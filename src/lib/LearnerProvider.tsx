import { useCallback, useMemo, useState, useEffect, useRef, type ReactNode } from 'react'
import type { LearnerState, ModuleProgress, ThemeMode } from '../content/types'
import { MODULE_COUNT } from '../content/types'
import {
  applyTheme,
  clearNotice,
  createDefaultState,
  loadState,
  resetState,
  saveState,
} from './storage'
import { getModuleProgress } from './progress'
import {
  LearnerContext,
  type LearnerContextValue,
  type ServerStatus,
  type Session,
} from './learnerContextValue'
import {
  AccessDeniedError,
  SignInRequiredError,
  fetchProgress,
  fetchSession,
  redirectToSignIn,
  saveCertificateName,
  saveProgress,
  submitQuiz,
  type ServerProgress,
} from './api'
import type { QuizResult } from '../components/module/Quiz'

const SAVE_DELAY_MS = 800

/** Server-owned quiz fields win; everything else keeps the learner's latest local edits. */
function withServerQuizScores(local: LearnerState, server: LearnerState): LearnerState {
  const modules = { ...local.modules }
  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    const key = String(id)
    const fromServer = server.modules[key]
    if (!fromServer) continue
    modules[key] = {
      ...getModuleProgress(local, id),
      quizBestScore: fromServer.quizBestScore,
      quizAttempts: fromServer.quizAttempts,
    }
  }
  return { ...local, modules }
}

function toServerStatus(progress: ServerProgress): ServerStatus {
  return {
    name: progress.name,
    completion: progress.completion,
    certificate: progress.certificate,
    passingPercent: progress.passingPercent,
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error'
}

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(() => loadState())
  const [session, setSession] = useState<Session>({ mode: 'loading' })
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const unsaved = useRef<LearnerState | null>(null)

  const handleSyncError = useCallback((err: unknown) => {
    if (err instanceof SignInRequiredError) redirectToSignIn()
    else setSyncError(`Your progress could not be saved: ${errorMessage(err)}`)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const user = await fetchSession()
        if (!user) {
          if (!cancelled) setSession({ mode: 'local' })
          return
        }
        const progress = await fetchProgress()
        if (cancelled) return
        setState(progress.state)
        setServerStatus(toServerStatus(progress))
        setSession({ mode: 'server', user })
      } catch (err) {
        if (err instanceof SignInRequiredError) return redirectToSignIn()
        if (err instanceof AccessDeniedError) {
          if (!cancelled) {
            setSession({
              mode: 'denied',
              message: err.message,
              email: err.email,
              logoutUrl: err.logoutUrl,
            })
          }
          return
        }
        if (!cancelled) setSession({ mode: 'error', message: errorMessage(err) })
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [])

  // Browser-only hosting keeps progress in localStorage. With the course server, progress is
  // saved to the learner's server record and never written to this (possibly shared) browser.
  useEffect(() => {
    if (session.mode === 'local') saveState(state)
    else applyTheme(state.theme)
  }, [state, session.mode])

  useEffect(() => {
    if (session.mode !== 'server') return
    unsaved.current = state
    const timer = window.setTimeout(() => {
      unsaved.current = null
      saveProgress(state)
        .then(() => setSyncError(null))
        .catch(handleSyncError)
    }, SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [state, session.mode, handleSyncError])

  useEffect(() => {
    if (session.mode !== 'server') return
    const flush = () => {
      if (!unsaved.current) return
      void fetch('/api/progress', {
        method: 'PUT',
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: unsaved.current }),
      })
      unsaved.current = null
    }
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [session.mode])

  const setFreeRoam = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, freeRoam: value }))
  }, [])

  const setTheme = useCallback((value: ThemeMode) => {
    setState((prev) => ({ ...prev, theme: value, themeChosen: true }))
  }, [])

  const updateModule = useCallback((moduleId: number, patch: Partial<ModuleProgress>) => {
    setState((prev) => {
      const key = String(moduleId)
      const current = getModuleProgress(prev, moduleId)
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [key]: { ...current, ...patch },
        },
      }
    })
  }, [])

  const recordQuizResult = useCallback(
    async (moduleId: number, result: QuizResult) => {
      if (session.mode !== 'server') {
        setState((prev) => {
          const current = getModuleProgress(prev, moduleId)
          return {
            ...prev,
            modules: {
              ...prev.modules,
              [String(moduleId)]: {
                ...current,
                quizBestScore: Math.max(current.quizBestScore, result.score),
                quizAttempts: current.quizAttempts + 1,
              },
            },
          }
        })
        return
      }
      try {
        const saved = await submitQuiz(moduleId, result.answers)
        setState((prev) => withServerQuizScores(prev, saved.state))
        setServerStatus(toServerStatus(saved))
        setSyncError(null)
      } catch (err) {
        handleSyncError(err)
      }
    },
    [session.mode, handleSyncError],
  )

  const saveName = useCallback(async (name: string) => {
    try {
      setServerStatus(toServerStatus(await saveCertificateName(name)))
    } catch (err) {
      if (err instanceof SignInRequiredError) redirectToSignIn()
      throw err
    }
  }, [])

  const resetProgress = useCallback(() => {
    if (session.mode !== 'server') {
      setState(resetState())
      return
    }
    // Quiz scores are the official record on the server, so a reset keeps them.
    setState((prev) => {
      const fresh = createDefaultState()
      return withServerQuizScores(
        { ...fresh, theme: prev.theme, themeChosen: prev.themeChosen, freeRoam: prev.freeRoam },
        prev,
      )
    })
  }, [session.mode])

  const dismissNotice = useCallback(() => {
    setState((prev) => clearNotice(prev))
  }, [])

  const value = useMemo<LearnerContextValue>(
    () => ({
      state,
      session,
      serverStatus,
      syncError,
      setFreeRoam,
      setTheme,
      updateModule,
      recordQuizResult,
      saveName,
      resetProgress,
      dismissNotice,
    }),
    [
      state,
      session,
      serverStatus,
      syncError,
      setFreeRoam,
      setTheme,
      updateModule,
      recordQuizResult,
      saveName,
      resetProgress,
      dismissNotice,
    ],
  )

  if (session.mode === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <div role="alert">
          <p className="font-display text-lg font-bold">{session.message}</p>
          {session.email ? (
            <p className="mt-2 text-sm text-muted">You are signed in as {session.email}.</p>
          ) : null}
          <a
            href={session.logoutUrl}
            className="mt-4 inline-flex rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white"
          >
            Sign out and use your work account
          </a>
        </div>
      </div>
    )
  }

  if (session.mode === 'loading' || session.mode === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        {session.mode === 'loading' ? (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted" role="status">
            Loading your progress…
          </p>
        ) : (
          <div role="alert">
            <p className="font-display text-lg font-bold">Your progress could not be loaded.</p>
            <p className="mt-2 text-sm text-muted">{session.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    )
  }

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>
}
