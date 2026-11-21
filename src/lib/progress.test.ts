import { describe, expect, it } from 'vitest'
import { createDefaultState } from './storage'
import {
  canMarkModuleComplete,
  findResumeModuleId,
  getModuleStatus,
  isModuleUnlocked,
  overallCompletionRatio,
  quizAverage,
} from './progress'

describe('module gating', () => {
  it('unlocks module 1 by default and locks module 2', () => {
    const state = createDefaultState()
    expect(isModuleUnlocked(state, 1)).toBe(true)
    expect(isModuleUnlocked(state, 2)).toBe(false)
    expect(getModuleStatus(state, 2)).toBe('locked')
  })

  it('unlocks next module when previous is complete', () => {
    const state = createDefaultState()
    state.modules['1']!.completed = true
    expect(isModuleUnlocked(state, 2)).toBe(true)
    expect(getModuleStatus(state, 2)).toBe('available')
  })

  it('unlocks everything when free roam is on', () => {
    const state = createDefaultState()
    state.freeRoam = true
    expect(isModuleUnlocked(state, 10)).toBe(true)
    expect(getModuleStatus(state, 10)).toBe('available')
  })

  it('marks in-progress when learner has activity', () => {
    const state = createDefaultState()
    state.modules['1']!.tryItDone = true
    expect(getModuleStatus(state, 1)).toBe('in-progress')
  })
})

describe('progress computation', () => {
  it('computes overall completion ratio', () => {
    const state = createDefaultState()
    state.modules['1']!.completed = true
    state.modules['2']!.completed = true
    expect(overallCompletionRatio(state)).toBe(0.2)
  })

  it('averages quiz scores only for attempted modules', () => {
    const state = createDefaultState()
    state.modules['1']!.quizAttempts = 1
    state.modules['1']!.quizBestPercent = 100
    state.modules['2']!.quizAttempts = 2
    state.modules['2']!.quizBestPercent = 75
    expect(quizAverage(state)).toBe(87.5)
  })

  it('finds resume module as first incomplete unlocked module', () => {
    const state = createDefaultState()
    state.modules['1']!.completed = true
    expect(findResumeModuleId(state)).toBe(2)
  })

  it('requires quiz pass and checklist for mark-complete', () => {
    const state = createDefaultState()
    const progress = state.modules['1']!
    progress.quizBestPercent = 87
    progress.checklist = { a: true, b: false }
    progress.tryItDone = true
    const result = canMarkModuleComplete(progress, {
      checklistIds: ['a', 'b'],
      requireTryIt: true,
    })
    expect(result.ready).toBe(false)
    expect(result.remaining.some((r) => r.includes('b'))).toBe(true)
  })
})

describe('quiz pass mark', () => {
  it('blocks mark-complete below 80% and allows it at 80%', () => {
    const progress = createDefaultState().modules['1']!
    progress.quizBestPercent = 75
    expect(
      canMarkModuleComplete(progress, { checklistIds: [], requireTryIt: false }).remaining,
    ).toContain('Pass the knowledge check (80% or more)')
    progress.quizBestPercent = 80
    expect(canMarkModuleComplete(progress, { checklistIds: [], requireTryIt: false }).ready).toBe(
      true,
    )
  })

  it('honors a per-module pass mark', () => {
    const progress = createDefaultState().modules['1']!
    progress.quizBestPercent = 87
    expect(
      canMarkModuleComplete(progress, { checklistIds: [], requireTryIt: false, passPercent: 90 })
        .ready,
    ).toBe(false)
  })
})
