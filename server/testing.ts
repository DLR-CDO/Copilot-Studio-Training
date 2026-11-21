import type { PublicQuizQuestion, QuizAttemptView, QuizQuestion } from '../src/content/types'
import { quizzesByModule } from '../src/content/quizzes'
import type { QuizAnswers } from '../src/lib/quiz'

const bankById = new Map<string, QuizQuestion>(
  Object.values(quizzesByModule).flatMap((bank) => bank.map((q) => [q.id, q])),
)

function answerFor(shown: PublicQuizQuestion, right: boolean): unknown {
  const q = bankById.get(shown.id)
  if (!q) throw new Error(`Unknown question ${shown.id}`)
  if (q.type === 'true-false') return right ? q.correct : !q.correct
  if (q.type === 'multiple-choice' && shown.type === 'multiple-choice') {
    const correct = shown.options.indexOf(q.options[q.correctIndex]!)
    return right ? correct : (correct + 1) % shown.options.length
  }
  if (q.type === 'order' && shown.type === 'order') {
    const correct = q.correctOrder.map((i) => shown.steps.indexOf(q.steps[i]!))
    return right ? correct : [...correct].reverse()
  }
  throw new Error(`Question ${shown.id} does not match its public form`)
}

/** Answers for a drawn attempt, as the browser would send them, with the first N right. */
export function answersFor(view: QuizAttemptView, correctCount: number): QuizAnswers {
  return Object.fromEntries(view.questions.map((q, i) => [q.id, answerFor(q, i < correctCount)]))
}
