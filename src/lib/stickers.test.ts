import { describe, expect, it } from 'vitest'
import { ALL_STICKERS, STICKER_SETS, collected, mergeStickers, pickSticker } from './stickers'

describe('sticker album', () => {
  it('has four full sets of distinct words', () => {
    expect(STICKER_SETS).toHaveLength(4)
    for (const set of STICKER_SETS) expect(set.stickers).toHaveLength(12)
    const words = ALL_STICKERS.map((s) => s.en)
    expect(new Set(words).size).toBe(words.length)
  })
})

describe('pickSticker', () => {
  it('is stable for a day', () => {
    expect(pickSticker({}, 500)).toBe(pickSticker({}, 500))
  })

  it('never repeats a sticker until the album is complete', () => {
    const owned: Record<number, number> = {}
    for (let day = 1; day <= ALL_STICKERS.length; day++) owned[day] = pickSticker(owned, day)
    expect(collected(owned).size).toBe(ALL_STICKERS.length)
  })

  it('still gives something once the album is full', () => {
    const full = Object.fromEntries(ALL_STICKERS.map((_, i) => [i + 1, i]))
    const next = pickSticker(full, 999)
    expect(next).toBeGreaterThanOrEqual(0)
    expect(next).toBeLessThan(ALL_STICKERS.length)
  })
})

describe('mergeStickers', () => {
  it('keeps every day from both devices, the same whichever way round', () => {
    const phone = { 10: 3, 11: 7 }
    const laptop = { 11: 5, 12: 9 }
    expect(mergeStickers(phone, laptop)).toEqual({ 10: 3, 11: 5, 12: 9 })
    expect(mergeStickers(laptop, phone)).toEqual({ 10: 3, 11: 5, 12: 9 })
  })

  it('ignores out-of-range indices when counting the album', () => {
    expect(collected({ 1: 2, 2: 999, 3: -1 }).size).toBe(1)
  })
})
