import { MODULE_COUNT, PASSING_PERCENT } from '../content/types'

export const COURSE_NAME = 'Copilot Studio Advanced'
export const CERTIFICATE_ISSUER = 'Digital University, Digital Realty'
export const CERTIFICATE_VALID_MONTHS = 12

export interface CompletionResult {
  complete: boolean
  /** Best scores across all module quizzes as a percent of all questions, rounded down. */
  finalPercent: number
  passedModules: number[]
  remainingModules: number[]
}

export function isQuizScorePassing(score: number, total: number): boolean {
  return total > 0 && score * 100 >= PASSING_PERCENT * total
}

/**
 * Course completion rule: every module quiz passed at PASSING_PERCENT, and the overall
 * percent at or above PASSING_PERCENT.
 */
export function evaluateCompletion(
  bestScores: Record<string, number>,
  quizSizes: Record<string, number>,
): CompletionResult {
  const passedModules: number[] = []
  const remainingModules: number[] = []
  let earned = 0
  let possible = 0

  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    const total = quizSizes[String(id)] ?? 0
    const score = Math.min(Math.max(bestScores[String(id)] ?? 0, 0), total)
    earned += score
    possible += total
    if (isQuizScorePassing(score, total)) passedModules.push(id)
    else remainingModules.push(id)
  }

  const finalPercent = possible > 0 ? Math.floor((earned * 100) / possible) : 0
  return {
    complete: remainingModules.length === 0 && finalPercent >= PASSING_PERCENT,
    finalPercent,
    passedModules,
    remainingModules,
  }
}

/** Same calendar day `months` later in UTC; clamps to month end (Feb 29 → Feb 28). */
export function addMonthsUtc(date: Date, months: number): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + months
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(date.getUTCDate(), lastDay),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  )
}

export function certificateExpiration(completedAt: Date): Date {
  return addMonthsUtc(completedAt, CERTIFICATE_VALID_MONTHS)
}

export function isExpired(expiresAt: string, now: Date): boolean {
  return now.getTime() >= new Date(expiresAt).getTime()
}

/** e.g. "November 17, 2026" — fixed locale and UTC so server output never varies. */
export function formatCertificateDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
