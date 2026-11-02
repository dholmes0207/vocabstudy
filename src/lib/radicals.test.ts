import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack, Word } from '@/types'
import { RADICALS, radicalQuiz, radicalTable } from './radicals'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack

/** A deterministic stand-in for Math.random. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31
    return seed / 2 ** 31
  }
}

const word = (id: number, w: string): Word => ({ id, word: w }) as Word

describe('RADICALS', () => {
  it('names every radical once, with Han members and no repeats', () => {
    const forms = RADICALS.map((r) => r.form)
    expect(new Set(forms).size).toBe(forms.length)
    for (const r of RADICALS) {
      expect(r.name.trim(), r.form).not.toBe('')
      expect(
        r.meaning.every((m) => m.trim()),
        r.form
      ).toBe(true)
      const chars = [...r.chars]
      expect(new Set(chars).size, `${r.form} lists a character twice`).toBe(chars.length)
      for (const ch of chars) expect(ch, r.form).toMatch(/^\p{Script=Han}$/u)
    }
  })

  it('shows every radical with at least two characters of the Chinese pack', () => {
    const shown = radicalTable(zh.words).map((e) => e.radical.form)
    const missing = RADICALS.filter((r) => !shown.includes(r.form)).map((r) => r.form)
    expect(missing).toEqual([])
    expect(shown.length).toBeGreaterThanOrEqual(40)
  })
})

describe('radicalTable', () => {
  it('pairs each character with the shortest word that uses it', () => {
    const words = [word(1, '妈妈'), word(2, '妈'), word(3, '姐姐'), word(4, '好吃')]
    const nv = radicalTable(words).find((e) => e.radical.form === '女')!
    expect(nv.members.map((m) => [m.char, m.word.word])).toEqual([
      ['妈', '妈'],
      ['姐', '姐姐'],
      ['好', '好吃'],
    ])
  })

  it('leaves out radicals with fewer members than asked', () => {
    const words = [word(1, '狗')]
    expect(radicalTable(words).some((e) => e.radical.form === '犭')).toBe(false)
    expect(radicalTable(words, 1).some((e) => e.radical.form === '犭')).toBe(true)
  })
})

describe('radicalQuiz', () => {
  it('asks distinct characters, each with its own radical among four', () => {
    const qs = radicalQuiz(zh.words, 10, seeded(7))
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.char)).size).toBe(10)
    for (const q of qs) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer].chars).toContain(q.char)
      expect(q.word.word).toContain(q.char)
    }
  })

  it('never offers as wrong a radical the character also contains', () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const q of radicalQuiz(zh.words, 10, seeded(seed))) {
        const containing = q.options.filter((r) => r.chars.includes(q.char))
        expect(containing, q.char).toHaveLength(1)
      }
    }
  })
})
