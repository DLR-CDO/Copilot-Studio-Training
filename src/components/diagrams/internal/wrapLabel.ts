const PADDING = 14
const MAX_LINES = 2
const MIN_SCALE = 0.7

/**
 * Greedy word wrap into at most two lines using an approximate character width.
 * Returns the lines and a font scale (< 1 only when two lines still are not enough).
 */
export function wrapLabel(
  text: string,
  width: number,
  fontSize: number,
  charWidth: number,
): { lines: string[]; scale: number } {
  const maxChars = Math.max(4, Math.floor((width - PADDING) / (fontSize * charWidth)))
  if (text.length <= maxChars) return { lines: [text], scale: 1 }

  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars || !current) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)

  const fitted = lines.length > MAX_LINES ? [lines[0]!, lines.slice(1).join(' ')] : lines
  const longest = Math.max(...fitted.map((l) => l.length))
  const scale = longest > maxChars ? Math.max(MIN_SCALE, maxChars / longest) : 1
  return { lines: fitted, scale }
}
