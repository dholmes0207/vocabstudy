import { describe, expect, it } from 'vitest'
import { textHash } from './textHash'

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
