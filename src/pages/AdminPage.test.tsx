import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { quizzesByModule } from '../content/quizzes'
import { answersFor } from '../../server/testing'
import { installFakeServer } from '../test/fakeServer'

const ADMIN = 'learner.one@example.com'
const LEARNER = { email: 'learner.two@example.com' }

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={['/admin/completions']}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Admin learners dashboard', () => {
  it('lists learners with their progress, filters by status, and shows module detail', async () => {
    const deps = installFakeServer(quizzesByModule, { ADMIN_EMAILS: ADMIN })
    await deps.service.setName(LEARNER, 'Taylor Two')
    for (const scope of ['1', '2']) {
      const view = await deps.service.startQuiz(LEARNER, scope)
      await deps.service.submitQuiz(LEARNER, scope, view.attemptId, answersFor(view, 10))
    }
    const user = userEvent.setup()
    renderAdmin()

    const table = await screen.findByRole('table', { name: 'Learner progress' })
    expect(within(table).getByRole('button', { name: /Taylor Two/ })).toBeInTheDocument()
    expect(within(table).getByText('2 of 10 modules · on Module 3')).toBeInTheDocument()
    expect(within(table).getByText(ADMIN)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Not started/ }))
    expect(within(table).queryByRole('button', { name: /Taylor Two/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /All learners/ }))

    await user.click(within(table).getByRole('button', { name: /Taylor Two/ }))
    expect(within(table).getByRole('button', { name: /Taylor Two/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getAllByText('Passed 100% · 1 attempt')).toHaveLength(2)
    expect(screen.getAllByText('Not attempted')).toHaveLength(8)

    await user.type(screen.getByRole('searchbox', { name: 'Search by name or email' }), 'nobody')
    expect(screen.getByText('No learners match.')).toBeInTheDocument()
  })

  it('tells non-admins they cannot see learners', async () => {
    installFakeServer()
    renderAdmin()
    expect(
      await screen.findByText('Only course admins can see learner progress.'),
    ).toBeInTheDocument()
  })
})
