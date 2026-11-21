import type { PublicQuizQuestion, QuestionResult, QuizQuestion } from '../src/content/types'
import {
  MODULE_QUIZ_MAX_TRUE_FALSE,
  MODULE_QUIZ_MIN_SCENARIO,
  MODULE_QUIZ_SIZE,
  type FinalAssessment,
} from '../src/lib/assessments'
import { scoreQuizSubmission, shuffleArray } from '../src/lib/quiz'

type Rng = () => number

const FINAL_DRAW_TRIES = 500

/** `public[i] = texts[order[i]]`, sorted so the authored order (and answer position) never leaks. */
function alphabeticalOrder(texts: string[]): number[] {
  return texts.map((_, i) => i).sort((a, b) => texts[a]!.localeCompare(texts[b]!, 'en'))
}

export function toPublicQuestion(q: QuizQuestion): PublicQuizQuestion {
  if (q.type === 'multiple-choice') {
    const order = alphabeticalOrder(q.options)
    return { id: q.id, type: q.type, prompt: q.prompt, options: order.map((i) => q.options[i]!) }
  }
  if (q.type === 'order') {
    const order = alphabeticalOrder(q.steps)
    return { id: q.id, type: q.type, prompt: q.prompt, steps: order.map((i) => q.steps[i]!) }
  }
  return { id: q.id, type: q.type, prompt: q.prompt }
}

function isIndex(value: unknown, length: number): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) < length
}

/** Maps an answer given against the public question back to the authored indices. */
function toAuthoredAnswer(q: QuizQuestion, answer: unknown): unknown {
  if (q.type === 'true-false') return typeof answer === 'boolean' ? answer : null
  if (q.type === 'multiple-choice') {
    return isIndex(answer, q.options.length) ? alphabeticalOrder(q.options)[answer] : null
  }
  const order = alphabeticalOrder(q.steps)
  if (
    !Array.isArray(answer) ||
    answer.length !== q.steps.length ||
    new Set(answer).size !== answer.length ||
    !answer.every((a) => isIndex(a, q.steps.length))
  ) {
    return null
  }
  return answer.map((a: number) => order[a])
}

export interface GradedAttempt {
  correctCount: number
  total: number
  percent: number
  results: Record<string, QuestionResult>
}

/** Grades answers keyed by question id; missing or malformed answers count as wrong. */
export function gradeAttempt(
  questions: QuizQuestion[],
  answers: Record<string, unknown>,
): GradedAttempt {
  const authored = Object.fromEntries(
    questions.map((q) => [q.id, toAuthoredAnswer(q, answers[q.id])]),
  )
  const { score, results } = scoreQuizSubmission(questions, authored)
  return {
    correctCount: score,
    total: questions.length,
    percent: questions.length > 0 ? Math.floor((score * 100) / questions.length) : 0,
    results: Object.fromEntries(
      questions.map((q) => [
        q.id,
        { correct: results[q.id] === true, explanation: q.explanation, sourceUrl: q.sourceUrl },
      ]),
    ),
  }
}

/** Questions not in the last attempt come first, each group shuffled, so retakes repeat least. */
function freshFirst(bank: QuizQuestion[], lastIds: ReadonlySet<string>, rng: Rng): QuizQuestion[] {
  return [
    ...shuffleArray(
      bank.filter((q) => !lastIds.has(q.id)),
      rng,
    ),
    ...shuffleArray(
      bank.filter((q) => lastIds.has(q.id)),
      rng,
    ),
  ]
}

/** `MODULE_QUIZ_SIZE` questions: at least 2 scenarios, at most 2 true/false, fewest repeats from the last attempt. */
export function drawModuleQuiz(
  bank: QuizQuestion[],
  lastIds: ReadonlySet<string>,
  rng: Rng = Math.random,
): QuizQuestion[] {
  const candidates = freshFirst(bank, lastIds, rng)
  const picked: QuizQuestion[] = []
  const count = (test: (q: QuizQuestion) => boolean) => picked.filter(test).length
  for (const q of candidates) {
    if (count((p) => p.scenario === true) >= MODULE_QUIZ_MIN_SCENARIO) break
    if (
      q.scenario &&
      (q.type !== 'true-false' ||
        count((p) => p.type === 'true-false') < MODULE_QUIZ_MAX_TRUE_FALSE)
    ) {
      picked.push(q)
    }
  }
  for (const q of candidates) {
    if (picked.length >= MODULE_QUIZ_SIZE) break
    if (picked.includes(q)) continue
    if (
      q.type === 'true-false' &&
      count((p) => p.type === 'true-false') >= MODULE_QUIZ_MAX_TRUE_FALSE
    ) {
      continue
    }
    picked.push(q)
  }
  return shuffleArray(picked, rng)
}

function shortfall(questions: QuizQuestion[], config: FinalAssessment): number {
  const scenarios = questions.filter((q) => q.scenario).length
  const orders = questions.filter((q) => q.type === 'order').length
  return Math.max(0, config.minScenario - scenarios) + Math.max(0, config.minOrder - orders)
}

/**
 * `perModule` questions from each module, none from the last attempt where the bank allows,
 * with the blueprint's minimum scenario and ordering questions.
 */
export function drawFinalAssessment(
  banks: Record<number, QuizQuestion[]>,
  config: FinalAssessment,
  lastIds: ReadonlySet<string>,
  rng: Rng = Math.random,
): QuizQuestion[] {
  let best: QuizQuestion[] = []
  let bestShortfall = Number.POSITIVE_INFINITY
  for (let attempt = 0; attempt < FINAL_DRAW_TRIES && bestShortfall > 0; attempt += 1) {
    const picks = config.modules.flatMap((id) =>
      freshFirst(banks[id] ?? [], lastIds, rng).slice(0, config.perModule),
    )
    const missing = shortfall(picks, config)
    if (missing < bestShortfall) {
      best = picks
      bestShortfall = missing
    }
  }
  return shuffleArray(best, rng)
}
