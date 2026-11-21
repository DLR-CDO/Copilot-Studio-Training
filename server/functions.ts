import logoDataUrl from '../public/assets/digital-realty-logo.png?inline'
import { quizzesByModule } from '../src/content/quizzes'
import { handleApi, type ApiDeps, type ApiRequest } from './api'
import { loadConfig } from './config'
import { LearnerService } from './learnerService'
import { RateLimiter } from './rateLimit'
import { TableStore } from './tableStore'

/** Subset of the Azure Functions (Node programming model v3) HTTP trigger shapes we use. */
export interface FunctionsHttpRequest {
  method: string
  url: string
  headers: Record<string, string | undefined>
  rawBody?: unknown
}

export interface FunctionsContext {
  res?: { status: number; headers: Record<string, string>; body?: Buffer | string; isRaw?: boolean }
}

const VERIFY_LOOKUPS_PER_MINUTE = 30

const logo = Buffer.from(logoDataUrl.slice(logoDataUrl.indexOf(',') + 1), 'base64')

let depsPromise: Promise<ApiDeps> | undefined

/** Created once per Functions host instance and reused across requests. */
function getDeps(): Promise<ApiDeps> {
  depsPromise ??= (async () => {
    const config = loadConfig(process.env)
    const store = await TableStore.connect(config.storageConnectionString!)
    const service = new LearnerService(store, quizzesByModule, {
      maxFailures: config.assessmentMaxFailures,
      cooldownHours: config.assessmentCooldownHours,
    })
    return {
      config,
      store,
      service,
      loadLogo: async () => logo,
      verifyLimiter: new RateLimiter(VERIFY_LOOKUPS_PER_MINUTE, 60_000),
    }
  })().catch((err: unknown) => {
    depsPromise = undefined
    throw err
  })
  return depsPromise
}

export function toApiRequest(req: FunctionsHttpRequest): ApiRequest {
  const url = new URL(req.url, 'http://localhost')
  const headers: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(req.headers ?? {})) headers[key.toLowerCase()] = value
  return {
    method: req.method.toUpperCase(),
    path: url.pathname,
    query: url.searchParams,
    headers,
    body: typeof req.rawBody === 'string' ? req.rawBody : '',
  }
}

export async function run(context: FunctionsContext, req: FunctionsHttpRequest): Promise<void> {
  const out = await handleApi(toApiRequest(req), await getDeps())
  context.res = {
    status: out.status,
    headers: out.headers,
    body: out.body instanceof Uint8Array ? Buffer.from(out.body) : out.body,
    isRaw: true,
  }
}
