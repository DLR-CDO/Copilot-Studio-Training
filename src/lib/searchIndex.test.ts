import { describe, expect, it } from 'vitest'
import { searchModules, SEARCH_SECTION_ANCHORS } from './searchIndex'

describe('searchModules', () => {
  it('returns no results for an empty query', () => {
    expect(searchModules('')).toEqual([])
    expect(searchModules('   ')).toEqual([])
  })

  it('finds a module by a concept keyword', () => {
    const results = searchModules('citation')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.moduleId === 3)).toBe(true)
  })

  it('finds a module by title', () => {
    const results = searchModules('publishing')
    expect(results.some((r) => r.moduleId === 10)).toBe(true)
  })

  it('finds build step content', () => {
    const results = searchModules('switch environment')
    expect(results.some((r) => r.section === 'build' && r.moduleId === 2)).toBe(true)
  })

  it('finds build sub-step content', () => {
    const results = searchModules('Display name')
    expect(results.some((r) => r.section === 'build' && r.moduleId === 1)).toBe(true)
  })

  it('includes a snippet around the match', () => {
    const results = searchModules('citation')
    for (const result of results) {
      expect(result.snippet.length).toBeGreaterThan(0)
    }
  })

  it('deduplicates results across indexed fields', () => {
    const results = searchModules('publish')
    const ids = results.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only defines anchors for sections that exist on the module page', () => {
    for (const anchor of Object.values(SEARCH_SECTION_ANCHORS)) {
      expect(['concept', 'build', 'watch-out', 'tips', 'try-it']).toContain(anchor)
    }
  })

  it('finds glossary terms, such as DLP', () => {
    const results = searchModules('DLP')
    expect(results.some((r) => r.section === 'glossary')).toBe(true)
  })

  it('finds tips', () => {
    const results = searchModules('Ask early')
    expect(results.some((r) => r.section === 'tips' && r.moduleId === 1)).toBe(true)
  })
})
