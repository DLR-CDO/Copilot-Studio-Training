import type { ServerConfig } from './config'

export interface SignedInUser {
  email: string
}

export type Identity =
  | { kind: 'signed-in'; user: SignedInUser }
  | { kind: 'anonymous' }
  /** Signed in, but not with an account from the allowed email domain. */
  | { kind: 'wrong-domain'; email: string }

export const MOCK_COOKIE = 'mock_user'

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+$/.test(value)
}

/**
 * Decode the x-ms-client-principal header that Azure Static Web Apps adds to API requests.
 * Only Microsoft (aad) sign-ins are accepted; `userDetails` is the account's email address.
 */
export function parseSwaPrincipal(header: string | undefined): string | null {
  if (!header) return null
  try {
    const principal = JSON.parse(Buffer.from(header, 'base64').toString('utf8')) as {
      identityProvider?: unknown
      userDetails?: unknown
      userRoles?: unknown
    }
    if (principal.identityProvider !== 'aad') return null
    if (!Array.isArray(principal.userRoles) || !principal.userRoles.includes('authenticated')) {
      return null
    }
    const email = typeof principal.userDetails === 'string' ? principal.userDetails.trim() : ''
    return isValidEmail(email) ? email.toLowerCase() : null
  } catch {
    return null
  }
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  for (const part of (cookieHeader ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

function emailForRequest(
  headers: Record<string, string | undefined>,
  config: ServerConfig,
): string | null {
  if (config.authMode === 'mock') {
    const choice = readCookie(headers.cookie, MOCK_COOKIE)
    if (choice === 'none') return null
    return config.mockUsers[Number(choice ?? 0)] ?? config.mockUsers[0] ?? null
  }
  // Static Web Apps sets this header at its edge; managed APIs are only reachable through it.
  return parseSwaPrincipal(headers['x-ms-client-principal'])
}

export function identify(
  headers: Record<string, string | undefined>,
  config: ServerConfig,
): Identity {
  const email = emailForRequest(headers, config)
  if (!email) return { kind: 'anonymous' }
  if (!email.endsWith(`@${config.allowedEmailDomain}`)) return { kind: 'wrong-domain', email }
  return { kind: 'signed-in', user: { email } }
}

/** Only same-site relative paths, so login and logout can't be used as open redirects. */
export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export const LOGOUT_URL = `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent('/signed-out')}`
