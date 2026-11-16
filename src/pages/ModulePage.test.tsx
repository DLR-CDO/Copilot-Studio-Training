import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { createDefaultState, saveState } from '../lib/storage'

function renderAt(path: string) {
  saveState({ ...createDefaultState(), freeRoam: true })
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('ModulePage navigation', () => {
  it('starts the next module quiz blank and scrolls to the top', async () => {
    const user = userEvent.setup()
    renderAt('/module/1')

    const quiz = document.getElementById('quiz')!
    const radios = Array.from(quiz.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
    const groups = new Set(radios.map((r) => r.name))
    for (const name of groups) {
      await user.click(radios.find((r) => r.name === name)!)
    }
    await user.click(screen.getByRole('button', { name: /submit answers/i }))
    expect(screen.queryByRole('button', { name: /submit answers/i })).not.toBeInTheDocument()

    window.scrollTo = vi.fn()
    await user.click(screen.getAllByRole('link', { name: /next module/i })[0]!)

    const nextQuiz = document.getElementById('quiz')!
    expect(nextQuiz.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0)
    expect(screen.getByRole('button', { name: /submit answers/i })).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })
})
