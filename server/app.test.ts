// @vitest-environment node
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { quizzesByModule } from '../src/content/quizzes'
import { createRequestHandler } from './app'
import { loadConfig } from './config'
import { toApiRequest } from './functions'
import { LearnerService } from './learnerService'
import { MemoryStore } from './store'

const staticDir = mkdtempSync(join(tmpdir(), 'academy-static-'))
writeFileSync(join(staticDir, 'index.html'), '<!doctype html><div id="root"></div>')

let server: Server
let base: string

beforeAll(async () => {
  const config = loadConfig({ AUTH_MODE: 'mock' })
  const store = new MemoryStore()
  const service = new LearnerService(store, quizzesByModule)
  server = createServer(
    createRequestHandler({ config, store, service, loadLogo: async () => null, staticDir }),
  )
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

const get = (path: string, cookie?: string) =>
  fetch(`${base}${path}`, { redirect: 'manual', headers: cookie ? { cookie } : {} })

describe('local mock server', () => {
  it('signs in as a mock learner and passes identity to the API', async () => {
    const login = await get('/.auth/login/mock?user=1&post_login_redirect_uri=%2Fmodule%2F2')
    expect(login.status).toBe(302)
    expect(login.headers.get('location')).toBe('/module/2')
    const cookie = login.headers.get('set-cookie')!.split(';')[0]!

    expect(await (await get('/api/me', cookie)).json()).toMatchObject({
      email: 'learner.two@example.com',
    })
  })

  it('rejects the mock outsider account and supports sign-out', async () => {
    expect((await get('/api/me', 'mock_user=2')).status).toBe(403)
    const logout = await get('/.auth/logout?post_logout_redirect_uri=%2Fsigned-out')
    expect(logout.headers.get('location')).toBe('/signed-out')
    expect((await get('/api/me', 'mock_user=none')).status).toBe(401)
  })

  it('does not follow absolute redirect targets off the site', async () => {
    const res = await get(
      '/.auth/login/mock?user=0&post_login_redirect_uri=https%3A%2F%2Fevil.test%2Fx',
    )
    expect(res.headers.get('location')).toBe('/x')
    const res2 = await get('/.auth/login/mock?user=0&post_login_redirect_uri=%2F%2Fevil.test')
    expect(res2.headers.get('location')).toBe('/')
  })

  it('serves the SPA shell for client routes and blocks path traversal', async () => {
    expect(await (await get('/verify')).text()).toContain('id="root"')
    const res = await get('/..%2f..%2f..%2fetc%2fpasswd')
    expect(res.status).toBe(404)
    expect(await res.text()).not.toContain('root:')
  })
})

describe('loadConfig', () => {
  it('refuses mock sign-in when running in Azure', () => {
    expect(() => loadConfig({ AUTH_MODE: 'mock', FUNCTIONS_WORKER_RUNTIME: 'node' })).toThrow()
  })

  it('requires storage and defaults to the Digital Realty domain in production', () => {
    expect(() => loadConfig({})).toThrow(/AZURE_STORAGE_CONNECTION_STRING/)
    const config = loadConfig({ AZURE_STORAGE_CONNECTION_STRING: 'UseDevelopmentStorage=true' })
    expect(config).toMatchObject({ authMode: 'swa', allowedEmailDomain: 'digitalrealty.com' })
  })
})

describe('Azure Functions adapter', () => {
  it('maps the Functions request onto the shared API request', () => {
    const req = toApiRequest({
      method: 'put',
      url: 'https://site.example.test/api/progress?x=1',
      headers: { 'X-MS-CLIENT-PRINCIPAL': 'abc', 'Content-Type': 'application/json' },
      rawBody: '{"state":{}}',
    })
    expect(req).toMatchObject({ method: 'PUT', path: '/api/progress', body: '{"state":{}}' })
    expect(req.query.get('x')).toBe('1')
    expect(req.headers['x-ms-client-principal']).toBe('abc')
    expect(req.headers['content-type']).toBe('application/json')
  })
})

describe('staticwebapp.config.json', () => {
  it('needs sign-in for pages and leaves admin checks to the API, not Static Web Apps roles', () => {
    const config = JSON.parse(
      readFileSync(join(process.cwd(), 'public/staticwebapp.config.json'), 'utf8'),
    ) as { routes: { route: string; allowedRoles?: string[] }[] }
    expect(config.routes.some((r) => r.allowedRoles?.includes('admin'))).toBe(false)
    expect(config.routes.find((r) => r.route === '/*')?.allowedRoles).toEqual(['authenticated'])
  })
})
