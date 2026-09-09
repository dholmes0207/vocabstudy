// Daily cap for the AI tutor. `/api/ai/chat` proxies to OpenAI on the project's
// own key, so without a cap a single account can spend the whole budget. The
// counter itself lives in Postgres (public.ai_usage, bumped atomically); this
// module only holds the arithmetic, so it can be tested on its own.

export interface QuotaVerdict {
  allowed: boolean
  /** Requests used today, including the one being judged. */
  used: number
  limit: number
  /** Requests left after this one; 0 once the cap is reached. */
  remaining: number
  /** Learner-facing explanation, set only when the request is refused. */
  message?: string
}

/** Parse the configured cap. 0 means "no cap"; anything invalid falls back. */
export function parseDailyLimit(raw: string | undefined, fallback: number): number {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return fallback
  if (!/^\d+$/.test(trimmed)) return fallback
  const n = Number(trimmed)
  return Number.isSafeInteger(n) && n >= 0 ? n : fallback
}

/**
 * Judge one request against the day's cap.
 *
 * A broken counter must never lock a learner out of the tutor, so a non-finite
 * or negative `used` is treated as "no evidence of overuse" and allowed.
 */
export function quotaVerdict(used: number, limit: number): QuotaVerdict {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0
  if (limit <= 0) {
    return { allowed: true, used: safeUsed, limit, remaining: Number.POSITIVE_INFINITY }
  }
  const remaining = Math.max(0, limit - safeUsed)
  if (safeUsed <= limit) return { allowed: true, used: safeUsed, limit, remaining }
  return {
    allowed: false,
    used: safeUsed,
    limit,
    remaining: 0,
    message: `Bạn đã dùng hết ${limit} lượt hỏi trợ lý AI cho hôm nay. Hẹn gặp lại vào ngày mai nhé!`,
  }
}
