import { Link } from 'react-router-dom'
import { MODULE_NAV } from '../content/moduleNav'
import { Quiz } from '../components/module/Quiz'
import { Callout } from '../components/ui/Callout'
import { FINAL_ASSESSMENT, FINAL_ASSESSMENT_SIZE } from '../lib/assessments'
import { useLearner } from '../lib/useLearner'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AssessmentPage() {
  const { session, serverStatus } = useLearner()

  const intro = (
    <>
      <h1 className="font-display text-3xl font-bold">{FINAL_ASSESSMENT.title}</h1>
      <p className="mt-2 max-w-[65ch] text-muted">
        {FINAL_ASSESSMENT_SIZE} questions, {FINAL_ASSESSMENT.perModule} from each of Modules 1–
        {FINAL_ASSESSMENT.modules.length}, including scenario and ordering questions. Score{' '}
        {FINAL_ASSESSMENT.passPercent}% or more to pass. Passing it, after every module quiz, earns
        your certificate.
      </p>
    </>
  )

  if (session.mode !== 'server' || !serverStatus) {
    return (
      <div className="mx-auto max-w-3xl">
        {intro}
        <p className="mt-6 text-muted">
          The final assessment is graded on the signed-in course site, where your progress is saved
          to your Digital Realty account.
        </p>
      </div>
    )
  }

  const { assessment, completion } = serverStatus
  const remaining = MODULE_NAV.filter((m) => completion.remainingModules.includes(m.id))

  return (
    <div className="mx-auto max-w-3xl">
      {intro}

      {assessment.passed ? (
        <div className="mt-6">
          <Callout variant="why" title={`Passed with ${assessment.bestPercent}%`}>
            <p>
              Well done. Your certificate is ready on the{' '}
              <Link to="/certificate" className="font-semibold text-violet underline">
                My Certificate
              </Link>{' '}
              page. You can retake the assessment for practice; your best score is kept.
            </p>
          </Callout>
        </div>
      ) : null}

      {!assessment.open ? (
        <section aria-labelledby="locked-heading" className="mt-6">
          <h2 id="locked-heading" className="font-display text-lg font-bold">
            Pass every module quiz first
          </h2>
          <p className="mt-1 text-sm text-muted">
            The final assessment opens when all {MODULE_NAV.length} module knowledge checks are
            passed. Still to pass:
          </p>
          <ul className="mt-4 space-y-2">
            {remaining.map((mod) => (
              <li key={mod.id}>
                <Link
                  to={`/module/${mod.id}#quiz`}
                  className="block rounded-inner border border-line bg-card px-4 py-3 font-display font-semibold hover:border-violet hover:text-violet"
                >
                  {String(mod.id).padStart(2, '0')} · {mod.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-6 space-y-4">
          {assessment.cooldownUntil ? (
            <Callout variant="watch" title="Take a break and review">
              <p>
                You have used your attempts for now. You can try again after{' '}
                <strong>{formatDateTime(assessment.cooldownUntil)}</strong>. Use the time to revisit
                the explanations from your last attempt and the modules they point to.
              </p>
            </Callout>
          ) : !assessment.passed ? (
            <p className="text-sm text-muted" role="note">
              {assessment.attemptsBeforeCooldown === 1
                ? `This is your last attempt before a ${assessment.cooldownHours}-hour break.`
                : `You have ${assessment.attemptsBeforeCooldown} attempts before a ${assessment.cooldownHours}-hour break.`}
            </p>
          ) : null}
          <Quiz
            scope={FINAL_ASSESSMENT.scope}
            title="Final assessment"
            summary={`${FINAL_ASSESSMENT_SIZE} questions · pass mark ${FINAL_ASSESSMENT.passPercent}%`}
            locked={false}
            bestPercent={assessment.bestPercent}
            attempts={assessment.attempts}
            blockedMessage={
              assessment.cooldownUntil
                ? `The next attempt opens after ${formatDateTime(assessment.cooldownUntil)}.`
                : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
