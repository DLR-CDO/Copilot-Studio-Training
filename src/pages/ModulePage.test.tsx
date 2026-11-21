import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { createDefaultState } from '../lib/storage'
import { installFakeServer } from '../test/fakeServer'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  localStorage.clear()
  const deps = installFakeServer()
  await deps.service.saveUiState(
    { email: deps.config.mockUsers[0]! },
    { ...createDefaultState(), freeRoam: true },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ModulePage navigation', () => {
  it('starts the next module quiz fresh and scrolls to the top', async () => {
    const user = userEvent.setup()
    renderAt('/module/1')
    await user.click(await screen.findByRole('button', { name: 'Start the quiz' }))
    await screen.findByRole('button', { name: /submit answers/i })

    const quiz = document.getElementById('quiz')!
    const radios = Array.from(quiz.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
    const groups = new Set(radios.map((r) => r.name))
    for (const name of groups) {
      await user.click(radios.find((r) => r.name === name)!)
    }
    await user.click(screen.getByRole('button', { name: /submit answers/i }))
    await screen.findByText(/You scored \d of 10/)
    expect(screen.queryByRole('button', { name: /submit answers/i })).not.toBeInTheDocument()

    window.scrollTo = vi.fn()
    await user.click(screen.getAllByRole('link', { name: /next module/i })[0]!)

    expect(await screen.findByRole('button', { name: 'Start the quiz' })).toBeInTheDocument()
    expect(document.getElementById('quiz')!.querySelectorAll('input[type="radio"]')).toHaveLength(0)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  }, 20_000)

  it('asks what happened before Try it can be ticked off', async () => {
    const user = userEvent.setup()
    renderAt('/module/2')
    const tick = await screen.findByRole('checkbox', { name: 'I did this' })
    expect(tick).toBeDisabled()
    expect(tick).toHaveAccessibleDescription('Write what happened first, then tick this off.')

    const box = screen.getByRole('textbox', { name: 'What happened when you tried it?' })
    expect(box).toHaveAccessibleDescription(/Don't paste confidential data/)
    await user.type(box, 'I was in Default, so I switched to Dev.')
    expect(tick).toBeEnabled()
    await user.click(tick)
    expect(tick).toBeChecked()
  })

  it('shows when the module was last reviewed and its time estimate', async () => {
    renderAt('/module/3')
    expect(
      await screen.findByText(
        /Last reviewed: .+ · Verified against Copilot Studio docs \d{4}-\d{2}/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Estimated time: 40 min')).toBeInTheDocument()
  })

  it('keeps extra detail in a collapsed Good to know box', async () => {
    renderAt('/module/9')
    const summary = await screen.findByText('Good to know')
    const details = summary.closest('details')!
    expect(details).not.toHaveAttribute('open')
    expect(details).toHaveTextContent(/not on the quiz/)
    expect(details).toHaveTextContent(/WhatsApp/)
  })

  it('lists the access to request before building, open on Module 1', async () => {
    renderAt('/module/1')
    const summary = await screen.findByText('Before you start: what to ask IT for')
    expect(summary.closest('details')).toHaveAttribute('open')
    expect(summary.closest('details')).toHaveTextContent(/trial .* cannot publish/i)
  })

  it('tells learners to check sign-in before sharing the demo website link', async () => {
    renderAt('/module/9')
    expect(
      await screen.findByText(/Check who will be able to chat with your agent/),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/Never put confidential data into a practice agent/).length,
    ).toBeGreaterThan(0)
  })

  it('shows general advice as Tips, apart from Watch out', async () => {
    renderAt('/module/1')
    const tip = await screen.findByText(/Ask early, ask often/)
    expect(tip.closest('#tips')).toHaveTextContent(/^Tips/)
    expect(screen.getByText(/Never put confidential data/).closest('#watch-out')).not.toBeNull()
  })

  it('points the last module at the final assessment', async () => {
    renderAt('/module/10')
    const cta = await screen.findByRole('link', { name: /take the final assessment/i })
    expect(cta).toHaveAttribute('href', '/assessment')
  })
})

describe('AssessmentPage', () => {
  it('stays locked until every module quiz is passed', async () => {
    renderAt('/assessment')
    expect(await screen.findByText(/pass every module quiz first/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start the quiz' })).not.toBeInTheDocument()
  })
})
