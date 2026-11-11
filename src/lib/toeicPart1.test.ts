import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PART1_ROUND, part1Round } from './toeicPart1'
import { validateToeicBank } from './toeicBank'

const PART1_BANK = validateToeicBank(
  JSON.parse(readFileSync('public/data/toeic/en.json', 'utf8'))
).part1

describe('Part 1 scenes', () => {
  it('have four different statements, a scene and an explanation', () => {
    expect(PART1_BANK.length).toBeGreaterThanOrEqual(46)
    for (const it of PART1_BANK) {
      expect(new Set(it.statements).size, it.scene).toBe(4)
      expect(it.scene.trim() && it.emoji.trim() && it.why.trim(), it.scene).toBeTruthy()
    }
  })

  it('make rounds of six with the right statement among four', () => {
    const round = part1Round(PART1_BANK)
    expect(round).toHaveLength(PART1_ROUND)
    for (const q of round) {
      expect(q.options).toHaveLength(4)
      expect(q.prompt).toBe('')
      const item = PART1_BANK.find((it) => it.scene === q.scene)!
      expect(q.options[q.answer]).toBe(item.statements[0])
    }
  })
})
