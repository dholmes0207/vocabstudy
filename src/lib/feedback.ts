// The in-app feedback form (docs/design/feedback.md). Pure rules shared by the
// browser and the Pages Function so both accept exactly the same message.

export const FEEDBACK_MIN = 10
export const FEEDBACK_MAX = 1000

export interface FeedbackInput {
  message: string
  name: string
  rating: number | null
  allowQuote: boolean
  page: string
}

/** A clean submission, or a reason it cannot be sent (bilingual pair). */
export function checkFeedback(
  raw: unknown
): { ok: true; value: FeedbackInput } | { ok: false; reason: [string, string] } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const message = typeof r.message === 'string' ? r.message.trim().replace(/\s+\n/g, '\n') : ''
  if ([...message].length < FEEDBACK_MIN)
    return {
      ok: false,
      reason: [
        `Viết thêm một chút nhé (tối thiểu ${FEEDBACK_MIN} ký tự).`,
        `Please write a little more (at least ${FEEDBACK_MIN} characters).`,
      ],
    }
  if ([...message].length > FEEDBACK_MAX)
    return {
      ok: false,
      reason: [
        `Góp ý tối đa ${FEEDBACK_MAX} ký tự.`,
        `Feedback can be at most ${FEEDBACK_MAX} characters.`,
      ],
    }
  const rating =
    typeof r.rating === 'number' && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5
      ? r.rating
      : null
  const name = typeof r.name === 'string' ? r.name.replace(/\s+/g, ' ').trim().slice(0, 50) : ''
  const page = typeof r.page === 'string' ? r.page.split(/[?#]/)[0].slice(0, 200) : ''
  return {
    ok: true,
    // Quoting needs a name to put next to the words.
    value: { message, name, rating, allowQuote: r.allowQuote === true && name !== '', page },
  }
}
