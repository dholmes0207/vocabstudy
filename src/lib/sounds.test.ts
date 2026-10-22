import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SOUND_LESSONS, earRound, lessonText, lessonWords } from './sounds'
import { availableIn } from './packContent'

const packs = Object.entries(SOUND_LESSONS)
const all = packs.flatMap(([, lessons]) => lessons)

describe('sound lessons', () => {
  it('have unique ids, words to hear, and two different words per pair', () => {
    const ids = all.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of all) {
      expect(l.words.length).toBeGreaterThanOrEqual(2)
      for (const [a, b] of l.pairs) expect(a).not.toBe(b)
    }
  })

  it.each(packs)(
    'only use words the %s pack has (so both sides play in the same voice)',
    (code, lessons) => {
      const pack = JSON.parse(readFileSync(`public/data/${code}.json`, 'utf8')) as {
        words: { word: string }[]
      }
      const have = new Set(pack.words.map((w) => w.word.toLowerCase()))
      expect(lessonWords(lessons).filter((w) => !have.has(w))).toEqual([])
    }
  )

  it.each(packs)(
    'are reachable: the %s pack opens /sounds and has an ear test',
    (code, lessons) => {
      expect(availableIn('/sounds', code)).toBe(true)
      expect(lessons.some((l) => l.pairs.length > 0)).toBe(true)
    }
  )

  it('keep each Chinese tone pair to the same syllable, so only the tone tells them apart', () => {
    const zh = JSON.parse(readFileSync('public/data/zh.json', 'utf8')) as {
      words: { word: string; viRead: string }[]
    }
    const read = new Map(zh.words.map((w) => [w.word, w.viRead]))
    const bare = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '')
    for (const l of SOUND_LESSONS.zh.filter((x) => x.id.startsWith('zh-tone')))
      for (const [a, b] of l.pairs) {
        expect(bare(read.get(a)!), `${a} ${b}`).toBe(bare(read.get(b)!))
        expect(read.get(a), `${a} ${b}`).not.toBe(read.get(b))
      }
  })
})

describe('earRound', () => {
  const pairs: [string, string][] = [
    ['ship', 'sheep'],
    ['man', 'men'],
  ]

  it('picks a pair and a side from the random source', () => {
    const seq = [0.9, 0.1]
    const r = earRound(pairs, () => seq.shift()!)
    expect(r).toEqual({ pair: ['man', 'men'], answer: 0 })
  })

  it('always returns one of the given pairs', () => {
    for (let i = 0; i < 20; i++) expect(pairs).toContainEqual(earRound(pairs).pair)
  })
})

describe('lessonText', () => {
  it('has English wording for every lesson', () => {
    for (const l of all) {
      const en = lessonText(l, 'en')
      // Some titles read the same in both ("j, q, x"); the explanations never do.
      expect(en.how, l.id).not.toBe(l.how)
      expect(en.slip, l.id).not.toBe(l.slip)
    }
    expect(lessonText(SOUND_LESSONS.en[0], 'vi').title).toBe(SOUND_LESSONS.en[0].title)
  })
})
