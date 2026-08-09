import type { PageContext } from '@/store/contextStore'

// Context- and level-aware suggested questions for the AI assistant.
// If the learner is focused on a specific word, suggestions target that word,
// with depth scaled to their level ("học 1 hiểu N").

export function suggestQuestions(ctx: PageContext, level: number): string[] {
  const w = ctx.word?.word
  if (w) {
    const base = [`Giải thích từ "${w}" cho mình`, `Cho ví dụ với "${w}"`]
    if (level <= 2) return [...base, `Mẹo ghi nhớ từ "${w}"`, `Đặt 1 câu đơn giản với "${w}"`]
    if (level === 3) return [...base, `Collocation hay gặp với "${w}"`, `Từ cùng họ với "${w}"`]
    if (level === 4)
      return [
        `Sắc thái & ngữ vực của "${w}"`,
        `Idiom/phrasal verb liên quan "${w}"`,
        `Phân biệt "${w}" với từ gần nghĩa`,
      ]
    return [
      `Gốc từ (etymology) của "${w}"`,
      `Collocation nâng cao với "${w}"`,
      `Nuance của "${w}" so với từ gần nghĩa`,
    ]
  }

  // No focused word — general suggestions by level.
  if (level <= 2)
    return [
      'Giải thích từ "ability" và cho 1 ví dụ',
      'Mẹo ghi nhớ từ "necessary"',
      'Kiểm tra mình 5 từ cơ bản',
    ]
  if (level === 3)
    return [
      'Phân biệt "affect" và "effect"',
      'Collocation thường gặp với "make"',
      'Kiểm tra mình 5 từ trình độ B1',
    ]
  return [
    'Phân biệt các từ chỉ "quan trọng": important, crucial, vital, essential',
    'Cho mình 5 collocation học thuật với "research"',
    'Kiểm tra mình 5 từ khó kèm giải thích nuance',
  ]
}
