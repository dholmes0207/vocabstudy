import { describe, expect, it } from 'vitest'
import { levelForXp } from './xpLevel'

describe('levelForXp', () => {
  it('starts at level 1', () => {
    expect(levelForXp(0)).toMatchObject({ level: 1, floor: 0, next: 100, ratio: 0 })
    expect(levelForXp(-5).level).toBe(1)
  })

  it('level 2 comes quickly, later levels take longer', () => {
    expect(levelForXp(100).level).toBe(2)
    expect(levelForXp(299).level).toBe(2)
    expect(levelForXp(300).level).toBe(3)
    expect(levelForXp(1000).level).toBe(5)
    const gap = (l: number) => {
      const a = levelForXp(50 * l * (l - 1))
      return a.next - a.floor
    }
    expect(gap(5)).toBeGreaterThan(gap(2))
  })

  it('reports progress through the current level', () => {
    expect(levelForXp(200).ratio).toBeCloseTo(0.5)
  })
})
