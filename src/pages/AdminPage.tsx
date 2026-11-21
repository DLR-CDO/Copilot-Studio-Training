import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { AdminLearnerRow, AdminLearnerStatus, AdminList } from '../content/types'
import { MODULE_COUNT } from '../content/types'
import {
  ADMIN_CSV_URL,
  ADMIN_LEARNERS_CSV_URL,
  SignInRequiredError,
  addAdmin,
  fetchAdminLearners,
  fetchAdmins,
  redirectToSignIn,
  removeAdmin,
} from '../lib/api'
import { useLearner } from '../lib/useLearner'

const STATUS_LABELS: Record<AdminLearnerStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'ready-for-final': 'Ready for final',
  certified: 'Certified',
  expired: 'Certificate expired',
}

const STATUS_STYLES: Record<AdminLearnerStatus, string> = {
  'not-started': 'border-line text-muted',
  'in-progress': 'border-violet text-violet',
  'ready-for-final': 'border-teal text-teal',
  certified: 'border-teal bg-teal-soft text-teal',
  expired: 'border-red text-red',
}

type Filter = 'all' | AdminLearnerStatus

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function finalSummary(row: AdminLearnerRow): string {
  const { final } = row
  if (final.passed) return `Passed · ${final.bestPercent}%`
  if (final.cooldownUntil) return `On a break until ${formatDateTime(final.cooldownUntil)}`
  if (final.attempts > 0) {
    return `${final.attempts} attempt${final.attempts === 1 ? '' : 's'} · best ${final.bestPercent}%`
  }
  return row.currentModule === null ? 'Not taken yet' : 'Locked'
}

export function AdminPage() {
  const { session } = useLearner()
  const isAdmin = session.mode === 'server' && session.user.isAdmin

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold">Learners</h1>
      {isAdmin ? (
        <>
          <AdminDashboard />
          <AdminsSection currentEmail={session.user.email} />
        </>
      ) : (
        <p className="mt-3 text-muted" role="alert">
          Only course admins can see learner progress.
        </p>
      )}
    </div>
  )
}

function AdminDashboard() {
  const [rows, setRows] = useState<AdminLearnerRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchAdminLearners()
      .then((learners) => {
        if (cancelled) return
        setRows(learners)
        setError(null)
        setLoadedAt(new Date())
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof SignInRequiredError) return redirectToSignIn()
        setError(err instanceof Error ? err.message : 'Could not load learners.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const counts = useMemo(() => {
    const out: Record<Filter, number> = {
      all: 0,
      'not-started': 0,
      'in-progress': 0,
      'ready-for-final': 0,
      certified: 0,
      expired: 0,
    }
    for (const row of rows ?? []) {
      out.all += 1
      out[row.status] += 1
    }
    return out
  }, [rows])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows ?? []).filter(
      (row) =>
        (filter === 'all' || row.status === filter) &&
        (!q || row.name.toLowerCase().includes(q) || row.email.includes(q)),
    )
  }, [rows, query, filter])

  const filters: Filter[] = [
    'all',
    'not-started',
    'in-progress',
    'ready-for-final',
    'certified',
    'expired',
  ]

  return (
    <>
      <p className="mt-2 text-muted">
        Everyone who has signed in to the course, most recently active first. Progress counts a
        module once its quiz is passed.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-card border px-4 py-2 text-left ${
              filter === f
                ? 'border-violet bg-violet-soft'
                : 'border-line bg-card hover:border-violet'
            }`}
          >
            <span className="block font-display text-xl font-bold">{counts[f]}</span>
            <span className="block font-mono text-[11px] uppercase tracking-wide text-muted">
              {f === 'all' ? 'All learners' : STATUS_LABELS[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex-1">
          <span className="sr-only">Search by name or email</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-pill border border-line bg-card px-4 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            setRefreshKey((k) => k + 1)
          }}
          className="rounded-pill border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide hover:border-violet"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        {loadedAt ? (
          <span className="font-mono text-xs text-muted">
            Updated {loadedAt.toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red" role="alert">
          {error}
        </p>
      ) : null}

      {rows === null && !error ? (
        <p className="mt-6 text-sm text-muted" role="status">
          Loading learners…
        </p>
      ) : null}

      {rows !== null ? (
        visible.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No learners match.</p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Learner progress</caption>
              <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Learner
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Progress
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Final assessment
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Last active
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <LearnerRow
                    key={row.email}
                    row={row}
                    open={expanded === row.email}
                    onToggle={() => setExpanded((cur) => (cur === row.email ? null : row.email))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      <p className="mt-8 text-sm text-muted">
        Need a file?{' '}
        <a href={ADMIN_LEARNERS_CSV_URL} download className="text-violet underline">
          Export learner progress
        </a>{' '}
        ·{' '}
        <a href={ADMIN_CSV_URL} download className="text-violet underline">
          Export certificates
        </a>
        . Exports contain names and emails; store them securely.
      </p>
    </>
  )
}

interface LearnerRowProps {
  row: AdminLearnerRow
  open: boolean
  onToggle: () => void
}

function LearnerRow({ row, open, onToggle }: LearnerRowProps) {
  const detailsId = `learner-${row.email.replace(/[^a-z0-9]/gi, '-')}`
  const ratio = row.modulesPassed / MODULE_COUNT
  return (
    <Fragment>
      <tr className="border-b border-line align-top last:border-0">
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={detailsId}
            className="text-left hover:text-violet"
          >
            <span className="block font-semibold">
              <span aria-hidden="true">{open ? '▾ ' : '▸ '}</span>
              {row.name || <span className="italic text-muted">No name yet</span>}
            </span>
            <span className="block text-xs text-muted">{row.email}</span>
          </button>
        </td>
        <td className="px-4 py-3">
          <div
            className="h-2 w-32 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`${row.email} modules passed`}
            aria-valuemin={0}
            aria-valuemax={MODULE_COUNT}
            aria-valuenow={row.modulesPassed}
          >
            <div className="h-full bg-teal" style={{ width: `${ratio * 100}%` }} />
          </div>
          <span className="mt-1 block text-xs text-muted">
            {row.modulesPassed} of {MODULE_COUNT} modules
            {row.currentModule !== null ? ` · on Module ${row.currentModule}` : ''}
          </span>
        </td>
        <td className="px-4 py-3 text-xs">{finalSummary(row)}</td>
        <td className="px-4 py-3 text-xs" title={formatDateTime(row.lastActivity)}>
          {formatDate(row.lastActivity)}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block whitespace-nowrap rounded-pill border px-2.5 py-0.5 font-mono text-[11px] ${STATUS_STYLES[row.status]}`}
          >
            {STATUS_LABELS[row.status]}
          </span>
        </td>
      </tr>
      {open ? (
        <tr id={detailsId} className="border-b border-line bg-paper">
          <td colSpan={5} className="px-4 py-4">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {row.modules.map((m) => (
                <li
                  key={m.id}
                  className={`rounded-inner border px-3 py-2 text-xs ${
                    m.passed ? 'border-teal bg-teal-soft/40' : 'border-line bg-card'
                  }`}
                >
                  <span className="block font-semibold">Module {m.id}</span>
                  <span className="block text-muted">
                    {m.attempts === 0
                      ? 'Not attempted'
                      : `${m.passed ? 'Passed' : 'Best'} ${m.bestPercent}% · ${m.attempts} attempt${m.attempts === 1 ? '' : 's'}`}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Started {formatDate(row.startedAt)}
              {row.certificate
                ? ` · Certificate ${row.certificate.id}, issued ${formatDate(row.certificate.issuedAt)}, expires ${formatDate(row.certificate.expiresAt)}`
                : ''}
            </p>
          </td>
        </tr>
      ) : null}
    </Fragment>
  )
}

function AdminsSection({ currentEmail }: { currentEmail: string }) {
  const [list, setList] = useState<AdminList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAdmins()
      .then((result) => {
        if (!cancelled) setList(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof SignInRequiredError) return redirectToSignIn()
        setError(err instanceof Error ? err.message : 'Could not load admins.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function run(action: () => Promise<AdminList>, success: string) {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      setList(await action())
      setNotice(success)
      return true
    } catch (err) {
      if (err instanceof SignInRequiredError) redirectToSignIn()
      else setError(err instanceof Error ? err.message : 'Something went wrong.')
      return false
    } finally {
      setBusy(false)
      setConfirming(null)
    }
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    const target = email.trim().toLowerCase()
    if (!target) return
    if (await run(() => addAdmin(target), `${target} is now an admin.`)) setEmail('')
  }

  return (
    <section aria-labelledby="admins-heading" className="mt-12 border-t border-line pt-8">
      <h2 id="admins-heading" className="font-display text-2xl font-bold">
        Admins
      </h2>
      <p className="mt-2 text-muted">
        Admins can see every learner's progress and download the exports above. Nothing else. A new
        admin sees the Admin link the next time they open the course.
      </p>

      <form onSubmit={onAdd} className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex-1">
          <span className="sr-only">Work email of the new admin</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full rounded-pill border border-line bg-card px-4 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-violet px-5 py-2 font-mono text-xs uppercase tracking-wide text-white disabled:opacity-60"
        >
          Add admin
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-sm text-teal" role="status">
          {notice}
        </p>
      ) : null}

      {list === null && !error ? (
        <p className="mt-4 text-sm text-muted" role="status">
          Loading admins…
        </p>
      ) : null}

      {list ? (
        <>
          <ul className="mt-5 divide-y divide-line rounded-card border border-line bg-card">
            {list.admins.map((a) => (
              <li key={a.email} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="flex-1">
                  <span className="block font-semibold">
                    {a.email}
                    {a.email === currentEmail ? (
                      <span className="font-normal text-muted"> (you)</span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted">
                    {a.permanent
                      ? 'Permanent admin (set in the app configuration)'
                      : `Added by ${a.addedBy} on ${a.addedAt ? formatDate(a.addedAt) : 'unknown date'}`}
                  </span>
                </span>
                {!a.permanent && a.email !== currentEmail ? (
                  confirming === a.email ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(() => removeAdmin(a.email), `${a.email} is no longer an admin.`)
                        }
                        className="rounded-pill border border-red px-3 py-1 font-mono text-[11px] uppercase text-red"
                      >
                        Confirm remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="rounded-pill border border-line px-3 py-1 font-mono text-[11px] uppercase"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(a.email)}
                      aria-label={`Remove ${a.email}`}
                      className="rounded-pill border border-line px-3 py-1 font-mono text-[11px] uppercase hover:border-red hover:text-red"
                    >
                      Remove
                    </button>
                  )
                ) : null}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-display text-lg font-bold">Recent changes</h3>
          {list.audit.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No changes yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {list.audit.map((c) => (
                <li key={`${c.at}-${c.target}-${c.action}`}>
                  {formatDateTime(c.at)}: {c.actor} {c.action} {c.target}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}
