import type { LearnerState } from '../content/types'
import type { CompletionResult } from './completion'
import type { QuizAnswers } from './quiz'

export interface SessionUser {
  name: string
  email: string
  isAdmin: boolean
  logoutUrl: string
}

export interface CertificateSummary {
  id: string
  name: string
  course: string
  completedAt: string
  expiresAt: string
  scorePercent: number
  expired: boolean
  verifyUrl: string
}

export interface ServerProgress {
  state: LearnerState
  completion: CompletionResult
  passingPercent: number
  certificate: CertificateSummary | null
}

export interface QuizSubmission {
  score: number
  passed: boolean
  state: LearnerState
  completion: CompletionResult
  certificate: CertificateSummary | null
}

export const CERTIFICATE_PDF_URL = '/api/certificate/pdf'

/** Thrown when the sign-in session has ended; the caller should send the learner to sign in. */
export class SignInRequiredError extends Error {}

function isJson(res: Response): boolean {
  return (res.headers.get('content-type') ?? '').includes('application/json')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (res.status === 401) throw new SignInRequiredError('Sign in required')
  if (!res.ok) {
    const message = isJson(res) ? ((await res.json()) as { error?: string }).error : undefined
    throw new Error(message ?? `Request failed (${res.status})`)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

/**
 * The signed-in learner, or null when the site is served without the course server
 * (GitHub Pages, Static Web Apps, `vite dev`), in which case progress stays in the browser.
 */
export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/me', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
    if (res.status === 401) throw new SignInRequiredError('Sign in required')
    if (!res.ok || !isJson(res)) return null
    return (await res.json()) as SessionUser
  } catch (err) {
    if (err instanceof SignInRequiredError) throw err
    return null
  }
}

export function redirectToSignIn(): void {
  const returnTo = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(returnTo)}`)
}

export const fetchProgress = () => request<ServerProgress>('/api/progress')

export const saveProgress = (state: LearnerState) =>
  request<void>('/api/progress', { method: 'PUT', body: JSON.stringify({ state }) })

export const submitQuiz = (moduleId: number, answers: QuizAnswers) =>
  request<QuizSubmission>(`/api/quiz/${moduleId}`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
