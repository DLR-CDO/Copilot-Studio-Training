import { useEffect, useId, useState } from 'react'
import { useCycle } from '../../hooks/useCycle'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { onActivateKeyDown } from './internal/a11y'
import { WrapText } from './internal/WrapText'

type TokenPosition = 'hidden' | 'draft' | 'demo'
type BoxId = 'draft' | 'publish' | 'demo' | 'live' | 'teams'

const CYCLE_ORDER: BoxId[] = ['draft', 'publish', 'demo', 'live', 'teams']
const CYCLE_MS = 1600

const CHANNEL_X = 460
const CHANNEL_WIDTH = 150
const DEMO_BOX = { y: 10, height: 52 }
const LIVE_BOX = { y: 82, height: 52 }
const TEAMS_BOX = { y: 154, height: 60 }

const TOKEN_COORDS: Record<Exclude<TokenPosition, 'hidden'>, { x: number; y: number }> = {
  draft: { x: 110, y: 104 },
  demo: { x: 452, y: 36 },
}

const DEFAULT_MESSAGE = 'Publish to send this draft to the demo website first.'

const LIT_FILL = '#EEEBFA'
const LIT_STROKE = '#6B5BD2'

/** Static diagram extracted from copilot-studio-training-guide.html (fig 10). */
export function Fig10PublishPath() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [publishRun, setPublishRun] = useState(0)
  const [tokenAt, setTokenAt] = useState<TokenPosition>('hidden')
  const [demoUnlocked, setDemoUnlocked] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const titleId = useId()

  const cycleIndex = useCycle(CYCLE_ORDER.length, CYCLE_MS, !prefersReducedMotion)
  const lit: BoxId | null = prefersReducedMotion ? null : CYCLE_ORDER[cycleIndex]!

  useEffect(() => {
    if (publishRun === 0) return
    const arriveDelay = prefersReducedMotion ? 60 : 900
    const raf = requestAnimationFrame(() => setTokenAt('demo'))
    const arriveTimer = setTimeout(() => {
      setDemoUnlocked(true)
      setMessage('Published! The demo website now shows this snapshot — Teams is unlocked.')
    }, arriveDelay)
    const hideTimer = setTimeout(() => setTokenAt('hidden'), arriveDelay + 500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(arriveTimer)
      clearTimeout(hideTimer)
    }
  }, [publishRun, prefersReducedMotion])

  useEffect(() => {
    if (!nudge) return
    const timer = setTimeout(() => setNudge(null), 3200)
    return () => clearTimeout(timer)
  }, [nudge])

  const handlePublish = () => {
    setTokenAt('draft')
    setPublishRun((n) => n + 1)
  }

  const handleDemoClick = () => {
    setDemoUnlocked(true)
    setNudge(null)
    setMessage('Demo website visited — Teams is now unlocked.')
  }

  const handleLiveClick = () => setMessage('Live website updated with this snapshot.')

  const handleTeamsClick = () => {
    if (!demoUnlocked) {
      setNudge('Demo first! Visit or publish to the demo website before enabling Teams.')
      return
    }
    setNudge(null)
    setMessage('Now live in Teams & Microsoft 365.')
  }

  const tokenCoords = tokenAt === 'hidden' ? null : TOKEN_COORDS[tokenAt]
  const channelCx = CHANNEL_X + CHANNEL_WIDTH / 2
  const boxTransition = {
    transition: 'fill 300ms ease, stroke 300ms ease, stroke-width 300ms ease',
  }
  const teamsOpacity = demoUnlocked ? 1 : 0.5

  return (
    <figure className="rounded-block border-[1.5px] border-line bg-paper p-[22px] text-center">
      <div className="mx-auto max-w-full overflow-x-auto">
        <svg viewBox="0 0 640 224" role="img" aria-labelledby={titleId}>
          <title id={titleId}>
            Diagram: a draft agent is published to channels like the demo website, live website, and
            Teams
          </title>
          <rect
            x="40"
            y="75"
            width="140"
            height="58"
            rx="12"
            fill={lit === 'draft' ? LIT_FILL : '#fff'}
            stroke={lit === 'draft' ? LIT_STROKE : '#1E2447'}
            strokeWidth={lit === 'draft' ? 3 : 2}
            strokeDasharray="6 4"
            style={boxTransition}
          />
          <text x="110" y="99" textAnchor="middle" className="st" fontWeight="600">
            Draft agent
          </text>
          <text x="110" y="117" textAnchor="middle" className="stm">
            only you see this
          </text>

          <g
            className="diagram-hotspot"
            tabIndex={0}
            role="button"
            aria-label="Publish: send the draft snapshot to the demo website"
            onClick={handlePublish}
            onKeyDown={onActivateKeyDown(handlePublish)}
          >
            <rect
              x="250"
              y="75"
              width="130"
              height="58"
              rx="29"
              fill="#6B5BD2"
              stroke={lit === 'publish' ? '#F2B33D' : 'none'}
              strokeWidth={lit === 'publish' ? 4 : 0}
              style={boxTransition}
            />
            <text x="315" y="110" textAnchor="middle" className="stw">
              Publish
            </text>
          </g>

          <g
            className="diagram-hotspot"
            tabIndex={0}
            role="button"
            aria-label="Demo website: stakeholder review"
            onClick={handleDemoClick}
            onKeyDown={onActivateKeyDown(handleDemoClick)}
          >
            <rect
              x={CHANNEL_X}
              y={DEMO_BOX.y}
              width={CHANNEL_WIDTH}
              height={DEMO_BOX.height}
              rx="10"
              fill={lit === 'demo' ? LIT_FILL : '#fff'}
              stroke={lit === 'demo' ? LIT_STROKE : '#0E8C86'}
              strokeWidth={lit === 'demo' ? 3 : 2}
              style={boxTransition}
            />
            <WrapText x={channelCx} y={DEMO_BOX.y + 23} width={CHANNEL_WIDTH}>
              Demo website
            </WrapText>
            <WrapText x={channelCx} y={DEMO_BOX.y + 40} width={CHANNEL_WIDTH} className="stm">
              stakeholder review
            </WrapText>
          </g>

          <g
            className="diagram-hotspot"
            tabIndex={0}
            role="button"
            aria-label="Live website"
            onClick={handleLiveClick}
            onKeyDown={onActivateKeyDown(handleLiveClick)}
          >
            <rect
              x={CHANNEL_X}
              y={LIVE_BOX.y}
              width={CHANNEL_WIDTH}
              height={LIVE_BOX.height}
              rx="10"
              fill={lit === 'live' ? LIT_FILL : '#fff'}
              stroke={lit === 'live' ? LIT_STROKE : '#0E8C86'}
              strokeWidth={lit === 'live' ? 3 : 2}
              style={boxTransition}
            />
            <WrapText x={channelCx} y={LIVE_BOX.y + 31} width={CHANNEL_WIDTH}>
              Live website
            </WrapText>
          </g>

          <g
            className="diagram-hotspot"
            tabIndex={0}
            role="button"
            aria-disabled={!demoUnlocked}
            aria-label={
              demoUnlocked
                ? 'Teams & Microsoft 365: admin approval needed'
                : 'Teams & Microsoft 365, locked until the demo website has been visited'
            }
            onClick={handleTeamsClick}
            onKeyDown={onActivateKeyDown(handleTeamsClick)}
          >
            <rect
              x={CHANNEL_X}
              y={TEAMS_BOX.y}
              width={CHANNEL_WIDTH}
              height={TEAMS_BOX.height}
              rx="10"
              fill={lit === 'teams' ? LIT_FILL : '#fff'}
              stroke={lit === 'teams' ? LIT_STROKE : '#0E8C86'}
              strokeWidth={lit === 'teams' ? 3 : 2}
              opacity={lit === 'teams' ? 1 : teamsOpacity}
              style={boxTransition}
            />
            <WrapText
              x={channelCx}
              y={TEAMS_BOX.y + 25}
              width={CHANNEL_WIDTH}
              opacity={teamsOpacity}
            >
              {demoUnlocked ? 'Teams & Microsoft 365' : 'Teams & Microsoft 365 🔒'}
            </WrapText>
            <WrapText
              x={channelCx}
              y={TEAMS_BOX.y + 51}
              width={CHANNEL_WIDTH}
              className="stm"
              opacity={teamsOpacity}
            >
              admin approval needed
            </WrapText>
          </g>

          <path d="M180 104 L242 104" stroke="#1E2447" strokeWidth="2" />
          <path d="M236 98 L246 104 L236 110" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path d="M380 90 C 415 75 425 45 452 36" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path d="M380 104 L452 108" fill="none" stroke="#1E2447" strokeWidth="2" />
          <path
            d="M380 118 C 415 133 425 175 452 184"
            fill="none"
            stroke="#1E2447"
            strokeWidth="2"
          />

          {tokenCoords ? (
            <g
              className="diagram-token"
              style={{ transform: `translate(${tokenCoords.x}px, ${tokenCoords.y}px)` }}
            >
              <circle r="7" fill="#F2B33D" stroke="#1E2447" strokeWidth="1.5" />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="mx-auto mt-3 max-w-md space-y-2">
        {nudge ? (
          <div
            className="rounded-inner border border-sun bg-sun-soft px-3 py-2 text-sm font-semibold text-ink"
            role="alert"
          >
            {nudge}
          </div>
        ) : (
          <div className="min-h-[2.5rem] text-sm text-ink" role="status" aria-live="polite">
            {message}
          </div>
        )}
      </div>

      <figcaption className="mt-2.5 font-mono text-xs text-muted">
        fig 10 · demo website first, then the real channels
      </figcaption>
    </figure>
  )
}
