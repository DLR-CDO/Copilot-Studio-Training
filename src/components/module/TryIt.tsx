import { MAX_REFLECTION_CHARS, MIN_REFLECTION_CHARS } from '../../lib/storage'
import { Callout } from '../ui/Callout'

interface TryItProps {
  text: string
  done: boolean
  reflection: string
  onToggle: (done: boolean) => void
  onReflection: (reflection: string) => void
}

export function TryIt({ text, done, reflection, onToggle, onReflection }: TryItProps) {
  const written = reflection.trim().length >= MIN_REFLECTION_CHARS
  return (
    <section id="try-it" className="scroll-mt-28">
      <Callout variant="try" title="Try it">
        <p>{text}</p>
        <label htmlFor="try-it-reflection" className="mt-3 block text-sm font-medium">
          What happened when you tried it?
        </label>
        <p id="try-it-reflection-hint" className="text-xs text-muted">
          A sentence or two, only you can see it. Don&apos;t paste confidential data.
        </p>
        <textarea
          id="try-it-reflection"
          value={reflection}
          onChange={(e) => onReflection(e.target.value)}
          maxLength={MAX_REFLECTION_CHARS}
          rows={2}
          aria-describedby="try-it-reflection-hint"
          placeholder="For example: it cited the right file for 4 of 5 questions."
          className="mt-1 w-full rounded-block border border-line bg-card px-3 py-2 text-sm outline-none focus:border-violet"
        />
        <label
          htmlFor="try-it-done"
          className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-medium has-disabled:cursor-not-allowed has-disabled:text-muted"
        >
          <input
            id="try-it-done"
            type="checkbox"
            value="I did this"
            className="size-4 accent-sun"
            checked={done}
            disabled={!done && !written}
            aria-describedby={!done && !written ? 'try-it-tick-hint' : undefined}
            onChange={(e) => onToggle(e.target.checked)}
          />
          I did this
        </label>
        {!done && !written ? (
          <p id="try-it-tick-hint" className="mt-1 text-xs text-muted">
            Write what happened first, then tick this off.
          </p>
        ) : null}
      </Callout>
    </section>
  )
}
