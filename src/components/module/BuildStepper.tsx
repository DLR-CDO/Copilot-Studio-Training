import { useId } from 'react'
import type { BuildStep, InlineToken, Screenshot } from '../../content/types'
import { RichText } from './RichText'
import { ScreenshotFigure } from './ScreenshotFigure'

function plainText(tokens: InlineToken[]): string {
  return tokens.map((token) => token.text).join('')
}

interface BuildStepperProps {
  steps: BuildStep[]
  checked: Record<string, boolean>
  onToggle: (stepId: string, value: boolean) => void
  /** The module was completed before some of these steps existed. */
  completed?: boolean
  /** Screenshots with `afterStep` set are shown right after that step. */
  screenshots?: Screenshot[]
}

export function BuildStepper({
  steps,
  checked,
  onToggle,
  completed = false,
  screenshots = [],
}: BuildStepperProps) {
  const done = steps.filter((s) => checked[s.id]).length
  const newSteps = steps.length - done
  const ratio = steps.length === 0 ? 0 : done / steps.length
  const idPrefix = useId()

  return (
    <section id="build" className="scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em]">Build it</h2>
        <p className="font-mono text-xs text-muted">
          {completed && newSteps > 0
            ? `Module complete · ${newSteps} new step${newSteps === 1 ? '' : 's'} to review`
            : `${done}/${steps.length} steps`}
        </p>
      </div>
      <div
        className="mb-4 h-2 overflow-hidden rounded-pill bg-line"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-label="Build steps progress"
      >
        <div
          className="h-full rounded-pill bg-teal transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const isChecked = checked[step.id] === true
          const hasSubsteps = (step.substeps?.length ?? 0) > 0
          const shots = screenshots.filter((shot) => shot.afterStep === step.id)
          return (
            <li key={step.id} className="space-y-3">
              <div
                data-verify={step.verify ? 'true' : undefined}
                className={`flex gap-3 rounded-block border px-3 py-3 ${
                  isChecked ? 'border-teal bg-teal-soft/50' : 'border-line bg-card'
                }`}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    id={`${idPrefix}-${step.id}`}
                    type="checkbox"
                    value={plainText(step.tokens)}
                    aria-describedby={hasSubsteps ? `${idPrefix}-${step.id}-substeps` : undefined}
                    className="mt-1 size-4 shrink-0 cursor-pointer accent-teal"
                    checked={isChecked}
                    onChange={(e) => onToggle(step.id, e.target.checked)}
                  />
                  <div className="min-w-0 text-[15px] leading-relaxed">
                    <label htmlFor={`${idPrefix}-${step.id}`} className="cursor-pointer">
                      <RichText tokens={step.tokens} inLabel />
                    </label>
                    {hasSubsteps ? (
                      <ol
                        id={`${idPrefix}-${step.id}-substeps`}
                        className="mt-2 list-[lower-alpha] space-y-1.5 pl-5"
                      >
                        {step.substeps!.map((sub, subIndex) => (
                          <li key={subIndex} data-verify={sub.verify ? 'true' : undefined}>
                            <RichText tokens={sub.tokens} />
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                </div>
              </div>
              {shots.map((shot) => (
                <ScreenshotFigure key={shot.id} shot={shot} />
              ))}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
