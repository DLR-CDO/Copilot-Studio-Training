import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { answersFor } from '../../server/testing'
import App from '../App'
import { FINAL_ASSESSMENT_SIZE } from '../lib/assessments'
import { expectQuestionGroupsNamed, seriousViolations } from '../test/a11y'
import { installFakeServer } from '../test/fakeServer'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AssessmentPage accessibility', () => {
  it('names every answer by its text and every question group by its question', async () => {
    const deps = installFakeServer()
    const user = { email: deps.config.mockUsers[0]! }
    for (let id = 1; id <= 10; id += 1) {
      const view = await deps.service.startQuiz(user, String(id))
      await deps.service.submitQuiz(user, String(id), view.attemptId, answersFor(view, 10))
    }

    const { container } = render(
      <MemoryRouter initialEntries={['/assessment']}>
        <App />
      </MemoryRouter>,
    )
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Start the quiz' }))
    await screen.findByRole('button', { name: 'Submit answers' })

    expect(screen.getByRole('heading', { level: 2, name: 'Final assessment' })).toBeInTheDocument()
    expectQuestionGroupsNamed(FINAL_ASSESSMENT_SIZE)
    expect(await seriousViolations(container)).toEqual([])
  }, 20_000)
})
