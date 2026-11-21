import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyCertificate, type VerifyResult } from '../lib/api'
import { formatCertificateDate } from '../lib/completion'

/** Public page: shows only name, certificate title, dates, and status. */
export function VerifyPage() {
  const [params, setParams] = useSearchParams()
  const id = (params.get('id') ?? '').trim()
  const [draft, setDraft] = useState(id)
  const [result, setResult] = useState<{ id: string; value: VerifyResult } | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void verifyCertificate(id).then((value) => {
      if (!cancelled) setResult({ id, value })
    })
    return () => {
      cancelled = true
    }
  }, [id])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setParams(draft.trim() ? { id: draft.trim() } : {})
  }

  const current = id && result?.id === id ? result.value : null

  return (
    <main className="mx-auto min-h-screen max-w-xl bg-paper px-5 py-12 text-ink">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal">Digital Realty</p>
      <h1 className="mt-1 font-display text-3xl font-bold">Verify a certificate</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm">
          <span className="text-muted">Certificate ID</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="DR-CSF-XXXX-XXXX-XXXX"
            maxLength={40}
            autoComplete="off"
            required
            className="rounded-inner border border-line bg-card px-3 py-2 font-mono uppercase"
          />
        </label>
        <button
          type="submit"
          className="rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Verify
        </button>
      </form>

      {id && !current ? (
        <p className="mt-6 text-sm text-muted" role="status">
          Checking…
        </p>
      ) : null}

      {current?.kind === 'found' ? (
        <div className="mt-6 rounded-card border border-line bg-card p-5" role="status">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted">Learner</dt>
            <dd className="font-semibold">{current.name}</dd>
            <dt className="text-muted">Certificate</dt>
            <dd className="font-semibold">{current.course}</dd>
            <dt className="text-muted">Completed</dt>
            <dd className="font-semibold">{formatCertificateDate(current.completedAt)}</dd>
            <dt className="text-muted">{current.status === 'valid' ? 'Expires' : 'Expired on'}</dt>
            <dd className="font-semibold">{formatCertificateDate(current.expiresAt)}</dd>
            <dt className="text-muted">Status</dt>
            <dd
              className={`font-semibold ${current.status === 'valid' ? 'text-teal' : 'text-red'}`}
            >
              {current.status === 'valid' ? 'Valid' : 'Expired'}
            </dd>
          </dl>
        </div>
      ) : null}

      {current && current.kind !== 'found' ? (
        <div className="mt-6 rounded-card border border-red bg-card p-5 text-red" role="alert">
          {current.message}
        </div>
      ) : null}
    </main>
  )
}
