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

export interface ServerStatus {
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
  resetProgress: () => void
  dismissNotice: () => void
}

export const LearnerContext = createContext<LearnerContextValue | null>(null)
