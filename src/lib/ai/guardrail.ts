// ============================================================================
// CLIENT-SIDE GUARDRAIL (GR-4)
// A cheap first layer that runs before any API call: structural validation to
// block empty / oversized input and save tokens. Topical scope enforcement is
// intentionally left to the model (GR-1/GR-2) because keyword blocking is
// brittle — e.g. "code" is itself a vocabulary word a learner may ask about.
// ============================================================================

export const MAX_INPUT_CHARS = 1000

export interface PreCheck {
  ok: boolean
  /** User-facing message when not ok. */
  message?: string
}

export function preCheckInput(text: string, lang: 'vi' | 'en' = 'vi'): PreCheck {
  const t = text.trim()
  const en = lang === 'en'
  if (!t)
    return {
      ok: false,
      message: en ? 'Type a question about vocabulary 🙂' : 'Bạn nhập câu hỏi về từ vựng nhé 🙂',
    }
  if (t.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      message: en
        ? `That's a bit long (max ${MAX_INPUT_CHARS} characters). Please shorten it.`
        : `Câu hỏi hơi dài (tối đa ${MAX_INPUT_CHARS} ký tự). Bạn rút gọn giúp mình nhé.`,
    }
  }
  return { ok: true }
}

/** Suggested in-scope prompts shown as chips to steer valid usage. */
export const SUGGESTED_PROMPTS: string[] = [
  'Giải thích từ "ability" và cho 2 ví dụ',
  'Phân biệt "affect" và "effect"',
  'Cho mình 3 câu ví dụ với "improve"',
  'Mẹo ghi nhớ từ "necessary"',
  'Kiểm tra mình 5 từ vựng ngẫu nhiên',
  'Các collocation thường gặp với "make"',
]
