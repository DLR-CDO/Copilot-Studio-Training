import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mockApi(handler: (url: string) => Response) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => handler(String(input)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('VerifyPage', () => {
  it('shows name, course, completion date, and status without signing in', async () => {
    const fetchMock = mockApi(() =>
      jsonResponse(200, {
        id: 'DR-CSA-7K2M-Q9XD-4HTB',
        name: 'Alice Learner',
        course: 'Copilot Studio Advanced',
        completedAt: '2026-11-17T15:00:00.000Z',
        status: 'valid',
        email: 'alice@example.com',
        scorePercent: 96,
      }),
    )
    renderAt('/verify?id=DR-CSA-7K2M-Q9XD-4HTB')

    expect(await screen.findByText('Alice Learner')).toBeInTheDocument()
    expect(screen.getByText('Copilot Studio Advanced')).toBeInTheDocument()
    expect(screen.getByText('November 17, 2026')).toBeInTheDocument()
    expect(screen.getByText('Valid')).toBeInTheDocument()
    // Even if the API sent more, the page shows nothing else about the learner.
    expect(document.body.textContent).not.toContain('alice@example.com')
    expect(document.body.textContent).not.toContain('96')
    // The public page never asks who is signed in.
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/verify?id=DR-CSA-7K2M-Q9XD-4HTB',
    ])
  })

  it('shows expired certificates as expired', async () => {
    mockApi(() =>
      jsonResponse(200, {
        name: 'Alice Learner',
        course: 'Copilot Studio Advanced',
        completedAt: '2025-01-02T00:00:00.000Z',
        status: 'expired',
      }),
    )
    renderAt('/verify?id=DR-CSA-7K2M-Q9XD-4HTB')
    expect(await screen.findByText('Expired')).toBeInTheDocument()
  })

  it('looks up an ID typed into the form and reports unknown IDs', async () => {
    const user = userEvent.setup()
    mockApi(() => jsonResponse(404, { error: 'No certificate was found with that ID.' }))
    renderAt('/verify')

    await user.type(screen.getByLabelText('Certificate ID'), 'DR-CSA-0000-0000-0000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No certificate was found')
  })
})
