import { Fragment, useId, useState } from 'react'
import type { InlineToken } from '../../content/types'
import { getGlossaryTerm } from '../../content/glossary'
import { Pill } from '../ui/Pill'

const chipClass =
  'mx-0.5 inline-block rounded-pill border border-teal/40 bg-teal-soft px-2 py-0.5 font-medium text-teal'

interface RichTextProps {
  tokens: InlineToken[]
  /** Render glossary terms as plain chips, for text inside a <label>, which must not hold buttons. */
  inLabel?: boolean
}

export function RichText({ tokens, inLabel = false }: RichTextProps) {
  return (
    <span>
      {tokens.map((token, i) => {
        if (token.type === 'text') {
          return <Fragment key={i}>{token.text}</Fragment>
        }
        if (token.type === 'ui') {
          return (
            <Pill key={i} variant="ui">
              {token.text}
            </Pill>
          )
        }
        if (inLabel) {
          return (
            <span key={i} className={chipClass}>
              {token.text}
            </span>
          )
        }
        return <KeywordChip key={i} text={token.text} termId={token.termId} />
      })}
    </span>
  )
}

function KeywordChip({ text, termId }: { text: string; termId?: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const term = termId ? getGlossaryTerm(termId) : undefined

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={`${chipClass} hover:border-teal`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        {text}
      </button>
      {open && term ? (
        <span
          id={panelId}
          role="tooltip"
          className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-inner border border-line bg-card p-3 text-left text-sm shadow-lg"
        >
          <span className="block font-display font-semibold">{term.term}</span>
          <span className="mt-1 block text-muted">{term.definition}</span>
        </span>
      ) : null}
    </span>
  )
}
