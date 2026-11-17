import { Link } from 'react-router-dom'
import { MODULE_NAV } from '../content/moduleNav'
import { CERTIFICATE_PDF_URL } from '../lib/api'
import { COURSE_NAME, formatCertificateDate } from '../lib/completion'
import { getModuleProgress } from '../lib/progress'
import { useLearner } from '../lib/useLearner'

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

  const { certificate, completion, passingPercent } = serverStatus
  const valid = certificate != null && !certificate.expired

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">My Certificate</h1>
      <p className="mt-2 text-muted">{COURSE_NAME}</p>

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
            <dt className="text-muted">Final score</dt>
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
              Pass every module quiz again to earn a new certificate with a new ID.
            </p>
          ) : null}
        </section>
      ) : null}

      {!valid ? (
        <section aria-labelledby="requirements-heading" className="mt-8">
          <h2 id="requirements-heading" className="font-display text-lg font-bold">
            {completion.remainingModules.length === 0
              ? 'All quizzes passed'
              : `${completion.passedModules.length} of ${MODULE_NAV.length} quizzes passed`}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Score {passingPercent}% or higher on every module knowledge check to earn your
            certificate.
          </p>
          <ul className="mt-4 space-y-2">
            {MODULE_NAV.map((mod) => {
              const passed = completion.passedModules.includes(mod.id)
              const best = getModuleProgress(state, mod.id).quizBestScore
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
                    {passed
                      ? `Passed · best ${best}/5`
                      : best > 0
                        ? `Best ${best}/5`
                        : 'Not passed'}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
