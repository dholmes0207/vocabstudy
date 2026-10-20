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
  zhTopics: json('public/data/topics/zh.json').topics.length,
  zhGrammar: json('public/data/grammar/zh.json').units.length,
  zhStories: json('public/data/reading/zh.json').stories.length,
  languages: json('public/data/index.json').languages.length,
  // Words across every pack, rounded down to the hundred ("4.700+").
  allWords: (() => {
    const packs = json('public/data/index.json').languages as { file: string }[]
    const n = packs.reduce((sum, p) => sum + json(`public/data/${p.file}`).words.length, 0)
    return Math.floor(n / 100) * 100
  })(),
  allStories: (json('public/data/index.json').languages as { code: string }[]).reduce(
    (n, { code }) => n + json(`public/data/reading/${code}.json`).stories.length,
    0
  ),
  phrases: json('public/data/phrases/en.json').topics.reduce(
    (n: number, t: { phrases: unknown[] }) => n + t.phrases.length,
    0
  ),
  koPhrases: json('public/data/phrases/ko.json').topics.reduce(
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
      // "all of HSK 1 and HSK 2" is checked word by word in lib/chinesePack.test.ts
      // and lib/exams.test.ts.
      `${count.zhWords} từ (đủ từ vựng HSK 1 và HSK 2) có pinyin`,
      `${count.zhWords} words (all of HSK 1 and HSK 2) with pinyin`,
      `${count.zhTopics} bộ chủ đề, ${count.zhGrammar} bài ngữ pháp và ${count.zhStories} truyện ngắn`,
      `${count.zhTopics} topic decks, ${count.zhGrammar} grammar lessons and ${count.zhStories} short stories`,
      `${count.koStories} short stories`,
      // The stats strip under the hero. A new language changes the first one —
      // update the hero sentence that names them too.
      `['${count.languages}', '${count.languages}', t('ngôn ngữ`,
      `['${count.allWords.toLocaleString('vi-VN')}+', '${count.allWords.toLocaleString('en-US')}+'`,
      `['${count.allStories}', '${count.allStories}', t('truyện ngắn`,
      `${count.phrases} câu tiếng Anh và ${count.koPhrases} câu tiếng Hàn theo tình huống`,
      `${count.phrases} English and ${count.koPhrases} Korean phrases for real situations`,
      `${count.koPhrases} mẫu câu giao tiếp`,
      `${count.koPhrases} everyday phrases`,
    ])
      expect(page, claim).toContain(claim)
  })
})
