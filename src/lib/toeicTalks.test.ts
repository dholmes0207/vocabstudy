import { describe, expect, it } from 'vitest'
import { TALK_SETS, pickTalk } from './toeicTalks'

describe('Part 3 and 4 sets', () => {
  it('pair two speakers in a conversation and one in a talk, with three questions each', () => {
    for (const s of TALK_SETS) {
      const speakers = new Set(s.lines.map((l) => l.speaker))
      expect([...speakers].sort(), s.id).toEqual(s.part === 3 ? ['M', 'W'] : ['N'])
      expect(s.questions, s.id).toHaveLength(3)
      for (const q of s.questions) {
        expect(q.q.trim(), s.id).not.toBe('')
        expect(new Set(q.options).size, `${s.id}: ${q.q}`).toBe(4)
        expect(q.why.trim(), `${s.id}: ${q.q}`).not.toBe('')
      }
    }
    expect(TALK_SETS.filter((s) => s.part === 3).length).toBeGreaterThanOrEqual(8)
    expect(TALK_SETS.filter((s) => s.part === 4).length).toBeGreaterThanOrEqual(8)
    expect(new Set(TALK_SETS.map((s) => s.id)).size).toBe(TALK_SETS.length)
  })

  it('asks "Look at the graphic" exactly when a set has one, and keeps its table square', () => {
    const graphic = TALK_SETS.filter((s) => s.graphic)
    expect(graphic.filter((s) => s.part === 3).length).toBeGreaterThanOrEqual(2)
    expect(graphic.filter((s) => s.part === 4).length).toBeGreaterThanOrEqual(2)
    for (const s of TALK_SETS) {
      const asks = s.questions.filter((q) => q.q.startsWith('Look at the graphic.'))
      expect(asks.length, s.id).toBe(s.graphic ? 1 : 0)
      if (!s.graphic) continue
      const width = s.graphic.rows[0].length
      for (const r of s.graphic.rows) expect(r, s.id).toHaveLength(width)
      // The right answer is read off the table, so it must be in it.
      const cells = s.graphic.rows.flat().join(' ')
      expect(cells, s.id).toContain(asks[0].options[0].replace(/^Room /, ''))
    }
  })

  it('offers another set than the one just done', () => {
    for (let i = 0; i < 20; i++) expect(pickTalk(3, 'p3-printer').id).not.toBe('p3-printer')
  })
})
