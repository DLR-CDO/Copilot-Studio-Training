import { ADMIN_CSV_URL } from '../lib/api'
import { useLearner } from '../lib/useLearner'

export function AdminPage() {
  const { session } = useLearner()
  const isAdmin = session.mode === 'server' && session.user.isAdmin

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Course completions</h1>
      {isAdmin ? (
        <>
          <p className="mt-3 text-muted">
            Download every certificate issued: name, email, completion date, expiration date, score,
            and certificate ID.
          </p>
          <a
            href={ADMIN_CSV_URL}
            download
            className="mt-5 inline-flex rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90"
          >
            Download CSV
          </a>
        </>
      ) : (
        <p className="mt-3 text-muted" role="alert">
          Only course admins can export completions.
        </p>
      )}
    </div>
  )
}
