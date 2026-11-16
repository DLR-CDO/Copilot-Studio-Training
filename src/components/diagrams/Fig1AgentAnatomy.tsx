import { useId, useState } from 'react'
import { onActivateKeyDown } from './internal/a11y'
import { WrapText } from './internal/WrapText'

type PartId =
  | 'description'
  | 'model'
  | 'instructions'
  | 'knowledge'
  | 'tools'
  | 'triggers'
  | 'agents'
  | 'topics'
  | 'suggested-prompts'
  | 'channels'

interface PartDef {
  id: PartId
  title: string
  subtitle: string
  definition: string
}

const LEFT_PARTS: PartDef[] = [
  {
    id: 'description',
    title: 'Description',
    subtitle: 'what it is for',
    definition:
      'The description says what the agent does, so people and other agents know when to use it.',
  },
  {
    id: 'model',
    title: 'Model',
    subtitle: 'its AI brain',
    definition:
      'The model is the AI that reasons and writes the answers. Leave the default to start.',
  },
  {
    id: 'instructions',
    title: 'Instructions',
    subtitle: 'how it behaves',
    definition: 'Instructions are how it behaves.',
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    subtitle: 'what it knows',
    definition: 'Knowledge is what it knows.',
  },
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'what it can do',
    definition: 'Tools are what it can do, like sending an email or posting in Teams.',
  },
]

const RIGHT_PARTS: PartDef[] = [
  {
    id: 'triggers',
    title: 'Triggers',
    subtitle: 'what starts it',
    definition:
      'Triggers start the agent automatically when something happens, like an urgent question arriving by email.',
  },
  {
    id: 'agents',
    title: 'Agents',
    subtitle: 'child agents',
    definition:
      'Other agents (child agents) live inside your agent and handle specific steps of a workflow.',
  },
  {
    id: 'topics',
    title: 'Topics',
    subtitle: 'scripted paths',
    definition: 'Topics are scripted conversation paths. Every agent needs a greeting topic.',
  },
  {
    id: 'suggested-prompts',
    title: 'Suggested prompts',
    subtitle: 'starter questions',
    definition: 'Suggested prompts are starter questions shown to users, each with a short title.',
  },
  {
    id: 'channels',
    title: 'Channels',
    subtitle: 'where people use it',
    definition: 'Channels are where people use it.',
  },
]

const BOX_WIDTH = 165
const BOX_HEIGHT = 44
const ROW_GAP = 54
const TOP = 12
const LEFT_X = 20
const RIGHT_X = 640 - 20 - BOX_WIDTH
const AGENT = { x: 255, y: 107, width: 130, height: 70 }
const AGENT_CY = AGENT.y + AGENT.height / 2

interface PlacedPart extends PartDef {
  box: { x: number; y: number }
  connector: string
}

function place(parts: PartDef[], side: 'left' | 'right'): PlacedPart[] {
  return parts.map((part, row) => {
    const y = TOP + row * ROW_GAP
    const cy = y + BOX_HEIGHT / 2
    const x = side === 'left' ? LEFT_X : RIGHT_X
    const edge = side === 'left' ? LEFT_X + BOX_WIDTH : RIGHT_X
    const agentEdge = side === 'left' ? AGENT.x : AGENT.x + AGENT.width
    const mid = (edge + agentEdge) / 2
    return {
      ...part,
      box: { x, y },
      connector: `M${edge} ${cy} C ${mid} ${cy} ${mid} ${AGENT_CY} ${agentEdge} ${AGENT_CY}`,
    }
  })
}

const PARTS: PlacedPart[] = [...place(LEFT_PARTS, 'left'), ...place(RIGHT_PARTS, 'right')]
const VIEW_HEIGHT = TOP * 2 + ROW_GAP * 4 + BOX_HEIGHT

/** Static diagram extracted from copilot-studio-training-guide.html (fig 1). */
export function Fig1AgentAnatomy() {
  const [activePart, setActivePart] = useState<PartId | null>(null)
  const titleId = useId()

  const active = PARTS.find((p) => p.id === activePart) ?? null

  return (
    <figure className="rounded-block border-[1.5px] border-line bg-paper p-[22px] text-center">
      <div className="mx-auto max-w-full overflow-x-auto">
        <svg
          viewBox={`0 0 640 ${VIEW_HEIGHT}`}
          role="img"
          aria-labelledby={titleId}
          onMouseLeave={() => setActivePart(null)}
        >
          <title id={titleId}>
            Diagram: an agent is made of a description, model, instructions, knowledge, tools,
            triggers, other agents, topics, suggested prompts, and channels
          </title>

          {PARTS.map((part) => (
            <path
              key={`${part.id}-connector`}
              d={part.connector}
              fill="none"
              stroke={activePart === part.id ? '#6B5BD2' : '#1E2447'}
              strokeWidth={activePart === part.id ? 3 : 1.5}
              className={activePart === part.id ? 'diagram-pulse' : undefined}
              style={{ transition: 'stroke 200ms ease, stroke-width 200ms ease' }}
            />
          ))}

          <rect
            x={AGENT.x}
            y={AGENT.y}
            width={AGENT.width}
            height={AGENT.height}
            rx="14"
            fill="#6B5BD2"
            opacity={activePart ? 1 : 0.92}
            style={{ transition: 'opacity 200ms ease' }}
          />
          <text x="320" y={AGENT.y + 30} textAnchor="middle" className="stw">
            Your agent
          </text>
          <text
            x="320"
            y={AGENT.y + 49}
            textAnchor="middle"
            fontFamily="Consolas"
            fontSize="11"
            fill="#EEEBFA"
          >
            answers + acts
          </text>

          {PARTS.map((part) => {
            const isActive = activePart === part.id
            const cx = part.box.x + BOX_WIDTH / 2
            return (
              <g
                key={part.id}
                className="diagram-hotspot"
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${part.title}: ${part.definition}`}
                onMouseEnter={() => setActivePart(part.id)}
                onMouseLeave={() => setActivePart(null)}
                onFocus={() => setActivePart(part.id)}
                onBlur={() => setActivePart(null)}
                onClick={() => setActivePart(part.id)}
                onKeyDown={onActivateKeyDown(() => setActivePart(part.id))}
              >
                <rect
                  x={part.box.x}
                  y={part.box.y}
                  width={BOX_WIDTH}
                  height={BOX_HEIGHT}
                  rx="10"
                  fill={isActive ? '#EEEBFA' : '#fff'}
                  stroke="#0E8C86"
                  strokeWidth={isActive ? 3 : 2}
                  style={{ transition: 'fill 200ms ease, stroke-width 200ms ease' }}
                />
                <WrapText x={cx} y={part.box.y + 19} width={BOX_WIDTH}>
                  {part.title}
                </WrapText>
                <WrapText x={cx} y={part.box.y + 35} width={BOX_WIDTH} className="stm">
                  {part.subtitle}
                </WrapText>
              </g>
            )
          })}
        </svg>
      </div>

      <div
        className="mx-auto mt-3 min-h-[2.25rem] max-w-md rounded-inner border border-line bg-card px-3 py-2 text-sm"
        role="status"
        aria-live="polite"
      >
        {active ? (
          <span>
            <strong className="text-violet">{active.title}:</strong> {active.definition}
          </span>
        ) : (
          <span className="text-muted">Hover, tap, or focus a part to see what it means.</span>
        )}
      </div>

      <figcaption className="mt-2.5 font-mono text-xs text-muted">
        fig 1 · the parts of every agent
      </figcaption>
    </figure>
  )
}
