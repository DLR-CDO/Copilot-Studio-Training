export interface MockUser {
  name: string
  email: string
}

export interface ServerConfig {
  port: number
  staticDir: string
  authMode: 'easyauth' | 'mock'
  /** True when App Service Authentication is switched on for this site. */
  easyAuthEnabled: boolean
  allowedTenantId?: string
  storageConnectionString?: string
  adminEmails: Set<string>
  publicBaseUrl?: string
  mockUsers: MockUser[]
}

const DEFAULT_MOCK_USERS =
  'Dev Learner <dev.learner@example.com>;Second Learner <second.learner@example.com>'

export function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@')),
  )
}

/** "Name <email>;Name <email>" → MockUser[] */
export function parseMockUsers(raw: string): MockUser[] {
  return raw
    .split(';')
    .map((entry) => /^\s*(.+?)\s*<([^<>\s]+@[^<>\s]+)>\s*$/.exec(entry))
    .filter((m): m is RegExpExecArray => m != null)
    .map((m) => ({ name: m[1]!, email: m[2]!.toLowerCase() }))
}

export function loadConfig(env: NodeJS.ProcessEnv, staticDir: string): ServerConfig {
  const onAppService = Boolean(env.WEBSITE_SITE_NAME)
  const authMode = env.AUTH_MODE === 'mock' ? 'mock' : 'easyauth'

  if (authMode === 'mock' && onAppService) {
    throw new Error('AUTH_MODE=mock is for local development only and cannot run on App Service.')
  }

  const storageConnectionString = env.AZURE_STORAGE_CONNECTION_STRING?.trim() || undefined
  if (!storageConnectionString && authMode !== 'mock') {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set.')
  }

  return {
    port: Number(env.PORT) || 8080,
    staticDir,
    authMode,
    easyAuthEnabled: env.WEBSITE_AUTH_ENABLED?.toLowerCase() === 'true',
    allowedTenantId: env.ALLOWED_TENANT_ID?.trim().toLowerCase() || undefined,
    storageConnectionString,
    adminEmails: parseEmailList(env.ADMIN_EMAILS),
    publicBaseUrl:
      env.PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
      (env.WEBSITE_HOSTNAME ? `https://${env.WEBSITE_HOSTNAME}` : undefined),
    mockUsers: parseMockUsers(env.MOCK_USERS ?? DEFAULT_MOCK_USERS),
  }
}
