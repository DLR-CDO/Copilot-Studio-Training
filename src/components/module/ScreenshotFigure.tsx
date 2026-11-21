import type { Screenshot } from '../../content/types'

function screenshotUrl(src: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}${src}`
}

export function ScreenshotFigure({ shot }: { shot: Screenshot }) {
  return (
    <figure className="overflow-hidden rounded-block border border-line bg-card">
      <img
        src={screenshotUrl(shot.src)}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        className="block h-auto w-full"
        loading="lazy"
      />
      <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[12.5px] text-muted">
        {shot.caption}
      </figcaption>
    </figure>
  )
}
