import { render, screen } from '@testing-library/react'
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
})
