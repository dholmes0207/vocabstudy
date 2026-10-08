import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LanguageProgress, SRSCard, StudyStats } from '@/types'
import { newCard, review } from '@/lib/srs'
import { today } from '@/lib/date'
import { nextStreak } from '@/lib/motivation'
import { pickSticker } from '@/lib/stickers'

/**
 * Stable stand-in for "this language has no progress yet". Screens read
 * `progress?.cards ?? NO_CARDS`; a fresh `{}` there would be a new reference on
 * every render and would silently defeat every `useMemo` that depends on it.
 */
export const NO_CARDS: Readonly<Record<number, SRSCard>> = Object.freeze({})

interface StudyState {
  /** Progress keyed by language code, so each language is independent. */
  progress: Record<string, LanguageProgress>

  /** Record a review/answer for a word; creates the card if it is new. */
  recordAnswer: (code: string, wordId: number, correct: boolean) => void
  /**
   * XP from play (games): counts as a study day for the streak but never
   * touches an SRS card — see lib/games.ts.
   */
  addPlayXp: (code: string, xp: number) => void
  /** Open the day's gift (once per day; a no-op if already opened). */
  claimSticker: (code: string, day: number) => void
  /** How many brand-new words have been introduced today for a language. */
  newIntroducedToday: (code: string) => number
  /** Wipe all progress for one language. */
  resetLanguage: (code: string) => void
  /** Replace one language's progress (used by server sync). */
  setLanguageProgress: (code: string, lang: LanguageProgress) => void
  /** Replace the whole progress map (used by backup import). */
  replaceAll: (progress: Record<string, LanguageProgress>) => void
}

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

function emptyProgress(): LanguageProgress {
  return { cards: {}, stats: emptyStats() }
}

/** XP awarded per answer (a little more for a correct one). */
const XP_CORRECT = 10
const XP_WRONG = 3

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      progress: {},

      recordAnswer: (code, wordId, correct) => {
        const day = today()
        set((state) => {
          const lang = state.progress[code] ?? emptyProgress()
          const existing = lang.cards[wordId]
          const isNew = !existing

          const base = existing ?? newCard(wordId, day)
          const updated = review(base, correct, day)

          const stats: StudyStats = {
            ...lang.stats,
            totalReviews: lang.stats.totalReviews + 1,
            totalCorrect: lang.stats.totalCorrect + (correct ? 1 : 0),
            xp: lang.stats.xp + (correct ? XP_CORRECT : XP_WRONG),
            reviewsByDay: bump(lang.stats.reviewsByDay, day),
            newByDay: isNew ? bump(lang.stats.newByDay, day) : lang.stats.newByDay,
            ...updateStreak(lang.stats, day),
          }

          return {
            progress: {
              ...state.progress,
              [code]: {
                cards: { ...lang.cards, [wordId]: updated },
                stats,
              },
            },
          }
        })
      },

      addPlayXp: (code, xp) => {
        if (!(xp > 0)) return
        const day = today()
        set((state) => {
          const lang = state.progress[code] ?? emptyProgress()
          const stats: StudyStats = {
            ...lang.stats,
            xp: lang.stats.xp + Math.round(xp),
            ...updateStreak(lang.stats, day),
          }
          return { progress: { ...state.progress, [code]: { cards: lang.cards, stats } } }
        })
      },

      claimSticker: (code, day) => {
        set((state) => {
          const lang = state.progress[code]
          if (!lang) return state
          const owned = lang.stats.stickers ?? {}
          if (owned[day] !== undefined) return state
          const stickers = { ...owned, [day]: pickSticker(owned, day) }
          return {
            progress: {
              ...state.progress,
              [code]: { ...lang, stats: { ...lang.stats, stickers } },
            },
          }
        })
      },

      newIntroducedToday: (code) => {
        const lang = get().progress[code]
        if (!lang) return 0
        return lang.stats.newByDay[today()] ?? 0
      },

      resetLanguage: (code) =>
        set((state) => ({
          progress: { ...state.progress, [code]: emptyProgress() },
        })),

      setLanguageProgress: (code, lang) =>
        set((state) => ({ progress: { ...state.progress, [code]: lang } })),

      replaceAll: (progress) => set({ progress }),
    }),
    {
      name: 'vocab.progress.v1',
      version: 1,
    }
  )
)

function bump(rec: Record<number, number>, day: number): Record<number, number> {
  return { ...rec, [day]: (rec[day] ?? 0) + 1 }
}

/** Advance/reset the streak based on the last active day (one missed day can be shielded). */
function updateStreak(stats: StudyStats, day: number) {
  return nextStreak(stats, day)
}

// ---------------------------------------------------------------------------
// Convenience selectors (call with the current language's card list).
// ---------------------------------------------------------------------------

/**
 * Coerce an arbitrary stored/synced blob into a well-formed LanguageProgress,
 * filling any missing stats fields. Never trust external data blindly.
 */
export function normalizeProgress(data: unknown): LanguageProgress {
  const d = (data ?? {}) as Partial<LanguageProgress>
  const cards = d.cards && typeof d.cards === 'object' ? (d.cards as Record<number, SRSCard>) : {}
  const s = (d.stats ?? {}) as Partial<StudyStats>
  const base = emptyStats()
  const stats: StudyStats = {
    streak: s.streak ?? base.streak,
    lastStudyDay: s.lastStudyDay ?? base.lastStudyDay,
    totalReviews: s.totalReviews ?? base.totalReviews,
    totalCorrect: s.totalCorrect ?? base.totalCorrect,
    xp: s.xp ?? base.xp,
    newByDay: s.newByDay ?? base.newByDay,
    reviewsByDay: s.reviewsByDay ?? base.reviewsByDay,
    shields: typeof s.shields === 'number' ? s.shields : 0,
    bestStreak: typeof s.bestStreak === 'number' ? s.bestStreak : (s.streak ?? 0),
    shieldUsedDay: typeof s.shieldUsedDay === 'number' ? s.shieldUsedDay : null,
    stickers: s.stickers && typeof s.stickers === 'object' ? s.stickers : {},
  }
  return { cards, stats }
}

/** All cards for a language as an array (empty if none). */
export function cardsOf(progress: Record<string, LanguageProgress>, code: string): SRSCard[] {
  const lang = progress[code]
  return lang ? Object.values(lang.cards) : []
}

export function statsOf(progress: Record<string, LanguageProgress>, code: string): StudyStats {
  return progress[code]?.stats ?? emptyStats()
}
