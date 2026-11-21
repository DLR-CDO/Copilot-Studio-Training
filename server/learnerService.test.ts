// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
import { FINAL_ASSESSMENT } from '../src/lib/assessments'
import { CERT_TITLE } from '../src/lib/completion'
import type { SignedInUser } from './auth'
import {
  CERTIFICATE_ID_PATTERN,
  LearnerService,
  ValidationError,
  newCertificateId,
} from './learnerService'
import { MemoryStore } from './store'
import { answersFor } from './testing'

const alice: SignedInUser = { email: 'alice@example.com' }
const bob: SignedInUser = { email: 'bob@example.com' }
const FINAL = FINAL_ASSESSMENT.scope

/** Deterministic random numbers so draws are repeatable. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const bankById = new Map(Object.values(quizzesByModule).flatMap((b) => b.map((q) => [q.id, q])))

/** Alice has entered her certificate name; Bob has not. */
async function setup(start = '2026-11-17T15:00:00Z') {
  const clock = { now: new Date(start) }
  const store = new MemoryStore()
  const service = new LearnerService(store, quizzesByModule, {
    now: () => clock.now,
    rng: seeded(42),
  })
  await service.setName(alice, 'Alice Learner')
  return { clock, store, service }
}

async function take(service: LearnerService, user: SignedInUser, scope: string, correct: number) {
  const view = await service.startQuiz(user, scope)
  return service.submitQuiz(user, scope, view.attemptId, answersFor(view, correct))
}

async function passModules(service: LearnerService, user: SignedInUser, correct = 8) {
  for (let id = 1; id <= 10; id += 1) await take(service, user, String(id), correct)
}

async function passAll(service: LearnerService, user: SignedInUser) {
  await passModules(service, user)
  return take(service, user, FINAL, 18)
}

describe('module quiz attempts', () => {
  it('sends 8 questions without answers, with at most 2 true/false and at least 2 scenarios', async () => {
    const { service } = await setup()
    const view = await service.startQuiz(alice, '3')
    expect(view.questions).toHaveLength(8)
    expect(view.passPercent).toBe(80)
    const json = JSON.stringify(view)
    for (const secret of [
      'correctIndex',
      'correctOrder',
      '"correct"',
      'explanation',
      'sourceUrl',
    ]) {
      expect(json).not.toContain(secret)
    }
    const authored = view.questions.map((q) => bankById.get(q.id)!)
    expect(authored.filter((q) => q.type === 'true-false').length).toBeLessThanOrEqual(2)
    expect(authored.filter((q) => q.scenario).length).toBeGreaterThanOrEqual(2)
  })

  it('returns the same open attempt until it is submitted, then draws mostly new questions', async () => {
    const { service } = await setup()
    const first = await service.startQuiz(alice, '2')
    const reopened = await service.startQuiz(alice, '2')
    expect(reopened).toEqual(first)

    await service.submitQuiz(alice, '2', first.attemptId, answersFor(first, 8))
    const retake = await service.startQuiz(alice, '2')
    expect(retake.attemptId).not.toBe(first.attemptId)
    const before = new Set(first.questions.map((q) => q.id))
    // A bank of 15 leaves 7 unseen, so at most one question repeats.
    expect(retake.questions.filter((q) => before.has(q.id)).length).toBeLessThanOrEqual(1)
  })

  it('grades on the server and returns explanations, sources, and a timestamped attempt', async () => {
    const { service } = await setup()
    const outcome = await take(service, alice, '1', 6)
    expect(outcome).toMatchObject({ percent: 75, passed: false, correctCount: 6, total: 8 })
    const results = Object.values(outcome.results)
    expect(results.filter((r) => r.correct)).toHaveLength(6)
    for (const r of results) {
      expect(r.explanation).not.toBe('')
      expect(r.sourceUrl).toMatch(/^https:\/\/learn\.microsoft\.com\//)
    }
    expect(outcome.attemptLog).toEqual([
      { scope: '1', at: '2026-11-17T15:00:00.000Z', percent: 75, passed: false },
    ])
    expect(outcome.state.modules['1']).toMatchObject({ quizBestPercent: 75, quizAttempts: 1 })

    const passed = await take(service, alice, '1', 7)
    expect(passed).toMatchObject({ percent: 87, passed: true })
    expect(passed.state.modules['1']).toMatchObject({ quizBestPercent: 87, quizAttempts: 2 })
  })

  it('refuses a submission for an attempt that is not open', async () => {
    const { service } = await setup()
    const view = await service.startQuiz(alice, '1')
    await expect(service.submitQuiz(alice, '1', 'made-up', {})).rejects.toMatchObject({
      status: 409,
    })
    await service.submitQuiz(alice, '1', view.attemptId, answersFor(view, 8))
    await expect(
      service.submitQuiz(alice, '1', view.attemptId, answersFor(view, 8)),
    ).rejects.toMatchObject({ status: 409 })
    // Another learner cannot submit Alice's attempt.
    await expect(service.submitQuiz(bob, '1', view.attemptId, {})).rejects.toMatchObject({
      status: 409,
    })
  })

  it('rejects unknown quizzes and malformed input', async () => {
    const { service } = await setup()
    await expect(service.startQuiz(alice, '11')).rejects.toMatchObject({ status: 404 })
    await expect(service.startQuiz(alice, 'final-9')).rejects.toMatchObject({ status: 404 })
    const view = await service.startQuiz(alice, '1')
    await expect(service.submitQuiz(alice, '1', view.attemptId, ['x'])).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(service.submitQuiz(alice, '1', 42, {})).rejects.toBeInstanceOf(ValidationError)
    await expect(service.saveUiState(alice, 'nope')).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('final assessment', () => {
  it('stays closed until every module quiz is passed', async () => {
    const { service } = await setup()
    await expect(service.startQuiz(alice, FINAL)).rejects.toMatchObject({ status: 409 })
    for (let id = 1; id <= 9; id += 1) await take(service, alice, String(id), 8)
    await expect(service.startQuiz(alice, FINAL)).rejects.toMatchObject({ status: 409 })
    await take(service, alice, '10', 8)
    const progress = await service.getProgress(alice)
    expect(progress.assessment).toMatchObject({ open: true, passed: false, attempts: 0 })
  })

  it('draws 20 questions, 2 per module, with enough scenario and ordering questions', async () => {
    const { service } = await setup()
    await passModules(service, alice)
    const view = await service.startQuiz(alice, FINAL)
    expect(view.questions).toHaveLength(20)
    const authored = view.questions.map((q) => bankById.get(q.id)!)
    const perModule = new Map<string, number>()
    for (const q of authored) {
      const id = q.id.split('-')[0]!
      perModule.set(id, (perModule.get(id) ?? 0) + 1)
    }
    expect([...perModule.values()]).toEqual(Array(10).fill(2))
    expect(authored.filter((q) => q.scenario).length).toBeGreaterThanOrEqual(4)
    expect(authored.filter((q) => q.type === 'order').length).toBeGreaterThanOrEqual(2)

    await service.submitQuiz(alice, FINAL, view.attemptId, answersFor(view, 10))
    const retake = await service.startQuiz(alice, FINAL)
    const before = new Set(view.questions.map((q) => q.id))
    expect(retake.questions.some((q) => before.has(q.id))).toBe(false)
  })

  it('locks for 24 hours after 3 failed attempts in a row', async () => {
    const { service, clock } = await setup()
    await passModules(service, alice)
    expect((await service.getProgress(alice)).assessment.attemptsBeforeCooldown).toBe(3)
    await take(service, alice, FINAL, 10)
    await take(service, alice, FINAL, 15)
    const third = await take(service, alice, FINAL, 12)
    expect(third.passed).toBe(false)
    expect(third.assessment).toMatchObject({
      attempts: 3,
      attemptsBeforeCooldown: 0,
      cooldownUntil: '2026-11-18T15:00:00.000Z',
    })
    await expect(service.startQuiz(alice, FINAL)).rejects.toMatchObject({ status: 429 })

    clock.now = new Date('2026-11-18T15:00:00Z')
    const after = await service.getProgress(alice)
    expect(after.assessment).toMatchObject({ cooldownUntil: null, attemptsBeforeCooldown: 3 })
    expect((await take(service, alice, FINAL, 16)).passed).toBe(true)
  })

  it('honours a configured number of attempts and cooldown length', async () => {
    const clock = { now: new Date('2026-11-17T15:00:00Z') }
    const service = new LearnerService(new MemoryStore(), quizzesByModule, {
      now: () => clock.now,
      maxFailures: 1,
      cooldownHours: 2,
    })
    await passModules(service, alice)
    const failed = await take(service, alice, FINAL, 0)
    expect(failed.assessment.cooldownUntil).toBe('2026-11-17T17:00:00.000Z')
  })
})

describe('certificates', () => {
  it('issues nothing when every module is passed but the final assessment is not', async () => {
    const { service, store } = await setup()
    await passModules(service, alice)
    const failed = await take(service, alice, FINAL, 15)
    expect(failed).toMatchObject({ percent: 75, passed: false, certificate: null })
    expect(failed.completion).toMatchObject({ modulesComplete: true, complete: false })
    expect(await store.listCertificates()).toHaveLength(0)
  })

  it('issues a certificate scored on the final assessment once it is passed', async () => {
    const { service, store } = await setup()
    const outcome = await passAll(service, alice)

    const cert = outcome.certificate!
    expect(cert.id).toMatch(/^DR-CSF-/)
    expect(cert.name).toBe('Alice Learner')
    expect(cert.email).toBe('alice@example.com')
    expect(cert.course).toBe(CERT_TITLE)
    expect(cert.track).toBe('fundamentals')
    expect(cert.completedAt).toBe('2026-11-17T15:00:00.000Z')
    expect(cert.expiresAt).toBe('2027-11-17T15:00:00.000Z')
    expect(cert.scorePercent).toBe(90)
    expect(await store.getCertificate(cert.id)).toEqual(cert)

    const learner = (await store.getLearner(alice.email))!.value
    expect(learner.completionStatus).toBe('complete')
    expect(learner.finalPercent).toBe(90)
  })

  it('keeps the same certificate on later visits and retakes while it is valid', async () => {
    const { service, store } = await setup()
    const first = (await passAll(service, alice)).certificate!
    await take(service, alice, '3', 8)
    expect((await service.getProgress(alice)).certificate!.id).toBe(first.id)
    expect(await store.listCertificates()).toHaveLength(1)
  })

  it('requires a full retake after expiry and then issues a new certificate ID', async () => {
    const { service, store, clock } = await setup()
    const original = (await passAll(service, alice)).certificate!

    clock.now = new Date('2027-11-18T09:00:00Z')
    const afterExpiry = await service.getProgress(alice)
    expect(afterExpiry.certificate!.id).toBe(original.id)
    expect(afterExpiry.completion).toMatchObject({ complete: false, passedModules: [] })
    expect(afterExpiry.assessment).toMatchObject({ open: false, passed: false })

    await passAll(service, alice)
    const renewed = (await service.getProgress(alice)).certificate!
    expect(renewed.id).not.toBe(original.id)
    expect(renewed.completedAt).toBe('2027-11-18T09:00:00.000Z')
    expect((await store.listCertificates()).map((c) => c.id).sort()).toEqual(
      [original.id, renewed.id].sort(),
    )
  })
})

describe('saved progress', () => {
  it('keeps each learner to their own progress and certificate', async () => {
    const { service } = await setup()
    await passAll(service, alice)
    await service.saveUiState(alice, {
      version: 1,
      modules: { '1': { notes: 'alice private note' } },
    })

    const bobView = await service.getProgress(bob)
    expect(bobView.certificate).toBeNull()
    expect(bobView.completion.passedModules).toEqual([])
    expect(bobView.attemptLog).toEqual([])
    expect(bobView.state.modules['1']).toMatchObject({ notes: '', quizBestPercent: 0 })

    const aliceView = await service.getProgress(alice)
    expect(aliceView.state.modules['1']!.notes).toBe('alice private note')
    expect(aliceView.certificate!.name).toBe('Alice Learner')
  })

  it('returns the same saved progress from any device', async () => {
    const { service } = await setup()
    await take(service, alice, '2', 8)
    await service.saveUiState(alice, { version: 1, modules: { '2': { tryItDone: true } } })
    const laterSession = await service.getProgress({ ...alice })
    expect(laterSession.state.modules['2']).toMatchObject({
      quizBestPercent: 100,
      quizAttempts: 1,
      tryItDone: true,
    })
  })

  it('ignores quiz scores sent in saved UI state', async () => {
    const { service } = await setup()
    await service.saveUiState(alice, {
      version: 1,
      modules: { '1': { quizBestPercent: 100, quizAttempts: 9 } },
    })
    const view = await service.getProgress(alice)
    expect(view.state.modules['1']).toMatchObject({ quizBestPercent: 0, quizAttempts: 0 })
  })

  it('rejects UI state too large for Table Storage', async () => {
    const { service } = await setup()
    const notes = 'x'.repeat(31_000)
    await expect(
      service.saveUiState(alice, { version: 1, modules: { '1': { notes } } }),
    ).rejects.toMatchObject({ status: 413 })
  })
})

describe('certificate name', () => {
  it('waits for a name before issuing, then issues as soon as one is entered', async () => {
    const { service, store } = await setup()
    await passAll(service, bob)
    const before = await service.getProgress(bob)
    expect(before.completion.complete).toBe(true)
    expect(before.certificate).toBeNull()
    expect(await store.listCertificates()).toHaveLength(0)

    const after = await service.setName(bob, '  Bob   Learner ')
    expect(after.name).toBe('Bob Learner')
    expect(after.certificate!.name).toBe('Bob Learner')
  })

  it('can change before the certificate is issued but is locked afterwards', async () => {
    const { service } = await setup()
    await service.setName(alice, 'Alice Q. Learner')
    await passAll(service, alice)
    expect((await service.getProgress(alice)).certificate!.name).toBe('Alice Q. Learner')

    await expect(service.setName(alice, 'Someone Else')).rejects.toMatchObject({ status: 409 })
    // Saving the same name again is harmless.
    await expect(service.setName(alice, 'Alice Q. Learner')).resolves.toBeTruthy()
  })

  it('unlocks once the certificate expires', async () => {
    const { service, clock } = await setup()
    await passAll(service, alice)
    clock.now = new Date('2027-11-18T09:00:00Z')
    expect((await service.setName(alice, 'Alice Renamed')).name).toBe('Alice Renamed')
  })

  it('rejects empty, overlong, or markup names', async () => {
    const { service } = await setup()
    for (const bad of ['', ' a ', 'x'.repeat(81), '<b>Bold</b>', 'Tab\u0007Bell', 42]) {
      await expect(service.setName(bob, bad)).rejects.toBeInstanceOf(ValidationError)
    }
    expect((await service.setName(bob, 'José Núñez-O’Brien')).name).toBe('José Núñez-O’Brien')
  })
})

describe('newCertificateId', () => {
  it('produces readable, well-formed, distinct IDs', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newCertificateId()))
    expect(ids.size).toBe(200)
    for (const id of ids) expect(id).toMatch(CERTIFICATE_ID_PATTERN)
    expect(newCertificateId(() => new Uint8Array(12))).toBe('DR-CSF-0000-0000-0000')
    expect(newCertificateId(() => new Uint8Array(12), 'DR-CSP')).toBe('DR-CSP-0000-0000-0000')
  })
})
