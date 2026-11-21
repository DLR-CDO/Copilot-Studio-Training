import { randomBytes } from 'node:crypto'
import type {
  AdminLearnerRow,
  AttemptLogEntry,
  LearnerState,
  QuestionResult,
  QuizAttemptView,
  QuizQuestion,
  QuizScope,
} from '../src/content/types'
import { MODULE_COUNT } from '../src/content/types'
import { FINAL_ASSESSMENT, isModuleScope, passPercentFor } from '../src/lib/assessments'
import {
  CERTIFICATES,
  CERT_TITLE,
  certificateExpiration,
  evaluateCompletion,
  isExpired,
  isPercentPassing,
  type CompletionResult,
} from '../src/lib/completion'
import { createDefaultState, migrateState } from '../src/lib/storage'
import type { SignedInUser } from './auth'
import { drawFinalAssessment, drawModuleQuiz, gradeAttempt, toPublicQuestion } from './quizEngine'
import {
  ConflictError,
  type CertificateRecord,
  type Cooldown,
  type LearnerRecord,
  type Store,
} from './store'

/** Table Storage string properties hold at most 32K characters. */
export const MAX_UI_STATE_CHARS = 30_000
const MAX_SAVE_ATTEMPTS = 3
/** Attempts kept per learner for the progress and admin views. */
export const MAX_ATTEMPT_LOG = 100
const HOUR_MS = 60 * 60 * 1000

// Crockford base32: no I, L, O, or U, so IDs are easy to read aloud and type.
const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
/** CSF = Fundamentals, CSP = Practitioner. CSA (the course's former title) stays verifiable. */
export const CERTIFICATE_ID_PATTERN =
  /^DR-CS[AFP]-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/

export class ValidationError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export const MAX_NAME_CHARS = 80

export interface AssessmentStatus {
  scope: QuizScope
  /** Every module quiz is passed. */
  open: boolean
  attempts: number
  bestPercent: number
  passed: boolean
  /** ISO time the learner may try again, while a cooldown is running. */
  cooldownUntil: string | null
  /** Failed attempts left before the next cooldown starts. */
  attemptsBeforeCooldown: number
  cooldownHours: number
}

export interface ProgressSnapshot {
  /** Name the learner entered for their certificate; empty until they enter one. */
  name: string
  state: LearnerState
  completion: CompletionResult
  assessment: AssessmentStatus
  attemptLog: AttemptLogEntry[]
  certificate: CertificateRecord | null
}

export interface QuizOutcome extends ProgressSnapshot {
  scope: QuizScope
  percent: number
  passed: boolean
  correctCount: number
  total: number
  results: Record<string, QuestionResult>
}

export interface LearnerServiceOptions {
  now?: () => Date
  rng?: () => number
  /** Failed final assessment attempts before a cooldown. */
  maxFailures?: number
  cooldownHours?: number
}

/** 60 random bits, e.g. DR-CSF-7K2M-Q9XD-4HTB. */
export function newCertificateId(
  random: (size: number) => Uint8Array = randomBytes,
  prefix = CERTIFICATES.fundamentals.idPrefix,
): string {
  // 256 is a multiple of 32, so `byte % 32` is unbiased.
  const chars = Array.from(random(12), (b) => ID_ALPHABET[b % 32]).join('')
  return `${prefix}-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function newLearnerRecord(user: SignedInUser, now: Date): LearnerRecord {
  return {
    email: user.email,
    name: '',
    bestPercent: {},
    attempts: {},
    passedAt: {},
    attemptLog: [],
    pending: {},
    lastQuestionIds: {},
    cooldowns: {},
    cycleStart: now.toISOString(),
    completionStatus: 'in-progress',
    updatedAt: now.toISOString(),
  }
}

export class LearnerService {
  private readonly store: Store
  private readonly quizzes: Record<number, QuizQuestion[]>
  private readonly questionsById: Map<string, QuizQuestion>
  private readonly now: () => Date
  private readonly rng: () => number
  private readonly maxFailures: number
  private readonly cooldownMs: number

  constructor(
    store: Store,
    quizzes: Record<number, QuizQuestion[]>,
    options: LearnerServiceOptions = {},
  ) {
    this.store = store
    this.quizzes = quizzes
    this.questionsById = new Map(
      Object.values(quizzes).flatMap((bank) => bank.map((q) => [q.id, q])),
    )
    this.now = options.now ?? (() => new Date())
    this.rng = options.rng ?? Math.random
    this.maxFailures = options.maxFailures ?? 3
    this.cooldownMs = (options.cooldownHours ?? 24) * HOUR_MS
  }

  async getProgress(user: SignedInUser): Promise<ProgressSnapshot> {
    return this.update(user, () => {})
  }

  async saveUiState(user: SignedInUser, raw: unknown): Promise<void> {
    if (!isRecord(raw)) throw new ValidationError('Progress must be a JSON object.')
    const state = migrateState(raw)
    if (state.notice) throw new ValidationError('Progress format was not recognized.')
    const uiState = JSON.stringify({
      version: state.version,
      freeRoam: state.freeRoam,
      theme: state.theme,
      themeChosen: state.themeChosen,
      modules: state.modules,
      ...(state.cheatSheet ? { cheatSheet: state.cheatSheet } : {}),
    })
    if (uiState.length > MAX_UI_STATE_CHARS) {
      throw new ValidationError('Notes are too long to save. Shorten them and try again.', 413)
    }
    await this.update(user, (record) => {
      record.uiState = uiState
    })
  }

  /**
   * Draws and saves the questions for an attempt. An unsubmitted attempt is returned as-is, so
   * reloading the page never offers a different set of questions.
   */
  async startQuiz(user: SignedInUser, scope: QuizScope): Promise<QuizAttemptView> {
    this.assertScope(scope)
    let view: QuizAttemptView | null = null
    await this.update(user, (record, now) => {
      const pending = record.pending[scope]
      const pendingQuestions = pending ? this.resolve(pending.questionIds) : null
      if (pending && pendingQuestions) {
        view = attemptView(pending.id, scope, pendingQuestions)
        return
      }
      if (scope === FINAL_ASSESSMENT.scope) this.assertAssessmentOpen(record, now)
      const questions = this.draw(scope, new Set(record.lastQuestionIds[scope] ?? []))
      const id = randomBytes(12).toString('base64url')
      record.pending[scope] = {
        id,
        questionIds: questions.map((q) => q.id),
        startedAt: now.toISOString(),
      }
      view = attemptView(id, scope, questions)
    })
    return view!
  }

  /** Grades on the server against the saved attempt; the client never sees answers beforehand. */
  async submitQuiz(
    user: SignedInUser,
    scope: QuizScope,
    attemptId: unknown,
    answers: unknown,
  ): Promise<QuizOutcome> {
    this.assertScope(scope)
    if (typeof attemptId !== 'string') throw new ValidationError('Attempt ID is missing.')
    if (!isRecord(answers)) throw new ValidationError('Answers must be a JSON object.')

    let graded: ReturnType<typeof gradeAttempt> | null = null
    let passed = false
    const snapshot = await this.update(user, (record, now) => {
      const pending = record.pending[scope]
      const questions = pending?.id === attemptId ? this.resolve(pending.questionIds) : null
      if (!pending || !questions) {
        throw new ValidationError('This attempt is no longer open. Start the quiz again.', 409)
      }
      graded = gradeAttempt(questions, answers)
      passed = isPercentPassing(graded.percent, scope)
      const at = now.toISOString()
      record.attempts[scope] = (record.attempts[scope] ?? 0) + 1
      record.bestPercent[scope] = Math.max(record.bestPercent[scope] ?? 0, graded.percent)
      if (passed && !record.passedAt[scope]) record.passedAt[scope] = at
      record.attemptLog = [
        ...record.attemptLog,
        { scope, at, percent: graded.percent, passed },
      ].slice(-MAX_ATTEMPT_LOG)
      record.lastQuestionIds[scope] = pending.questionIds
      delete record.pending[scope]
      if (scope === FINAL_ASSESSMENT.scope) this.recordAssessmentResult(record, passed, now)
    })
    const result = graded!
    return {
      ...snapshot,
      scope,
      percent: result.percent,
      passed,
      correctCount: result.correctCount,
      total: result.total,
      results: result.results,
    }
  }

  /** The certificate name can change until a certificate is issued, then it is locked. */
  async setName(user: SignedInUser, raw: unknown): Promise<ProgressSnapshot> {
    const name = normalizeName(raw)
    return this.update(user, (record, now) => {
      if (name !== record.name && hasValidCertificate(record, now)) {
        throw new ValidationError(
          'Your name is locked because your certificate has been issued.',
          409,
        )
      }
      record.name = name
    })
  }

  async listCertificates(): Promise<CertificateRecord[]> {
    const all = await this.store.listCertificates()
    return all.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  }

  async listLearners(): Promise<LearnerRecord[]> {
    const all = await this.store.listLearners()
    return all.sort((a, b) => a.email.localeCompare(b.email))
  }

  /** Every learner's progress for the admin dashboard, most recently active first. */
  async adminOverview(): Promise<AdminLearnerRow[]> {
    const now = this.now()
    const rows = (await this.store.listLearners()).map((r) => toAdminRow(r, now))
    return rows.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
  }

  private assertScope(scope: QuizScope): void {
    const known =
      scope === FINAL_ASSESSMENT.scope ||
      (isModuleScope(scope) && (this.quizzes[Number(scope)]?.length ?? 0) > 0)
    if (!known) throw new ValidationError('Unknown quiz.', 404)
  }

  private assertAssessmentOpen(record: LearnerRecord, now: Date): void {
    if (!evaluateCompletion(record.bestPercent).modulesComplete) {
      throw new ValidationError('Pass every module quiz before taking the final assessment.', 409)
    }
    const { until } = currentCooldown(record.cooldowns[FINAL_ASSESSMENT.scope], now)
    if (until) {
      throw new ValidationError(
        `You have used your attempts for now. Try the final assessment again after ${until}.`,
        429,
      )
    }
  }

  /** After `maxFailures` failed attempts in a row, the assessment locks for the cooldown. */
  private recordAssessmentResult(record: LearnerRecord, passed: boolean, now: Date): void {
    const scope = FINAL_ASSESSMENT.scope
    if (passed) {
      delete record.cooldowns[scope]
      return
    }
    const failures = currentCooldown(record.cooldowns[scope], now).failures + 1
    record.cooldowns[scope] =
      failures >= this.maxFailures
        ? { failures, until: new Date(now.getTime() + this.cooldownMs).toISOString() }
        : { failures }
  }

  private assessmentStatus(
    record: LearnerRecord,
    completion: CompletionResult,
    now: Date,
  ): AssessmentStatus {
    const scope = FINAL_ASSESSMENT.scope
    const cooldown = currentCooldown(record.cooldowns[scope], now)
    return {
      scope,
      open: completion.modulesComplete,
      attempts: record.attempts[scope] ?? 0,
      bestPercent: record.bestPercent[scope] ?? 0,
      passed: completion.assessmentPassed,
      cooldownUntil: cooldown.until,
      attemptsBeforeCooldown: cooldown.until
        ? 0
        : Math.max(0, this.maxFailures - cooldown.failures),
      cooldownHours: this.cooldownMs / HOUR_MS,
    }
  }

  private draw(scope: QuizScope, lastIds: ReadonlySet<string>): QuizQuestion[] {
    if (scope === FINAL_ASSESSMENT.scope) {
      return drawFinalAssessment(this.quizzes, FINAL_ASSESSMENT, lastIds, this.rng)
    }
    return drawModuleQuiz(this.quizzes[Number(scope)] ?? [], lastIds, this.rng)
  }

  /** Null when a saved question no longer exists, e.g. after a content update. */
  private resolve(ids: string[]): QuizQuestion[] | null {
    const questions = ids.map((id) => this.questionsById.get(id))
    return questions.every((q) => q != null) ? (questions as QuizQuestion[]) : null
  }

  /**
   * Read, change, and save one learner's record with optimistic concurrency. Also restarts the
   * cycle after expiry, and issues a certificate once it is earned and a name has been entered.
   */
  private async update(
    user: SignedInUser,
    change: (record: LearnerRecord, now: Date) => void,
  ): Promise<ProgressSnapshot> {
    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
      const now = this.now()
      const existing = await this.store.getLearner(user.email)
      const record = existing ? structuredClone(existing.value) : newLearnerRecord(user, now)

      restartCycleIfExpired(record, now)
      change(record, now)
      const completion = evaluateCompletion(record.bestPercent)
      const issued = completion.complete && record.name ? issueIfDue(record, completion, now) : null

      if (!existing || JSON.stringify(record) !== JSON.stringify(existing.value)) {
        record.updatedAt = now.toISOString()
        try {
          await this.store.saveLearner(record, existing?.etag ?? null)
        } catch (err) {
          if (err instanceof ConflictError) continue
          throw err
        }
        if (issued) await this.store.saveCertificate(issued)
      }

      return {
        name: record.name,
        state: toLearnerState(record),
        completion,
        assessment: this.assessmentStatus(record, completion, now),
        attemptLog: record.attemptLog,
        certificate: await this.findCertificate(record, issued),
      }
    }
    throw new Error('Progress could not be saved because of repeated concurrent updates.')
  }

  private async findCertificate(
    record: LearnerRecord,
    issued: CertificateRecord | null,
  ): Promise<CertificateRecord | null> {
    if (issued) return issued
    if (!record.certificateId) return null
    const found = await this.store.getCertificate(record.certificateId)
    if (found) return found
    // The learner record is saved first, so a crash in between can leave the certificate unsaved.
    const rebuilt = certificateFromLearner(record)
    if (rebuilt) await this.store.saveCertificate(rebuilt)
    return rebuilt
  }
}

function attemptView(id: string, scope: QuizScope, questions: QuizQuestion[]): QuizAttemptView {
  return {
    attemptId: id,
    scope,
    questions: questions.map(toPublicQuestion),
    passPercent: passPercentFor(scope),
  }
}

/** A finished cooldown starts a fresh count of failures. */
export function toAdminRow(record: LearnerRecord, now: Date): AdminLearnerRow {
  const completion = evaluateCompletion(record.bestPercent)
  const modules = Array.from({ length: MODULE_COUNT }, (_, i) => {
    const id = String(i + 1)
    const bestPercent = record.bestPercent[id] ?? 0
    return {
      id: i + 1,
      bestPercent,
      attempts: record.attempts[id] ?? 0,
      passed: isPercentPassing(bestPercent, id),
    }
  })
  const finalScope = FINAL_ASSESSMENT.scope
  const final = {
    bestPercent: record.bestPercent[finalScope] ?? 0,
    attempts: record.attempts[finalScope] ?? 0,
    passed: completion.assessmentPassed,
    cooldownUntil: currentCooldown(record.cooldowns[finalScope], now).until,
  }
  const certificate =
    record.certificateId && record.completedAt && record.certificateExpiresAt
      ? {
          id: record.certificateId,
          issuedAt: record.completedAt,
          expiresAt: record.certificateExpiresAt,
        }
      : null
  const anyAttempt = Object.values(record.attempts).some((n) => n > 0)
  const status = certificate
    ? isExpired(certificate.expiresAt, now)
      ? 'expired'
      : 'certified'
    : completion.modulesComplete
      ? 'ready-for-final'
      : anyAttempt
        ? 'in-progress'
        : 'not-started'
  const lastAttempt = record.attemptLog.at(-1)?.at ?? ''
  return {
    name: record.name,
    email: record.email,
    status,
    modulesPassed: completion.passedModules.length,
    currentModule: completion.remainingModules[0] ?? null,
    modules,
    final,
    startedAt: record.cycleStart,
    lastActivity: lastAttempt > record.updatedAt ? lastAttempt : record.updatedAt,
    certificate,
  }
}

function currentCooldown(
  cooldown: Cooldown | undefined,
  now: Date,
): { failures: number; until: string | null } {
  if (!cooldown) return { failures: 0, until: null }
  if (cooldown.until) {
    return isExpired(cooldown.until, now)
      ? { failures: 0, until: null }
      : { failures: cooldown.failures, until: cooldown.until }
  }
  return { failures: cooldown.failures, until: null }
}

/** Once a certificate expires the learner retakes every quiz to earn a new one. */
function restartCycleIfExpired(record: LearnerRecord, now: Date): void {
  const expiresAt = record.certificateExpiresAt
  if (!expiresAt || !isExpired(expiresAt, now) || record.cycleStart >= expiresAt) return
  record.bestPercent = {}
  record.attempts = {}
  record.passedAt = {}
  record.pending = {}
  record.cooldowns = {}
  record.completionStatus = 'in-progress'
  delete record.completedAt
  delete record.finalPercent
  record.cycleStart = now.toISOString()
}

function hasValidCertificate(record: LearnerRecord, now: Date): boolean {
  return (
    record.certificateId != null &&
    record.certificateExpiresAt != null &&
    !isExpired(record.certificateExpiresAt, now)
  )
}

export function normalizeName(raw: unknown): string {
  if (typeof raw !== 'string') throw new ValidationError('Name must be text.')
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim()
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f<>]/.test(name)) {
    throw new ValidationError('Name contains characters that are not allowed.')
  }
  if (name.length < 2 || name.length > MAX_NAME_CHARS) {
    throw new ValidationError(`Name must be between 2 and ${MAX_NAME_CHARS} characters.`)
  }
  return name
}

function issueIfDue(
  record: LearnerRecord,
  completion: CompletionResult,
  now: Date,
): CertificateRecord | null {
  if (hasValidCertificate(record, now)) return null

  const completedAt = now.toISOString()
  const certificate: CertificateRecord = {
    id: newCertificateId(),
    name: record.name,
    email: record.email,
    course: CERT_TITLE,
    track: 'fundamentals',
    completedAt,
    expiresAt: certificateExpiration(now).toISOString(),
    scorePercent: completion.finalPercent,
    issuedAt: completedAt,
  }
  record.completionStatus = 'complete'
  record.completedAt = certificate.completedAt
  record.finalPercent = certificate.scorePercent
  record.certificateId = certificate.id
  record.certificateExpiresAt = certificate.expiresAt
  return certificate
}

function certificateFromLearner(record: LearnerRecord): CertificateRecord | null {
  if (!record.certificateId || !record.certificateExpiresAt || !record.completedAt) return null
  return {
    id: record.certificateId,
    name: record.name,
    email: record.email,
    course: CERT_TITLE,
    track: 'fundamentals',
    completedAt: record.completedAt,
    expiresAt: record.certificateExpiresAt,
    scorePercent: record.finalPercent ?? 0,
    issuedAt: record.completedAt,
  }
}

function toLearnerState(record: LearnerRecord): LearnerState {
  let parsed: unknown = null
  try {
    parsed = record.uiState ? JSON.parse(record.uiState) : null
  } catch {
    parsed = null
  }
  const state = parsed ? migrateState(parsed) : createDefaultState()
  delete state.notice
  delete state.migratedFrom
  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    const key = String(id)
    const current = state.modules[key] ?? createDefaultState().modules[key]!
    state.modules[key] = {
      ...current,
      quizBestPercent: record.bestPercent[key] ?? 0,
      quizAttempts: record.attempts[key] ?? 0,
    }
  }
  return state
}
