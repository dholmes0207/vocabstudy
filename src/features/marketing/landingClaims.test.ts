/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettings } from '@/store/settingsStore'
import { CONTENT, atLeast } from '@/lib/contentStats'
import Landing from './Landing'

// The landing page promises numbers (docs/design/landing.md: "every number is
// true of the product as shipped"). They come from the data at build time
// (lib/contentStats.ts); this checks the counting, what the page shows, and
// that nobody writes a count back into the page by hand.

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const codes = (json('public/data/index.json').languages as { code: string }[]).map((l) => l.code)
const sumPhrases = (code: string) =>
  (json(`public/data/phrases/${code}.json`).topics as { phrases: unknown[] }[]).reduce(
    (n, t) => n + t.phrases.length,
    0
  )

const count = {
  en: {
    stories: json('public/data/reading/en.json').stories.length,
    grammar: json('public/data/grammar/en.json').units.length,
    topics: json('public/data/topics/en.json').topics.length,
    phrases: sumPhrases('en'),
  },
  ko: {
    words: json('public/data/ko.json').words.length,
    topics: json('public/data/topics/ko.json').topics.length,
    grammar: json('public/data/grammar/ko.json').units.length,
    stories: json('public/data/reading/ko.json').stories.length,
    phrases: sumPhrases('ko'),
  },
  zh: {
    words: json('public/data/zh.json').words.length,
    topics: json('public/data/topics/zh.json').topics.length,
    grammar: json('public/data/grammar/zh.json').units.length,
    stories: json('public/data/reading/zh.json').stories.length,
  },
  languages: codes.length,
  words: codes.reduce((n, c) => n + json(`public/data/${c}.json`).words.length, 0),
  stories: codes.reduce((n, c) => n + json(`public/data/reading/${c}.json`).stories.length, 0),
}

function pageText(lang: 'vi' | 'en'): string {
  useSettings.setState({ uiLang: lang })
  const { container } = render(createElement(MemoryRouter, null, createElement(Landing)))
  const text = container.textContent ?? ''
  cleanup()
  return text
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('', { status: 404 }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('content counts', () => {
  it('are counted from the shipped data', () => {
    expect(CONTENT.languages).toBe(count.languages)
    expect(CONTENT.words).toBe(count.words)
    expect(CONTENT.stories).toBe(count.stories)
    expect(CONTENT.packs.en).toMatchObject(count.en)
    expect(CONTENT.packs.ko).toMatchObject(count.ko)
    expect(CONTENT.packs.zh).toMatchObject(count.zh)
  })

  it('round a total down to the hundred, in each language’s format', () => {
    expect(atLeast(5023, 'vi')).toBe('5.000+')
    expect(atLeast(5023, 'en')).toBe('5,000+')
    expect(atLeast(4999, 'en')).toBe('4,900+')
  })
})

describe('numbers on the landing page', () => {
  it('match the shipped content, in Vietnamese', () => {
    const page = pageText('vi')
    for (const claim of [
      `${atLeast(count.words, 'vi')}từ vựng`,
      `${count.stories}truyện ngắn chạm là ra nghĩa`,
      `${count.languages}ngôn ngữ`,
      `${count.en.phrases} câu tiếng Anh và ${count.ko.phrases} câu tiếng Hàn`,
      `Tiếng Anh: ${count.en.stories} truyện ngắn`,
      `${count.en.grammar} bài ngữ pháp giải thích`,
      `${count.en.topics} bộ từ theo tình huống`,
      `${count.ko.words} từ sơ cấp`,
      `${count.ko.phrases} mẫu câu giao tiếp`,
      `${count.ko.topics} bộ chủ đề, ${count.ko.grammar} bài ngữ pháp và ${count.ko.stories} truyện ngắn`,
      // "all of HSK 1 and HSK 2" is checked word by word in lib/chinesePack.test.ts
      // and lib/exams.test.ts.
      `${count.zh.words} từ (đủ từ vựng HSK 1 và HSK 2)`,
      `${count.zh.topics} bộ chủ đề, ${count.zh.grammar} bài ngữ pháp và ${count.zh.stories} truyện ngắn`,
    ])
      expect(page, claim).toContain(claim)
  })

  it('match the shipped content, in English', () => {
    const page = pageText('en')
    for (const claim of [
      `${atLeast(count.words, 'en')}words`,
      `${count.stories}short stories, tap for meanings`,
      `${count.en.phrases} English and ${count.ko.phrases} Korean phrases`,
      `English: ${count.en.stories} short stories`,
      `${count.en.grammar} grammar lessons explained`,
      `${count.en.topics} topic decks`,
      `${count.ko.words} beginner words`,
      `${count.ko.phrases} everyday phrases`,
      `${count.ko.topics} topic decks, ${count.ko.grammar} grammar lessons and ${count.ko.stories} short stories`,
      `${count.zh.words} words (all of HSK 1 and HSK 2)`,
      `${count.zh.topics} topic decks, ${count.zh.grammar} grammar lessons and ${count.zh.stories} short stories`,
    ])
      expect(page, claim).toContain(claim)
  })

  it('are never written into the page by hand', () => {
    const source = readFileSync('src/features/marketing/Landing.tsx', 'utf8')
    const handWritten =
      /\b\d[\d.,]*\+? (truyện|bài ngữ pháp|bộ (từ|chủ đề)|từ sơ cấp|mẫu câu|câu tiếng|short stories|grammar lessons|topic decks|beginner words|everyday phrases|English and)/
    expect(source).not.toMatch(handWritten)
  })
})
