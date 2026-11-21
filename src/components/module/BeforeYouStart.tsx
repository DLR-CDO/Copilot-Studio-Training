import { BEFORE_YOU_START } from '../../content/modules'

interface BeforeYouStartProps {
  defaultOpen?: boolean
  className?: string
}

/** Access a learner should request from IT before Module 1. */
export function BeforeYouStart({ defaultOpen = false, className = '' }: BeforeYouStartProps) {
  return (
    <details
      open={defaultOpen}
      className={`rounded-card border border-line bg-card px-5 py-4 ${className}`}
    >
      <summary className="cursor-pointer font-display text-base font-bold">
        Before you start: what to ask IT for
      </summary>
      <p className="mt-2 text-sm text-muted">
        Check these before Module 1. If one is missing, send this list to your IT or Power Platform
        admin, so you don&apos;t get stuck halfway.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {BEFORE_YOU_START.map(({ item, neededFor }) => (
          <li key={item} className="relative pl-7">
            <span
              className="absolute left-1 top-[0.4rem] size-3 rounded-full border-[2.5px] border-teal"
              aria-hidden="true"
            />
            {item} <span className="font-mono text-xs text-muted">({neededFor})</span>
          </li>
        ))}
      </ul>
      <a
        href="https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-violet underline underline-offset-2"
      >
        Copilot Studio licensing on Microsoft Learn
      </a>
    </details>
  )
}
