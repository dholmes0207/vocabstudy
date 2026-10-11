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
export function quotaVerdict(used: number, limit: number, lang: 'vi' | 'en' = 'vi'): QuotaVerdict {
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
    message:
      lang === 'en'
        ? `You've used all ${limit} AI tutor questions for today. See you tomorrow!`
        : `Bạn đã dùng hết ${limit} lượt hỏi trợ lý AI cho hôm nay. Hẹn gặp lại vào ngày mai nhé!`,
  }
}

/** One row of public.ai_usage as PostgREST returns it. */
export interface UsageRow {
  user_id?: unknown
  used?: unknown
}

export interface UsageSummary {
  /** Distinct learners who asked the tutor anything today. */
  users: number
  /** Total requests counted today. */
  requests: number
}

/**
 * Roll today's usage rows into the two numbers an admin actually needs.
 *
 * `requests > 0` is the only hard proof the whole path works: the cap fails
 * open, so a silent counter and a working one look identical from outside.
 */
export function summarizeUsage(rows: unknown): UsageSummary {
  if (!Array.isArray(rows)) return { users: 0, requests: 0 }
  const seen = new Set<string>()
  let requests = 0
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const { user_id: id, used } = row as UsageRow
    if (typeof id !== 'string' || !id) continue
    if (typeof used !== 'number' || !Number.isFinite(used)) continue
    seen.add(id)
    requests += used
  }
  return { users: seen.size, requests }
}

/** Warn the learner this many requests before the cap. */
const HINT_THRESHOLD = 5

/**
 * A short nudge about the remaining allowance, or null when there is nothing
 * worth saying. Silence is the right answer whenever the server did not report
 * a real number — no cap configured, or the counter was unreachable — because
 * guessing at a number the learner will be judged against is worse than saying
 * nothing.
 */
export function quotaHint(
  remaining: number | null | undefined,
  lang: 'vi' | 'en' = 'vi'
): string | null {
  if (typeof remaining !== 'number' || !Number.isFinite(remaining)) return null
  if (remaining > HINT_THRESHOLD) return null
  const en = lang === 'en'
  if (remaining <= 0)
    return en
      ? 'That was your last question for today. See you tomorrow!'
      : 'Đó là lượt hỏi cuối cùng hôm nay. Hẹn gặp lại ngày mai nhé!'
  return en
    ? `${remaining} tutor questions left today.`
    : `Còn ${remaining} lượt hỏi trợ lý hôm nay.`
}
