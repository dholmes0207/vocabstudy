import { describe, expect, it } from 'vitest'
import { availableIn, packsFor, screenOf } from './packContent'

describe('pack-specific screens', () => {
  it('find the screen of a deep link', () => {
    expect(screenOf('/reading/lans-morning')).toBe('/reading')
    expect(screenOf('/grammar')).toBe('/grammar')
    expect(screenOf('/learn')).toBeNull()
    expect(screenOf('/')).toBeNull()
  })

  it('keep English content for English and Hangul for Korean', () => {
    for (const path of ['/grammar', '/topics', '/phrases', '/sounds']) {
      expect(availableIn(path, 'en'), path).toBe(true)
      expect(availableIn(path, 'ko'), path).toBe(false)
    }
    // Stories exist in both packs (public/data/reading/en.json and ko.json).
    expect(availableIn('/reading/x', 'en')).toBe(true)
    expect(availableIn('/reading/x', 'ko')).toBe(true)
    expect(availableIn('/reading/x', 'ja')).toBe(false)
    expect(availableIn('/hangul', 'ko')).toBe(true)
    expect(availableIn('/hangul', 'en')).toBe(false)
    expect(packsFor('/hangul')).toEqual(['ko'])
  })

  it('leave every shared screen open to every pack', () => {
    for (const path of ['/home', '/learn', '/review', '/quiz', '/dictation', '/browse'])
      for (const code of ['en', 'ko', 'ja']) expect(availableIn(path, code)).toBe(true)
  })
})
