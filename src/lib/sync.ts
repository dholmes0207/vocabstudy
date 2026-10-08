import type { LanguageProgress, SRSCard, StudyStats } from '@/types'
import { mergeStickers } from './stickers'

// ============================================================================
// Merging local progress with the server copy.
//
// Pulling used to be a blind overwrite: whatever Supabase returned replaced
// whatever was in localStorage. That quietly deleted work in two ordinary
// situations — studying while the connection is flaky (the pull fails, pushes
// stay blocked, the session lives only on the device) and studying on a second
// device. Merging is the only safe direction of travel, so this module answers
// one question: given two versions of the same learner's progress, what does
// the union look like?
//
// The rules are deliberately conservative:
//   * a card either side knows about survives;
//   * for a card both sides know, the side with the more recent review wins;
//   * aggregate counters take the maximum, never the sum — summing would double
//     count everything both sides already agreed on.
// A merge can therefore never show the learner less work than they had.
// ============================================================================

function emptyStats(): StudyStats {
  return {
    streak: 0,
    lastStudyDay: null,
    totalReviews: 0,
    totalCorrect: 0,
    xp: 0,
    newByDay: {},
    reviewsByDay: {},
  }
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function dayMap(v: unknown): Record<number, number> {
  if (!v || typeof v !== 'object') return {}
  const out: Record<number, number> = {}
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    const day = Number(k)
    if (Number.isFinite(day) && typeof n === 'number') out[day] = n
  }
  return out
}

/** Coerce anything (including a malformed server row) into usable progress. */
function safeProgress(p: LanguageProgress | undefined | null): LanguageProgress {
  const cards = p?.cards && typeof p.cards === 'object' ? (p.cards as Record<number, SRSCard>) : {}
  const s = (p?.stats ?? {}) as Partial<StudyStats>
  const base = emptyStats()
  return {
    cards,
    stats: {
      streak: num(s.streak, base.streak),
      lastStudyDay: typeof s.lastStudyDay === 'number' ? s.lastStudyDay : base.lastStudyDay,
      totalReviews: num(s.totalReviews, base.totalReviews),
      totalCorrect: num(s.totalCorrect, base.totalCorrect),
      xp: num(s.xp, base.xp),
      newByDay: dayMap(s.newByDay),
      reviewsByDay: dayMap(s.reviewsByDay),
      shields: num(s.shields, 0),
      bestStreak: num(s.bestStreak, num(s.streak, 0)),
      shieldUsedDay: typeof s.shieldUsedDay === 'number' ? s.shieldUsedDay : null,
      stickers: dayMap(s.stickers),
    },
  }
}

/** Day of the card's last review; never-reviewed sorts before everything. */
function lastActivity(c: SRSCard): number {
  return typeof c.lastReviewedDay === 'number' ? c.lastReviewedDay : -1
}

/** How many answers the card has recorded — the same-day tie-breaker. */
function answersOn(c: SRSCard): number {
  return num(c.correctCount) + num(c.wrongCount)
}

/** The more advanced of two versions of the same card. */
function preferred(a: SRSCard, b: SRSCard): SRSCard {
  const byDay = lastActivity(a) - lastActivity(b)
  if (byDay !== 0) return byDay > 0 ? a : b
  const byWork = answersOn(a) - answersOn(b)
  if (byWork !== 0) return byWork > 0 ? a : b
  return num(a.box) >= num(b.box) ? a : b
}

function maxDayMaps(a: Record<number, number>, b: Record<number, number>): Record<number, number> {
  const out: Record<number, number> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const day = Number(k)
    out[day] = Math.max(out[day] ?? 0, v)
  }
  return out
}

/**
 * Union of two versions of one language's progress. Order-independent: merging
 * A into B gives the same result as merging B into A.
 */
export function mergeProgress(
  local: LanguageProgress | undefined | null,
  remote: LanguageProgress | undefined | null
): LanguageProgress {
  const a = safeProgress(local)
  const b = safeProgress(remote)

  const cards: Record<number, SRSCard> = { ...a.cards }
  for (const [key, card] of Object.entries(b.cards)) {
    const id = Number(key)
    const mine = cards[id]
    cards[id] = mine ? preferred(mine, card) : card
  }

  const lastStudyDay =
    a.stats.lastStudyDay === null && b.stats.lastStudyDay === null
      ? null
      : Math.max(a.stats.lastStudyDay ?? -1, b.stats.lastStudyDay ?? -1)

  return {
    cards,
    stats: {
      streak: Math.max(a.stats.streak, b.stats.streak),
      lastStudyDay,
      totalReviews: Math.max(a.stats.totalReviews, b.stats.totalReviews),
      totalCorrect: Math.max(a.stats.totalCorrect, b.stats.totalCorrect),
      xp: Math.max(a.stats.xp, b.stats.xp),
      newByDay: maxDayMaps(a.stats.newByDay, b.stats.newByDay),
      reviewsByDay: maxDayMaps(a.stats.reviewsByDay, b.stats.reviewsByDay),
      // Shields follow whichever device studied last; the record is the best of both.
      shields:
        (a.stats.lastStudyDay ?? -1) >= (b.stats.lastStudyDay ?? -1)
          ? (a.stats.shields ?? 0)
          : (b.stats.shields ?? 0),
      bestStreak: Math.max(
        a.stats.bestStreak ?? a.stats.streak,
        b.stats.bestStreak ?? b.stats.streak
      ),
      shieldUsedDay:
        Math.max(a.stats.shieldUsedDay ?? -1, b.stats.shieldUsedDay ?? -1) >= 0
          ? Math.max(a.stats.shieldUsedDay ?? -1, b.stats.shieldUsedDay ?? -1)
          : null,
      stickers: mergeStickers(a.stats.stickers ?? {}, b.stats.stickers ?? {}),
    },
  }
}
