import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { createDefaultState, loadState, saveState } from '../lib/storage'

function renderCheatSheet() {
  return render(
    <MemoryRouter initialEntries={['/cheatsheet']}>
      <App />
    </MemoryRouter>,
  )
}

describe('CheatSheetPage checklists', () => {
  it('uses real checkboxes whose ticks survive a reload', async () => {
    const user = userEvent.setup()
    saveState(createDefaultState())
    const first = renderCheatSheet()
    const boxes = await screen.findAllByRole('checkbox')
    expect(boxes.length).toBeGreaterThan(0)
    const box = boxes[0]!
    expect(box).toHaveAccessibleName()
    await user.click(box)
    expect(box).toBeChecked()
    expect(Object.values(loadState().cheatSheet ?? {})).toEqual([true])
    first.unmount()

    renderCheatSheet()
    expect((await screen.findAllByRole('checkbox'))[0]).toBeChecked()
  })

  it('lists the monitoring steps, not publishing steps, under the weekly review', async () => {
    saveState(createDefaultState())
    renderCheatSheet()
    const heading = await screen.findByRole('heading', { name: 'Weekly review ritual' })
    const box = heading.closest('section')!
    expect(box).toHaveTextContent(/Monitor page/)
    expect(box).not.toHaveTextContent(/Published my practice agent/)
  })
})

describe('module menu', () => {
  it('opens the module whose number and title it shows', async () => {
    const user = userEvent.setup()
    saveState(createDefaultState())
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const [nav] = await screen.findAllByRole('navigation', { name: 'Course modules' })
    if (!nav) throw new Error('module menu not found')
    await user.click(within(nav).getByRole('link', { name: /Monitor & improve/ }))
    expect(
      await screen.findByRole('heading', { level: 1, name: /Monitor & improve/ }),
    ).toBeVisible()
    expect(within(nav).getByRole('link', { name: /Monitor & improve/ })).toHaveTextContent('10')
  })
})
