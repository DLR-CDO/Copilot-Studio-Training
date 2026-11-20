import { createContext } from 'react'
import type { LearnerState, ModuleProgress, ThemeMode } from '../content/types'
import type { CertificateSummary, SessionUser } from './api'
import type { CompletionResult } from './completion'
import type { QuizResult } from '../components/module/Quiz'

export type Session =
  | { mode: 'loading' }
  /** No course server (static hosting or `vite dev`): progress lives in this browser only. */
  | { mode: 'local' }
  | { mode: 'server'; user: SessionUser }
  | { mode: 'error'; message: string }
  /** Signed in with an account outside the allowed email domain. */
  | { mode: 'denied'; message: string; email: string; logoutUrl: string }

export interface ServerStatus {
  /** Name for the certificate, entered by the learner; empty until entered. */
  name: string
  completion: CompletionResult
  certificate: CertificateSummary | null
  passingPercent: number
}

export interface LearnerContextValue {
  state: LearnerState
  session: Session
  serverStatus: ServerStatus | null
  syncError: string | null
  setFreeRoam: (value: boolean) => void
  setTheme: (value: ThemeMode) => void
  updateModule: (moduleId: number, patch: Partial<ModuleProgress>) => void
  recordQuizResult: (moduleId: number, result: QuizResult) => Promise<void>
  /** Rejects with a message to show the learner if the name is not accepted. */
  saveName: (name: string) => Promise<void>
  resetProgress: () => void
  dismissNotice: () => void
}

export const LearnerContext = createContext<LearnerContextValue | null>(null)
