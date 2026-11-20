import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { handleApi, MAX_BODY_BYTES, type ApiDeps, type ApiRequest } from './api'
import { MOCK_COOKIE, safeRedirectPath } from './auth'
import { log } from './log'
import { renderMockLoginPage } from './pages'

/**
 * Local development server: stands in for Azure Static Web Apps by serving the built site,
 * emulating /.auth sign-in with mock users, and passing /api/* to the same handler that
 * production runs as an Azure Function.
 */
export interface DevServerDeps extends ApiDeps {
  staticDir: string
}

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

function sendText(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end(text)
}

function redirect(res: ServerResponse, location: string, cookie?: string): void {
  res.writeHead(302, { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) })
  res.end()
}

async function readBody(req: IncomingMessage): Promise<string | null> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function flatHeaders(req: IncomingMessage): Record<string, string | undefined> {
  const headers: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = Array.isArray(value) ? value.join(', ') : value
  }
  return headers
}

export function createRequestHandler(deps: DevServerDeps) {
  return (req: IncomingMessage, res: ServerResponse): void => {
    handle(req, res, deps).catch((err: unknown) => {
      log.error('Request failed', {
        method: req.method,
        path: req.url?.split('?')[0],
        error: err instanceof Error ? err.message : String(err),
      })
      if (!res.headersSent) sendText(res, 500, 'Something went wrong.')
      else res.end()
    })
  }
}

async function handle(req: IncomingMessage, res: ServerResponse, deps: DevServerDeps) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname
  const method = req.method ?? 'GET'

  if (path.startsWith('/.auth/')) return handleMockAuth(res, url, deps)

  if (path.startsWith('/api/')) {
    const body = await readBody(req)
    if (body === null) return sendText(res, 413, 'Request is too large.')
    const apiReq: ApiRequest = {
      method,
      path,
      query: url.searchParams,
      headers: flatHeaders(req),
      body,
    }
    const out = await handleApi(apiReq, deps)
    res.writeHead(out.status, out.headers)
    return void res.end(out.body)
  }

  return serveStatic(req, res, path, deps.staticDir)
}

/** Stand-in for Static Web Apps' /.auth/* endpoints. */
function handleMockAuth(res: ServerResponse, url: URL, deps: DevServerDeps): void {
  const users = deps.config.mockUsers
  const cookie = (value: string) => `${MOCK_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax`
  const returnTo = (param: string) => {
    const raw = url.searchParams.get(param)
    try {
      // Static Web Apps accepts absolute URLs on the same site; keep only the path here.
      const parsed = raw ? new URL(raw, 'http://localhost') : null
      return safeRedirectPath(parsed ? `${parsed.pathname}${parsed.search}` : null)
    } catch {
      return '/'
    }
  }

  if (url.pathname === '/.auth/login/aad') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return void res.end(renderMockLoginPage(users, returnTo('post_login_redirect_uri')))
  }
  if (url.pathname === '/.auth/login/mock') {
    const index = Number(url.searchParams.get('user'))
    if (!Number.isInteger(index) || !users[index]) return sendText(res, 400, 'Unknown user.')
    return redirect(res, returnTo('post_login_redirect_uri'), cookie(String(index)))
  }
  if (url.pathname === '/.auth/logout') {
    return redirect(res, returnTo('post_logout_redirect_uri'), cookie('none'))
  }
  return sendText(res, 404, 'Not found')
}

async function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  staticDir: string,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(res, 405, 'Method not allowed')
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(path)
  } catch {
    return sendText(res, 400, 'Bad request')
  }

  const root = resolve(staticDir)
  const filePath = resolve(root, `.${decoded}`)
  if (filePath !== root && !filePath.startsWith(root + sep)) {
    return sendText(res, 404, 'Not found')
  }

  const file = await stat(filePath).catch(() => null)
  if (file?.isFile()) return streamFile(req, res, filePath, file.size)
  if (extname(decoded)) return sendText(res, 404, 'Not found')

  // Client-side routes fall back to the SPA shell.
  const indexPath = resolve(root, 'index.html')
  const index = await stat(indexPath).catch(() => null)
  if (!index) return sendText(res, 404, 'Site has not been built')
  return streamFile(req, res, indexPath, index.size)
}

function streamFile(
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string,
  size: number,
): void {
  res.writeHead(200, {
    'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': String(size),
    'Cache-Control': 'no-cache',
  })
  if (req.method === 'HEAD') return void res.end()
  createReadStream(filePath).pipe(res)
}
