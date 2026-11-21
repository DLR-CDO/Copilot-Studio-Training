import { existsSync } from 'node:fs'
import { join } from 'node:path'
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
      'm1-step-solution',
      'm1-step-2',
      'm1-step-3',
      'm1-step-4',
      'm1-step-5',
    ])
    expect(modules[6]!.buildSteps.map((s) => s.id).slice(0, 6)).toEqual([
      'm7-step-1',
      'm7-step-2',
      'm7-step-3',
      'm7-step-4',
      'm7-step-retired-models',
      'm7-step-5',
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

describe('screenshots', () => {
  const shots = modules.flatMap((m) => m.screenshots.map((shot) => ({ m, shot })))

  it.each(shots.map(({ m, shot }) => ({ id: shot.id, m, shot })))(
    '$id has its image, alt text, and sits after a real step',
    ({ m, shot }) => {
      expect(existsSync(join(process.cwd(), 'public', shot.src)), shot.src).toBe(true)
      expect(shot.src).not.toMatch(/^\/|^https?:/)
      expect(shot.alt.length).toBeGreaterThan(20)
      expect(m.buildSteps.map((s) => s.id)).toContain(shot.afterStep)
    },
  )

  it('concept figures have their image and alt text', () => {
    const figures = modules.flatMap((m) =>
      [...m.concept, ...(m.goodToKnow ?? [])].flatMap((b) => (b.type === 'figure' ? [b.shot] : [])),
    )
    expect(figures.length).toBeGreaterThan(0)
    for (const shot of figures) {
      expect(existsSync(join(process.cwd(), 'public', shot.src)), shot.src).toBe(true)
      expect(shot.src).not.toMatch(/^\/|^https?:/)
      expect(shot.alt.length).toBeGreaterThan(20)
    }
  })
})
