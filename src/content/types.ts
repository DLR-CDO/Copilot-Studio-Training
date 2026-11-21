/** Shared content & progress types for Agent Academy */

export type DiagramId =
  'fig1' | 'fig2' | 'fig3' | 'fig4' | 'fig5' | 'fig6' | 'fig7' | 'fig8' | 'fig9' | 'fig10'

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'kw'; text: string; termId?: string }
  | { type: 'ui'; text: string }

export type ConceptBlock =
  | { type: 'paragraph'; tokens: InlineToken[] }
  | { type: 'list'; items: InlineToken[][] }
  | {
      type: 'table'
      caption?: string
      headers: string[]
      rows: string[][]
    }

export interface BuildSubStep {
  tokens: InlineToken[]
  /** Click path not yet confirmed against the live Copilot Studio UI. */
  verify?: boolean
}

export interface BuildStep {
  id: string
  tokens: InlineToken[]
  substeps?: BuildSubStep[]
  /** Click path not yet confirmed against the live Copilot Studio UI. */
  verify?: boolean
}

export interface Screenshot {
  id: string
  /** Path under `public/`, e.g. `images/02-environment-picker.png`. */
  src: string
  /** Describes the image for screen readers. */
  alt: string
  caption: string
  /** Capture and annotation instructions for course authors. Never rendered. */
  authorNotes?: string
  /** ISO date the image was captured. */
  capturedAt: string
}

/** A screenshot still to be captured. Never rendered. */
export interface ScreenshotRequest {
  id: string
  caption: string
  authorNotes: string
}

export interface LinkItem {
  label: string
  url: string
}

export type QuizQuestion =
  | {
      id: string
      type: 'multiple-choice'
      prompt: string
      options: string[]
      correctIndex: number
      explanation: string
    }
  | {
      id: string
      type: 'true-false'
      prompt: string
      correct: boolean
      explanation: string
    }
  | {
      id: string
      type: 'order'
      prompt: string
      steps: string[]
      correctOrder: number[]
      explanation: string
    }

/** The Copilot Studio runtime a module's instructions apply to. */
export type Harness = 'standard' | 'copilot' | 'any'

export interface Module {
  id: number
  harness: Harness
  slug: string
  title: string
  whyItMatters: string
  estimatedMinutes: string
  badgeName: string
  concept: ConceptBlock[]
  diagram: DiagramId
  buildSteps: BuildStep[]
  watchOuts: string[]
  screenshots: Screenshot[]
  /** Author-only list of screenshots still to capture. Never rendered. */
  screenshotsToCapture?: ScreenshotRequest[]
  tryIt: string
  goDeeper: LinkItem[]
  quiz: QuizQuestion[]
  checklist: string[]
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
}

export type ModuleStatus = 'locked' | 'available' | 'in-progress' | 'complete'

export interface ModuleProgress {
  checklist: Record<string, boolean>
  buildSteps: Record<string, boolean>
  tryItDone: boolean
  notes: string
  quizBestScore: number
  quizAttempts: number
  completed: boolean
}

export type ThemeMode = 'light' | 'dark'

export interface LearnerState {
  version: 1
  freeRoam: boolean
  theme: ThemeMode
  /** True only after the learner explicitly picks light/dark. */
  themeChosen: boolean
  modules: Record<string, ModuleProgress>
  /** Ticked cheat sheet checklist items, keyed by `section:item text`. */
  cheatSheet?: Record<string, boolean>
  migratedFrom?: string
  notice?: string
}

export const STORAGE_KEY = 'agent-academy-v1'
/** Percent needed to pass each module quiz, and therefore the course. The one place to change it. */
export const PASSING_PERCENT = 80
export const QUESTIONS_PER_QUIZ = 5
export const PASSING_SCORE = Math.ceil((QUESTIONS_PER_QUIZ * PASSING_PERCENT) / 100)
export const MODULE_COUNT = 10
