import { wrapLabel } from './wrapLabel'

const CLASS_FONT: Record<'st' | 'stm' | 'stw', { size: number; charWidth: number }> = {
  st: { size: 13, charWidth: 0.56 },
  stw: { size: 13, charWidth: 0.58 },
  stm: { size: 11, charWidth: 0.6 },
}

interface WrapTextProps {
  /** Horizontal center of the text. */
  x: number
  /** Baseline used when the text fits on one line; two lines are centered around it. */
  y: number
  /** Width of the box the text must fit inside. */
  width: number
  children: string
  className?: 'st' | 'stm' | 'stw'
  fontSize?: number
  fontWeight?: number | string
  fontFamily?: string
  fill?: string
  opacity?: number
}

/** SVG label that wraps onto two lines instead of overflowing its box. */
export function WrapText({
  x,
  y,
  width,
  children,
  className = 'st',
  fontSize,
  fontWeight,
  fontFamily,
  fill,
  opacity,
}: WrapTextProps) {
  const font = CLASS_FONT[className]
  const baseSize = fontSize ?? font.size
  const charWidth = fontFamily === 'Consolas' ? 0.6 : font.charWidth
  const { lines, scale } = wrapLabel(children, width, baseSize, charWidth)
  const size = baseSize * scale
  const lineHeight = size * 1.2
  const firstY = y - ((lines.length - 1) * lineHeight) / 2

  return (
    <text
      x={x}
      y={firstY}
      textAnchor="middle"
      className={className}
      fontWeight={fontWeight}
      fontFamily={fontFamily}
      fill={fill}
      opacity={opacity}
      style={{ fontSize: `${size}px` }}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  )
}
