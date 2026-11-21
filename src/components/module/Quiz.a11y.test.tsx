import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { quizzesByModule } from '../../content/quizzes'
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

describe('Quiz accessibility', () => {
  it('has no serious axe issues and names every option, before and after a retake', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Quiz questions={quizzesByModule[1]!} locked={false} bestScore={0} onResult={() => {}} />,
    )

    expect(await seriousViolations(container)).toEqual([])
    radioNamesAreAnswerText()
    expect(screen.getByText('Answer all questions to submit.')).toBeInTheDocument()

    await answerEverything(user)
    await user.click(screen.getByRole('button', { name: 'Submit answers' }))
    expect(screen.getByRole('status')).toHaveTextContent(/You scored \d of 5/)
    expect(await seriousViolations(container)).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Retake quiz' }))
    expect(screen.getByRole('heading', { name: 'Knowledge check' })).toHaveFocus()
    expect(await seriousViolations(container)).toEqual([])
    radioNamesAreAnswerText()
  })

  it('announces the new position when an ordering step moves', async () => {
    const user = userEvent.setup()
    const moduleWithOrder = Object.entries(quizzesByModule).find(([, qs]) =>
      qs.some((q) => q.type === 'order'),
    )!
    render(<Quiz questions={moduleWithOrder[1]} locked={false} bestScore={0} onResult={() => {}} />)
    const down = screen.getAllByRole('button', { name: /down$/ })[0]!
    await user.click(down)
    expect(document.body.textContent).toMatch(/Moved ".+" to position 2 of \d+\./)
  })

  it('does not submit until every question is answered', async () => {
    const user = userEvent.setup()
    let submitted = false
    render(
      <Quiz
        questions={quizzesByModule[1]!}
        locked={false}
        bestScore={0}
        onResult={() => {
          submitted = true
        }}
      />,
    )
    const submit = screen.getByRole('button', { name: 'Submit answers' })
    expect(submit).toHaveAttribute('aria-disabled', 'true')
    await user.click(submit)
    expect(submitted).toBe(false)
  })
})
