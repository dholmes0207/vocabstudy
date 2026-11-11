import { describe, expect, it } from 'vitest'
import { TWISTERS } from './tongueTwisters'

describe('tongue twisters', () => {
  it('gives every twister a meaning and the sounds it drills, with pinyin for Chinese', () => {
    for (const code of ['en', 'zh'] as const) {
      const list = TWISTERS[code]
      expect(list.length, code).toBeGreaterThanOrEqual(5)
      expect(new Set(list.map((x) => x.text)).size, code).toBe(list.length)
      for (const x of list) {
        expect(x.vi.trim() && x.focus.every((f) => f.trim()), x.text).toBeTruthy()
        if (code === 'zh') expect(x.reading, x.text).toMatch(/^[A-ZÀ-Ž]/)
        else expect(x.reading, x.text).toBeUndefined()
      }
    }
  })
})
