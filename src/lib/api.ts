import type {
  AdminLearnerRow,
  AttemptLogEntry,
  LearnerState,
  QuestionResult,
  QuizAttemptView,
  QuizScope,
} from '../content/types'
import type { CompletionResult } from './completion'
import type { QuizAnswers } from './quiz'

export interface SessionUser {
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

export interface AssessmentStatus {
  scope: QuizScope
  /** Every module quiz is passed. */
  open: boolean
  attempts: number
  bestPercent: number
  passed: boolean
  cooldownUntil: string | null
  attemptsBeforeCooldown: number
  cooldownHours: number
}

export interface ServerProgress {
  /** Name the learner entered for their certificate; empty until entered. */
  name: string
  state: LearnerState
  completion: CompletionResult
  assessment: AssessmentStatus
  /** Recent graded attempts, oldest first. */
  attempts: AttemptLogEntry[]
  passingPercent: number
  certificate: CertificateSummary | null
}

export interface QuizOutcome {
  scope: QuizScope
  percent: number
  passed: boolean
  correctCount: number
  total: number
  results: Record<string, QuestionResult>
}

export interface QuizSubmission extends ServerProgress {
  result: QuizOutcome
}

export type VerifyResult =
  | {
      kind: 'found'
      name: string
      course: string
      completedAt: string
      expiresAt: string
      status: 'valid' | 'expired'
    }
  | { kind: 'not-found' | 'invalid' | 'error'; message: string }

export const CERTIFICATE_PDF_URL = '/api/certificate/pdf'
export const ADMIN_CSV_URL = '/api/admin/completions.csv'
export const ADMIN_LEARNERS_CSV_URL = '/api/admin/learners.csv'

/** Thrown when the sign-in session has ended; the caller should send the learner to sign in. */
export class SignInRequiredError extends Error {}

/** Signed in with an account outside the allowed email domain. */
export class AccessDeniedError extends Error {
  readonly email: string
  readonly logoutUrl: string

  constructor(message: string, email: string, logoutUrl: string) {
    super(message)
    this.email = email
    this.logoutUrl = logoutUrl
  }
}

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
 * The signed-in learner, or null when the site is served without the course API
 * (`vite dev`, static hosting), in which case progress stays in the browser.
 */
export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/me', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
    if (res.status === 401) throw new SignInRequiredError('Sign in required')
    if (res.status === 403 && isJson(res)) {
      const body = (await res.json()) as { error?: string; email?: string; logoutUrl?: string }
      throw new AccessDeniedError(
        body.error ?? 'This account cannot use the course.',
        body.email ?? '',
        body.logoutUrl ?? '/.auth/logout',
      )
    }
    if (!res.ok || !isJson(res)) return null
    return (await res.json()) as SessionUser
  } catch (err) {
    if (err instanceof SignInRequiredError || err instanceof AccessDeniedError) throw err
    return null
  }
}

export function redirectToSignIn(): void {
  const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}`
  window.location.assign(`/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(returnTo)}`)
}

export const fetchProgress = () => request<ServerProgress>('/api/progress')

export const saveProgress = (state: LearnerState) =>
  request<void>('/api/progress', { method: 'PUT', body: JSON.stringify({ state }) })

/** Draws questions for an attempt, or returns the learner's unsubmitted one. */
export const startQuiz = (scope: QuizScope) =>
  request<QuizAttemptView>(`/api/quiz/${encodeURIComponent(scope)}/start`, {
    method: 'POST',
    body: '{}',
  })

export const submitQuiz = (scope: QuizScope, attemptId: string, answers: QuizAnswers) =>
  request<QuizSubmission>(`/api/quiz/${encodeURIComponent(scope)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ attemptId, answers }),
  })

export const saveCertificateName = (name: string) =>
  request<ServerProgress>('/api/profile', { method: 'PUT', body: JSON.stringify({ name }) })

export const fetchAdminLearners = () =>
  request<{ learners: AdminLearnerRow[] }>('/api/admin/learners').then((r) => r.learners)

/** Public: no sign-in needed. */
export async function verifyCertificate(id: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`/api/verify?id=${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    })
    const body = isJson(res) ? ((await res.json()) as Record<string, unknown>) : {}
    const message = typeof body.error === 'string' ? body.error : 'Verification is unavailable.'
    if (res.ok) {
      return {
        kind: 'found',
        name: String(body.name ?? ''),
        course: String(body.course ?? ''),
        completedAt: String(body.completedAt ?? ''),
        expiresAt: String(body.expiresAt ?? ''),
        status: body.status === 'valid' ? 'valid' : 'expired',
      }
    }
    if (res.status === 404) return { kind: 'not-found', message }
    if (res.status === 400) return { kind: 'invalid', message }
    if (res.status === 429) return { kind: 'error', message }
    return { kind: 'error', message }
  } catch {
    return { kind: 'error', message: 'Verification is unavailable. Check your connection.' }
  }
}
