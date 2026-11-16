import { describe, expect, it } from 'vitest'
import { wrapLabel } from './wrapLabel'

describe('wrapLabel', () => {
  it('keeps short labels on one line at full size', () => {
    expect(wrapLabel('Dev', 160, 13, 0.56)).toEqual({ lines: ['Dev'], scale: 1 })
  })

  it('wraps long labels onto two lines', () => {
    const { lines, scale } = wrapLabel('real users, never build here', 160, 11, 0.6)
    expect(lines).toEqual(['real users, never', 'build here'])
    expect(scale).toBe(1)
  })

  it('never returns more than two lines and shrinks text that still does not fit', () => {
    const { lines, scale } = wrapLabel(
      '"Where is my expense reimbursement for last month?"',
      150,
      10.5,
      0.6,
    )
    expect(lines).toHaveLength(2)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThanOrEqual(0.7)
  })
})
