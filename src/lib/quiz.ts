import type { PublicQuizQuestion, QuizQuestion } from '../content/types'

/** Fisher–Yates shuffle. Accepts a pluggable RNG so behavior is testable/deterministic. */
export function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]!
    result[j] = tmp!
  }
  return result
}

/** Returns a shuffled permutation of indices [0, count). */
function shuffledIndices(count: number, rng: () => number): number[] {
  return shuffleArray(
    Array.from({ length: count }, (_, i) => i),
    rng,
  )
}

export interface DisplayQuestion {
  question: PublicQuizQuestion
  /** Option positions (indices into `question.options`) in the order they are shown. */
  optionOrder: number[]
  /** Starting arrangement of an ordering question, as indices into `question.steps`. */
  stepOrder: number[]
}

/** Shuffles each question's options and starting step order for display. */
export function arrangeForDisplay(
  questions: PublicQuizQuestion[],
  rng: () => number = Math.random,
): DisplayQuestion[] {
  return questions.map((question) => ({
    question,
    optionOrder:
      question.type === 'multiple-choice' ? shuffledIndices(question.options.length, rng) : [],
    stepOrder: question.type === 'order' ? shuffledIndices(question.steps.length, rng) : [],
  }))
}

/**
 * Answers keyed by question id: an option index for multiple-choice, a boolean for true/false,
 * and step indices in the chosen order for ordering questions. Indices refer to the question as
 * it was sent (the browser) or as it was authored (server grading).
 */
export type QuizAnswers = Record<string, unknown>

/** Score a submission against the original questions. Malformed answers count as wrong. */
export function scoreQuizSubmission(
  questions: QuizQuestion[],
  answers: QuizAnswers,
): { score: number; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {}
  for (const q of questions) {
    const answer = answers[q.id]
    if (q.type === 'multiple-choice') {
      results[q.id] = answer === q.correctIndex
    } else if (q.type === 'true-false') {
      results[q.id] = answer === q.correct
    } else {
      results[q.id] =
        Array.isArray(answer) &&
        answer.length === q.correctOrder.length &&
        answer.every((value, index) => value === q.correctOrder[index])
    }
  }
  return { score: Object.values(results).filter(Boolean).length, results }
}
