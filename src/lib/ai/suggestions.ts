import type { PageContext } from '@/store/contextStore'

// Context- and level-aware suggested questions for the AI assistant — worded in
// plain, friendly Vietnamese (no jargon), scaling depth with the learner level.

export function suggestQuestions(ctx: PageContext, level: number): string[] {
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
