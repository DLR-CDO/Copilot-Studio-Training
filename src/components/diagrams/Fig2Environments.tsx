import { useId, useState } from 'react'
import { Callout } from '../ui/Callout'
import { useCycle } from '../../hooks/useCycle'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { onActivateKeyDown } from './internal/a11y'
import { WrapText } from './internal/WrapText'

type EnvId = 'dev' | 'test' | 'prod'

interface EnvDef {
  id: EnvId
  label: string
  subtitle: string
  box: { x: number; y: number; width: number; height: number }
  happens: string
  never: string
}

const ENVS: EnvDef[] = [
  {
    id: 'dev',
    label: 'Dev',
    subtitle: 'you build here',
    box: { x: 30, y: 55, width: 160, height: 66 },
    happens: 'You build and experiment here, freely and often.',
    never: 'Never treat Dev as production truth — it can break at any time.',
  },
  {
    id: 'test',
    label: 'Test',
    subtitle: 'others verify here',
    box: { x: 240, y: 55, width: 160, height: 66 },
    happens: 'Other people verify your work before it goes further.',
    never: 'Never skip verification before Production.',
  },
  {
    id: 'prod',
    label: 'Production',
    subtitle: 'real users, never build here',
    box: { x: 450, y: 55, width: 160, height: 66 },
    happens: 'Real users rely on this every day.',
    never: 'Never build or experiment directly in Production.',
  },
]

const CYCLE_MS = 1800

/** Static diagram extracted from copilot-studio-training-guide.html (fig 2). */
export function Fig2Environments() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [selected, setSelected] = useState<EnvId | null>(null)
  const titleId = useId()

  const animating = !prefersReducedMotion && selected === null
  const cycleIndex = useCycle(ENVS.length, CYCLE_MS, animating)
  const highlighted = selected ?? (animating ? ENVS[cycleIndex]!.id : null)

  const active = ENVS.find((e) => e.id === selected) ?? null

  return (
    <figure className="rounded-block border-[1.5px] border-line bg-paper p-[22px] text-center">
      <div className="mx-auto max-w-full overflow-x-auto">
        <svg viewBox="0 0 640 170" role="img" aria-labelledby={titleId}>
          <title id={titleId}>Diagram: build in Dev, verify in Test, ship to Production</title>

          {ENVS.map((env) => {
            const isLit = highlighted === env.id
            const isSelected = selected === env.id
            const cx = env.box.x + env.box.width / 2
            return (
              <g key={env.id}>
                {isLit ? (
                  <rect
                    x={env.box.x - 6}
                    y={env.box.y - 6}
                    width={env.box.width + 12}
                    height={env.box.height + 12}
                    rx="16"
                    fill="none"
                    stroke="#0E8C86"
                    strokeWidth="3"
                    className="diagram-glow"
                  />
                ) : null}
                <g
                  className="diagram-hotspot"
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${env.label}: ${env.happens} ${env.never}`}
                  onClick={() => setSelected(env.id)}
                  onKeyDown={onActivateKeyDown(() => setSelected(env.id))}
                >
                  <rect
                    x={env.box.x}
                    y={env.box.y}
                    width={env.box.width}
                    height={env.box.height}
                    rx="12"
                    fill={isLit ? '#0E8C86' : '#fff'}
                    stroke={isLit ? '#0E8C86' : '#1E2447'}
                    strokeWidth={isLit ? 3 : 2}
                    style={{ transition: 'fill 300ms ease, stroke 300ms ease' }}
                  />
                  <WrapText
                    x={cx}
                    y={env.box.y + 26}
                    width={env.box.width}
                    className={isLit ? 'stw' : 'st'}
                    fontWeight={600}
                  >
                    {env.label}
                  </WrapText>
                  <WrapText
                    x={cx}
                    y={env.box.y + 48}
                    width={env.box.width}
                    className="stm"
                    fill={isLit ? '#E3F3F2' : undefined}
                  >
                    {env.subtitle}
                  </WrapText>
                </g>
              </g>
            )
          })}

          <path d="M190 88 L232 88" stroke="#1E2447" strokeWidth="2" fill="none" />
          <path d="M226 82 L236 88 L226 94" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path d="M400 88 L442 88" stroke="#1E2447" strokeWidth="2" fill="none" />
          <path d="M436 82 L446 88 L436 94" fill="none" stroke="#1E2447" strokeWidth="2" />
          <text x="110" y="35" textAnchor="middle" className="stm">
            ← start every project here
          </text>
        </svg>
      </div>

      <div className="mx-auto mt-3 max-w-lg text-left">
        {active ? (
          <div className="space-y-2">
            <Callout variant="why" title={`${active.label} · what happens here`}>
              <p>{active.happens}</p>
            </Callout>
            <Callout variant="watch" title="What you must never do here">
              <p>{active.never}</p>
            </Callout>
            {!prefersReducedMotion ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-pill border border-line bg-card px-4 py-1.5 font-mono text-xs uppercase tracking-wide hover:border-violet"
                >
                  Resume animation
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-sm text-muted">
            Click or focus Dev, Test, or Production to see what happens there — and what to never do
            there.
          </p>
        )}
      </div>

      <figcaption className="mt-2.5 font-mono text-xs text-muted">
        fig 2 · work flows one direction: Dev → Test → Production
      </figcaption>
    </figure>
  )
}
