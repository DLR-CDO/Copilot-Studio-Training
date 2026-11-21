import { describe, expect, it } from 'vitest'
import {
  REVIEW_INTERVAL_DAYS,
  daysSinceReview,
  formatMinutes,
  freshnessLine,
  totalMinutes,
} from '../lib/moduleMeta'
import { modules } from './modules'

const today = new Date()

describe('module freshness metadata', () => {
  it.each(modules.map((m) => ({ id: m.id, m })))(
    'module $id has a valid review date, docs month and time estimate',
    ({ m }) => {
      expect(m.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(`${m.lastReviewed}T00:00:00Z`))).toBe(false)
      expect(
        daysSinceReview(m.lastReviewed, today),
        'review date is in the future',
      ).toBeGreaterThanOrEqual(-1)
      expect(m.verifiedAgainst).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
      expect(m.verifiedAgainst <= m.lastReviewed.slice(0, 7)).toBe(true)
      expect(Number.isInteger(m.estimatedMinutes)).toBe(true)
      expect(m.estimatedMinutes).toBeGreaterThanOrEqual(5)
      expect(m.estimatedMinutes).toBeLessThanOrEqual(120)
    },
  )

  it(`warns (without failing) when a module was last reviewed over ${REVIEW_INTERVAL_DAYS} days ago`, () => {
    const stale = modules.filter(
      (m) => daysSinceReview(m.lastReviewed, today) > REVIEW_INTERVAL_DAYS,
    )
    for (const m of stale) {
      console.warn(
        `Module ${m.id} "${m.title}" was last reviewed ${m.lastReviewed}. Re-check it against Microsoft Learn's What's new page.`,
      )
    }
    expect(Array.isArray(stale)).toBe(true)
  })

  it('keeps build step ids unique, and steps added after launch use explicit ids', () => {
    for (const m of modules) {
      const ids = m.buildSteps.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      const positional = ids.filter((id) => /^m\d+-step-\d+$/.test(id))
      expect(positional).toEqual(positional.map((_, i) => `m${m.id}-step-${i + 1}`))
    }
    expect(modules[0]!.buildSteps.map((s) => s.id)).toEqual([
      'm1-step-harness',
      'm1-step-1',
      'm1-step-2',
      'm1-step-3',
      'm1-step-4',
      'm1-step-5',
    ])
  })
})

describe('module meta formatting', () => {
  it('formats the freshness line in UTC', () => {
    expect(freshnessLine({ lastReviewed: '2026-11-21', verifiedAgainst: '2026-11' })).toBe(
      'Last reviewed: November 21, 2026 · Verified against Copilot Studio docs 2026-11',
    )
  })

  it('formats minutes and totals', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(60)).toBe('1 h')
    expect(formatMinutes(95)).toBe('1 h 35 min')
    expect(totalMinutes([{ estimatedMinutes: 20 }, { estimatedMinutes: 40 }])).toBe(60)
  })

  it('counts whole days since a review', () => {
    expect(daysSinceReview('2026-08-01', new Date('2026-11-01T12:00:00Z'))).toBe(92)
  })
})
