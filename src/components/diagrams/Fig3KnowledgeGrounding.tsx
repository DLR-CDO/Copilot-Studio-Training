import { useEffect, useId, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/** 0 = idle, 1 = at sources, 2 = merged at the agent, 3 = at the answer, 4 = finished. */
type Step = 0 | 1 | 2 | 3 | 4

interface Point {
  x: number
  y: number
}

const SOURCES = [
  { label: 'SharePoint', y: 20 },
  { label: 'Files you upload', y: 84 },
  { label: 'Public websites', y: 148 },
]

/** Each ball starts at the right edge of its own source box. */
const BALL_START: Point[] = SOURCES.map((s) => ({ x: 180, y: s.y + 21 }))
const AGENT_POINT: Point = { x: 262, y: 105 }
const ANSWER_POINT: Point = { x: 450, y: 105 }

const CAPTIONS: Record<Exclude<Step, 0>, string> = {
  1: 'Searches the connected sources.',
  2: 'Brings what it found together and composes an answer.',
  3: 'Cites the source in the final answer.',
  4: 'Done: one grounded answer with a citation. Press Replay to watch again.',
}

const STEP_MS = 2400
const TRAVEL_MS = 1800

/** Static diagram extracted from copilot-studio-training-guide.html (fig 3). */
export function Fig3KnowledgeGrounding() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [step, setStep] = useState<Step>(0)
  const titleId = useId()

  const playing = step >= 1 && step <= 3

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(
      () => setStep((s) => (s + 1) as Step),
      prefersReducedMotion ? 80 : STEP_MS,
    )
    return () => clearTimeout(timer)
  }, [step, playing, prefersReducedMotion])

  const ballPosition = (index: number): Point => {
    if (step === 1) return BALL_START[index]!
    if (step === 2) return AGENT_POINT
    return ANSWER_POINT
  }

  // Three balls travel separately, merge at the agent, and only one continues to the answer.
  const visibleBalls = step === 1 || step === 2 ? [0, 1, 2] : step === 3 ? [0] : []
  const sourcesLit = step === 1
  const agentLit = step === 2
  const answerLit = step === 3

  return (
    <figure className="rounded-block border-[1.5px] border-line bg-paper p-[22px] text-center">
      <div className="mx-auto max-w-full overflow-x-auto">
        <svg viewBox="0 0 640 210" role="img" aria-labelledby={titleId}>
          <title id={titleId}>
            Diagram: knowledge sources feed the agent, which gives a cited answer
          </title>
          {SOURCES.map((source) => (
            <g key={source.label}>
              <rect
                x="30"
                y={source.y}
                width="150"
                height="42"
                rx="10"
                fill={sourcesLit ? '#E3F3F2' : '#fff'}
                stroke="#0E8C86"
                strokeWidth={sourcesLit ? 3 : 2}
                style={{ transition: 'fill 300ms ease, stroke-width 300ms ease' }}
              />
              <text x="105" y={source.y + 26} textAnchor="middle" className="st">
                {source.label}
              </text>
            </g>
          ))}
          <rect
            x="260"
            y="76"
            width="130"
            height="58"
            rx="12"
            fill="#6B5BD2"
            stroke={agentLit ? '#1E2447' : 'none'}
            strokeWidth={agentLit ? 3 : 0}
            style={{ transition: 'stroke-width 300ms ease' }}
          />
          <text x="325" y="110" textAnchor="middle" className="stw">
            Agent
          </text>
          <rect
            x="450"
            y="66"
            width="160"
            height="78"
            rx="12"
            fill="#fff"
            stroke={answerLit ? '#6B5BD2' : '#1E2447'}
            strokeWidth={answerLit ? 3 : 2}
            style={{ transition: 'stroke 300ms ease, stroke-width 300ms ease' }}
          />
          <text x="530" y="92" textAnchor="middle" className="st" fontWeight="600">
            Answer
          </text>
          <text x="530" y="112" textAnchor="middle" className="stm">
            grounded in sources,
          </text>
          <text x="530" y="127" textAnchor="middle" className="stm">
            with a citation [1]
          </text>
          <path d="M180 41 C 225 41 225 95 260 98" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path d="M180 105 L260 105" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path
            d="M180 169 C 225 169 225 115 260 112"
            fill="none"
            stroke="#1E2447"
            strokeWidth="2"
          />
          <path d="M390 105 L442 105" stroke="#1E2447" strokeWidth="2" />
          <path d="M436 99 L446 105 L436 111" fill="none" stroke="#1E2447" strokeWidth="2" />

          {visibleBalls.map((index) => {
            const p = ballPosition(index)
            return (
              <g
                key={index}
                data-testid="fig3-ball"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  transition: prefersReducedMotion
                    ? undefined
                    : `transform ${TRAVEL_MS}ms ease-in-out`,
                }}
              >
                <circle r="9" fill="#F2B33D" fillOpacity="0.55" stroke="#1E2447" strokeWidth="1" />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mx-auto mt-3 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={playing}
          className={`rounded-pill px-5 py-2 font-display text-sm font-semibold ${
            playing
              ? 'cursor-not-allowed bg-line text-muted'
              : 'bg-violet text-white hover:opacity-90'
          }`}
        >
          {playing ? 'Playing…' : step === 4 ? 'Replay' : 'Play'}
        </button>
        <div className="min-h-[1.5rem] text-sm text-ink" role="status" aria-live="polite">
          {step === 0 ? 'Press Play to watch a question get answered.' : CAPTIONS[step]}
        </div>
      </div>

      <figcaption className="mt-2.5 font-mono text-xs text-muted">
        fig 3 · ground the agent in trusted sources
      </figcaption>
    </figure>
  )
}
