import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Fig4TopicFlow } from './Fig4TopicFlow'

describe('Fig4TopicFlow', () => {
  it('lights up the Outlook answer when the user picks Outlook', async () => {
    const user = userEvent.setup()
    render(<Fig4TopicFlow />)

    await user.click(screen.getByRole('button', { name: /user picks: outlook/i }))

    expect(screen.getByText(/sends the Outlook answer/i)).toBeInTheDocument()
  })

  it('lights up the escalate path for anything else', async () => {
    const user = userEvent.setup()
    render(<Fig4TopicFlow />)

    await user.click(screen.getByRole('button', { name: /user picks: teams/i }))

    expect(screen.getByText(/hands it to a person/i)).toBeInTheDocument()
  })
})
