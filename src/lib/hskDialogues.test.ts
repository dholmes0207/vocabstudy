import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { HSK_LEVELS, levelWords } from './hskPractice'
import {
  dialogueRound,
  HSK_DIALOGUES,
  PICTURE_DIALOGUES,
  pictureDialogueRound,
} from './hskDialogues'
import { PICTURE_WORDS } from './hskPractice'
import { mulberry32 } from './sky'

const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as LanguagePack
/** Every character of the words of a level and below, and of their examples. */
const known = (upTo: 'hsk2' | 'hsk3') =>
  new Set(
    HSK_LEVELS.slice(0, HSK_LEVELS.indexOf(upTo) + 1)
      .flatMap((l) => levelWords(l, zh.words))
      .flatMap((w) => [...w.word, ...w.exampleEn])
  )
const han = (s: string) => [...s].filter((c) => /\p{Script=Han}/u.test(c))

describe('HSK dialogues', () => {
  it('use only characters of their level and below', () => {
    for (const d of HSK_DIALOGUES) {
      const ok = known(d.level)
      const text = [...d.lines.map((l) => l.zh), d.q, ...d.options].join('')
      expect(
        han(text).filter((c) => !ok.has(c)),
        d.id
      ).toEqual([])
    }
  })

  it('have a woman and a man, a question, three options and an explanation', () => {
    expect(HSK_DIALOGUES.filter((d) => d.level === 'hsk3').length).toBeGreaterThanOrEqual(35)
    expect(HSK_DIALOGUES.filter((d) => d.level === 'hsk2').length).toBeGreaterThanOrEqual(28)
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
    const round = dialogueRound('hsk2', 5, mulberry32(2))
    expect(round.every((d) => d.level === 'hsk2')).toBe(true)
    expect(new Set(round.map((d) => d.id)).size).toBe(5)
    for (const d of round) {
      const original = HSK_DIALOGUES.find((x) => x.id === d.id)!
      expect(d.options[d.answer]).toBe(original.options[0])
    }
  })
})

describe('HSK 2 picture dialogues', () => {
  const low = [...levelWords('hsk1', zh.words), ...levelWords('hsk2', zh.words)]

  it('name exactly one word with a picture, theirs, in HSK 1–2 characters', () => {
    const ok = known('hsk2')
    expect(PICTURE_DIALOGUES.length).toBeGreaterThanOrEqual(24)
    for (const d of PICTURE_DIALOGUES) {
      const said = d.lines.map((l) => l.zh).join('')
      expect(
        PICTURE_WORDS.filter((p) => said.includes(p)),
        d.id
      ).toEqual([d.picture])
      expect(
        han(said).filter((c) => !ok.has(c)),
        d.id
      ).toEqual([])
      expect(new Set(d.lines.map((l) => l.speaker)), d.id).toEqual(new Set(['W', 'M']))
    }
  })

  it('offer five different pictures, only one of them said', () => {
    // Picture → its word, among the words with pictures (other words can share an emoji).
    const emoji = new Map(
      low.filter((w) => w.emoji && PICTURE_WORDS.includes(w.word)).map((w) => [w.emoji!, w.word])
    )
    for (let seed = 1; seed <= 5; seed++) {
      const round = pictureDialogueRound(low, 10, mulberry32(seed))
      expect(round).toHaveLength(10)
      for (const d of round) {
        expect(new Set(d.options).size).toBe(5)
        const said = d.lines.map((l) => l.zh).join('')
        const named = d.options.filter((o) => said.includes(emoji.get(o)!))
        expect(named, d.id).toEqual([d.options[d.answer]])
      }
    }
  })
})
