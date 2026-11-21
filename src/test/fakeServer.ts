import { vi } from 'vitest'
import { handleApi, type ApiDeps } from '../../server/api'
import { loadConfig } from '../../server/config'
import { LearnerService } from '../../server/learnerService'
import { MemoryStore } from '../../server/store'
import { quizzesByModule } from '../content/quizzes'
import type { QuizQuestion } from '../content/types'

function headersOf(init: RequestInit | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  new Headers(init?.headers).forEach((value, key) => {
    out[key] = value
  })
  return out
}

/**
 * Routes `fetch('/api/...')` to the real API handler with an in-memory store,
 * so UI tests exercise the same server-side drawing and grading as production.
 */
export function installFakeServer(
  quizzes: Record<number, QuizQuestion[]> = quizzesByModule,
  env: Record<string, string> = {},
): ApiDeps {
  const store = new MemoryStore()
  const deps: ApiDeps = {
    config: loadConfig({ AUTH_MODE: 'mock', ...env }),
    store,
    service: new LearnerService(store, quizzes),
    loadLogo: async () => null,
  }
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const res = await handleApi(
      {
        method: init?.method ?? 'GET',
        path: url.pathname,
        query: url.searchParams,
        headers: headersOf(init),
        body: typeof init?.body === 'string' ? init.body : '',
      },
      deps,
    )
    const body = res.status === 204 ? null : (res.body ?? null)
    return new Response(body as BodyInit | null, { status: res.status, headers: res.headers })
  })
  return deps
}
