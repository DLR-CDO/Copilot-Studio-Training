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

interface QuizQuestionBase {
  id: string
  prompt: string
  /** Shown after the attempt is graded. */
  explanation: string
  /** The learn.microsoft.com page that backs the answer. */
  sourceUrl: string
  /** Asks the learner to apply the idea to a situation, not just recall it. */
  scenario?: boolean
}

/**
 * Quiz questions with their answers. Only the server reads these; the browser receives
 * `PublicQuizQuestion`s and gets results back after grading.
 */
export type QuizQuestion =
  | (QuizQuestionBase & { type: 'multiple-choice'; options: string[]; correctIndex: number })
  | (QuizQuestionBase & { type: 'true-false'; correct: boolean })
  | (QuizQuestionBase & { type: 'order'; steps: string[]; correctOrder: number[] })

/**
 * A question as sent to the browser: no answer, and options and steps sorted alphabetically so
 * their order gives nothing away. Answers refer to positions in these arrays.
 */
export type PublicQuizQuestion =
  | { id: string; type: 'multiple-choice'; prompt: string; options: string[] }
  | { id: string; type: 'true-false'; prompt: string }
  | { id: string; type: 'order'; prompt: string; steps: string[] }

/** Module quizzes use the module id as the scope; final assessments use `final-<part>`. */
export type QuizScope = string

export interface QuizAttemptView {
  attemptId: string
  scope: QuizScope
  questions: PublicQuizQuestion[]
  passPercent: number
}

export interface QuestionResult {
  correct: boolean
  explanation: string
  sourceUrl: string
}

export interface AttemptLogEntry {
  scope: QuizScope
  /** ISO time the attempt was submitted. */
  at: string
  percent: number
  passed: boolean
}

/** The Copilot Studio runtime a module's instructions apply to. */
export type Harness = 'standard' | 'copilot' | 'any'

export interface Module {
  id: number
  harness: Harness
  slug: string
  title: string
  whyItMatters: string
  /** Typical time to work through the module, in minutes. */
  estimatedMinutes: number
  /** Date (YYYY-MM-DD) the content was last checked against Microsoft Learn. */
  lastReviewed: string
  /** Month (YYYY-MM) of the Copilot Studio docs the content was checked against. */
  verifiedAgainst: string
  badgeName: string
  concept: ConceptBlock[]
  /** Extra detail shown collapsed under "In plain words". Never quizzed. */
  goodToKnow?: ConceptBlock[]
  diagram: DiagramId
  buildSteps: BuildStep[]
  watchOuts: string[]
  screenshots: Screenshot[]
  /** Author-only list of screenshots still to capture. Never rendered. */
  screenshotsToCapture?: ScreenshotRequest[]
  tryIt: string
  goDeeper: LinkItem[]
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
  /** Best quiz score as a percent. */
  quizBestPercent: number
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
/** Percent needed to pass each module quiz and the final assessment. */
export const PASSING_PERCENT = 80
export const MODULE_COUNT = 10
