import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MODULE_NAV } from '../content/moduleNav'
import { CERTIFICATE_PDF_URL } from '../lib/api'
import { FINAL_ASSESSMENT } from '../lib/assessments'
import { CERT_TITLE, formatCertificateDate } from '../lib/completion'
import { getModuleProgress } from '../lib/progress'
import { useLearner } from '../lib/useLearner'

function NameForm({ current, ready }: { current: string; ready: boolean }) {
  const { saveName } = useLearner()
  const [draft, setDraft] = useState(current)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('saving')
    setError(null)
    try {
      await saveName(draft)
      setStatus('saved')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Your name could not be saved.')
    }
  }

  return (
    <section
      aria-labelledby="name-heading"
      className={`mt-6 rounded-card border bg-card p-5 ${ready ? 'border-teal' : 'border-line'}`}
    >
      <h2 id="name-heading" className="font-display text-lg font-bold">
        {ready ? 'Enter your name to receive your certificate' : 'Name on your certificate'}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {ready
          ? 'You passed every module quiz and the final assessment. Your certificate is issued as soon as you save your name.'
          : 'Enter your name as it should appear on your certificate. You can change it until the certificate is issued.'}
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-semibold">Full name</span>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setStatus('idle')
            }}
            maxLength={80}
            required
            autoComplete="name"
            className="rounded-inner border border-line bg-paper px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'saving' || draft.trim().length < 2}
          className="rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : ready ? 'Save and issue certificate' : 'Save name'}
        </button>
      </form>
      {status === 'saved' ? (
        <p className="mt-2 text-sm text-teal" role="status">
          Saved.
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

export function CertificatePage() {
  const { state, session, serverStatus } = useLearner()

  if (session.mode !== 'server' || !serverStatus) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold">My Certificate</h1>
        <p className="mt-3 text-muted">
          Certificates are only issued on the signed-in course site, where your progress is saved to
          your Digital Realty account.
        </p>
      </div>
    )
  }

  const { certificate, completion, assessment, passingPercent, name } = serverStatus
  const valid = certificate != null && !certificate.expired

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">My Certificate</h1>
      <p className="mt-2 text-muted">{CERT_TITLE}</p>

      {certificate ? (
        <section
          aria-labelledby="certificate-heading"
          className={`mt-6 rounded-card border bg-card p-5 ${valid ? 'border-teal' : 'border-red'}`}
        >
          <h2 id="certificate-heading" className="font-display text-lg font-bold">
            {valid ? 'Certificate of Completion' : 'Your certificate has expired'}
          </h2>
          <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="font-semibold">{certificate.name}</dd>
            <dt className="text-muted">Completed</dt>
            <dd className="font-semibold">{formatCertificateDate(certificate.completedAt)}</dd>
            <dt className="text-muted">{valid ? 'Expires' : 'Expired'}</dt>
            <dd className="font-semibold">{formatCertificateDate(certificate.expiresAt)}</dd>
            <dt className="text-muted">Final assessment score</dt>
            <dd className="font-semibold">{certificate.scorePercent}%</dd>
            <dt className="text-muted">Certificate ID</dt>
            <dd className="font-mono font-semibold">{certificate.id}</dd>
            <dt className="text-muted">Verify at</dt>
            <dd className="break-all">
              <a href={certificate.verifyUrl} className="text-violet underline">
                {certificate.verifyUrl}
              </a>
            </dd>
          </dl>
          <a
            href={CERTIFICATE_PDF_URL}
            className="mt-5 inline-flex rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90"
          >
            Download PDF
          </a>
          {!valid ? (
            <p className="mt-4 text-sm">
              Pass every module quiz and the final assessment again to earn a new certificate with a
              new ID.
            </p>
          ) : null}
        </section>
      ) : null}

      {!valid ? <NameForm current={name} ready={completion.complete && !name} /> : null}

      {!valid ? (
        <section aria-labelledby="requirements-heading" className="mt-8">
          <h2 id="requirements-heading" className="font-display text-lg font-bold">
            {completion.complete ? 'Everything is passed' : 'What is still needed'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Score {passingPercent}% or higher on every module knowledge check, then pass the final
            assessment, to earn your certificate.
          </p>
          <ul className="mt-4 space-y-2">
            {MODULE_NAV.map((mod) => {
              const passed = completion.passedModules.includes(mod.id)
              const best = getModuleProgress(state, mod.id).quizBestPercent
              return (
                <li
                  key={mod.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-inner border border-line bg-card px-4 py-3"
                >
                  <Link
                    to={`/module/${mod.id}#quiz`}
                    className="font-display font-semibold hover:text-violet"
                  >
                    {String(mod.id).padStart(2, '0')} · {mod.title}
                  </Link>
                  <span className={`font-mono text-xs ${passed ? 'text-teal' : 'text-muted'}`}>
                    {passed ? `Passed · best ${best}%` : best > 0 ? `Best ${best}%` : 'Not passed'}
                  </span>
                </li>
              )
            })}
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-inner border border-line bg-card px-4 py-3">
              <Link to="/assessment" className="font-display font-semibold hover:text-violet">
                {FINAL_ASSESSMENT.title}
              </Link>
              <span
                className={`font-mono text-xs ${assessment.passed ? 'text-teal' : 'text-muted'}`}
              >
                {assessment.passed
                  ? `Passed · best ${assessment.bestPercent}%`
                  : !assessment.open
                    ? 'Opens after every module quiz is passed'
                    : assessment.attempts > 0
                      ? `Best ${assessment.bestPercent}%`
                      : 'Not taken'}
              </span>
            </li>
          </ul>
        </section>
      ) : null}
    </div>
  )
}
