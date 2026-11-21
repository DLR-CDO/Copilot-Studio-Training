// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
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

/** Alice has entered her certificate name; Bob has not. */
async function setup(start = '2026-11-17T15:00:00Z') {
  const clock = { now: new Date(start) }
  const store = new MemoryStore()
  const service = new LearnerService(store, quizzesByModule, () => clock.now)
  await service.setName(alice, 'Alice Learner')
  return { clock, store, service }
}

async function passAll(service: LearnerService, user: SignedInUser, correct = 5) {
  for (let id = 1; id <= 10; id += 1) await service.submitQuiz(user, id, answersFor(id, correct))
}

describe('LearnerService', () => {
  it('issues no certificate while any quiz is failed', async () => {
    const { service, store } = await setup()
    for (let id = 1; id <= 9; id += 1) await service.submitQuiz(alice, id, answersFor(id, 5))
    const failed = await service.submitQuiz(alice, 10, answersFor(10, 3))

    expect(failed).toMatchObject({ score: 3, passed: false, certificate: null })
    expect(failed.completion.remainingModules).toEqual([10])
    expect(await store.listCertificates()).toHaveLength(0)
    expect((await store.getLearner(alice.email))!.value.completionStatus).toBe('in-progress')
  })

  it('issues a certificate with the entered name, dates, and score once every quiz passes', async () => {
    const { service, store } = await setup()
    for (let id = 1; id <= 9; id += 1) await service.submitQuiz(alice, id, answersFor(id, 5))
    const outcome = await service.submitQuiz(alice, 10, answersFor(10, 4))

    const cert = outcome.certificate!
    expect(cert.id).toMatch(CERTIFICATE_ID_PATTERN)
    expect(cert.name).toBe('Alice Learner')
    expect(cert.email).toBe('alice@example.com')
    expect(cert.course).toBe(CERT_TITLE)
    expect(cert.id).toMatch(/^DR-CSF-/)
    expect(cert.track).toBe('fundamentals')
    expect(cert.completedAt).toBe('2026-11-17T15:00:00.000Z')
    expect(cert.expiresAt).toBe('2027-11-17T15:00:00.000Z')
    expect(cert.scorePercent).toBe(98)
    expect(await store.getCertificate(cert.id)).toEqual(cert)

    const learner = (await store.getLearner(alice.email))!.value
    expect(learner.completionStatus).toBe('complete')
    expect(learner.finalPercent).toBe(98)
    expect(learner.completedAt).toBe(cert.completedAt)
  })

  it('keeps the same certificate on later visits and retakes while it is valid', async () => {
    const { service, store } = await setup()
    await passAll(service, alice, 4)
    const first = (await service.getProgress(alice)).certificate!
    await service.submitQuiz(alice, 3, answersFor(3, 5))
    expect((await service.getProgress(alice)).certificate!.id).toBe(first.id)
    expect(await store.listCertificates()).toHaveLength(1)
  })

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
    expect(bobView.state.modules['1']!.notes).toBe('')
    expect(bobView.state.modules['1']!.quizBestScore).toBe(0)

    const aliceView = await service.getProgress(alice)
    expect(aliceView.state.modules['1']!.notes).toBe('alice private note')
    expect(aliceView.certificate!.name).toBe('Alice Learner')
  })

  it('returns the same saved progress from any device', async () => {
    const { service } = await setup()
    await service.submitQuiz(alice, 2, answersFor(2, 5))
    await service.saveUiState(alice, { version: 1, modules: { '2': { tryItDone: true } } })
    const laterSession = await service.getProgress({ ...alice })
    expect(laterSession.state.modules['2']).toMatchObject({
      quizBestScore: 5,
      quizAttempts: 1,
      tryItDone: true,
    })
  })

  it('ignores quiz scores sent in saved UI state', async () => {
    const { service } = await setup()
    await service.saveUiState(alice, {
      version: 1,
      modules: { '1': { quizBestScore: 5, quizAttempts: 9 } },
    })
    const view = await service.getProgress(alice)
    expect(view.state.modules['1']).toMatchObject({ quizBestScore: 0, quizAttempts: 0 })
  })

  it('requires a full retake after expiry and then issues a new certificate ID', async () => {
    const { service, store, clock } = await setup()
    await passAll(service, alice)
    const original = (await service.getProgress(alice)).certificate!

    clock.now = new Date('2027-11-18T09:00:00Z')
    const afterExpiry = await service.getProgress(alice)
    expect(afterExpiry.certificate!.id).toBe(original.id)
    expect(afterExpiry.completion.complete).toBe(false)
    expect(afterExpiry.completion.passedModules).toEqual([])

    await passAll(service, alice)
    const renewed = (await service.getProgress(alice)).certificate!
    expect(renewed.id).not.toBe(original.id)
    expect(renewed.completedAt).toBe('2027-11-18T09:00:00.000Z')
    expect(renewed.expiresAt).toBe('2028-11-18T09:00:00.000Z')
    expect((await store.listCertificates()).map((c) => c.id).sort()).toEqual(
      [original.id, renewed.id].sort(),
    )
  })

  it('rejects unknown modules and malformed answers', async () => {
    const { service } = await setup()
    await expect(service.submitQuiz(alice, 11, {})).rejects.toBeInstanceOf(ValidationError)
    await expect(service.submitQuiz(alice, 1, ['x'])).rejects.toBeInstanceOf(ValidationError)
    await expect(service.saveUiState(alice, 'nope')).rejects.toBeInstanceOf(ValidationError)
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
    expect(after.certificate!.email).toBe('bob@example.com')
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
