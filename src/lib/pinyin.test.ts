import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mulberry32 } from './sky'
import {
  SANDHI_DRILL,
  sandhiQuiz,
  INITIALS,
  SANDHI,
  TONES,
  TRICKY_FINALS,
  TONE_PAIRS,
  earQuiz,
  hasThirdToneRun,
  missedPairs,
  tonePair,
  tonePairTable,
  pinyinQuiz,
  pinyinXp,
  toneOf,
  toneVariants,
  type ZhWord,
} from './pinyin'

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

describe('earQuiz: hear a word, pick its tones', () => {
  it('makes options that differ from the reading in tones only', () => {
    const v = toneVariants('xǐhuan')
    expect(v).toHaveLength(3)
    expect(new Set(v).size).toBe(3)
    for (const r of v) {
      expect(r).not.toBe('xǐhuan')
      expect(r.normalize('NFD').replace(/[̀-ͯ]/g, '')).toBe('xihuan')
    }
    expect(toneVariants('ma')).toEqual([])
  })

  it('leaves out words whose two third tones are said 2 + 3', () => {
    expect(hasThirdToneRun('nǐ hǎo')).toBe(true)
    expect(hasThirdToneRun('xǐhuan')).toBe(false)
    expect(hasThirdToneRun('lǎoshī')).toBe(false)
  })

  it('asks about two-character words of the pack, the reading among four options', () => {
    const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as { words: ZhWord[] }
    const qs = earQuiz(zh.words, 10)
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      if (q.kind !== 'ear') throw new Error('kind')
      expect([...q.prompt]).toHaveLength(2)
      expect(new Set(q.options).size).toBe(4)
      const w = zh.words.find((x) => x.word === q.prompt)!
      expect(q.options[q.answer]).toBe(w.viRead)
      expect(hasThirdToneRun(w.viRead)).toBe(false)
    }
  })
})

describe('tone pairs', () => {
  const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as { words: ZhWord[] }

  it('reads the two tones of a word, 5 for a neutral second syllable', () => {
    expect(tonePair('lǎoshī')).toEqual([3, 1])
    expect(tonePair('xǐhuan')).toEqual([3, 5])
    expect(tonePair("nǚ'ér")).toEqual([3, 2])
    expect(tonePair('ma')).toBeNull()
    expect(TONE_PAIRS).toHaveLength(20)
  })

  it('finds pack words for every pair, never a one-syllable 儿 word', () => {
    const table = tonePairTable(zh.words)
    expect(table.filter((r) => r.words.length === 0).map((r) => r.pair)).toEqual([])
    const words = table.flatMap((r) => r.words.map((w) => w.word))
    expect(words).not.toContain('哪儿')
    expect(words).not.toContain('这儿')
    expect(tonePairTable([{ word: '女儿', viRead: "nǚ'ér", meaning: '' }])[11].words).toHaveLength(
      1
    )
  })

  it('spreads a listening round over ten different pairs', () => {
    const qs = earQuiz(zh.words, 10)
    const pairs = qs.map((q) => (q.kind === 'ear' ? q.pair : ''))
    expect(new Set(pairs).size).toBe(10)
    for (const q of qs) {
      if (q.kind !== 'ear') throw new Error('kind')
      expect(q.pair).toBe(tonePair(q.options[q.answer])!.join('-'))
    }
  })

  it('lists the pairs a round got wrong, worst first', () => {
    expect(
      missedPairs([
        { pair: '2-3', ok: false },
        { pair: '1-4', ok: true },
        { pair: '3-2', ok: false },
        { pair: '3-2', ok: true },
        { pair: '2-3', ok: false },
      ])
    ).toEqual([
      ['2-3', 2, 2],
      ['3-2', 1, 2],
    ])
  })
})

describe('tone changes in speech', () => {
  it('follows the rules: 一 and 不 by the next tone, the first of two third tones rises', () => {
    for (const d of SANDHI_DRILL) {
      expect(d.wrong.includes(d.said), d.zh).toBe(false)
      expect(new Set([d.said, ...d.wrong]).size, d.zh).toBe(d.wrong.length + 1)
      // toneOf reads the first tone mark, so the first syllable's tone.
      if (d.rule === 'three') expect(toneOf(d.said), d.zh).toBe(2)
      const lead = [...d.zh][0]
      if (lead === '一' || lead === '不') {
        const next = d.said.slice(2).trim()
        expect(toneOf(d.said.slice(0, 2)), d.zh).toBe(toneOf(next) === 4 ? 2 : 4)
      } else if (d.rule === 'yi') {
        // 第一, 十一: 一 at the end keeps its first tone.
        expect(d.said.endsWith('yī'), d.zh).toBe(true)
      }
    }
  })

  it('makes a round over all three rules with the spoken reading among the options', () => {
    const qs = sandhiQuiz(10, (vi) => vi, mulberry32(7))
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.prompt)).size).toBe(10)
    const rules = new Set(qs.map((q) => SANDHI_DRILL.find((d) => d.zh === q.prompt)!.rule))
    expect(rules.size).toBe(3)
    for (const q of qs) {
      if (q.kind !== 'sandhi') throw new Error(q.kind)
      expect(q.options[q.answer]).toBe(SANDHI_DRILL.find((d) => d.zh === q.prompt)!.said)
    }
  })
})
