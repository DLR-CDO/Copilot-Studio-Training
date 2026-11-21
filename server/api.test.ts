// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
import { CERT_TITLE } from '../src/lib/completion'
import { handleApi, type ApiDeps, type ApiResponse } from './api'
import type { ServerConfig } from './config'
import { LearnerService } from './learnerService'
import { RateLimiter } from './rateLimit'
import { MemoryStore, type CertificateRecord } from './store'
import { answersFor } from './testing'

const config: ServerConfig = {
  authMode: 'swa',
  allowedEmailDomain: 'example.com',
  adminEmails: new Set(['admin@example.com']),
  publicBaseUrl: 'https://academy.example.test',
  mockUsers: [],
  assessmentMaxFailures: 3,
  assessmentCooldownHours: 24,
}

const clock = { now: new Date('2026-11-17T15:00:00Z') }
let store: MemoryStore
let deps: ApiDeps

beforeEach(() => {
  clock.now = new Date('2026-11-17T15:00:00Z')
  store = new MemoryStore()
  deps = {
    config,
    store,
    service: new LearnerService(store, quizzesByModule, { now: () => clock.now }),
    loadLogo: async () => null,
    now: () => clock.now,
  }
})

type Headers = Record<string, string>

/** The x-ms-client-principal header Azure Static Web Apps adds for a signed-in user. */
function principal(email: string, provider = 'aad', roles = ['anonymous', 'authenticated']) {
  const value = {
    identityProvider: provider,
    userId: 'abc123',
    userDetails: email,
    userRoles: roles,
  }
  return { 'x-ms-client-principal': Buffer.from(JSON.stringify(value)).toString('base64') }
}
const alice = principal('alice@example.com')
const bob = principal('bob@example.com')
const admin = principal('admin@example.com', 'aad', ['anonymous', 'authenticated', 'admin'])

function call(method: string, pathAndQuery: string, headers: Headers = {}, body = '') {
  const url = new URL(pathAndQuery, 'http://localhost')
  return handleApi({ method, path: url.pathname, query: url.searchParams, headers, body }, deps)
}
const get = (path: string, headers?: Headers) => call('GET', path, headers)
const sendJson = (method: string, path: string, body: unknown, headers: Headers) =>
  call(
    method,
    path,
    { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...headers },
    JSON.stringify(body),
  )
const parse = (res: ApiResponse) => JSON.parse(String(res.body))

async function takeQuiz(scope: string, correct: number, headers: Headers) {
  const start = await sendJson('POST', `/api/quiz/${scope}/start`, {}, headers)
  expect(start.status).toBe(200)
  const view = parse(start)
  const res = await sendJson(
    'POST',
    `/api/quiz/${scope}/submit`,
    { attemptId: view.attemptId, answers: answersFor(view, correct) },
    headers,
  )
  expect(res.status).toBe(200)
  return parse(res)
}

async function passAllQuizzes(headers: Headers) {
  for (let id = 1; id <= 10; id += 1) await takeQuiz(String(id), 8, headers)
  await takeQuiz('final-1', 20, headers)
}

function certificate(overrides: Partial<CertificateRecord> = {}): CertificateRecord {
  return {
    id: 'DR-CSA-7K2M-Q9XD-4HTB',
    name: 'Alice Learner',
    email: 'alice@example.com',
    course: 'Copilot Studio Advanced',
    completedAt: '2026-11-17T15:00:00.000Z',
    expiresAt: '2027-11-17T15:00:00.000Z',
    scorePercent: 96,
    issuedAt: '2026-11-17T15:00:00.000Z',
    ...overrides,
  }
}

describe('/api/verify (public)', () => {
  it('needs no sign-in and returns only name, title, dates, and status', async () => {
    await store.saveCertificate(certificate())
    const res = await get('/api/verify?id=dr-csa-7k2m-q9xd-4htb')

    expect(res.status).toBe(200)
    expect(parse(res)).toEqual({
      id: 'DR-CSA-7K2M-Q9XD-4HTB',
      name: 'Alice Learner',
      course: CERT_TITLE,
      completedAt: '2026-11-17T15:00:00.000Z',
      expiresAt: '2027-11-17T15:00:00.000Z',
      status: 'valid',
    })
    expect(String(res.body)).not.toMatch(/advanced/i)
    expect(String(res.body)).not.toContain('alice@example.com')
    expect(String(res.body)).not.toContain('96')
  })

  it('reports expired certificates as expired', async () => {
    await store.saveCertificate(certificate())
    clock.now = new Date('2027-11-17T15:00:00Z')
    expect(parse(await get('/api/verify?id=DR-CSA-7K2M-Q9XD-4HTB')).status).toBe('expired')
  })

  it('limits lookups per caller', async () => {
    deps.verifyLimiter = new RateLimiter(2, 60_000)
    const from = (ip: string) =>
      call('GET', '/api/verify?id=DR-CSF-0000-0000-0000', {
        'x-forwarded-for': ip,
      })
    expect((await from('203.0.113.5')).status).toBe(404)
    expect((await from('203.0.113.5')).status).toBe(404)
    expect((await from('203.0.113.5')).status).toBe(429)
    expect((await from('198.51.100.7')).status).toBe(404)
    clock.now = new Date(clock.now.getTime() + 60_000)
    expect((await from('203.0.113.5')).status).toBe(404)
  })

  it('returns 404 for unknown IDs and 400 for malformed ones', async () => {
    expect((await get('/api/verify?id=DR-CSA-0000-0000-0000')).status).toBe(404)
    expect((await get('/api/verify?id=DR-CSF-0000-0000-0000')).status).toBe(404)
    // A tampered prefix or character outside the ID alphabet is rejected outright.
    expect((await get('/api/verify?id=DR-XXX-7K2M-Q9XD-4HTB')).status).toBe(400)
    expect((await get('/api/verify?id=DR-CSF-7K2M-Q9XD-4HTU')).status).toBe(400)
    expect((await get('/api/verify?id=%3Cscript%3E')).status).toBe(400)
    expect((await get('/api/verify')).status).toBe(400)
  })
})

describe('sign-in', () => {
  it('returns 401 without a Static Web Apps principal', async () => {
    expect((await get('/api/progress')).status).toBe(401)
    expect((await get('/api/me', { 'x-ms-client-principal': 'not base64 json' })).status).toBe(401)
  })

  it('reads the learner email from the principal header', async () => {
    expect(parse(await get('/api/me', alice))).toMatchObject({
      email: 'alice@example.com',
      isAdmin: false,
      logoutUrl: '/.auth/logout?post_logout_redirect_uri=%2Fsigned-out',
    })
    expect(parse(await get('/api/me', principal('Alice@Example.com'))).email).toBe(
      'alice@example.com',
    )
  })

  it('refuses accounts outside the allowed email domain', async () => {
    for (const email of [
      'someone@contoso.com',
      'alice@example.com.evil.test',
      'x@notexample.com',
    ]) {
      const res = await get('/api/me', principal(email))
      expect(res.status).toBe(403)
      expect(parse(res).error).toContain('@example.com')
    }
  })

  it('accepts only Microsoft sign-ins, not GitHub', async () => {
    expect((await get('/api/me', principal('alice@example.com', 'github'))).status).toBe(401)
    expect(
      (await get('/api/me', principal('alice@example.com', 'aad', ['anonymous']))).status,
    ).toBe(401)
  })
})

describe('learner data', () => {
  it('only ever returns the signed-in learner’s own progress and certificate', async () => {
    await sendJson('PUT', '/api/profile', { name: 'Alice Learner' }, alice)
    await passAllQuizzes(alice)

    const aliceProgress = parse(await get('/api/progress', alice))
    expect(aliceProgress.completion.complete).toBe(true)
    expect(aliceProgress.certificate.name).toBe('Alice Learner')
    expect(aliceProgress.certificate.verifyUrl).toBe(
      `https://academy.example.test/verify?id=${aliceProgress.certificate.id}`,
    )

    const bobProgress = parse(await get('/api/progress', bob))
    expect(bobProgress.name).toBe('')
    expect(bobProgress.certificate).toBeNull()
    expect(bobProgress.completion.passedModules).toEqual([])
    expect((await get('/api/certificate/pdf', bob)).status).toBe(404)

    const pdf = await get('/api/certificate/pdf', alice)
    expect(pdf.status).toBe(200)
    expect(pdf.headers['Content-Type']).toBe('application/pdf')
    expect(pdf.headers['Content-Disposition']).toContain(aliceProgress.certificate.id)
  })

  it('issues the certificate when the name is entered after passing', async () => {
    await passAllQuizzes(bob)
    expect(parse(await get('/api/progress', bob)).certificate).toBeNull()
    const res = await sendJson('PUT', '/api/profile', { name: 'Bob Learner' }, bob)
    expect(res.status).toBe(200)
    expect(parse(res).certificate.name).toBe('Bob Learner')
  })

  it('rejects invalid names', async () => {
    const res = await sendJson('PUT', '/api/profile', { name: '<script>' }, alice)
    expect(res.status).toBe(400)
  })

  it('sends questions without answers, then grades on the server and ignores a claimed score', async () => {
    const start = await sendJson('POST', '/api/quiz/1/start', {}, alice)
    const view = parse(start)
    expect(String(start.body)).not.toMatch(/correctIndex|correctOrder|explanation|sourceUrl/)
    const res = await sendJson(
      'POST',
      '/api/quiz/1/submit',
      { attemptId: view.attemptId, answers: answersFor(view, 2), score: 8, percent: 100 },
      alice,
    )
    const body = parse(res)
    expect(body.result).toMatchObject({ percent: 20, passed: false, correctCount: 2, total: 10 })
    expect(Object.keys(body.result.results).sort()).toEqual(
      view.questions.map((q: { id: string }) => q.id).sort(),
    )
    expect(body.attempts).toHaveLength(1)
    expect(body.state.modules['1']).toMatchObject({ quizBestPercent: 20, quizAttempts: 1 })
  })

  it('keeps the final assessment closed until every module quiz is passed', async () => {
    const res = await sendJson('POST', '/api/quiz/final-1/start', {}, alice)
    expect(res.status).toBe(409)
    expect(parse(await get('/api/progress', alice)).assessment).toMatchObject({ open: false })
  })

  it('rejects unknown quiz scopes', async () => {
    expect((await sendJson('POST', '/api/quiz/99/start', {}, alice)).status).toBe(404)
    expect((await sendJson('POST', '/api/quiz/1/peek', {}, alice)).status).toBe(404)
  })

  it('rejects cross-site writes and non-JSON bodies', async () => {
    const crossSite = await sendJson(
      'POST',
      '/api/quiz/1/start',
      {},
      {
        ...alice,
        'sec-fetch-site': 'cross-site',
      },
    )
    expect(crossSite.status).toBe(403)
    const form = await call(
      'POST',
      '/api/quiz/1/start',
      { ...alice, 'content-type': 'application/x-www-form-urlencoded' },
      'answers=1',
    )
    expect(form.status).toBe(403)
    const huge = await sendJson('PUT', '/api/progress', { state: 'x'.repeat(70_000) }, alice)
    expect(huge.status).toBe(413)
  })
})

describe('/api/admin/completions.csv', () => {
  it('is for admins only, decided by the admin list rather than Static Web Apps roles', async () => {
    expect((await get('/api/admin/completions.csv', alice)).status).toBe(403)
    expect((await get('/api/admin/completions.csv', admin)).status).toBe(200)
    expect((await get('/api/admin/completions.csv', principal('admin@example.com'))).status).toBe(
      200,
    )
    const roleOnly = principal('alice@example.com', 'aad', ['authenticated', 'admin'])
    expect((await get('/api/admin/completions.csv', roleOnly)).status).toBe(403)
    expect(parse(await get('/api/me', roleOnly)).isAdmin).toBe(false)
    expect(parse(await get('/api/me', admin)).isAdmin).toBe(true)
  })

  it('exports every completion as CSV with formula injection neutralized', async () => {
    await store.saveCertificate(certificate())
    await store.saveCertificate(
      certificate({
        id: 'DR-CSA-AAAA-BBBB-CCCC',
        name: '=HYPERLINK("x")',
        email: 'eve@example.com',
      }),
    )
    const res = await get('/api/admin/completions.csv', admin)
    const csv = String(res.body)

    expect(res.headers['Content-Type']).toContain('text/csv')
    expect(res.headers['Content-Disposition']).toContain('attachment')
    const lines = csv.trim().split('\r\n')
    expect(lines[0]).toBe(
      '"Name","Email","Completion date","Expiration date","Score (%)","Certificate ID"',
    )
    expect(lines).toContain(
      '"Alice Learner","alice@example.com","2026-11-17","2027-11-17","96","DR-CSA-7K2M-Q9XD-4HTB"',
    )
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
  })
})

describe('/api/admin/learners.csv', () => {
  it('lists attempt counts that match the learner’s own progress, for admins only', async () => {
    await sendJson('PUT', '/api/profile', { name: 'Alice Learner' }, alice)
    await takeQuiz('1', 3, alice)
    await takeQuiz('1', 8, alice)
    await takeQuiz('2', 8, alice)

    expect((await get('/api/admin/learners.csv', alice)).status).toBe(403)
    const res = await get('/api/admin/learners.csv', admin)
    expect(res.status).toBe(200)
    expect(res.headers['Content-Type']).toContain('text/csv')
    const [header, row] = String(res.body).trim().split('\r\n')
    expect(header).toContain('"Module 1 attempts"')
    expect(header).toContain('"Final assessment attempts"')
    const cells = row!.split(',')
    expect(cells.slice(0, 5)).toEqual([
      '"Alice Learner"',
      '"alice@example.com"',
      '"2 of 10"',
      '"2"',
      '"1"',
    ])

    const progress = parse(await get('/api/progress', alice))
    expect(progress.state.modules['1'].quizAttempts).toBe(2)
    expect(progress.state.modules['2'].quizAttempts).toBe(1)
  })
})

describe('/api/admin/learners', () => {
  it('shows each learner’s progress to admins only, without their notes or answers', async () => {
    await sendJson('PUT', '/api/profile', { name: 'Alice Learner' }, alice)
    await sendJson(
      'PUT',
      '/api/progress',
      { state: { version: 1, modules: { '1': { notes: 'private note' } } } },
      alice,
    )
    await takeQuiz('1', 3, alice)
    await takeQuiz('1', 8, alice)
    await takeQuiz('2', 8, alice)
    await get('/api/progress', bob)

    expect((await get('/api/admin/learners', alice)).status).toBe(403)
    const res = await get('/api/admin/learners', admin)
    expect(res.status).toBe(200)
    expect(res.headers['Cache-Control']).toBe('no-store')
    const body = String(res.body)
    expect(body).not.toContain('private note')
    expect(body).not.toMatch(/correctIndex|questionIds|uiState/)

    const { learners } = JSON.parse(body) as { learners: Record<string, unknown>[] }
    const aliceRow = learners.find((l) => l.email === 'alice@example.com')
    expect(aliceRow).toMatchObject({
      name: 'Alice Learner',
      status: 'in-progress',
      modulesPassed: 2,
      currentModule: 3,
      final: { attempts: 0, passed: false, cooldownUntil: null },
      certificate: null,
    })
    expect((aliceRow!.modules as { attempts: number }[]).slice(0, 2)).toMatchObject([
      { id: 1, attempts: 2, passed: true, bestPercent: 80 },
      { id: 2, attempts: 1, passed: true },
    ])
    expect(learners.find((l) => l.email === 'bob@example.com')).toMatchObject({
      status: 'not-started',
      modulesPassed: 0,
      currentModule: 1,
    })
  })
})

describe('/api/admin/admins', () => {
  const add = (email: unknown, who = admin) => sendJson('POST', '/api/admin/admins', { email }, who)
  const remove = (email: unknown, who = admin) =>
    sendJson('POST', '/api/admin/admins/remove', { email }, who)

  it('lets admins add and remove admins, and logs each change', async () => {
    expect(parse(await get('/api/me', alice)).isAdmin).toBe(false)
    const added = await add(' Alice@Example.com ')
    expect(added.status).toBe(200)
    expect(parse(added).admins).toEqual([
      { email: 'admin@example.com', permanent: true, addedBy: null, addedAt: null },
      {
        email: 'alice@example.com',
        permanent: false,
        addedBy: 'admin@example.com',
        addedAt: clock.now.toISOString(),
      },
    ])
    expect(parse(await get('/api/me', alice)).isAdmin).toBe(true)
    expect((await get('/api/admin/learners', alice)).status).toBe(200)

    // A newly added admin can add others.
    expect((await add('bob@example.com', alice)).status).toBe(200)
    expect((await remove('alice@example.com', bob)).status).toBe(200)
    expect(parse(await get('/api/me', alice)).isAdmin).toBe(false)
    expect((await get('/api/admin/learners', alice)).status).toBe(403)

    const overview = parse(await get('/api/admin/admins', admin))
    expect(overview.audit).toEqual([
      expect.objectContaining({
        actor: 'bob@example.com',
        action: 'removed',
        target: 'alice@example.com',
      }),
      expect.objectContaining({
        actor: 'alice@example.com',
        action: 'added',
        target: 'bob@example.com',
      }),
      expect.objectContaining({
        actor: 'admin@example.com',
        action: 'added',
        target: 'alice@example.com',
      }),
    ])
  })

  it('rejects bad emails, other domains, duplicates, self-removal and permanent admins', async () => {
    expect((await add('not-an-email')).status).toBe(400)
    expect(parse(await add('eve@elsewhere.com')).error).toBe(
      'Only @example.com accounts can be admins.',
    )
    expect((await add('admin@example.com')).status).toBe(409)
    expect((await add('bob@example.com')).status).toBe(200)
    expect((await add('bob@example.com')).status).toBe(409)
    expect(parse(await remove('bob@example.com', bob)).error).toBe(
      "You can't remove yourself as an admin.",
    )
    expect((await remove('admin@example.com', bob)).status).toBe(400)
    expect((await remove('carol@example.com')).status).toBe(404)
  })

  it('is closed to non-admins and to cross-site requests', async () => {
    expect((await get('/api/admin/admins', alice)).status).toBe(403)
    expect((await add('alice@example.com', alice)).status).toBe(403)
    expect(parse(await get('/api/me', alice)).isAdmin).toBe(false)
    const crossSite = await call(
      'POST',
      '/api/admin/admins',
      { ...admin, 'content-type': 'text/plain' },
      JSON.stringify({ email: 'alice@example.com' }),
    )
    expect(crossSite.status).toBe(403)
    expect(parse(await get('/api/me', alice)).isAdmin).toBe(false)
  })
})
