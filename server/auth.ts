import type { IncomingMessage } from 'node:http'
import type { ServerConfig } from './config'

export interface SignedInUser {
  name: string
  email: string
  tenantId?: string
}

interface PrincipalClaim {
  typ: string
  val: string
}

const EMAIL_CLAIMS = [
  'preferred_username',
  'email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
]
const NAME_CLAIMS = ['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
const TENANT_CLAIMS = ['tid', 'http://schemas.microsoft.com/identity/claims/tenantid']

export const MOCK_COOKIE = 'mock_user'

function firstClaim(claims: PrincipalClaim[], types: string[]): string | undefined {
  for (const typ of types) {
    const val = claims.find((c) => c.typ === typ)?.val?.trim()
    if (val) return val
  }
  return undefined
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+$/.test(value)
}

/** Decode the X-MS-CLIENT-PRINCIPAL header that App Service Authentication injects. */
export function parseClientPrincipal(header: string | undefined): SignedInUser | null {
  if (!header) return null
  try {
    const decoded = JSON.parse(Buffer.from(header, 'base64').toString('utf8')) as {
      claims?: unknown
    }
    if (!Array.isArray(decoded.claims)) return null
    const claims = decoded.claims.filter(
      (c): c is PrincipalClaim =>
        typeof c === 'object' &&
        c != null &&
        typeof (c as PrincipalClaim).typ === 'string' &&
        typeof (c as PrincipalClaim).val === 'string',
    )
    const email = firstClaim(claims, EMAIL_CLAIMS)?.toLowerCase()
    if (!email || !isValidEmail(email)) return null
    const name = (firstClaim(claims, NAME_CLAIMS) ?? email).slice(0, 200)
    const tenantId = firstClaim(claims, TENANT_CLAIMS)?.toLowerCase()
    return { name, email, ...(tenantId ? { tenantId } : {}) }
  } catch {
    return null
  }
}

export function readCookie(req: IncomingMessage, name: string): string | undefined {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

/**
 * The signed-in learner, or null. In Easy Auth mode the principal header is only trusted when
 * App Service Authentication is on, because App Service then strips client-sent copies of it.
 */
export function getSignedInUser(req: IncomingMessage, config: ServerConfig): SignedInUser | null {
  if (config.authMode === 'mock') {
    const choice = readCookie(req, MOCK_COOKIE)
    if (choice === 'none') return null
    const user = config.mockUsers[Number(choice ?? 0)] ?? config.mockUsers[0]
    return user ? { ...user } : null
  }
  if (!config.easyAuthEnabled) return null
  const header = req.headers['x-ms-client-principal']
  return parseClientPrincipal(Array.isArray(header) ? header[0] : header)
}

export function isAllowedTenant(user: SignedInUser, config: ServerConfig): boolean {
  return !config.allowedTenantId || user.tenantId === config.allowedTenantId
}

/** Only same-site relative paths, so login and logout can't be used as open redirects. */
export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export function loginUrl(returnTo: string): string {
  return `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(safeRedirectPath(returnTo))}`
}

export const LOGOUT_URL = `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent('/signed-out')}`
