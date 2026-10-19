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
    expect(availableIn('/sounds', 'en')).toBe(true)
    expect(availableIn('/sounds', 'ko')).toBe(false)
    // Everyday phrases have an English and a Korean pack.
    expect(packsFor('/phrases')).toEqual(['en', 'ko'])
    // Stories, topic decks and grammar exist for both packs (public/data/{reading,topics,grammar}/).
    for (const path of ['/reading/x', '/topics', '/grammar']) {
      expect(availableIn(path, 'en'), path).toBe(true)
      expect(availableIn(path, 'ko'), path).toBe(true)
      expect(availableIn(path, 'ja'), path).toBe(false)
    }
    expect(availableIn('/hangul', 'ko')).toBe(true)
    expect(availableIn('/hangul', 'en')).toBe(false)
    expect(packsFor('/hangul')).toEqual(['ko'])
    // Chinese (beta) has words, topics, stories, grammar and the pinyin page; the rest stays closed.
    for (const path of ['/hangul', '/phrases', '/sounds'])
      expect(availableIn(path, 'zh'), path).toBe(false)
    expect(availableIn('/grammar', 'zh')).toBe(true)
    expect(availableIn('/topics', 'zh')).toBe(true)
    expect(availableIn('/reading/x', 'zh')).toBe(true)
    expect(availableIn('/pinyin', 'zh')).toBe(true)
    expect(availableIn('/pinyin', 'en')).toBe(false)
    expect(availableIn('/pinyin', 'ko')).toBe(false)
  })

  it('leave every shared screen open to every pack', () => {
    for (const path of ['/home', '/learn', '/review', '/quiz', '/dictation', '/browse'])
      for (const code of ['en', 'ko', 'ja']) expect(availableIn(path, code)).toBe(true)
  })
})
