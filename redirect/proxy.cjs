// Runs on the App Service copilotstudio-academy as a gateway in front of the Static Web App, so
// learners see this App Service's address instead of the Static Web App's generated one.
// Static Web Apps must list PUBLIC_HOST in forwardingGateway.allowedForwardedHosts
// (public/staticwebapp.config.json, Standard plan) so sign-in redirects come back here.
const http = require('node:http')
const https = require('node:https')

const target = new URL(process.env.PROXY_TARGET || 'invalid:')
const publicHost = (process.env.PUBLIC_HOST || '').toLowerCase()
if (target.protocol !== 'https:' || !/^[a-z0-9.-]+$/.test(publicHost)) {
  console.error('Set PROXY_TARGET (https origin) and PUBLIC_HOST (this site’s hostname).')
  process.exit(1)
}

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])
// Identity and forwarding headers are set here or by Static Web Apps, never taken from clients.
const STRIPPED = new Set(['host', 'x-forwarded-host', 'x-forwarded-proto', 'x-ms-client-principal'])

function forwardHeaders(incoming) {
  const headers = {}
  for (const [key, value] of Object.entries(incoming)) {
    if (!HOP_BY_HOP.has(key) && !STRIPPED.has(key) && !key.startsWith('x-arr-')) {
      headers[key] = value
    }
  }
  headers.host = target.host
  headers['x-forwarded-host'] = publicHost
  headers['x-forwarded-proto'] = 'https'
  return headers
}

/** Safety net: keep any absolute redirect to the Static Web App on this address. */
function rewriteLocation(location) {
  try {
    const url = new URL(location)
    if (url.host === target.host) {
      url.host = publicHost
      return url.toString()
    }
  } catch {
    // Relative locations are already correct.
  }
  return location
}

http
  .createServer((req, res) => {
    const upstream = https.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || 443,
        method: req.method,
        path: req.url && req.url.startsWith('/') ? req.url : '/',
        headers: forwardHeaders(req.headers),
        timeout: 60_000,
      },
      (upRes) => {
        const headers = {}
        for (const [key, value] of Object.entries(upRes.headers)) {
          if (!HOP_BY_HOP.has(key)) headers[key] = value
        }
        if (typeof headers.location === 'string')
          headers.location = rewriteLocation(headers.location)
        res.writeHead(upRes.statusCode || 502, headers)
        upRes.pipe(res)
      },
    )
    upstream.on('timeout', () => upstream.destroy(new Error('Upstream timed out')))
    upstream.on('error', (err) => {
      console.error('Proxy error:', err.message)
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('The course is temporarily unavailable. Please try again.')
    })
    req.pipe(upstream)
  })
  .listen(Number(process.env.PORT) || 8080, () =>
    console.log(`Serving ${target.origin} as https://${publicHost}`),
  )
