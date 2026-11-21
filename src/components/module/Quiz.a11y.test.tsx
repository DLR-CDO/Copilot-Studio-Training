import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { quizzesByModule } from '../../content/quizzes'
import { LearnerProvider } from '../../lib/LearnerProvider'
import { installFakeServer } from '../../test/fakeServer'
import { Quiz } from './Quiz'

async function seriousViolations(container: HTMLElement) {
  // jsdom has no layout, so contrast can't be measured here.
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  return results.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

function radioNamesAreAnswerText() {
  for (const radio of screen.getAllByRole('radio')) {
    const name = radio.getAttribute('aria-labelledby')
    const text = name ? document.getElementById(name)?.textContent?.trim() : ''
    expect(text, 'every option has its answer text as its name').toBeTruthy()
    expect(text).not.toBe('on')
  }
}

async function answerEverything(user: ReturnType<typeof userEvent.setup>) {
  const groups = new Map<string, HTMLElement>()
  for (const radio of screen.getAllByRole('radio')) {
    const name = radio.getAttribute('name')!
    if (!groups.has(name)) groups.set(name, radio)
  }
  for (const radio of groups.values()) await user.click(radio)
}

function renderQuiz() {
  return render(
    <LearnerProvider>
      <Quiz
        scope="1"
        summary="10 questions · pass mark 80%"
        locked={false}
        bestPercent={0}
        attempts={0}
      />
    </LearnerProvider>,
  )
}

async function startQuiz(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Start the quiz' }))
  await screen.findByRole('button', { name: 'Submit answers' })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Quiz accessibility', () => {
  it('has no serious axe issues and names every option, before and after a retake', async () => {
    installFakeServer()
    const user = userEvent.setup()
    const { container } = renderQuiz()
    await startQuiz(user)

    expect(await seriousViolations(container)).toEqual([])
    radioNamesAreAnswerText()
    expect(screen.getByText('Answer all questions to submit.')).toBeInTheDocument()

    await answerEverything(user)
    await user.click(screen.getByRole('button', { name: 'Submit answers' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/You scored \d of 10 \(\d+%\)/),
    )
    expect(screen.getAllByRole('link', { name: 'Source on Microsoft Learn' })).toHaveLength(10)
    expect(await seriousViolations(container)).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Retake with new questions' }))
    await screen.findByRole('button', { name: 'Submit answers' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Knowledge check' })).toHaveFocus(),
    )
    expect(await seriousViolations(container)).toEqual([])
    radioNamesAreAnswerText()
  })

  it('announces the new position when an ordering step moves', async () => {
    const bank = [...quizzesByModule[1]!]
      .filter((q) => q.type !== 'true-false')
      .sort((a, b) => Number(b.type === 'order') - Number(a.type === 'order'))
      .slice(0, 10)
    installFakeServer({ ...quizzesByModule, 1: bank })
    const user = userEvent.setup()
    renderQuiz()
    await startQuiz(user)
    const down = screen.getAllByRole('button', { name: /down$/ })[0]!
    await user.click(down)
    expect(document.body.textContent).toMatch(/Moved ".+" to position 2 of \d+\./)
  })

  it('does not submit until every question is answered', async () => {
    const deps = installFakeServer()
    const submit = vi.spyOn(deps.service, 'submitQuiz')
    const user = userEvent.setup()
    renderQuiz()
    await startQuiz(user)
    const button = screen.getByRole('button', { name: 'Submit answers' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    await user.click(button)
    expect(submit).not.toHaveBeenCalled()
  })

  it('never sends the answer key to the browser', async () => {
    const deps = installFakeServer()
    const start = vi.spyOn(deps.service, 'startQuiz')
    const user = userEvent.setup()
    renderQuiz()
    await startQuiz(user)
    const view = await start.mock.results[0]!.value
    expect(JSON.stringify(view)).not.toMatch(/correctIndex|correctOrder|"correct"|explanation/)
  })
})
