import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Fig1AgentAnatomy } from './Fig1AgentAnatomy'

describe('Fig1AgentAnatomy', () => {
  it('shows a hint before any interaction', () => {
    render(<Fig1AgentAnatomy />)
    expect(screen.getByText(/hover, tap, or focus a part/i)).toBeInTheDocument()
  })

  it('reveals the definition when a part is hovered', async () => {
    const user = userEvent.setup()
    render(<Fig1AgentAnatomy />)

    const knowledge = screen.getByRole('button', { name: /knowledge: knowledge is what it knows/i })
    await user.hover(knowledge)

    expect(screen.getByText(/knowledge is what it knows/i)).toBeInTheDocument()
  })

  it('reveals the definition when a part is focused via keyboard', async () => {
    const user = userEvent.setup()
    render(<Fig1AgentAnatomy />)

    await user.tab()
    expect(screen.getByRole('button', { name: /^description:/i })).toHaveFocus()
    expect(screen.getByText(/so people and other agents know when to use it/i)).toBeInTheDocument()

    await user.tab()
    expect(screen.getByRole('button', { name: /^model:/i })).toHaveFocus()
    expect(screen.getByText(/the model is the ai that reasons/i)).toBeInTheDocument()
  })

  it('lists every part of an agent, including triggers, topics, suggested prompts, and agents', () => {
    render(<Fig1AgentAnatomy />)
    for (const name of [
      'Description',
      'Model',
      'Instructions',
      'Knowledge',
      'Tools',
      'Triggers',
      'Agents',
      'Topics',
      'Suggested prompts',
      'Channels',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(`^${name}:`) })).toBeInTheDocument()
    }
  })
})
