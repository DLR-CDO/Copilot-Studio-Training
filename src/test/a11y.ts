import { screen } from '@testing-library/react'
import axe from 'axe-core'
import { expect } from 'vitest'

export async function seriousViolations(container: HTMLElement): Promise<string[]> {
  // jsdom has no layout, so contrast can't be measured here.
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  return results.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

function visibleText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** Each control is named by its own native <label>, and never by its value ("on", "0"…). */
export function expectNamedByOwnLabel(controls: HTMLElement[]) {
  expect(controls.length).toBeGreaterThan(0)
  const ids = new Set<string>()
  for (const control of controls) {
    const input = control as HTMLInputElement
    expect(input.id, 'every control has an id').toBeTruthy()
    expect(ids.has(input.id), `id ${input.id} is unique`).toBe(false)
    ids.add(input.id)
    expect(input.labels, 'exactly one native label').toHaveLength(1)
    const text = visibleText(input.labels![0]!)
    expect(text).not.toBe('')
    expect(input).toHaveAccessibleName(text)
    expect(input).not.toHaveAccessibleName(/^(on|\d+)$/)
    expect(input.hasAttribute('aria-labelledby')).toBe(false)
  }
}

/** Every question is one group named by its visible question text, holding its answers. */
export function expectQuestionGroupsNamed(expectedCount: number) {
  const radios = screen.queryAllByRole('radio')
  if (radios.length > 0) expectNamedByOwnLabel(radios)
  const fieldsets = Array.from(document.querySelectorAll('fieldset'))
  expect(fieldsets).toHaveLength(expectedCount)
  for (const fieldset of fieldsets) {
    const legend = fieldset.querySelector('legend')!
    const question = visibleText(legend)
    expect(question).toMatch(/^\d+\. .{10,}/)
    expect(fieldset).toHaveAccessibleName(question)
    const answers = fieldset.querySelectorAll('input[type="radio"]')
    if (answers.length > 0) {
      expect(fieldset).toHaveAttribute('role', 'radiogroup')
      expect(new Set(Array.from(answers, (a) => (a as HTMLInputElement).name)).size).toBe(1)
    } else {
      expect(fieldset.querySelector('ol')).toHaveAccessibleName(question)
    }
  }
  const radioGroups = screen.queryAllByRole('radiogroup')
  expect(radioGroups.every((g) => g.tagName === 'FIELDSET')).toBe(true)
  const names = new Set(radios.map((r) => (r as HTMLInputElement).name))
  expect(names.size).toBe(radioGroups.length)
}
