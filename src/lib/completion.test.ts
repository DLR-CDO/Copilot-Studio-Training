import { describe, expect, it } from 'vitest'
import { PASSING_PERCENT, PASSING_SCORE } from '../content/types'
import { quizzesByModule } from '../content/quizzes'
import {
  addMonthsUtc,
  certificateExpiration,
  evaluateCompletion,
  formatCertificateDate,
  isExpired,
  isQuizScorePassing,
} from './completion'
import { scoreQuizSubmission } from './quiz'

const sizes = Object.fromEntries(Object.entries(quizzesByModule).map(([id, q]) => [id, q.length]))
const scoresOf = (score: number) =>
  Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i + 1), score]))

describe('completion rule', () => {
  it('derives the per-quiz pass mark from the single passing percent', () => {
    expect(PASSING_PERCENT).toBe(80)
    expect(PASSING_SCORE).toBe(4)
    expect(isQuizScorePassing(4, 5)).toBe(true)
    expect(isQuizScorePassing(3, 5)).toBe(false)
    expect(isQuizScorePassing(0, 0)).toBe(false)
  })

  it('is not complete when any single quiz is below the pass mark', () => {
    const result = evaluateCompletion({ ...scoresOf(5), '7': 3 }, sizes)
    expect(result.complete).toBe(false)
    expect(result.remainingModules).toEqual([7])
    expect(result.passedModules).toHaveLength(9)
  })

  it('is not complete when a quiz was never taken', () => {
    const scores = scoresOf(5)
    delete scores['10']
    expect(evaluateCompletion(scores, sizes).complete).toBe(false)
  })

  it('is complete when every quiz passes, with the final score as a percent of all questions', () => {
    const result = evaluateCompletion({ ...scoresOf(5), '1': 4, '2': 4 }, sizes)
    expect(result.complete).toBe(true)
    expect(result.finalPercent).toBe(96)
    expect(result.remainingModules).toEqual([])
  })

  it('accepts exactly the pass mark on every quiz', () => {
    const result = evaluateCompletion(scoresOf(4), sizes)
    expect(result.complete).toBe(true)
    expect(result.finalPercent).toBe(80)
  })

  it('ignores impossible scores above the quiz length', () => {
    const result = evaluateCompletion({ ...scoresOf(4), '3': 99 }, sizes)
    expect(result.finalPercent).toBe(82)
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
