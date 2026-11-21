import { useId } from 'react'
import { Link } from 'react-router-dom'
import { MODULE_COUNT } from '../../content/types'

interface ModuleFooterNavProps {
  moduleId: number
  canComplete: boolean
  /** Plain-English to-do items shown under the button until the module can be completed. */
  missingItems: string[]
  completed: boolean
  onMarkComplete: () => void
}

export function ModuleFooterNav({
  moduleId,
  canComplete,
  missingItems,
  completed,
  onMarkComplete,
}: ModuleFooterNavProps) {
  const missingId = useId()
  const showMissing = !canComplete && !completed && missingItems.length > 0

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 print:hidden"
      aria-label="Module navigation"
    >
      {moduleId > 1 ? (
        <Link to={`/module/${moduleId - 1}`} className="text-violet hover:underline">
          ← Previous module
        </Link>
      ) : (
        <span />
      )}

      <div className="flex max-w-sm flex-col items-center gap-2">
        <button
          type="button"
          disabled={!canComplete || completed}
          aria-describedby={showMissing ? missingId : undefined}
          onClick={onMarkComplete}
          className={`rounded-pill px-5 py-2.5 font-display text-sm font-semibold ${
            completed
              ? 'bg-teal text-white'
              : canComplete
                ? 'bg-violet text-white hover:opacity-90'
                : 'cursor-not-allowed bg-line text-muted'
          }`}
        >
          {completed ? 'Module complete' : 'Mark module complete'}
        </button>
        {showMissing ? (
          <p id={missingId} className="text-center text-xs leading-relaxed text-muted">
            {missingItems.join(' · ')}
          </p>
        ) : null}
      </div>

      {moduleId < MODULE_COUNT ? (
        <Link to={`/module/${moduleId + 1}`} className="text-violet hover:underline">
          Next module →
        </Link>
      ) : (
        <Link
          to="/assessment"
          className={
            completed
              ? 'rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90'
              : 'text-violet hover:underline'
          }
        >
          Take the final assessment →
        </Link>
      )}
    </nav>
  )
}
