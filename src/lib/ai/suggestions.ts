import type { PageContext } from '@/store/contextStore'

// Context- and level-aware suggested questions for the AI assistant — worded in
// plain, friendly Vietnamese (no jargon), scaling depth with the learner level.

export function suggestQuestions(
  ctx: PageContext,
  level: number,
  lang: 'vi' | 'en' = 'vi'
): string[] {
  if (lang === 'en') return suggestEnglish(ctx.word?.word, level)
  const w = ctx.word?.word
  if (w) {
    const base = [`Giải thích từ "${w}" cho mình`, `Cho ví dụ với "${w}"`]
    if (level <= 2) return [...base, `Mẹo nhớ từ "${w}"`, `Đặt 1 câu đơn giản với "${w}"`]
    if (level === 3)
      return [...base, `Những từ hay đi chung với "${w}"`, `Các từ cùng gốc với "${w}"`]
    if (level === 4)
      return [
        `"${w}" dùng khi trang trọng hay thân mật?`,
        `Thành ngữ / cụm liên quan "${w}"`,
        `Phân biệt "${w}" với từ gần nghĩa`,
      ]
    return [
      `Gốc của từ "${w}" (để dễ nhớ)`,
      `"${w}" khác gì mấy từ gần nghĩa?`,
      `Cách dùng "${w}" trong văn viết`,
    ]
  }

  // No focused word — general suggestions by level.
  if (level <= 2)
    return [
      'Giải thích từ "ability" và cho 1 ví dụ',
      'Mẹo nhớ từ "necessary"',
      'Kiểm tra mình 5 từ cơ bản',
    ]
  if (level === 3)
    return [
      'Phân biệt "affect" và "effect"',
      'Những từ hay đi chung với "make"',
      'Kiểm tra mình 5 từ',
    ]
  return [
    'Phân biệt: important, crucial, vital, essential',
    'Những từ hay đi chung với "research"',
    'Kiểm tra mình 5 từ khó kèm giải thích',
  ]
}

function suggestEnglish(w: string | undefined, level: number): string[] {
  if (w) {
    const base = [`Explain "${w}" to me`, `Give me examples with "${w}"`]
    if (level <= 2) return [...base, `A memory trick for "${w}"`, `One simple sentence with "${w}"`]
    if (level === 3)
      return [...base, `Words that go with "${w}"`, `Words from the same root as "${w}"`]
    if (level === 4)
      return [
        `Is "${w}" formal or casual?`,
        `Idioms and phrases with "${w}"`,
        `"${w}" vs. similar words`,
      ]
    return [
      `Where does "${w}" come from?`,
      `How is "${w}" different from its synonyms?`,
      `Using "${w}" in formal writing`,
    ]
  }
  if (level <= 2)
    return [
      'Explain "ability" with one example',
      'A memory trick for "necessary"',
      'Quiz me on 5 basic words',
    ]
  if (level === 3)
    return ['"affect" vs. "effect"', 'Words that go with "make"', 'Quiz me on 5 words']
  return [
    'important vs. crucial vs. vital vs. essential',
    'Words that go with "research"',
    'Quiz me on 5 hard words with explanations',
  ]
}
