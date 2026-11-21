import type { LearnerState, ModuleProgress, ModuleStatus } from '../content/types'
import { MODULE_COUNT, PASSING_PERCENT } from '../content/types'

export function getModuleProgress(state: LearnerState, moduleId: number): ModuleProgress {
  return (
    state.modules[String(moduleId)] ?? {
      checklist: {},
      buildSteps: {},
      tryItDone: false,
      reflection: '',
      notes: '',
      quizBestPercent: 0,
      quizAttempts: 0,
      completed: false,
    }
  )
}

/** Module N unlocks when free roam is on, or N === 1, or module N-1 is complete. */
export function isModuleUnlocked(state: LearnerState, moduleId: number): boolean {
  if (state.freeRoam) return true
  if (moduleId <= 1) return true
  return getModuleProgress(state, moduleId - 1).completed
}

export function getModuleStatus(state: LearnerState, moduleId: number): ModuleStatus {
  const progress = getModuleProgress(state, moduleId)
  if (progress.completed) return 'complete'
  if (!isModuleUnlocked(state, moduleId)) return 'locked'

  const hasActivity =
    progress.tryItDone ||
    progress.reflection.trim().length > 0 ||
    progress.quizAttempts > 0 ||
    Object.values(progress.buildSteps).some(Boolean) ||
    Object.values(progress.checklist).some(Boolean) ||
    progress.notes.trim().length > 0

  return hasActivity ? 'in-progress' : 'available'
}

export function isQuizPassed(progress: ModuleProgress, passPercent = PASSING_PERCENT): boolean {
  return progress.quizBestPercent >= passPercent
}

export function areChecklistItemsComplete(
  progress: ModuleProgress,
  checklistIds: string[],
): boolean {
  return checklistIds.every((id) => progress.checklist[id] === true)
}

export function areBuildStepsComplete(progress: ModuleProgress, stepIds: string[]): boolean {
  return stepIds.every((id) => progress.buildSteps[id] === true)
}

export function canMarkModuleComplete(
  progress: ModuleProgress,
  options: { checklistIds: string[]; requireTryIt: boolean; passPercent?: number },
): { ready: boolean; remaining: string[] } {
  const remaining: string[] = []
  const passPercent = options.passPercent ?? PASSING_PERCENT

  if (!isQuizPassed(progress, passPercent)) {
    remaining.push(`Pass the knowledge check (${passPercent}% or more)`)
  }

  for (const id of options.checklistIds) {
    if (!progress.checklist[id]) {
      remaining.push(`Complete checklist item: ${id}`)
    }
  }

  if (options.requireTryIt && !progress.tryItDone) {
    remaining.push('Mark the Try it exercise as done')
  }

  return { ready: remaining.length === 0, remaining }
}

export function countCompletedModules(state: LearnerState): number {
  let count = 0
  for (let i = 1; i <= MODULE_COUNT; i += 1) {
    if (getModuleProgress(state, i).completed) count += 1
  }
  return count
}

export function overallCompletionRatio(state: LearnerState): number {
  return countCompletedModules(state) / MODULE_COUNT
}

export function quizAverage(state: LearnerState): number | null {
  const scores: number[] = []
  for (let i = 1; i <= MODULE_COUNT; i += 1) {
    const p = getModuleProgress(state, i)
    if (p.quizAttempts > 0) scores.push(p.quizBestPercent)
  }
  if (scores.length === 0) return null
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

export function findResumeModuleId(state: LearnerState): number {
  for (let i = 1; i <= MODULE_COUNT; i += 1) {
    const status = getModuleStatus(state, i)
    if (status === 'in-progress' || status === 'available') return i
  }
  // All complete → last module
  return MODULE_COUNT
}
