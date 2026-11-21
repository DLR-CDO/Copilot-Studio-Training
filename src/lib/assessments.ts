import { MODULE_COUNT, PASSING_PERCENT, type QuizScope } from '../content/types'

/** Questions drawn from a module's bank for each attempt. */
export const MODULE_QUIZ_SIZE = 8
/** Most true/false questions allowed in one module attempt. */
export const MODULE_QUIZ_MAX_TRUE_FALSE = 2
/** Fewest scenario questions in one module attempt. */
export const MODULE_QUIZ_MIN_SCENARIO = 2
/** Smallest bank a published module may have. */
export const MIN_BANK_SIZE = 15

export interface FinalAssessment {
  scope: QuizScope
  title: string
  modules: number[]
  perModule: number
  minScenario: number
  minOrder: number
  passPercent: number
}

export const FINAL_ASSESSMENT: FinalAssessment = {
  scope: 'final-1',
  title: 'Part 1 final assessment',
  modules: Array.from({ length: MODULE_COUNT }, (_, i) => i + 1),
  perModule: 2,
  minScenario: 4,
  minOrder: 2,
  passPercent: PASSING_PERCENT,
}

export const FINAL_ASSESSMENT_SIZE = FINAL_ASSESSMENT.modules.length * FINAL_ASSESSMENT.perModule

/** Pass mark for a module quiz. Change a module's entry to override the default. */
export const MODULE_PASS_PERCENT: Record<number, number> = {}

export function passPercentFor(scope: QuizScope): number {
  if (scope === FINAL_ASSESSMENT.scope) return FINAL_ASSESSMENT.passPercent
  return MODULE_PASS_PERCENT[Number(scope)] ?? PASSING_PERCENT
}

export function isModuleScope(scope: QuizScope): boolean {
  return /^\d{1,2}$/.test(scope) && Number(scope) >= 1 && Number(scope) <= MODULE_COUNT
}
