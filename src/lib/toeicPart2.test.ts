import { describe, expect, it } from 'vitest'
import { PART2_BANK, PART2_ROUND, part2Round } from './toeicPart2'

describe('the Part 2 bank', () => {
  it('has three different responses and an explanation for every prompt', () => {
    for (const it of PART2_BANK) {
      expect(new Set(it.responses).size, it.prompt).toBe(3)
      expect(it.why.trim(), it.prompt).not.toBe('')
    }
    expect(new Set(PART2_BANK.map((it) => it.prompt)).size).toBe(PART2_BANK.length)
    expect(PART2_BANK.length).toBeGreaterThanOrEqual(72)
  })

  it('puts the right response anywhere in a round', () => {
    const rounds = Array.from({ length: 20 }, () => part2Round())
    for (const qs of rounds) {
      expect(qs).toHaveLength(PART2_ROUND)
      for (const qn of qs) expect(qn.options[qn.answer]).toBe(qn.responses[0])
    }
    const positions = new Set(rounds.flat().map((qn) => qn.answer))
    expect(positions).toEqual(new Set([0, 1, 2]))
  })
})
