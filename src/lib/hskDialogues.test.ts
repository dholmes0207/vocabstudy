import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { HSK_LEVELS, levelWords } from './hskPractice'
import { dialogueRound, HSK_DIALOGUES } from './hskDialogues'
import { mulberry32 } from './sky'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
/** Every character of an HSK 1–3 word, and of their examples. */
const known = new Set(
  HSK_LEVELS.flatMap((l) => levelWords(l, zh.words)).flatMap((w) => [...w.word, ...w.exampleEn])
)
const han = (s: string) => [...s].filter((c) => /\p{Script=Han}/u.test(c))

describe('HSK 3 dialogues', () => {
  it('use only characters of HSK 1–3', () => {
    for (const d of HSK_DIALOGUES) {
      const text = [...d.lines.map((l) => l.zh), d.q, ...d.options].join('')
      expect(
        han(text).filter((c) => !known.has(c)),
        d.id
      ).toEqual([])
    }
  })

  it('have a woman and a man, a question, three options and an explanation', () => {
    expect(HSK_DIALOGUES.length).toBeGreaterThanOrEqual(10)
    expect(new Set(HSK_DIALOGUES.map((d) => d.id)).size).toBe(HSK_DIALOGUES.length)
    for (const d of HSK_DIALOGUES) {
      expect(new Set(d.lines.map((l) => l.speaker)), d.id).toEqual(new Set(['W', 'M']))
      for (const l of d.lines) expect(l.vi.trim(), d.id).not.toBe('')
      expect(d.q.endsWith('？'), d.id).toBe(true)
      expect(new Set(d.options).size, d.id).toBe(3)
      expect(d.why.trim(), d.id).not.toBe('')
    }
  })

  it('keeps the right option after shuffling', () => {
    const round = dialogueRound(5, mulberry32(2))
    expect(new Set(round.map((d) => d.id)).size).toBe(5)
    for (const d of round) {
      const original = HSK_DIALOGUES.find((x) => x.id === d.id)!
      expect(d.options[d.answer]).toBe(original.options[0])
    }
  })
})
