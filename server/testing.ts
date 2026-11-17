import type { QuizQuestion } from '../src/content/types'
import { quizzesByModule } from '../src/content/quizzes'
import type { QuizAnswers } from '../src/lib/quiz'

/** Answers for a module's real quiz with the first `correctCount` questions right. */
export function answersFor(moduleId: number, correctCount: number): QuizAnswers {
  const questions: QuizQuestion[] = quizzesByModule[moduleId] ?? []
  return Object.fromEntries(
    questions.map((q, i) => {
      const right = i < correctCount
      if (q.type === 'multiple-choice') {
        return [q.id, right ? q.correctIndex : (q.correctIndex + 1) % q.options.length]
      }
      if (q.type === 'true-false') return [q.id, right ? q.correct : !q.correct]
      return [q.id, right ? q.correctOrder : [...q.correctOrder].reverse()]
    }),
  )
}
