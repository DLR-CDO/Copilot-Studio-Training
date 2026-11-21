import type { Module } from '../content/types'

/** Modules should be re-checked against Microsoft Learn at least this often. */
export const REVIEW_INTERVAL_DAYS = 90

const DAY_MS = 24 * 60 * 60 * 1000

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** Formats a YYYY-MM-DD date in UTC so every browser shows the same day. */
export function formatReviewDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function freshnessLine(mod: Pick<Module, 'lastReviewed' | 'verifiedAgainst'>): string {
  return `Last reviewed: ${formatReviewDate(mod.lastReviewed)} · Verified against Copilot Studio docs ${mod.verifiedAgainst}`
}

export function daysSinceReview(isoDate: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(`${isoDate}T00:00:00Z`)) / DAY_MS)
}

export function totalMinutes(mods: Pick<Module, 'estimatedMinutes'>[]): number {
  return mods.reduce((sum, m) => sum + m.estimatedMinutes, 0)
}
