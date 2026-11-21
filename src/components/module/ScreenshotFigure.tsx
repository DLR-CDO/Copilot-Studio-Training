import { useEffect, useId, useRef, useState } from 'react'
import type { Screenshot } from '../../content/types'

/** Captures are about 1024px wide, so the full-size view enlarges them to keep small text legible. */
const ZOOM = 1.75

function screenshotUrl(src: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}${src}`
}

export function ScreenshotFigure({ shot }: { shot: Screenshot }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const opener = openerRef.current
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [open])

  return (
    <figure className="overflow-hidden rounded-block border border-line bg-card">
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-zoom-in"
        aria-haspopup="dialog"
      >
        <img
          src={screenshotUrl(shot.src)}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          className="block h-auto w-full"
          loading="lazy"
        />
        <span className="absolute right-2 top-2 rounded-pill bg-ink/80 px-2.5 py-1 font-mono text-[11px] text-white opacity-90 group-hover:opacity-100 print:hidden">
          View full size
        </span>
      </button>
      <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[12.5px] text-muted">
        {shot.caption}
      </figcaption>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col bg-ink/90 p-3 sm:p-6 print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3 text-white">
            <p id={titleId} className="font-mono text-xs sm:text-sm">
              {shot.caption}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-pill border border-white/60 px-3 py-1 font-mono text-xs uppercase tracking-wide hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <img
              src={screenshotUrl(shot.src)}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              style={{ width: `${Math.round(shot.width * ZOOM)}px` }}
              className="mx-auto block h-auto max-w-none"
            />
          </div>
        </div>
      ) : null}
    </figure>
  )
}
