import { describe, expect, it } from 'vitest'
import type { PublicQuizQuestion } from '../content/types'
import { arrangeForDisplay, shuffleArray } from './quiz'

/** Deterministic "rng" that cycles through a fixed sequence of [0,1) values. */
function sequenceRng(values: number[]): () => number {
  let i = 0
  return () => {
    const v = values[i % values.length]!
    i += 1
    return v
  }
}

describe('shuffleArray', () => {
  it('returns a permutation containing the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input, sequenceRng([0.9, 0.1, 0.5, 0.2, 0.7]))
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    const copy = [...input]
    shuffleArray(input, sequenceRng([0.5, 0.5]))
    expect(input).toEqual(copy)
  })

  it('is deterministic for a given rng sequence', () => {
    const a = shuffleArray([1, 2, 3, 4], sequenceRng([0.1, 0.2, 0.9]))
    const b = shuffleArray([1, 2, 3, 4], sequenceRng([0.1, 0.2, 0.9]))
    expect(a).toEqual(b)
  })
})

describe('arrangeForDisplay', () => {
  const questions: PublicQuizQuestion[] = [
    { id: 'mc-1', type: 'multiple-choice', prompt: 'Pick one', options: ['A', 'B', 'C', 'D'] },
    { id: 'tf-1', type: 'true-false', prompt: 'Is this true?' },
    { id: 'order-1', type: 'order', prompt: 'Order these', steps: ['First', 'Second', 'Third'] },
  ]

  it('keeps the questions as sent, in the same order', () => {
    const display = arrangeForDisplay(questions, sequenceRng([0.9, 0.1, 0.4]))
    expect(display.map((d) => d.question)).toEqual(questions)
  })

  it('gives multiple-choice questions a permutation of option positions', () => {
    const [mc] = arrangeForDisplay(questions, sequenceRng([0.99, 0.01, 0.5]))
    expect([...mc!.optionOrder].sort()).toEqual([0, 1, 2, 3])
    expect(mc!.stepOrder).toEqual([])
  })

  it('gives ordering questions a permutation of step positions', () => {
    const display = arrangeForDisplay(questions, sequenceRng([0.9, 0.1, 0.5]))
    expect([...display[2]!.stepOrder].sort()).toEqual([0, 1, 2])
    expect(display[1]).toEqual({ question: questions[1], optionOrder: [], stepOrder: [] })
  })
})
