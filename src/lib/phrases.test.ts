import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildPhraseSession,
  canBuild,
  isKnown,
  phraseInPack,
  phraseXp,
  recordPhrase,
  topicProgress,
  validatePhrasePack,
  type PhraseTopic,
} from './phrases'

const pack = validatePhrasePack(
  JSON.parse(readFileSync('public/data/phrases/en.json', 'utf8')) as unknown
)
const all = pack.topics.flatMap((t) => t.phrases)

describe('phrase pack (public/data/phrases/en.json)', () => {
  it('has topics in both languages with unique phrase ids', () => {
    expect(pack.topics.length).toBeGreaterThanOrEqual(10)
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
    for (const t of pack.topics) {
      expect(t.title).not.toBe('')
      expect(t.titleEn).not.toBe('')
      expect(t.phrases.length).toBeGreaterThanOrEqual(8)
    }
  })

  it('has a recorded clip in every voice, made from the current text', () => {
    const recorded = JSON.parse(
      readFileSync('scripts/audio-texts/phrases-en.json', 'utf8')
    ) as Record<string, string>
    const voices = (
      JSON.parse(readFileSync('public/audio/en/index.json', 'utf8')) as {
        voices: { key: string }[]
      }
    ).voices
    const problems: string[] = []
    for (const p of all) {
      if (recorded[p.id] !== p.en) problems.push(`${p.id}: stale text`)
      for (const v of voices) {
        if (!existsSync(`public/audio/en/${v.key}/p${p.id}.mp3`)) problems.push(`${p.id}: ${v.key}`)
      }
    }
    expect(problems).toEqual([])
  })

  it('refuses a broken pack', () => {
    expect(() => validatePhrasePack({ topics: [] })).toThrow()
    const dup = {
      topics: [
        {
          id: 'a',
          emoji: '',
          title: 'A',
          titleEn: 'A',
          phrases: [
            { id: 1, en: 'Hi.', vi: 'Chào.' },
            { id: 1, en: 'Bye.', vi: 'Tạm biệt.' },
          ],
        },
      ],
    }
    expect(() => validatePhrasePack(dup)).toThrow(/Duplicate/)
  })
})

describe('Korean phrase pack (public/data/phrases/ko.json)', () => {
  const ko = validatePhrasePack(
    JSON.parse(readFileSync('public/data/phrases/ko.json', 'utf8')) as unknown
  )
  const koAll = ko.topics.flatMap((t) => t.phrases)

  it('has full topics, numbered in its own range so progress never mixes', () => {
    expect(ko.topics.length).toBeGreaterThanOrEqual(8)
    for (const t of ko.topics) expect(t.phrases.length).toBeGreaterThanOrEqual(8)
    expect(koAll.every((p) => phraseInPack(p.id, 'ko'))).toBe(true)
    expect(all.every((p) => phraseInPack(p.id, 'en'))).toBe(true)
    expect(koAll.some((p) => phraseInPack(p.id, 'en'))).toBe(false)
  })

  it('is written in Hangul, with a distinct meaning for every phrase', () => {
    for (const p of koAll) expect(p.en).toMatch(/[가-힣]/)
    // Two phrases meaning the same would make a choice question unanswerable.
    expect(new Set(koAll.map((p) => p.vi)).size).toBe(koAll.length)
    expect(new Set(koAll.map((p) => p.en)).size).toBe(koAll.length)
  })
})

describe('progress', () => {
  const topic = pack.topics[0]

  it('counts a phrase as known after two right answers', () => {
    let pr = recordPhrase({}, topic.phrases[0].id, true, 10)
    expect(isKnown(pr[topic.phrases[0].id])).toBe(false)
    pr = recordPhrase(pr, topic.phrases[0].id, false, 10)
    pr = recordPhrase(pr, topic.phrases[0].id, true, 11)
    expect(pr[topic.phrases[0].id]).toEqual({ right: 2, wrong: 1, lastDay: 11 })
    expect(topicProgress(topic, pr)).toMatchObject({ known: 1, total: topic.phrases.length })
  })
})

describe('buildPhraseSession', () => {
  const topic: PhraseTopic = pack.topics[3]
  const seq = (() => {
    let x = 7
    return () => (x = (x * 9301 + 49297) % 233280) / 233280
  })()

  it('asks each picked phrase once, mixing the three kinds', () => {
    const qs = buildPhraseSession(topic, all, {}, 8, seq)
    expect(qs).toHaveLength(8)
    expect(new Set(qs.map((q) => q.phrase.id)).size).toBe(8)
    expect(new Set(qs.map((q) => q.kind)).size).toBeGreaterThanOrEqual(2)
  })

  it('puts the right answer among four distinct options', () => {
    for (const q of buildPhraseSession(topic, all, {}, 10, seq)) {
      if (q.kind === 'build') {
        expect(q.tokens.join(' ')).toBe(q.phrase.en)
        expect(canBuild(q.phrase)).toBe(true)
        continue
      }
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.kind === 'meaning' ? q.phrase.vi : q.phrase.en)
    }
  })

  it('practises the least-known phrases first', () => {
    const progress = Object.fromEntries(
      topic.phrases.slice(0, 7).map((p) => [p.id, { right: 5, wrong: 0, lastDay: 1 }])
    )
    const ids = buildPhraseSession(topic, all, progress, 3, seq).map((q) => q.phrase.id)
    const fresh = topic.phrases.slice(7).map((p) => p.id)
    expect(ids.every((id) => fresh.includes(id))).toBe(true)
  })

  it('gives a little XP for trying and a bonus for a perfect round', () => {
    expect(phraseXp(0, 8)).toBe(3)
    expect(phraseXp(8, 8)).toBe(29)
  })
})
