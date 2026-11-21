import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { QuizQuestion } from '../../content/types'
import { PASSING_SCORE } from '../../content/types'
import {
  scoreQuizSubmission,
  shuffleQuiz,
  type QuizAnswers,
  type ShuffledQuizQuestion,
} from '../../lib/quiz'
import { Callout } from '../ui/Callout'

export interface QuizResult {
  score: number
  passed: boolean
  answers: QuizAnswers
}

interface QuizProps {
  questions: QuizQuestion[]
  locked: boolean
  bestScore: number
  onResult: (result: QuizResult) => void
}

/** Full quiz UI for a module: all questions at once, one submit, immediate feedback, retakes reshuffle. */
export function Quiz({ questions, locked, bestScore, onResult }: QuizProps) {
  const [attempt, setAttempt] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const retake = useCallback(() => setAttempt((a) => a + 1), [])

  useEffect(() => {
    if (attempt > 0) headingRef.current?.focus()
  }, [attempt])

  return (
    <section id="quiz" className="scroll-mt-28 rounded-card border border-line bg-card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-sm font-bold uppercase tracking-[0.06em] outline-none"
        >
          Knowledge check
        </h2>
        {!locked && questions.length > 0 ? (
          <p className="font-mono text-xs text-muted">
            {questions.length} questions · pass with {PASSING_SCORE} of {questions.length}
            {bestScore > 0 ? ` · best score: ${bestScore}/${questions.length}` : ''}
          </p>
        ) : null}
      </div>

      {locked ? (
        <p className="text-sm text-muted">
          Quiz is disabled until prior modules are complete (or enable Free roam in Settings).
        </p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted">No questions are available for this module yet.</p>
      ) : (
        <QuizAttempt
          key={`${questions[0]?.id ?? 'quiz'}-${attempt}`}
          questions={questions}
          onResult={onResult}
          onRetake={retake}
        />
      )}
    </section>
  )
}

interface QuizAttemptProps {
  questions: QuizQuestion[]
  onResult: (result: QuizResult) => void
  onRetake: () => void
}

/** One attempt: owns its own shuffle + answer state, remounted fresh (via `key`) on retake. */
function QuizAttempt({ questions, onResult, onRetake }: QuizAttemptProps) {
  const shuffled = useMemo(() => shuffleQuiz(questions), [questions])
  const originalById = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions])

  const [mcAnswers, setMcAnswers] = useState<Record<string, number | undefined>>({})
  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean | undefined>>({})
  const [orderAnswers, setOrderAnswers] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      shuffled
        .filter((q) => q.type === 'order')
        .map((q) => [q.id, (q as ShuffledQuizQuestion & { type: 'order' }).originalIndices]),
    ),
  )
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const allAnswered = shuffled.every((q) => {
    if (q.type === 'multiple-choice') return mcAnswers[q.id] != null
    if (q.type === 'true-false') return tfAnswers[q.id] != null
    return true
  })

  const moveOrderItem = useCallback((questionId: string, from: number, to: number) => {
    setOrderAnswers((prev) => {
      const current = prev[questionId]
      if (!current || to < 0 || to >= current.length) return prev
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item!)
      return { ...prev, [questionId]: next }
    })
  }, [])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (submitted || !allAnswered) return

      const answers: QuizAnswers = {}
      for (const q of shuffled) {
        const original = originalById.get(q.id)
        if (q.type === 'multiple-choice') {
          const picked = mcAnswers[q.id]
          answers[q.id] =
            picked != null && original?.type === 'multiple-choice'
              ? original.options.indexOf(q.options[picked] ?? '')
              : null
        } else if (q.type === 'true-false') {
          answers[q.id] = tfAnswers[q.id] ?? null
        } else {
          answers[q.id] = orderAnswers[q.id] ?? []
        }
      }

      const { score, results: nextResults } = scoreQuizSubmission(questions, answers)
      const passed = score >= PASSING_SCORE
      setResults(nextResults)
      setSubmitted(true)
      onResult({ score, passed, answers })
    },
    [
      submitted,
      allAnswered,
      shuffled,
      questions,
      mcAnswers,
      tfAnswers,
      orderAnswers,
      originalById,
      onResult,
    ],
  )

  const submitHintId = `${shuffled[0]?.id ?? 'quiz'}-submit-hint`
  const score = submitted ? Object.values(results).filter(Boolean).length : 0
  const passed = submitted && score >= PASSING_SCORE

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        {shuffled.map((q, index) => {
          const original = originalById.get(q.id)
          return (
            <QuizQuestionField
              key={q.id}
              index={index}
              question={q}
              submitted={submitted}
              correct={results[q.id]}
              mcValue={mcAnswers[q.id] ?? null}
              onMcChange={(v) => setMcAnswers((prev) => ({ ...prev, [q.id]: v }))}
              tfValue={tfAnswers[q.id] ?? null}
              onTfChange={(v) => setTfAnswers((prev) => ({ ...prev, [q.id]: v }))}
              orderValue={orderAnswers[q.id] ?? []}
              originalSteps={original?.type === 'order' ? original.steps : []}
              onMoveOrderItem={(from, to) => moveOrderItem(q.id, from, to)}
            />
          )
        })}
      </div>

      {!submitted ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            aria-disabled={!allAnswered}
            aria-describedby={allAnswered ? undefined : submitHintId}
            className={`rounded-pill px-5 py-2.5 font-display text-sm font-semibold ${
              allAnswered
                ? 'bg-violet text-white hover:opacity-90'
                : 'cursor-not-allowed bg-line text-muted'
            }`}
          >
            Submit answers
          </button>
          {!allAnswered ? (
            <p id={submitHintId} className="text-sm text-muted">
              Answer all questions to submit.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-3" role="status" aria-live="polite">
        {submitted ? (
          <Callout variant={passed ? 'why' : 'watch'} title={passed ? 'Passed!' : 'Not quite yet'}>
            <p>
              You scored {score} of {shuffled.length}
              {passed
                ? ` — that's a pass (${PASSING_SCORE} of ${shuffled.length} needed).`
                : `. You need ${PASSING_SCORE} of ${shuffled.length} to pass — check the explanations below, then retake.`}
            </p>
          </Callout>
        ) : null}
      </div>
      {submitted ? (
        <button
          type="button"
          onClick={onRetake}
          className="mt-3 rounded-pill border border-line px-5 py-2.5 font-display text-sm font-semibold hover:border-violet"
        >
          Retake quiz
        </button>
      ) : null}
    </form>
  )
}

interface QuizQuestionFieldProps {
  index: number
  question: ShuffledQuizQuestion
  submitted: boolean
  correct?: boolean
  mcValue: number | null
  onMcChange: (value: number) => void
  tfValue: boolean | null
  onTfChange: (value: boolean) => void
  orderValue: number[]
  originalSteps: string[]
  onMoveOrderItem: (from: number, to: number) => void
}

function QuizQuestionField({
  index,
  question,
  submitted,
  correct,
  mcValue,
  onMcChange,
  tfValue,
  onTfChange,
  orderValue,
  originalSteps,
  onMoveOrderItem,
}: QuizQuestionFieldProps) {
  const [moveMessage, setMoveMessage] = useState('')
  const move = (from: number, to: number, label: string) => {
    onMoveOrderItem(from, to)
    setMoveMessage(`Moved "${label}" to position ${to + 1} of ${orderValue.length}.`)
  }
  const feedbackClass = !submitted
    ? 'border-line bg-paper'
    : correct
      ? 'border-teal bg-teal-soft/40'
      : 'border-red bg-red-soft/40'

  return (
    <fieldset className={`rounded-block border px-4 py-4 ${feedbackClass}`}>
      <legend
        id={`${question.id}-prompt`}
        className="mb-3 px-1 text-[15px] font-semibold leading-snug"
      >
        {index + 1}. {question.prompt}
      </legend>

      {question.type === 'multiple-choice' ? (
        <div className="space-y-2" role="radiogroup" aria-labelledby={`${question.id}-prompt`}>
          {question.options.map((option, i) => {
            const optionId = `${question.id}-opt-${i}`
            const selected = mcValue === i
            return (
              <label
                key={optionId}
                htmlFor={optionId}
                className={`flex cursor-pointer items-start gap-2 rounded-inner border px-3 py-2 text-sm ${
                  selected ? 'border-violet bg-violet-soft' : 'border-line bg-card'
                }`}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={question.id}
                  value={String(i)}
                  aria-labelledby={`${optionId}-text`}
                  className="mt-0.5 size-4 accent-violet"
                  checked={selected}
                  disabled={submitted}
                  onChange={() => onMcChange(i)}
                />
                <span id={`${optionId}-text`}>{option}</span>
              </label>
            )
          })}
        </div>
      ) : null}

      {question.type === 'true-false' ? (
        <div className="flex gap-3" role="radiogroup" aria-labelledby={`${question.id}-prompt`}>
          {[true, false].map((value) => {
            const optionId = `${question.id}-${value}`
            const selected = tfValue === value
            return (
              <label
                key={String(value)}
                htmlFor={optionId}
                className={`flex cursor-pointer items-center gap-2 rounded-inner border px-4 py-2 text-sm ${
                  selected ? 'border-violet bg-violet-soft' : 'border-line bg-card'
                }`}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={question.id}
                  value={String(value)}
                  aria-labelledby={`${optionId}-text`}
                  className="size-4 accent-violet"
                  checked={selected}
                  disabled={submitted}
                  onChange={() => onTfChange(value)}
                />
                <span id={`${optionId}-text`}>{value ? 'True' : 'False'}</span>
              </label>
            )
          })}
        </div>
      ) : null}

      {question.type === 'order' ? (
        <ol className="space-y-2">
          {orderValue.map((originalIndex, position) => {
            const label = originalSteps[originalIndex] ?? ''
            return (
              <li
                key={originalIndex}
                className="flex items-center gap-3 rounded-inner border border-line bg-card px-3 py-2 text-sm"
              >
                <span aria-hidden="true" className="font-mono text-xs text-muted">
                  {position + 1}.
                </span>
                <span className="flex-1">{label}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={submitted || position === 0}
                    onClick={() => move(position, position - 1, label)}
                    aria-label={`Move "${label}" up`}
                    className="rounded-inner border border-line px-2 py-1 text-xs hover:border-violet disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={submitted || position === orderValue.length - 1}
                    onClick={() => move(position, position + 1, label)}
                    aria-label={`Move "${label}" down`}
                    className="rounded-inner border border-line px-2 py-1 text-xs hover:border-violet disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
      {question.type === 'order' ? (
        <p className="sr-only" aria-live="polite">
          {moveMessage}
        </p>
      ) : null}

      <div aria-live="polite">
        {submitted ? (
          <p className={`mt-3 text-sm ${correct ? 'text-teal' : 'text-red'}`}>
            <strong>
              <span aria-hidden="true">{correct ? '✓ ' : '✗ '}</span>
              {correct ? 'Correct.' : 'Not quite.'}
            </strong>{' '}
            {question.explanation}
          </p>
        ) : null}
      </div>
    </fieldset>
  )
}
