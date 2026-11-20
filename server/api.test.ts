// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
import { handleApi, type ApiDeps, type ApiResponse } from './api'
import type { ServerConfig } from './config'
import { LearnerService } from './learnerService'
import { MemoryStore, type CertificateRecord } from './store'
import { answersFor } from './testing'

const config: ServerConfig = {
  authMode: 'swa',
  allowedEmailDomain: 'example.com',
  adminEmails: new Set(['admin@example.com']),
  publicBaseUrl: 'https://academy.example.test',
  mockUsers: [],
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
    service: new LearnerService(store, quizzesByModule, () => clock.now),
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
const admin = principal('admin@example.com')

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

async function passAllQuizzes(headers: Headers) {
  for (let id = 1; id <= 10; id += 1) {
    const res = await sendJson('POST', `/api/quiz/${id}`, { answers: answersFor(id, 5) }, headers)
    expect(res.status).toBe(200)
  }
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
  it('needs no sign-in and returns only name, course, completion date, and status', async () => {
    await store.saveCertificate(certificate())
    const res = await get('/api/verify?id=dr-csa-7k2m-q9xd-4htb')

    expect(res.status).toBe(200)
    expect(parse(res)).toEqual({
      id: 'DR-CSA-7K2M-Q9XD-4HTB',
      name: 'Alice Learner',
      course: 'Copilot Studio Advanced',
      completedAt: '2026-11-17T15:00:00.000Z',
      status: 'valid',
    })
    expect(String(res.body)).not.toContain('alice@example.com')
    expect(String(res.body)).not.toContain('96')
  })

  it('reports expired certificates as expired', async () => {
    await store.saveCertificate(certificate())
    clock.now = new Date('2027-11-17T15:00:00Z')
    expect(parse(await get('/api/verify?id=DR-CSA-7K2M-Q9XD-4HTB')).status).toBe('expired')
  })

  it('returns 404 for unknown IDs and 400 for malformed ones', async () => {
    expect((await get('/api/verify?id=DR-CSA-0000-0000-0000')).status).toBe(404)
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

  it('scores quizzes on the server and ignores a claimed score', async () => {
    const res = await sendJson(
      'POST',
      '/api/quiz/1',
      { answers: answersFor(1, 2), score: 5 },
      alice,
    )
    expect(parse(res)).toMatchObject({ score: 2, passed: false })
  })

  it('rejects cross-site writes and non-JSON bodies', async () => {
    const crossSite = await sendJson(
      'POST',
      '/api/quiz/1',
      { answers: {} },
      {
        ...alice,
        'sec-fetch-site': 'cross-site',
      },
    )
    expect(crossSite.status).toBe(403)
    const form = await call(
      'POST',
      '/api/quiz/1',
      { ...alice, 'content-type': 'application/x-www-form-urlencoded' },
      'answers=1',
    )
    expect(form.status).toBe(403)
    const huge = await sendJson('PUT', '/api/progress', { state: 'x'.repeat(70_000) }, alice)
    expect(huge.status).toBe(413)
  })
})

describe('/api/admin/completions.csv', () => {
  it('is limited to the admin allowlist', async () => {
    expect((await get('/api/admin/completions.csv', alice)).status).toBe(403)
    expect((await get('/api/admin/completions.csv', admin)).status).toBe(200)
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
