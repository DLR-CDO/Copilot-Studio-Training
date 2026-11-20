export interface ServerConfig {
  /** `swa`: identity comes from Azure Static Web Apps. `mock`: local development only. */
  authMode: 'swa' | 'mock'
  /** Only accounts whose sign-in email ends in @<domain> may use the course. */
  allowedEmailDomain: string
  storageConnectionString?: string
  adminEmails: Set<string>
  publicBaseUrl?: string
  mockUsers: string[]
}

const DEFAULT_MOCK_USERS = 'learner.one@example.com;learner.two@example.com;outsider@contoso.test'

export function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@')),
  )
}

export function loadConfig(env: NodeJS.ProcessEnv): ServerConfig {
  const runningInAzure = Boolean(env.WEBSITE_SITE_NAME || env.FUNCTIONS_WORKER_RUNTIME)
  const authMode = env.AUTH_MODE === 'mock' ? 'mock' : 'swa'

  if (authMode === 'mock' && runningInAzure) {
    throw new Error('AUTH_MODE=mock is for local development only and cannot run in Azure.')
  }

  const storageConnectionString = env.AZURE_STORAGE_CONNECTION_STRING?.trim() || undefined
  if (!storageConnectionString && authMode !== 'mock') {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set.')
  }

  const defaultDomain = authMode === 'mock' ? 'example.com' : 'digitalrealty.com'
  return {
    authMode,
    allowedEmailDomain: (env.ALLOWED_EMAIL_DOMAIN?.trim() || defaultDomain)
      .toLowerCase()
      .replace(/^@/, ''),
    storageConnectionString,
    adminEmails: parseEmailList(env.ADMIN_EMAILS),
    publicBaseUrl: env.PUBLIC_BASE_URL?.trim().replace(/\/+$/, '') || undefined,
    mockUsers: [...parseEmailList(env.MOCK_USERS ?? DEFAULT_MOCK_USERS)],
  }
}
