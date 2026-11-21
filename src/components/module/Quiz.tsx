import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { QuizAttemptView, QuizScope } from '../../content/types'
import type { QuizOutcome } from '../../lib/api'
import { arrangeForDisplay, type DisplayQuestion, type QuizAnswers } from '../../lib/quiz'
import { useLearner } from '../../lib/useLearner'
import { Callout } from '../ui/Callout'

interface QuizProps {
  scope: QuizScope
  title?: string
  /** One line under the heading, e.g. how many questions and the pass mark. */
  summary: string
  locked: boolean
  lockedMessage?: string
  bestPercent: number
  attempts: number
  /** Shown instead of the start and retake buttons, e.g. during a cooldown. */
  blockedMessage?: string
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'attempt'; view: QuizAttemptView }

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

/** A server-drawn quiz: start an attempt, answer, submit for grading, read the explanations. */
export function Quiz({
  scope,
  title = 'Knowledge check',
  summary,
  locked,
  lockedMessage = 'Quiz is disabled until prior modules are complete (or enable Free roam in Settings).',
  bestPercent,
  attempts,
  blockedMessage,
}: QuizProps) {
  const { session, startQuiz } = useLearner()
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const retaking = useRef(false)

  const begin = useCallback(async () => {
    setPhase({ kind: 'loading' })
    try {
      setPhase({ kind: 'attempt', view: await startQuiz(scope) })
    } catch (err) {
      setPhase({ kind: 'error', message: messageOf(err) })
    }
  }, [scope, startQuiz])

  const retake = useCallback(() => {
    retaking.current = true
    void begin()
  }, [begin])

  useEffect(() => {
    if (phase.kind === 'attempt' && retaking.current) {
      retaking.current = false
      headingRef.current?.focus()
    }
  }, [phase])

  return (
    <section id="quiz" className="scroll-mt-28 rounded-card border border-line bg-card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-sm font-bold uppercase tracking-[0.06em] outline-none"
        >
          {title}
        </h2>
        {!locked ? (
          <p className="font-mono text-xs text-muted">
            {summary}
            {attempts > 0 ? ` · best: ${bestPercent}% · attempts: ${attempts}` : ''}
          </p>
        ) : null}
      </div>

      {locked ? (
        <p className="text-sm text-muted">{lockedMessage}</p>
      ) : session.mode === 'loading' ? null : session.mode !== 'server' ? (
        <p className="text-sm text-muted">
          Quizzes are graded by the course server. Open the course site and sign in to take them.
        </p>
      ) : phase.kind === 'idle' && blockedMessage ? (
        <p className="text-sm text-muted">{blockedMessage}</p>
      ) : phase.kind === 'idle' ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void begin()}
            className="rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90"
          >
            {attempts > 0 ? 'Take the quiz again' : 'Start the quiz'}
          </button>
          <p className="text-sm text-muted">Each attempt draws a new set of questions.</p>
        </div>
      ) : phase.kind === 'loading' ? (
        <p className="text-sm text-muted" role="status">
          Drawing your questions…
        </p>
      ) : phase.kind === 'error' ? (
        <div className="space-y-3">
          <Callout variant="watch" title="The quiz could not start">
            <p>{phase.message}</p>
          </Callout>
          <button
            type="button"
            onClick={() => void begin()}
            className="rounded-pill border border-line px-5 py-2.5 font-display text-sm font-semibold hover:border-violet"
          >
            Try again
          </button>
        </div>
      ) : (
        <QuizAttempt
          key={phase.view.attemptId}
          view={phase.view}
          onRetake={blockedMessage ? undefined : retake}
        />
      )}
    </section>
  )
}

interface QuizAttemptProps {
  view: QuizAttemptView
  /** Omitted when another attempt is not allowed yet. */
  onRetake?: () => void
}

/** One attempt: owns its display order and answers, remounted (via `key`) for each new attempt. */
function QuizAttempt({ view, onRetake }: QuizAttemptProps) {
  const { submitQuiz } = useLearner()
  const display = useMemo(() => arrangeForDisplay(view.questions), [view.questions])

  const [choices, setChoices] = useState<Record<string, number | undefined>>({})
  const [truths, setTruths] = useState<Record<string, boolean | undefined>>({})
  const [orders, setOrders] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      display.filter((d) => d.question.type === 'order').map((d) => [d.question.id, d.stepOrder]),
    ),
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)

  const allAnswered = view.questions.every((q) => {
    if (q.type === 'multiple-choice') return choices[q.id] != null
    if (q.type === 'true-false') return truths[q.id] != null
    return true
  })
  const graded = outcome != null

  const moveStep = useCallback((questionId: string, from: number, to: number) => {
    setOrders((prev) => {
      const current = prev[questionId]
      if (!current || to < 0 || to >= current.length) return prev
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item!)
      return { ...prev, [questionId]: next }
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (graded || submitting || !allAnswered) return
      const answers: QuizAnswers = {}
      for (const q of view.questions) {
        if (q.type === 'multiple-choice') answers[q.id] = choices[q.id] ?? null
        else if (q.type === 'true-false') answers[q.id] = truths[q.id] ?? null
        else answers[q.id] = orders[q.id] ?? []
      }
      setSubmitting(true)
      setSubmitError(null)
      try {
        setOutcome(await submitQuiz(view.scope, view.attemptId, answers))
      } catch (err) {
        setSubmitError(messageOf(err))
      } finally {
        setSubmitting(false)
      }
    },
    [graded, submitting, allAnswered, view, choices, truths, orders, submitQuiz],
  )

  const submitHintId = `${view.attemptId}-submit-hint`
  const canSubmit = allAnswered && !submitting

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      <div className="space-y-6">
        {display.map((d, index) => (
          <QuizQuestionField
            key={d.question.id}
            index={index}
            item={d}
            graded={graded}
            result={outcome?.results[d.question.id]}
            choice={choices[d.question.id] ?? null}
            onChoice={(v) => setChoices((prev) => ({ ...prev, [d.question.id]: v }))}
            truth={truths[d.question.id] ?? null}
            onTruth={(v) => setTruths((prev) => ({ ...prev, [d.question.id]: v }))}
            order={orders[d.question.id] ?? []}
            onMoveStep={(from, to) => moveStep(d.question.id, from, to)}
          />
        ))}
      </div>

      {!graded ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            aria-disabled={!canSubmit}
            aria-describedby={allAnswered ? undefined : submitHintId}
            className={`rounded-pill px-5 py-2.5 font-display text-sm font-semibold ${
              canSubmit
                ? 'bg-violet text-white hover:opacity-90'
                : 'cursor-not-allowed bg-line text-muted'
            }`}
          >
            {submitting ? 'Grading…' : 'Submit answers'}
          </button>
          {!allAnswered ? (
            <p id={submitHintId} className="text-sm text-muted">
              Answer all questions to submit.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-3" role="status" aria-live="polite">
        {outcome ? (
          <Callout
            variant={outcome.passed ? 'why' : 'watch'}
            title={outcome.passed ? 'Passed!' : 'Not quite yet'}
          >
            <p>
              You scored {outcome.correctCount} of {outcome.total} ({outcome.percent}%).{' '}
              {outcome.passed
                ? `That's a pass (${view.passPercent}% needed).`
                : `You need ${view.passPercent}% to pass. Read the explanations below, then try again with a new set of questions.`}
            </p>
          </Callout>
        ) : null}
        {submitError ? (
          <Callout variant="watch" title="Your answers could not be graded">
            <p>{submitError}</p>
          </Callout>
        ) : null}
      </div>
      {(graded || submitError) && onRetake ? (
        <button
          type="button"
          onClick={onRetake}
          className="mt-3 rounded-pill border border-line px-5 py-2.5 font-display text-sm font-semibold hover:border-violet"
        >
          {submitError ? 'Start again' : 'Retake with new questions'}
        </button>
      ) : null}
    </form>
  )
}

interface QuizQuestionFieldProps {
  index: number
  item: DisplayQuestion
  graded: boolean
  result?: { correct: boolean; explanation: string; sourceUrl: string }
  choice: number | null
  onChoice: (value: number) => void
  truth: boolean | null
  onTruth: (value: boolean) => void
  order: number[]
  onMoveStep: (from: number, to: number) => void
}

function QuizQuestionField({
  index,
  item,
  graded,
  result,
  choice,
  onChoice,
  truth,
  onTruth,
  order,
  onMoveStep,
}: QuizQuestionFieldProps) {
  const { question, optionOrder } = item
  const [moveMessage, setMoveMessage] = useState('')
  const move = (from: number, to: number, label: string) => {
    onMoveStep(from, to)
    setMoveMessage(`Moved "${label}" to position ${to + 1} of ${order.length}.`)
  }
  const correct = result?.correct === true
  const feedbackClass = !result
    ? 'border-line bg-paper'
    : correct
      ? 'border-teal bg-teal-soft/40'
      : 'border-red bg-red-soft/40'
  const promptId = `${question.id}-prompt`

  return (
    <fieldset className={`rounded-block border px-4 py-4 ${feedbackClass}`}>
      <legend id={promptId} className="mb-3 px-1 text-[15px] font-semibold leading-snug">
        {index + 1}. {question.prompt}
      </legend>

      {question.type === 'multiple-choice' ? (
        <div className="space-y-2" role="radiogroup" aria-labelledby={promptId}>
          {optionOrder.map((optionIndex) => {
            const optionId = `${question.id}-opt-${optionIndex}`
            const selected = choice === optionIndex
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
                  value={String(optionIndex)}
                  aria-labelledby={`${optionId}-text`}
                  className="mt-0.5 size-4 accent-violet"
                  checked={selected}
                  disabled={graded}
                  onChange={() => onChoice(optionIndex)}
                />
                <span id={`${optionId}-text`}>{question.options[optionIndex]}</span>
              </label>
            )
          })}
        </div>
      ) : null}

      {question.type === 'true-false' ? (
        <div className="flex gap-3" role="radiogroup" aria-labelledby={promptId}>
          {[true, false].map((value) => {
            const optionId = `${question.id}-${value}`
            const selected = truth === value
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
                  disabled={graded}
                  onChange={() => onTruth(value)}
                />
                <span id={`${optionId}-text`}>{value ? 'True' : 'False'}</span>
              </label>
            )
          })}
        </div>
      ) : null}

      {question.type === 'order' ? (
        <>
          <ol className="space-y-2">
            {order.map((stepIndex, position) => {
              const label = question.steps[stepIndex] ?? ''
              return (
                <li
                  key={stepIndex}
                  className="flex items-center gap-3 rounded-inner border border-line bg-card px-3 py-2 text-sm"
                >
                  <span aria-hidden="true" className="font-mono text-xs text-muted">
                    {position + 1}.
                  </span>
                  <span className="flex-1">{label}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={graded || position === 0}
                      onClick={() => move(position, position - 1, label)}
                      aria-label={`Move "${label}" up`}
                      className="rounded-inner border border-line px-2 py-1 text-xs hover:border-violet disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={graded || position === order.length - 1}
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
          <p className="sr-only" aria-live="polite">
            {moveMessage}
          </p>
        </>
      ) : null}

      <div aria-live="polite">
        {result ? (
          <p className={`mt-3 text-sm ${correct ? 'text-teal' : 'text-red'}`}>
            <strong>
              <span aria-hidden="true">{correct ? '✓ ' : '✗ '}</span>
              {correct ? 'Correct.' : 'Not quite.'}
            </strong>{' '}
            <span className="text-ink">{result.explanation}</span>{' '}
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-violet underline underline-offset-2"
            >
              Source on Microsoft Learn
            </a>
          </p>
        ) : null}
      </div>
    </fieldset>
  )
}
