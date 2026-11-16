import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Fig3KnowledgeGrounding } from './Fig3KnowledgeGrounding'

describe('Fig3KnowledgeGrounding', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts three balls apart, merges them into one, then removes it at the end', () => {
    render(<Fig3KnowledgeGrounding />)
    expect(screen.queryAllByTestId('fig3-ball')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    expect(screen.getAllByTestId('fig3-ball')).toHaveLength(3)

    act(() => vi.advanceTimersByTime(2400))
    expect(screen.getAllByTestId('fig3-ball')).toHaveLength(3)

    act(() => vi.advanceTimersByTime(2400))
    expect(screen.getAllByTestId('fig3-ball')).toHaveLength(1)

    act(() => vi.advanceTimersByTime(2400))
    expect(screen.queryAllByTestId('fig3-ball')).toHaveLength(0)
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })
})
