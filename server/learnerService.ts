import { randomBytes } from 'node:crypto'
import type { LearnerState, QuizQuestion } from '../src/content/types'
import { MODULE_COUNT } from '../src/content/types'
import {
  CERTIFICATES,
  CERT_TITLE,
  certificateExpiration,
  evaluateCompletion,
  isExpired,
  isQuizScorePassing,
  type CompletionResult,
} from '../src/lib/completion'
import { scoreQuizSubmission } from '../src/lib/quiz'
import { createDefaultState, migrateState } from '../src/lib/storage'
import type { SignedInUser } from './auth'
import { ConflictError, type CertificateRecord, type LearnerRecord, type Store } from './store'

/** Table Storage string properties hold at most 32K characters. */
export const MAX_UI_STATE_CHARS = 30_000
const MAX_SAVE_ATTEMPTS = 3

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

export interface ProgressSnapshot {
  /** Name the learner entered for their certificate; empty until they enter one. */
  name: string
  state: LearnerState
  completion: CompletionResult
  certificate: CertificateRecord | null
}

export interface QuizOutcome extends ProgressSnapshot {
  score: number
  passed: boolean
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
    scores: {},
    attempts: {},
    passedAt: {},
    cycleStart: now.toISOString(),
    completionStatus: 'in-progress',
    updatedAt: now.toISOString(),
  }
}

export class LearnerService {
  private readonly store: Store
  private readonly quizzes: Record<number, QuizQuestion[]>
  private readonly now: () => Date
  private readonly quizSizes: Record<string, number>

  constructor(
    store: Store,
    quizzes: Record<number, QuizQuestion[]>,
    now: () => Date = () => new Date(),
  ) {
    this.store = store
    this.quizzes = quizzes
    this.now = now
    this.quizSizes = Object.fromEntries(
      Object.entries(quizzes).map(([id, questions]) => [id, questions.length]),
    )
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

  /** Scores on the server from the raw answers; the client's own score is never trusted. */
  async submitQuiz(user: SignedInUser, moduleId: number, answers: unknown): Promise<QuizOutcome> {
    const questions = Number.isInteger(moduleId) ? this.quizzes[moduleId] : undefined
    if (!questions || moduleId < 1 || moduleId > MODULE_COUNT) {
      throw new ValidationError('Unknown module.', 404)
    }
    if (!isRecord(answers)) throw new ValidationError('Answers must be a JSON object.')

    const { score } = scoreQuizSubmission(questions, answers)
    const passed = isQuizScorePassing(score, questions.length)
    const key = String(moduleId)
    const snapshot = await this.update(user, (record, now) => {
      record.attempts[key] = (record.attempts[key] ?? 0) + 1
      record.scores[key] = Math.max(record.scores[key] ?? 0, score)
      if (passed && !record.passedAt[key]) record.passedAt[key] = now.toISOString()
    })
    return { ...snapshot, score, passed }
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
      const completion = evaluateCompletion(record.scores, this.quizSizes)
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

/** Once a certificate expires the learner retakes every quiz to earn a new one. */
function restartCycleIfExpired(record: LearnerRecord, now: Date): void {
  const expiresAt = record.certificateExpiresAt
  if (!expiresAt || !isExpired(expiresAt, now) || record.cycleStart >= expiresAt) return
  record.scores = {}
  record.attempts = {}
  record.passedAt = {}
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
      quizBestScore: record.scores[key] ?? 0,
      quizAttempts: record.attempts[key] ?? 0,
    }
  }
  return state
}
