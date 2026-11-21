import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { modules } from '../../content/modules'
import type { InlineToken } from '../../content/types'
import { expectNamedByOwnLabel, seriousViolations } from '../../test/a11y'
import { BuildStepper } from './BuildStepper'
import { TryIt } from './TryIt'

const textOf = (tokens: InlineToken[]) => tokens.map((t) => t.text).join('')

describe('Build it checkboxes', () => {
  it.each(modules.map((m) => [m.id, m] as const))(
    'module %i names each step checkbox by its visible step text',
    async (_id, mod) => {
      const { container } = render(
        <BuildStepper steps={mod.buildSteps} checked={{}} onToggle={() => {}} />,
      )
      const boxes = screen.getAllByRole('checkbox')
      expect(boxes).toHaveLength(mod.buildSteps.length)
      expectNamedByOwnLabel(boxes)
      mod.buildSteps.forEach((step, i) => {
        expect(boxes[i]).toHaveAccessibleName(textOf(step.tokens).replace(/\s+/g, ' ').trim())
        if (step.substeps?.length) {
          expect(boxes[i]).toHaveAccessibleDescription(
            expect.stringContaining(textOf(step.substeps[0]!.tokens).trim()),
          )
        }
      })
      expect(container.querySelector('label button, label ol')).toBeNull()
      expect(await seriousViolations(container)).toEqual([])
    },
  )

  it('ticks a step when its text is clicked', async () => {
    const mod = modules.find((m) => m.buildSteps.some((s) => s.substeps?.length))!
    const onToggle = vi.fn()
    render(<BuildStepper steps={mod.buildSteps} checked={{}} onToggle={onToggle} />)
    const step = mod.buildSteps.find((s) => s.substeps?.length)!
    const box = screen.getAllByRole<HTMLInputElement>('checkbox')[mod.buildSteps.indexOf(step)]!
    await userEvent.setup().click(box.labels![0]!)
    expect(onToggle).toHaveBeenCalledWith(step.id, true)
  })
})

describe('Try it checkbox', () => {
  it('is named "I did this", before and after it can be ticked', async () => {
    const { container, rerender } = render(
      <TryIt
        text="Try it."
        done={false}
        reflection=""
        onToggle={() => {}}
        onReflection={() => {}}
      />,
    )
    expectNamedByOwnLabel([screen.getByRole('checkbox')])
    expect(screen.getByRole('checkbox')).toHaveAccessibleName('I did this')
    expect(await seriousViolations(container)).toEqual([])

    rerender(
      <TryIt
        text="Try it."
        done
        reflection="It cited the right file."
        onToggle={() => {}}
        onReflection={() => {}}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'I did this' })).toBeChecked()
  })
})
