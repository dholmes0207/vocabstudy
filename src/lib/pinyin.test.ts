import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { INITIALS, SANDHI, TONES, TRICKY_FINALS, pinyinQuiz, pinyinXp, toneOf } from './pinyin'

const pack = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as {
  words: { word: string; viRead: string; meaning: string }[]
}
const readingOf = new Map(pack.words.map((w) => [w.word, w.viRead.toLowerCase()]))

describe('toneOf', () => {
  it('reads the tone from the mark, neutral when there is none', () => {
    expect(['mā', 'má', 'mǎ', 'mà', 'ma'].map(toneOf)).toEqual([1, 2, 3, 4, 5])
    expect(toneOf('nǚ')).toBe(3)
    expect(toneOf('lǜ')).toBe(4)
    expect(toneOf('Zhōng')).toBe(1)
  })
})

describe('the tables', () => {
  it('give each tone a sample that carries that tone', () => {
    expect(TONES.map((t) => t.n)).toEqual([1, 2, 3, 4, 5])
    for (const t of TONES) expect(toneOf(t.read), t.char).toBe(t.n)
  })

  it('list the 21 initials, each sample starting with its letters', () => {
    expect(INITIALS).toHaveLength(21)
    for (const s of INITIALS) expect(s.read.startsWith(s.ch), s.ch).toBe(true)
    // zh / ch / sh must not be read as z / c / s.
    for (const s of INITIALS.filter((x) => ['z', 'c', 's'].includes(x.ch)))
      expect(s.read[1]).not.toBe('h')
  })

  it('point at real words of the pack, read the way the pack reads them', () => {
    for (const s of [...INITIALS, ...TRICKY_FINALS]) {
      expect(readingOf.has(s.word!), s.word).toBe(true)
      expect(s.word!.startsWith(s.char), s.word).toBe(true)
      expect(
        readingOf.get(s.word!)!.startsWith(s.read),
        `${s.word} ${readingOf.get(s.word!)}`
      ).toBe(true)
    }
  })

  it('show tone changes that really change a tone', () => {
    for (const r of SANDHI) {
      const [a, b] = [r.read.split(' ')[0], r.said.split(' ')[0]]
      expect(toneOf(a), r.example).not.toBe(toneOf(b))
    }
  })
})

describe('the quick check', () => {
  it('asks tone marks and whole words, each with the pack as the answer key', () => {
    const qs = pinyinQuiz(pack.words, 10, Math.random)
    expect(qs).toHaveLength(10)
    expect(qs.filter((q) => q.kind === 'tone')).toHaveLength(5)
    for (const q of qs) {
      if (q.kind === 'tone') {
        expect(q.answer).toBe(toneOf(q.reading))
        expect([...q.prompt]).toHaveLength(1)
      } else {
        expect(q.options[q.answer]).toBe(pack.words.find((w) => w.word === q.prompt)!.viRead)
        expect(new Set(q.options).size).toBe(q.options.length)
      }
    }
  })

  it('finishes even when every random draw is the same', () => {
    const qs = pinyinQuiz(pack.words, 10, () => 0.42)
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
  })

  it('gives XP for trying and for each right answer', () => {
    expect(pinyinXp(0, 10)).toBe(5)
    expect(pinyinXp(10, 10)).toBe(30)
  })
})
