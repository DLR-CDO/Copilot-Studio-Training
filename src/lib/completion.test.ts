import { describe, expect, it } from 'vitest'
import { PASSING_PERCENT } from '../content/types'
import { quizzesByModule } from '../content/quizzes'
import {
  addMonthsUtc,
  certificateExpiration,
  evaluateCompletion,
  formatCertificateDate,
  isExpired,
  isPercentPassing,
} from './completion'
import { FINAL_ASSESSMENT } from './assessments'
import { scoreQuizSubmission } from './quiz'

const allModules = (percent: number) =>
  Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i + 1), percent]))

describe('completion rule', () => {
  it('uses one 80% pass mark for module quizzes and the final assessment', () => {
    expect(PASSING_PERCENT).toBe(80)
    expect(isPercentPassing(80, '1')).toBe(true)
    expect(isPercentPassing(79, '1')).toBe(false)
    expect(isPercentPassing(80, FINAL_ASSESSMENT.scope)).toBe(true)
    expect(isPercentPassing(75, FINAL_ASSESSMENT.scope)).toBe(false)
  })

  it('is not complete when any single module quiz is below the pass mark', () => {
    const result = evaluateCompletion({ ...allModules(100), '7': 75, [FINAL_ASSESSMENT.scope]: 90 })
    expect(result.complete).toBe(false)
    expect(result.modulesComplete).toBe(false)
    expect(result.remainingModules).toEqual([7])
    expect(result.passedModules).toHaveLength(9)
  })

  it('is not complete when a module quiz was never taken', () => {
    const scores = { ...allModules(100), [FINAL_ASSESSMENT.scope]: 90 }
    delete scores['10']
    expect(evaluateCompletion(scores).complete).toBe(false)
  })

  it('is not complete until the final assessment is passed', () => {
    const notTaken = evaluateCompletion(allModules(100))
    expect(notTaken.modulesComplete).toBe(true)
    expect(notTaken.assessmentPassed).toBe(false)
    expect(notTaken.complete).toBe(false)
    expect(evaluateCompletion({ ...allModules(100), [FINAL_ASSESSMENT.scope]: 75 }).complete).toBe(
      false,
    )
  })

  it('is complete with every module and the final passed, reporting the final score', () => {
    const result = evaluateCompletion({ ...allModules(80), [FINAL_ASSESSMENT.scope]: 85 })
    expect(result.complete).toBe(true)
    expect(result.finalPercent).toBe(85)
    expect(result.remainingModules).toEqual([])
  })
})

describe('server-side quiz scoring', () => {
  it('scores answers given relative to the original question order', () => {
    const questions = quizzesByModule[1]!
    const allRight = Object.fromEntries(
      questions.map((q) => [
        q.id,
        q.type === 'multiple-choice'
          ? q.correctIndex
          : q.type === 'true-false'
            ? q.correct
            : q.correctOrder,
      ]),
    )
    expect(scoreQuizSubmission(questions, allRight).score).toBe(questions.length)
  })

  it('treats missing and malformed answers as wrong', () => {
    const questions = quizzesByModule[1]!
    const junk = Object.fromEntries(questions.map((q) => [q.id, 'correct']))
    expect(scoreQuizSubmission(questions, junk).score).toBe(0)
    expect(scoreQuizSubmission(questions, {}).score).toBe(0)
  })
})

describe('certificate dates', () => {
  it('expires 12 months after completion', () => {
    const completed = new Date('2026-11-17T15:30:42.643Z')
    expect(certificateExpiration(completed).toISOString()).toBe('2027-11-17T15:30:42.643Z')
  })

  it('clamps leap-day completions to the end of February', () => {
    expect(addMonthsUtc(new Date('2028-02-29T00:00:00Z'), 12).toISOString()).toBe(
      '2029-02-28T00:00:00.000Z',
    )
  })

  it('treats the expiration instant itself as expired', () => {
    const expires = '2027-11-17T15:30:00.000Z'
    expect(isExpired(expires, new Date('2027-11-17T15:29:59Z'))).toBe(false)
    expect(isExpired(expires, new Date(expires))).toBe(true)
  })

  it('formats dates in UTC so every server prints the same day', () => {
    expect(formatCertificateDate('2026-11-17T23:59:00Z')).toBe('November 17, 2026')
  })
})
