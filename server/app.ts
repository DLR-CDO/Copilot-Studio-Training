import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { PASSING_PERCENT } from '../src/content/types'
import { isExpired } from '../src/lib/completion'
import {
  LOGOUT_URL,
  MOCK_COOKIE,
  getSignedInUser,
  isAllowedTenant,
  loginUrl,
  safeRedirectPath,
  type SignedInUser,
} from './auth'
import { certificateContent, renderCertificatePdf, verifyUrlFor } from './certificatePdf'
import type { ServerConfig } from './config'
import { CERTIFICATE_ID_PATTERN, ValidationError, type LearnerService } from './learnerService'
import { log } from './log'
import {
  completionsCsv,
  renderAdminPage,
  renderForbiddenPage,
  renderMockLoginPage,
  renderSignedOutPage,
  renderVerifyPage,
} from './pages'
import type { CertificateRecord, Store } from './store'

export interface AppDeps {
  config: ServerConfig
  service: LearnerService
  store: Store
  loadLogo: () => Promise<Uint8Array | null>
  now?: () => Date
}

const MAX_BODY_BYTES = 64 * 1024
const PAGE_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function send(
  res: ServerResponse,
  status: number,
  body: string | Uint8Array,
  headers: Record<string, string>,
): void {
  res.writeHead(status, headers)
  res.end(body)
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  send(res, status, JSON.stringify(body), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
}

function sendPage(res: ServerResponse, status: number, html: string): void {
  send(res, status, html, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': PAGE_CSP,
    'Cache-Control': 'no-store',
  })
}

function redirect(res: ServerResponse, location: string, cookie?: string): void {
  res.writeHead(302, { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) })
  res.end()
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new ValidationError('Request is too large.', 413)
    chunks.push(chunk)
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error()
    return parsed as Record<string, unknown>
  } catch {
    throw new ValidationError('Request body must be a JSON object.')
  }
}

/** Blocks cross-site form posts and scripted requests from other origins. */
function isSameOriginJson(req: IncomingMessage): boolean {
  if (!(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json'))
    return false
  const origin = req.headers.origin
  if (origin) {
    try {
      return new URL(origin).host === req.headers.host
    } catch {
      return false
    }
  }
  const site = req.headers['sec-fetch-site']
  return site == null || site === 'same-origin'
}

function baseUrl(req: IncomingMessage, config: ServerConfig): string {
  return config.publicBaseUrl ?? `http://${req.headers.host ?? 'localhost'}`
}

function certificateSummary(
  cert: CertificateRecord | null,
  req: IncomingMessage,
  deps: AppDeps,
): Record<string, unknown> | null {
  if (!cert) return null
  return {
    id: cert.id,
    name: cert.name,
    course: cert.course,
    completedAt: cert.completedAt,
    expiresAt: cert.expiresAt,
    scorePercent: cert.scorePercent,
    expired: isExpired(cert.expiresAt, deps.now?.() ?? new Date()),
    verifyUrl: verifyUrlFor(baseUrl(req, deps.config), cert.id),
  }
}

export function createRequestHandler(deps: AppDeps) {
  return (req: IncomingMessage, res: ServerResponse): void => {
    handle(req, res, deps).catch((err: unknown) => {
      log.error('Request failed', {
        method: req.method,
        path: req.url?.split('?')[0],
        error: err instanceof Error ? err.message : String(err),
      })
      if (!res.headersSent) sendJson(res, 500, { error: 'Something went wrong. Please try again.' })
      else res.end()
    })
  }
}

async function handle(req: IncomingMessage, res: ServerResponse, deps: AppDeps): Promise<void> {
  const { config } = deps
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname
  const method = req.method ?? 'GET'

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('X-Frame-Options', 'DENY')

  // Public routes — no sign-in.
  if (path === '/healthz') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' })
  if (path === '/verify' && (method === 'GET' || method === 'HEAD')) {
    return handleVerify(res, url, deps)
  }
  if (path === '/signed-out') return sendPage(res, 200, renderSignedOutPage())
  if (config.authMode === 'mock' && path.startsWith('/.auth/'))
    return handleMockAuth(res, url, config)

  const user = getSignedInUser(req, config)
  if (!user) {
    if (path.startsWith('/api/')) {
      return sendJson(res, 401, { error: 'Sign in required.', loginUrl: loginUrl('/') })
    }
    return redirect(res, loginUrl(`${path}${url.search}`))
  }
  if (config.authMode === 'easyauth' && !isAllowedTenant(user, config)) {
    return sendPage(
      res,
      403,
      renderForbiddenPage('This course is only for Digital Realty accounts.'),
    )
  }
  const isAdmin = config.adminEmails.has(user.email)

  try {
    if (path.startsWith('/api/')) return await handleApi(req, res, url, user, isAdmin, deps)
  } catch (err) {
    if (err instanceof ValidationError) return sendJson(res, err.status, { error: err.message })
    throw err
  }

  if (path === '/admin/completions' || path === '/admin/completions.csv') {
    if (!isAdmin) {
      return sendPage(res, 403, renderForbiddenPage('Only course admins can export completions.'))
    }
    const certificates = await deps.service.listCertificates()
    if (path.endsWith('.csv')) {
      const day = (deps.now?.() ?? new Date()).toISOString().slice(0, 10)
      return send(res, 200, completionsCsv(certificates), {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="completions-${day}.csv"`,
        'Cache-Control': 'no-store',
      })
    }
    return sendPage(res, 200, renderAdminPage(certificates.length))
  }

  return serveStatic(req, res, path, config.staticDir)
}

async function handleVerify(res: ServerResponse, url: URL, deps: AppDeps): Promise<void> {
  const query = (url.searchParams.get('id') ?? '').trim().toUpperCase().slice(0, 40)
  if (!query) return sendPage(res, 200, renderVerifyPage({ kind: 'empty' }))
  if (!CERTIFICATE_ID_PATTERN.test(query)) {
    return sendPage(res, 200, renderVerifyPage({ kind: 'invalid', query }))
  }
  const certificate = await deps.store.getCertificate(query)
  if (!certificate) return sendPage(res, 200, renderVerifyPage({ kind: 'not-found', query }))
  return sendPage(
    res,
    200,
    renderVerifyPage({ kind: 'found', query, certificate, now: deps.now?.() ?? new Date() }),
  )
}

/** Stand-in for /.auth/* so sign-in and sign-out can be exercised without Azure. */
function handleMockAuth(res: ServerResponse, url: URL, config: ServerConfig): void {
  const cookie = (value: string) => `${MOCK_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax`
  if (url.pathname === '/.auth/login/aad') {
    const returnTo = safeRedirectPath(url.searchParams.get('post_login_redirect_uri'))
    return sendPage(res, 200, renderMockLoginPage(config.mockUsers, returnTo))
  }
  if (url.pathname === '/.auth/login/mock') {
    const index = Number(url.searchParams.get('user'))
    if (!Number.isInteger(index) || !config.mockUsers[index])
      return sendJson(res, 400, { error: 'Unknown user.' })
    const returnTo = safeRedirectPath(url.searchParams.get('post_login_redirect_uri'))
    return redirect(res, returnTo, cookie(String(index)))
  }
  if (url.pathname === '/.auth/logout') {
    return redirect(
      res,
      safeRedirectPath(url.searchParams.get('post_logout_redirect_uri')),
      cookie('none'),
    )
  }
  return sendJson(res, 404, { error: 'Not found.' })
}

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  user: SignedInUser,
  isAdmin: boolean,
  deps: AppDeps,
): Promise<void> {
  const { service } = deps
  const method = req.method ?? 'GET'
  const path = url.pathname

  if (method !== 'GET' && !isSameOriginJson(req)) {
    return sendJson(res, 403, { error: 'Requests must come from the course site as JSON.' })
  }

  if (path === '/api/me' && method === 'GET') {
    return sendJson(res, 200, {
      name: user.name,
      email: user.email,
      isAdmin,
      logoutUrl: LOGOUT_URL,
    })
  }

  if (path === '/api/progress' && method === 'GET') {
    const snapshot = await service.getProgress(user)
    return sendJson(res, 200, {
      state: snapshot.state,
      completion: snapshot.completion,
      passingPercent: PASSING_PERCENT,
      certificate: certificateSummary(snapshot.certificate, req, deps),
    })
  }

  if (path === '/api/progress' && method === 'PUT') {
    const body = await readJsonBody(req)
    await service.saveUiState(user, body.state)
    res.writeHead(204, { 'Cache-Control': 'no-store' })
    return void res.end()
  }

  const quizMatch = /^\/api\/quiz\/(\d{1,2})$/.exec(path)
  if (quizMatch && method === 'POST') {
    const body = await readJsonBody(req)
    const outcome = await service.submitQuiz(user, Number(quizMatch[1]), body.answers)
    return sendJson(res, 200, {
      score: outcome.score,
      passed: outcome.passed,
      state: outcome.state,
      completion: outcome.completion,
      certificate: certificateSummary(outcome.certificate, req, deps),
    })
  }

  if (path === '/api/certificate/pdf' && method === 'GET') {
    // Always the signed-in learner's own certificate; there is no ID parameter to tamper with.
    const { certificate } = await service.getProgress(user)
    if (!certificate) return sendJson(res, 404, { error: 'No certificate has been issued yet.' })
    const pdf = await renderCertificatePdf(
      certificateContent(certificate, verifyUrlFor(baseUrl(req, deps.config), certificate.id)),
      await deps.loadLogo(),
    )
    return send(res, 200, pdf, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${certificate.id}.pdf"`,
      'Cache-Control': 'no-store',
    })
  }

  return sendJson(res, 404, { error: 'Not found.' })
}

async function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  staticDir: string,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed', { 'Content-Type': 'text/plain' })
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(path)
  } catch {
    return send(res, 400, 'Bad request', { 'Content-Type': 'text/plain' })
  }

  const root = resolve(staticDir)
  const filePath = resolve(root, `.${decoded}`)
  if (filePath !== root && !filePath.startsWith(root + sep)) {
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' })
  }

  const file = await stat(filePath).catch(() => null)
  if (file?.isFile()) {
    const hashed = /-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(filePath)
    return streamFile(req, res, filePath, file.size, {
      'Cache-Control': hashed ? 'private, max-age=31536000, immutable' : 'private, max-age=3600',
    })
  }
  if (extname(decoded)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' })

  // Client-side routes fall back to the SPA shell.
  const indexPath = resolve(root, 'index.html')
  const index = await stat(indexPath).catch(() => null)
  if (!index) return send(res, 404, 'Site has not been built', { 'Content-Type': 'text/plain' })
  return streamFile(req, res, indexPath, index.size, { 'Cache-Control': 'no-cache' })
}

function streamFile(
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string,
  size: number,
  headers: Record<string, string>,
): void {
  res.writeHead(200, {
    'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': String(size),
    ...headers,
  })
  if (req.method === 'HEAD') return void res.end()
  createReadStream(filePath).pipe(res)
}
