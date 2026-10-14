import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseTopics } from './topics'

// The topic decks (docs/design/topics.md) only ever point at real words.

const pack = JSON.parse(readFileSync('public/data/en.json', 'utf8')) as {
  words: { id: number }[]
}
const topics = JSON.parse(readFileSync('public/data/topics/en.json', 'utf8')) as {
  topics: { id: string; emoji: string; title: [string, string]; wordIds: number[] }[]
}
const ids = new Set(pack.words.map((w) => w.id))

describe('topic decks', () => {
  it('have unique ids and a title in both languages', () => {
    const seen = new Set<string>()
    for (const t of topics.topics) {
      expect(seen.has(t.id)).toBe(false)
      seen.add(t.id)
      expect(t.title[0].trim() && t.title[1].trim()).toBeTruthy()
      expect(t.emoji).toBeTruthy()
    }
  })

  it('only list words that exist, each once, at least 15 per deck', () => {
    for (const t of topics.topics) {
      expect(t.wordIds.length, t.id).toBeGreaterThanOrEqual(15)
      expect(new Set(t.wordIds).size, t.id).toBe(t.wordIds.length)
      for (const id of t.wordIds) expect(ids.has(id), `${t.id}: ${id}`).toBe(true)
    }
  })
})

describe('parseTopics', () => {
  it('reads the shipped file', () => {
    expect(parseTopics(topics).length).toBe(topics.topics.length)
  })

  it('drops malformed entries instead of throwing', () => {
    expect(
      parseTopics({
        topics: [
          { id: 'ok', emoji: '💼', title: ['Công sở', 'Work'], wordIds: [1, 2] },
          { id: 'bad-title', emoji: '💼', title: ['only one'], wordIds: [1] },
          { id: 'bad-ids', emoji: '💼', title: ['a', 'b'], wordIds: ['x'] },
          null,
        ],
      }).map((t) => t.id)
    ).toEqual(['ok'])
    expect(parseTopics('nope')).toEqual([])
  })
})
