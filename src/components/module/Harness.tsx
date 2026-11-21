import type { Harness } from '../../content/types'

export const HARNESSES_URL =
  'https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview'

const HARNESS_LABELS: Record<Harness, string> = {
  standard: 'Standard harness',
  copilot: 'Microsoft Copilot harness',
  any: 'Any harness',
}

export function HarnessTag({ harness }: { harness: Harness }) {
  return (
    <span className="rounded-pill border border-teal px-3 py-1 font-mono text-xs text-teal">
      {HARNESS_LABELS[harness]}
    </span>
  )
}

export function HarnessBanner({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Which harness this course covers"
      className={`rounded-block border-l-4 border-teal bg-teal-soft px-4 py-3 text-sm ${className}`}
    >
      <strong>This course teaches agents on the standard harness.</strong> Copilot Studio also has
      the Microsoft Copilot and Customer Conversation harnesses, which look and work differently.{' '}
      <a href={HARNESSES_URL} target="_blank" rel="noreferrer" className="text-violet underline">
        Compare the harnesses on Microsoft Learn
      </a>
      .
    </aside>
  )
}
