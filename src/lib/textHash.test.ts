import { describe, expect, it } from 'vitest'
import { clipId, textHash } from './textHash'

describe('textHash', () => {
  it('is stable for the same text', () => {
    expect(textHash('The river runs through the city.')).toBe(
      textHash('The river runs through the city.')
    )
  })

  it('changes when the sentence changes, even by one character', () => {
    expect(textHash('Key study point.')).not.toBe(textHash('Key study points.'))
  })

  it('is short and URL-safe', () => {
    expect(textHash('She has a book and an apple.')).toMatch(/^[0-9a-z]{1,7}$/)
  })
})

describe('clipId', () => {
  it('names a sentence clip as scripts/generate_text_audio.py does (SELF_CHECK there)', () => {
    expect(clipId('I have one sister.')).toBe('1ucfe6k-lk5ak1')
    expect(clipId('我\u200b要\u200b这个。')).toBe('1ecrvq0-1uy4hrr')
  })
})
