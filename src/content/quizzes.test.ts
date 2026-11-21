import { describe, expect, it } from 'vitest'
import { drawFinalAssessment, drawModuleQuiz } from '../../server/quizEngine'
import {
  FINAL_ASSESSMENT,
  FINAL_ASSESSMENT_SIZE,
  MIN_BANK_SIZE,
  MODULE_QUIZ_MAX_TRUE_FALSE,
  MODULE_QUIZ_MIN_SCENARIO,
  MODULE_QUIZ_SIZE,
} from '../lib/assessments'
import { quizzesByModule } from './quizzes'
import { MODULE_COUNT, type QuizQuestion } from './types'

const banks = Object.entries(quizzesByModule).map(([id, bank]) => ({ id: Number(id), bank }))
const allQuestions = banks.flatMap((b) => b.bank)
const SEEDS = 200

/** Small deterministic PRNG so draw checks are repeatable. */
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const countOf = (qs: QuizQuestion[], test: (q: QuizQuestion) => boolean) => qs.filter(test).length

describe('question banks', () => {
  it('has a bank for every module', () => {
    expect(banks.map((b) => b.id).sort((a, b) => a - b)).toEqual(
      Array.from({ length: MODULE_COUNT }, (_, i) => i + 1),
    )
  })

  it.each(banks)(`module $id has at least ${MIN_BANK_SIZE} questions`, ({ bank }) => {
    expect(bank.length).toBeGreaterThanOrEqual(MIN_BANK_SIZE)
  })

  it('uses unique question ids across all banks', () => {
    const ids = allQuestions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(allQuestions.map((q) => ({ id: q.id, q })))(
    '$id has an explanation and a Microsoft Learn source',
    ({ q }) => {
      expect(q.explanation.trim().length).toBeGreaterThan(20)
      expect(q.sourceUrl).toMatch(/^https:\/\/learn\.microsoft\.com\//)
    },
  )

  it.each(allQuestions.map((q) => ({ id: q.id, q })))('$id is well formed', ({ q }) => {
    expect(q.prompt.trim()).not.toBe('')
    if (q.type === 'multiple-choice') {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
      expect(new Set(q.options).size).toBe(q.options.length)
      expect(q.options[q.correctIndex]).toBeDefined()
    }
    if (q.type === 'order') {
      expect(new Set(q.steps).size).toBe(q.steps.length)
      expect([...q.correctOrder].sort((a, b) => a - b)).toEqual(q.steps.map((_, i) => i))
    }
  })

  it.each(allQuestions.map((q) => ({ id: q.id, q })))(
    '$id reads correctly in the final assessment, away from its module',
    ({ q }) => {
      expect(`${q.prompt} ${q.explanation}`).not.toMatch(/\bthis (module|lesson)\b/i)
    },
  )

  it.each(banks)('module $id does not give answers away by length', ({ bank }) => {
    const choices = bank.filter((q) => q.type === 'multiple-choice')
    const longest = choices.filter(
      (q) => q.options[q.correctIndex]!.length >= Math.max(...q.options.map((o) => o.length)),
    )
    expect(longest.length / choices.length).toBeLessThanOrEqual(0.4)
    for (const q of choices) {
      const wrong = q.options.filter((_, i) => i !== q.correctIndex).map((o) => o.length)
      expect(q.options[q.correctIndex]!.length, q.id).toBeLessThanOrEqual(
        Math.ceil(Math.max(...wrong) * 1.15),
      )
    }
  })

  it.each(banks)('module $id has enough scenario and non-true/false questions', ({ bank }) => {
    expect(countOf(bank, (q) => q.scenario === true)).toBeGreaterThanOrEqual(4)
    expect(countOf(bank, (q) => q.type !== 'true-false')).toBeGreaterThanOrEqual(
      MODULE_QUIZ_SIZE - MODULE_QUIZ_MAX_TRUE_FALSE,
    )
  })
})

describe('pass marks', () => {
  it('are a whole number of questions, so 80% means exactly 80%', () => {
    expect((MODULE_QUIZ_SIZE * FINAL_ASSESSMENT.passPercent) % 100).toBe(0)
    expect((FINAL_ASSESSMENT_SIZE * FINAL_ASSESSMENT.passPercent) % 100).toBe(0)
  })
})

describe('draws', () => {
  it.each(banks)('module $id always draws a valid quiz', ({ bank }) => {
    let last = new Set<string>()
    for (let seed = 1; seed <= SEEDS; seed += 1) {
      const quiz = drawModuleQuiz(bank, last, seeded(seed))
      expect(quiz).toHaveLength(MODULE_QUIZ_SIZE)
      expect(new Set(quiz.map((q) => q.id)).size).toBe(MODULE_QUIZ_SIZE)
      expect(countOf(quiz, (q) => q.type === 'true-false')).toBeLessThanOrEqual(
        MODULE_QUIZ_MAX_TRUE_FALSE,
      )
      expect(countOf(quiz, (q) => q.scenario === true)).toBeGreaterThanOrEqual(
        MODULE_QUIZ_MIN_SCENARIO,
      )
      last = new Set(quiz.map((q) => q.id))
    }
  })

  it('always draws a valid final assessment with no repeats from the last attempt', () => {
    let last = new Set<string>()
    for (let seed = 1; seed <= SEEDS; seed += 1) {
      const exam = drawFinalAssessment(quizzesByModule, FINAL_ASSESSMENT, last, seeded(seed))
      expect(exam).toHaveLength(FINAL_ASSESSMENT_SIZE)
      for (const id of FINAL_ASSESSMENT.modules) {
        const fromModule = exam.filter((q) => quizzesByModule[id]!.includes(q))
        expect(fromModule).toHaveLength(FINAL_ASSESSMENT.perModule)
      }
      expect(countOf(exam, (q) => q.scenario === true)).toBeGreaterThanOrEqual(
        FINAL_ASSESSMENT.minScenario,
      )
      expect(countOf(exam, (q) => q.type === 'order')).toBeGreaterThanOrEqual(
        FINAL_ASSESSMENT.minOrder,
      )
      expect(exam.filter((q) => last.has(q.id))).toEqual([])
      last = new Set(exam.map((q) => q.id))
    }
  })
})

describe('answer key stays on the server', () => {
  const sources = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  const browserFiles = Object.entries(sources).filter(
    ([path]) => !/\.test\.tsx?$/.test(path) && !path.startsWith('/src/test/'),
  )

  it('finds the browser source files', () => {
    expect(browserFiles.length).toBeGreaterThan(20)
  })

  it.each(browserFiles.map(([path, source]) => ({ path, source })))(
    '$path does not import the question banks or server code',
    ({ path, source }) => {
      if (path === '/src/content/quizzes.ts') return
      expect(source).not.toMatch(/from\s+['"][^'"]*content\/quizzes['"]/)
      expect(source).not.toMatch(/from\s+['"][^'"]*\/quizzes['"]/)
      expect(source).not.toMatch(/from\s+['"](\.\.\/)+server\//)
    },
  )
})
