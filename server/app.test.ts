// @vitest-environment node
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
import { createRequestHandler } from './app'
import type { ServerConfig } from './config'
import { LearnerService } from './learnerService'
import { MemoryStore, type CertificateRecord } from './store'
import { answersFor } from './testing'

const TENANT = '11111111-2222-3333-4444-555555555555'
const staticDir = mkdtempSync(join(tmpdir(), 'academy-static-'))
writeFileSync(join(staticDir, 'index.html'), '<!doctype html><div id="root"></div>')

const config: ServerConfig = {
  port: 0,
  staticDir,
  authMode: 'easyauth',
  easyAuthEnabled: true,
  allowedTenantId: TENANT,
  adminEmails: new Set(['admin@example.com']),
  publicBaseUrl: 'https://academy.example.test',
  mockUsers: [],
}

const clock = { now: new Date('2026-11-17T15:00:00Z') }
let store: MemoryStore
let server: Server
let base: string

function principal(name: string, email: string, tid = TENANT): string {
  const claims = [
    { typ: 'name', val: name },
    { typ: 'preferred_username', val: email },
    { typ: 'http://schemas.microsoft.com/identity/claims/tenantid', val: tid },
  ]
  return Buffer.from(JSON.stringify({ auth_typ: 'aad', claims })).toString('base64')
}

const as = (name: string, email: string, tid?: string) => ({
  'x-ms-client-principal': principal(name, email, tid),
})
const alice = as('Alice Learner', 'alice@example.com')
const bob = as('Bob Learner', 'bob@example.com')
const admin = as('Course Admin', 'admin@example.com')

function get(path: string, headers: Record<string, string> = {}) {
  return fetch(`${base}${path}`, { headers, redirect: 'manual' })
}

function postJson(path: string, body: unknown, headers: Record<string, string>) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, ...headers },
    body: JSON.stringify(body),
  })
}

async function passAllQuizzes(headers: Record<string, string>) {
  for (let id = 1; id <= 10; id += 1) {
    const res = await postJson(`/api/quiz/${id}`, { answers: answersFor(id, 5) }, headers)
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

beforeAll(async () => {
  server = createServer((req, res) => handler(req, res))
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

let handler: ReturnType<typeof createRequestHandler>
beforeEach(() => {
  clock.now = new Date('2026-11-17T15:00:00Z')
  store = new MemoryStore()
  handler = createRequestHandler({
    config,
    store,
    service: new LearnerService(store, quizzesByModule, () => clock.now),
    loadLogo: async () => null,
    now: () => clock.now,
  })
})

describe('/verify (public)', () => {
  it('opens without sign-in and shows only name, course, completion date, and status', async () => {
    await store.saveCertificate(certificate())
    const res = await get('/verify?id=dr-csa-7k2m-q9xd-4htb')
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-security-policy')).toContain("default-src 'none'")
    expect(html).toContain('Alice Learner')
    expect(html).toContain('Copilot Studio Advanced')
    expect(html).toContain('November 17, 2026')
    expect(html).toContain('Valid')
    expect(html).not.toContain('alice@example.com')
    expect(html).not.toContain('96')
    expect(html).not.toContain('November 17, 2027')
  })

  it('shows expired certificates as expired', async () => {
    await store.saveCertificate(certificate())
    clock.now = new Date('2027-11-17T15:00:00Z')
    const html = await (await get('/verify?id=DR-CSA-7K2M-Q9XD-4HTB')).text()
    expect(html).toContain('Expired')
    expect(html).not.toContain('>Valid<')
  })

  it('says when no certificate matches, and rejects malformed IDs', async () => {
    expect(await (await get('/verify?id=DR-CSA-0000-0000-0000')).text()).toContain(
      'No certificate was found',
    )
    expect(await (await get('/verify?id=%3Cscript%3E')).text()).toContain(
      "doesn't look like a certificate ID",
    )
  })

  it('escapes stored names', async () => {
    await store.saveCertificate(certificate({ name: '<img src=x onerror=alert(1)>' }))
    const html = await (await get('/verify?id=DR-CSA-7K2M-Q9XD-4HTB')).text()
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<img src=x')
  })

  it('shows an empty form with no ID', async () => {
    const html = await (await get('/verify')).text()
    expect(html).toContain('Verify a certificate')
    expect(html).not.toContain('role="status"')
  })
})

describe('sign-in', () => {
  it('redirects pages to Microsoft sign-in and keeps the destination', async () => {
    const res = await get('/module/2?x=1')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(
      '/.auth/login/aad?post_login_redirect_uri=%2Fmodule%2F2%3Fx%3D1',
    )
  })

  it('returns 401 for the API without sign-in', async () => {
    expect((await get('/api/progress')).status).toBe(401)
  })

  it('reads the learner from the App Service principal header', async () => {
    const me = await (await get('/api/me', alice)).json()
    expect(me).toMatchObject({ name: 'Alice Learner', email: 'alice@example.com', isAdmin: false })
  })

  it('refuses accounts from another tenant', async () => {
    const res = await get('/', as('Outsider', 'someone@contoso.com', 'other-tenant'))
    expect(res.status).toBe(403)
  })

  it('ignores the principal header when App Service Authentication is off', async () => {
    handler = createRequestHandler({
      config: { ...config, easyAuthEnabled: false },
      store,
      service: new LearnerService(store, quizzesByModule),
      loadLogo: async () => null,
    })
    expect((await get('/api/me', alice)).status).toBe(401)
  })

  it('serves the app shell to signed-in learners', async () => {
    const res = await get('/module/3', alice)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('id="root"')
  })
})

describe('learner data', () => {
  it('only ever returns the signed-in learner’s own progress and certificate', async () => {
    await passAllQuizzes(alice)

    const aliceProgress = await (await get('/api/progress', alice)).json()
    expect(aliceProgress.completion.complete).toBe(true)
    expect(aliceProgress.certificate.name).toBe('Alice Learner')
    expect(aliceProgress.certificate.verifyUrl).toBe(
      `https://academy.example.test/verify?id=${aliceProgress.certificate.id}`,
    )

    const bobProgress = await (await get('/api/progress', bob)).json()
    expect(bobProgress.certificate).toBeNull()
    expect(bobProgress.completion.passedModules).toEqual([])
    expect((await get('/api/certificate/pdf', bob)).status).toBe(404)

    const pdf = await get('/api/certificate/pdf', alice)
    expect(pdf.status).toBe(200)
    expect(pdf.headers.get('content-type')).toBe('application/pdf')
    expect(pdf.headers.get('content-disposition')).toContain(aliceProgress.certificate.id)
  })

  it('scores quizzes on the server and ignores a claimed score', async () => {
    const res = await postJson('/api/quiz/1', { answers: answersFor(1, 2), score: 5 }, alice)
    expect(await res.json()).toMatchObject({ score: 2, passed: false })
  })

  it('rejects writes from other origins or without JSON', async () => {
    const crossSite = await postJson(
      '/api/quiz/1',
      { answers: {} },
      { ...alice, Origin: 'https://evil.example' },
    )
    expect(crossSite.status).toBe(403)
    const form = await fetch(`${base}/api/quiz/1`, {
      method: 'POST',
      headers: { ...alice, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'answers=1',
    })
    expect(form.status).toBe(403)
  })
})

describe('/admin/completions', () => {
  it('is limited to the admin allowlist', async () => {
    expect((await get('/admin/completions', alice)).status).toBe(403)
    expect((await get('/admin/completions.csv', alice)).status).toBe(403)
    expect((await get('/admin/completions', admin)).status).toBe(200)
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
    const res = await get('/admin/completions.csv', admin)
    const csv = await res.text()

    expect(res.headers.get('content-type')).toContain('text/csv')
    expect(res.headers.get('content-disposition')).toContain('attachment')
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

describe('static files', () => {
  it('does not serve files outside the site folder', async () => {
    const res = await get('/..%2f..%2f..%2fetc%2fpasswd', alice)
    expect(res.status).toBe(404)
    expect(await res.text()).not.toContain('root:')
  })
})
