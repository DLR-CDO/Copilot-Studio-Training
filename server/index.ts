import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { quizzesByModule } from '../src/content/quizzes'
import { createRequestHandler } from './app'
import { loadConfig } from './config'
import { LearnerService } from './learnerService'
import { RateLimiter } from './rateLimit'
import { log } from './log'
import { MemoryStore, type Store } from './store'
import { TableStore } from './tableStore'

// Local development only. In production the API runs as Azure Functions on Static Web Apps.
const staticDir =
  process.env.STATIC_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const port = Number(process.env.PORT) || 8080

async function main(): Promise<void> {
  const config = loadConfig(process.env)
  if (config.authMode !== 'mock') {
    throw new Error(
      'The local server only runs with AUTH_MODE=mock. Production sign-in is handled by Azure Static Web Apps.',
    )
  }

  let store: Store
  if (config.storageConnectionString) {
    store = await TableStore.connect(config.storageConnectionString)
  } else {
    log.warn('No AZURE_STORAGE_CONNECTION_STRING; using in-memory storage.')
    store = new MemoryStore()
  }

  const logoPath = join(staticDir, 'assets', 'digital-realty-logo.png')
  const loadLogo = () => readFile(logoPath).catch(() => null)
  const service = new LearnerService(store, quizzesByModule, {
    maxFailures: config.assessmentMaxFailures,
    cooldownHours: config.assessmentCooldownHours,
  })
  createServer(
    createRequestHandler({
      config,
      service,
      store,
      loadLogo,
      staticDir,
      verifyLimiter: new RateLimiter(30, 60_000),
    }),
  ).listen(port, () => log.info('Local server listening', { port }))
}

main().catch((err: unknown) => {
  log.error('Server failed to start', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})
