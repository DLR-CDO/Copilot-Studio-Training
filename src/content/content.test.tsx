import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { createDefaultState, saveState } from '../lib/storage'
import { modules } from './modules'

const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob('/public/**/*.{png,jpg,jpeg,webp,gif,svg}')).map((p) =>
    p.replace(/^\/public\//, ''),
  ),
)
const AUTHOR_TEXT = /PLACEHOLDER|Capture:|Annotate:/

describe('content checks', () => {
  it.each(modules.map((m) => [m.id, m]))(
    'module %i screenshots have an image and alt text',
    (_, mod) => {
      for (const shot of mod.screenshots) {
        expect(shot.src, shot.id).toBeTruthy()
        expect(shot.alt.trim(), shot.id).not.toBe('')
        expect(
          PUBLIC_FILES.has(shot.src.replace(/^\//, '')),
          `${shot.id}: public/${shot.src}`,
        ).toBe(true)
        expect(shot.alt + shot.caption, shot.id).not.toMatch(AUTHOR_TEXT)
      }
    },
  )

  it.each(modules.map((m) => [m.id]))(
    'module %i renders no author notes or placeholders',
    async (id) => {
      saveState({ ...createDefaultState(), freeRoam: true })
      const { findByRole, container, unmount } = render(
        <MemoryRouter initialEntries={[`/module/${id}`]}>
          <App />
        </MemoryRouter>,
      )
      await findByRole('heading', { level: 1 })
      expect(container.textContent).not.toMatch(AUTHOR_TEXT)
      unmount()
    },
  )
})
