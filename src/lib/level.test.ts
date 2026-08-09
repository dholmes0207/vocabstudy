import { describe, expect, it } from 'vitest'
import { LEVELS, computeLevel, levelInfo } from './level'

describe('levelInfo', () => {
  it('returns the matching level for 1..5', () => {
    for (const l of LEVELS) {
      expect(levelInfo(l.level).level).toBe(l.level)
    }
  })

  it('clamps out-of-range input instead of returning undefined', () => {
    expect(levelInfo(0).level).toBe(1)
    expect(levelInfo(-3).level).toBe(1)
    expect(levelInfo(99).level).toBe(LEVELS.length)
  })

  it('rounds fractional levels', () => {
    expect(levelInfo(2.4).level).toBe(2)
    expect(levelInfo(2.6).level).toBe(3)
  })

  it('gives every level an AI instruction — an empty one would weaken the prompt', () => {
    for (const l of LEVELS) {
      expect(l.aiInstruction.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('computeLevel', () => {
  it('keeps a beginner at level 1 until 25 words are learned', () => {
    expect(computeLevel({ learned: 0, mastered: 0, accuracy: 100 })).toBe(1)
    expect(computeLevel({ learned: 24, mastered: 0, accuracy: 100 })).toBe(1)
    expect(computeLevel({ learned: 25, mastered: 0, accuracy: 100 })).toBe(2)
  })

  it('uses accuracy to break the tie in the 30..119 mastered band', () => {
    expect(computeLevel({ learned: 200, mastered: 60, accuracy: 84 })).toBe(3)
    expect(computeLevel({ learned: 200, mastered: 60, accuracy: 85 })).toBe(4)
  })

  it('reaches level 4 on volume alone, and 5 past 350 mastered', () => {
    expect(computeLevel({ learned: 400, mastered: 120, accuracy: 0 })).toBe(4)
    expect(computeLevel({ learned: 500, mastered: 349, accuracy: 0 })).toBe(4)
    expect(computeLevel({ learned: 500, mastered: 350, accuracy: 0 })).toBe(5)
  })

  it('always lands inside the defined level range', () => {
    const inputs = [
      { learned: 0, mastered: 0, accuracy: 0 },
      { learned: 1000, mastered: 1000, accuracy: 100 },
      { learned: 26, mastered: 30, accuracy: 50 },
    ]
    for (const i of inputs) {
      const l = computeLevel(i)
      expect(l).toBeGreaterThanOrEqual(1)
      expect(l).toBeLessThanOrEqual(LEVELS.length)
    }
  })
})
