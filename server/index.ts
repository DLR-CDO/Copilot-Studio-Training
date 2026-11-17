import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { quizzesByModule } from '../src/content/quizzes'
import { createRequestHandler } from './app'
import { loadConfig } from './config'
import { LearnerService } from './learnerService'
import { log } from './log'
import { MemoryStore, type Store } from './store'
import { TableStore } from './tableStore'

// Bundled to server-dist/index.mjs; the built site sits next to it in dist/.
const staticDir =
  process.env.STATIC_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const logoPath = join(staticDir, 'assets', 'digital-realty-logo.png')

async function main(): Promise<void> {
  const config = loadConfig(process.env, staticDir)

  let store: Store
  if (config.storageConnectionString) {
    store = await TableStore.connect(config.storageConnectionString)
  } else {
    log.warn('No AZURE_STORAGE_CONNECTION_STRING; using in-memory storage (local mock mode only).')
    store = new MemoryStore()
  }

  if (config.authMode === 'easyauth' && !config.easyAuthEnabled) {
    log.error('App Service Authentication is off; every signed-in route will refuse access.')
  }
  if (config.adminEmails.size === 0)
    log.warn('ADMIN_EMAILS is empty; nobody can export completions.')

  let warnedLogo = false
  const loadLogo = async (): Promise<Uint8Array | null> => {
    try {
      return await readFile(logoPath)
    } catch {
      if (!warnedLogo) log.warn('Logo not found; certificates use a placeholder.', { logoPath })
      warnedLogo = true
      return null
    }
  }

  const service = new LearnerService(store, quizzesByModule)
  createServer(createRequestHandler({ config, service, store, loadLogo })).listen(
    config.port,
    () => {
      log.info('Server listening', { port: config.port, authMode: config.authMode })
    },
  )
}

main().catch((err: unknown) => {
  log.error('Server failed to start', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})
