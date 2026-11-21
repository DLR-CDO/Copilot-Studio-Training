import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HelpPage } from './HelpPage'

describe('HelpPage', () => {
  it('lists the support team and the course builder as email links', () => {
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('link', { name: 'cdo-agent-support@digitalrealty.com' }),
    ).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:cdo-agent-support@digitalrealty\.com\?/),
    )
    expect(screen.getByText('Nabih Sabeh')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'nsabeh@digitalrealty.com' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:nsabeh@digitalrealty\.com\?/),
    )
    expect(screen.getByText(/Never send passwords, keys, or confidential data/)).toBeInTheDocument()
  })
})
