import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The landing page promises numbers (docs/design/landing.md: "every number is
// true of the product as shipped"). This ties each one to the data it counts,
// so adding a story or a deck fails here until the page is updated too.

const page = readFileSync('src/features/marketing/Landing.tsx', 'utf8')
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))

const count = {
  enStories: json('public/data/reading/en.json').stories.length,
  koStories: json('public/data/reading/ko.json').stories.length,
  grammar: json('public/data/grammar/en.json').units.length,
  topics: json('public/data/topics/en.json').topics.length,
  koWords: json('public/data/ko.json').words.length,
  koTopics: json('public/data/topics/ko.json').topics.length,
  koGrammar: json('public/data/grammar/ko.json').units.length,
  zhWords: json('public/data/zh.json').words.length,
  phrases: json('public/data/phrases/en.json').topics.reduce(
    (n: number, t: { phrases: unknown[] }) => n + t.phrases.length,
    0
  ),
}

describe('numbers on the landing page', () => {
  it('match the shipped content, in both languages', () => {
    for (const claim of [
      `${count.enStories} truyện ngắn`,
      `${count.enStories} short stories`,
      `${count.grammar} bài ngữ pháp`,
      `${count.grammar} grammar lessons`,
      `${count.topics} bộ từ`,
      `${count.topics} topic decks`,
      `${count.koWords} từ sơ cấp`,
      `${count.koWords} beginner words`,
      `${count.koTopics} bộ chủ đề, ${count.koGrammar} bài ngữ pháp và ${count.koStories} truyện ngắn`,
      `${count.koTopics} topic decks, ${count.koGrammar} grammar lessons and ${count.koStories} short stories`,
      `${count.koStories} truyện ngắn`,
      `${count.zhWords} từ HSK 1 có pinyin`,
      `${count.zhWords} HSK 1 words with pinyin`,
      `${count.koStories} short stories`,
      `${count.phrases} câu theo tình huống`,
      `${count.phrases} phrases for real situations`,
    ])
      expect(page, claim).toContain(claim)
  })
})
