import { describe, expect, it } from 'vitest'
import { targetLangNames } from './targetLang'

describe('targetLangNames', () => {
  it('reads the pack metadata, ready for the middle of a sentence', () => {
    expect(targetLangNames({ name: 'Korean', nativeName: 'Tiếng Hàn' })).toEqual({
      vi: 'tiếng Hàn',
      en: 'Korean',
    })
  })

  it('falls back to English before a pack has loaded', () => {
    expect(targetLangNames(null)).toEqual({ vi: 'tiếng Anh', en: 'English' })
  })
})
