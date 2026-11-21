import { PASSING_PERCENT } from '../src/content/types'
import { certificateTitle, isExpired } from '../src/lib/completion'
import { AdminService } from './adminService'
import { LOGOUT_URL, identify, type SignedInUser } from './auth'
import { certificateContent, renderCertificatePdf, verifyUrlFor } from './certificatePdf'
import type { ServerConfig } from './config'
import {
  CERTIFICATE_ID_PATTERN,
  ValidationError,
  type LearnerService,
  type ProgressSnapshot,
} from './learnerService'
import { log } from './log'
import { clientIp, type RateLimiter } from './rateLimit'
import { completionsCsv, learnersCsv } from './pages'
import type { CertificateRecord, Store } from './store'

/** Hosting-neutral request, so the same handler runs in Azure Functions and the local server. */
export interface ApiRequest {
  method: string
  /** Path including the /api prefix, e.g. /api/progress. */
  path: string
  query: URLSearchParams
  /** Lower-case header names. */
  headers: Record<string, string | undefined>
  body: string
}

export interface ApiResponse {
  status: number
  headers: Record<string, string>
  body?: string | Uint8Array
}

export interface ApiDeps {
  config: ServerConfig
  service: LearnerService
  store: Store
  loadLogo: () => Promise<Uint8Array | null>
  now?: () => Date
  /** Limits public certificate lookups per caller. */
  verifyLimiter?: RateLimiter
}

export const MAX_BODY_BYTES = 64 * 1024

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
}

function json(status: number, body: unknown): ApiResponse {
  return {
    status,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  }
}

function readJsonBody(req: ApiRequest): Record<string, unknown> {
  if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
    throw new ValidationError('Request is too large.', 413)
  }
  try {
    const parsed: unknown = JSON.parse(req.body)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error()
    return parsed as Record<string, unknown>
  } catch {
    throw new ValidationError('Request body must be a JSON object.')
  }
}

/**
 * Blocks cross-site form posts and scripted requests from other sites: browsers can only send a
 * JSON content type cross-origin after a CORS preflight, which this API never approves.
 */
function isSameSiteJson(req: ApiRequest): boolean {
  const type = (req.headers['content-type'] ?? '').toLowerCase()
  if (!type.startsWith('application/json')) return false
  const site = req.headers['sec-fetch-site']
  return site == null || site === 'same-origin'
}

function baseUrl(req: ApiRequest, config: ServerConfig): string {
  if (config.publicBaseUrl) return config.publicBaseUrl
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost'
  return `${config.authMode === 'mock' ? 'http' : 'https'}://${host}`
}

function certificateSummary(
  cert: CertificateRecord | null,
  req: ApiRequest,
  deps: ApiDeps,
): Record<string, unknown> | null {
  if (!cert) return null
  return {
    id: cert.id,
    name: cert.name,
    course: certificateTitle(cert.track),
    completedAt: cert.completedAt,
    expiresAt: cert.expiresAt,
    scorePercent: cert.scorePercent,
    expired: isExpired(cert.expiresAt, deps.now?.() ?? new Date()),
    verifyUrl: verifyUrlFor(baseUrl(req, deps.config), cert.id),
  }
}

function progressBody(snapshot: ProgressSnapshot, req: ApiRequest, deps: ApiDeps) {
  return {
    name: snapshot.name,
    state: snapshot.state,
    completion: snapshot.completion,
    assessment: snapshot.assessment,
    attempts: snapshot.attemptLog,
    passingPercent: PASSING_PERCENT,
    certificate: certificateSummary(snapshot.certificate, req, deps),
  }
}

export async function handleApi(req: ApiRequest, deps: ApiDeps): Promise<ApiResponse> {
  try {
    return await route(req, deps)
  } catch (err) {
    if (err instanceof ValidationError) return json(err.status, { error: err.message })
    log.error('Request failed', {
      method: req.method,
      path: req.path,
      error: err instanceof Error ? err.message : String(err),
    })
    return json(500, { error: 'Something went wrong. Please try again.' })
  }
}

async function route(req: ApiRequest, deps: ApiDeps): Promise<ApiResponse> {
  const { path, method } = req

  // Public — anyone with a certificate ID can check it.
  if (path === '/api/verify' && method === 'GET') return verify(req, deps)

  const identity = identify(req.headers, deps.config)
  if (identity.kind === 'anonymous') return json(401, { error: 'Sign in required.' })
  if (identity.kind === 'wrong-domain') {
    return json(403, {
      error: `This course is only for @${deps.config.allowedEmailDomain} accounts.`,
      email: identity.email,
      logoutUrl: LOGOUT_URL,
    })
  }

  if (method !== 'GET' && !isSameSiteJson(req)) {
    return json(403, { error: 'Requests must come from the course site as JSON.' })
  }
  return signedInRoute(req, identity.user, deps)
}

async function signedInRoute(
  req: ApiRequest,
  user: SignedInUser,
  deps: ApiDeps,
): Promise<ApiResponse> {
  const { service } = deps
  const { path, method } = req
  const admins = new AdminService(deps.store, deps.config, deps.now)

  if (path === '/api/me' && method === 'GET') {
    const isAdmin = await admins.isAdmin(user.email)
    return json(200, { email: user.email, isAdmin, logoutUrl: LOGOUT_URL })
  }

  if (path.startsWith('/api/admin/') && !(await admins.isAdmin(user.email))) {
    return json(403, { error: 'Only course admins can do this.' })
  }

  if (path === '/api/progress' && method === 'GET') {
    return json(200, progressBody(await service.getProgress(user), req, deps))
  }

  if (path === '/api/progress' && method === 'PUT') {
    await service.saveUiState(user, readJsonBody(req).state)
    return { status: 204, headers: SECURITY_HEADERS }
  }

  if (path === '/api/profile' && method === 'PUT') {
    const snapshot = await service.setName(user, readJsonBody(req).name)
    return json(200, progressBody(snapshot, req, deps))
  }

  const quizMatch = /^\/api\/quiz\/([a-z0-9-]{1,20})\/(start|submit)$/.exec(path)
  if (quizMatch && method === 'POST') {
    const [, scope = '', action] = quizMatch
    const body = readJsonBody(req)
    if (action === 'start') return json(200, await service.startQuiz(user, scope))
    const outcome = await service.submitQuiz(user, scope, body.attemptId, body.answers)
    return json(200, {
      ...progressBody(outcome, req, deps),
      result: {
        scope: outcome.scope,
        percent: outcome.percent,
        passed: outcome.passed,
        correctCount: outcome.correctCount,
        total: outcome.total,
        results: outcome.results,
      },
    })
  }

  if (path === '/api/certificate/pdf' && method === 'GET') {
    // Always the signed-in learner's own certificate; there is no ID parameter to tamper with.
    const { certificate } = await service.getProgress(user)
    if (!certificate) return json(404, { error: 'No certificate has been issued yet.' })
    const pdf = await renderCertificatePdf(
      certificateContent(certificate, verifyUrlFor(baseUrl(req, deps.config), certificate.id)),
      await deps.loadLogo(),
    )
    return {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.id}.pdf"`,
      },
      body: pdf,
    }
  }

  if (path === '/api/admin/completions.csv' && method === 'GET') {
    const day = (deps.now?.() ?? new Date()).toISOString().slice(0, 10)
    return {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="completions-${day}.csv"`,
      },
      body: completionsCsv(await service.listCertificates()),
    }
  }

  if (path === '/api/admin/learners' && method === 'GET') {
    return json(200, { learners: await service.adminOverview() })
  }

  if (path === '/api/admin/admins' && method === 'GET') {
    return json(200, await admins.overview())
  }

  if (path === '/api/admin/admins' && method === 'POST') {
    return json(200, await admins.add(user.email, readJsonBody(req).email))
  }

  if (path === '/api/admin/admins/remove' && method === 'POST') {
    return json(200, await admins.remove(user.email, readJsonBody(req).email))
  }

  if (path === '/api/admin/learners.csv' && method === 'GET') {
    const day = (deps.now?.() ?? new Date()).toISOString().slice(0, 10)
    return {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="learners-${day}.csv"`,
      },
      body: learnersCsv(await service.listLearners()),
    }
  }

  return json(404, { error: 'Not found.' })
}

/** Returns name, title, dates, and status only — never email, score, or other personal data. */
async function verify(req: ApiRequest, deps: ApiDeps): Promise<ApiResponse> {
  const now = deps.now?.() ?? new Date()
  if (deps.verifyLimiter && !deps.verifyLimiter.allow(clientIp(req.headers), now.getTime())) {
    return json(429, { error: 'Too many lookups. Wait a minute and try again.' })
  }
  const id = (req.query.get('id') ?? '').trim().toUpperCase()
  if (!CERTIFICATE_ID_PATTERN.test(id)) {
    return json(400, { error: 'That is not a valid certificate ID.' })
  }
  const certificate = await deps.store.getCertificate(id)
  if (!certificate) return json(404, { error: 'No certificate was found with that ID.' })
  return json(200, {
    id: certificate.id,
    name: certificate.name,
    course: certificateTitle(certificate.track),
    completedAt: certificate.completedAt,
    expiresAt: certificate.expiresAt,
    status: isExpired(certificate.expiresAt, now) ? 'expired' : 'valid',
  })
}
