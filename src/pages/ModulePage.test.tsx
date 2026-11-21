import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { getModuleById } from '../content/modules'
import { createDefaultState } from '../lib/storage'
import { installFakeServer } from '../test/fakeServer'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

let deps: ReturnType<typeof installFakeServer>

beforeEach(async () => {
  localStorage.clear()
  deps = installFakeServer()
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

  it('shows a step screenshot right after the step it illustrates', async () => {
    renderAt('/module/8')
    const image = await screen.findByRole('img', { name: /activity map for one test conversation/ })
    const stepItem = image.closest('#build li')!
    expect(stepItem).toHaveTextContent(/Read the activity map from top to bottom/)
    expect(document.getElementById('screenshots')).toBeNull()
  })

  it('opens a screenshot full size and closes it with Escape', async () => {
    const user = userEvent.setup()
    renderAt('/module/2')
    const opener = await screen.findByRole('button', { name: /Switch environment menu/ })
    await user.click(opener)
    const dialog = screen.getByRole('dialog', {
      name: 'Switch environment menu, opened from the environment name at the bottom left.',
    })
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
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

describe('Mark module complete', () => {
  const missingList = () => document.getElementById(markButton().getAttribute('aria-describedby')!)
  const markButton = () => screen.getByRole('button', { name: 'Mark module complete' })

  it('lists what is still needed by step number, without a hover tooltip', async () => {
    const user = userEvent.setup()
    const state = { ...createDefaultState(), freeRoam: true }
    state.modules['1']!.buildSteps = { 'm1-step-harness': true, 'm1-step-solution': true }
    await deps.service.saveUiState({ email: deps.config.mockUsers[0]! }, state)
    renderAt('/module/1')

    await screen.findByRole('button', { name: 'Mark module complete' })
    expect(markButton()).toBeDisabled()
    expect(markButton()).not.toHaveAttribute('title')
    expect(markButton()).toHaveAccessibleName('Mark module complete')
    expect(missingList()).toBeVisible()
    expect(missingList()).toHaveTextContent(
      'Tick build steps 2, 4, 5, 6 and 7 · Write what happened in Try it and tick I did this · Pass the knowledge check',
    )
    expect(markButton()).toHaveAccessibleDescription(/^Tick build steps 2, 4, 5, 6 and 7/)

    await user.type(
      screen.getByRole('textbox', { name: 'What happened when you tried it?' }),
      'I set up my environment and it worked.',
    )
    await user.click(screen.getByRole('checkbox', { name: 'I did this' }))
    expect(missingList()).toHaveTextContent(/^Tick build steps 2, 4, 5, 6 and 7 · Pass/)
  })

  it('hides the list once every requirement is met', async () => {
    const user = userEvent.setup()
    const email = deps.config.mockUsers[0]!
    const state = { ...createDefaultState(), freeRoam: true }
    const allSteps = getModuleById(7)!.buildSteps.map((s) => s.id)
    expect(allSteps[4]).toBe('m7-step-retired-models')
    state.modules['7']!.buildSteps = Object.fromEntries(
      allSteps.filter((id) => id !== 'm7-step-retired-models').map((id) => [id, true]),
    )
    state.modules['7']!.tryItDone = true
    state.modules['7']!.reflection = 'It worked as described.'
    await deps.service.saveUiState({ email }, state)
    const record = (await deps.store.getLearner(email))!
    record.value.bestPercent['7'] = 100
    await deps.store.saveLearner(record.value, record.etag)
    renderAt('/module/7')

    await screen.findByRole('button', { name: 'Mark module complete' })
    expect(missingList()).toHaveTextContent(/^Tick build step 5$/)

    const build = document.getElementById('build')!
    const checkbox = build.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[4]!
    await user.click(checkbox)
    expect(markButton()).toBeEnabled()
    expect(markButton()).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByText(/Tick build step/)).not.toBeInTheDocument()
  })
})

describe('AssessmentPage', () => {
  it('stays locked until every module quiz is passed', async () => {
    renderAt('/assessment')
    expect(await screen.findByText(/pass every module quiz first/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start the quiz' })).not.toBeInTheDocument()
  })
})
