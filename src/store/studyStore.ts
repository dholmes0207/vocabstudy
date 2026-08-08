import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LanguageProgress, SRSCard, StudyStats } from '@/types'
import { newCard, review } from '@/lib/srs'
import { today } from '@/lib/date'

interface StudyState {
  /** Progress keyed by language code, so each language is independent. */
  progress: Record<string, LanguageProgress>

  /** Record a review/answer for a word; creates the card if it is new. */
  recordAnswer: (code: string, wordId: number, correct: boolean) => void
  /** How many brand-new words have been introduced today for a language. */
  newIntroducedToday: (code: string) => number
  /** Wipe all progress for one language. */
  resetLanguage: (code: string) => void
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

      newIntroducedToday: (code) => {
        const lang = get().progress[code]
        if (!lang) return 0
        return lang.stats.newByDay[today()] ?? 0
      },

      resetLanguage: (code) =>
        set((state) => ({
          progress: { ...state.progress, [code]: emptyProgress() },
        })),

      replaceAll: (progress) => set({ progress }),
    }),
    {
      name: 'vocab.progress.v1',
      version: 1,
    },
  ),
)

function bump(rec: Record<number, number>, day: number): Record<number, number> {
  return { ...rec, [day]: (rec[day] ?? 0) + 1 }
}

/** Advance/reset the streak based on the last active day. */
function updateStreak(stats: StudyStats, day: number): Pick<StudyStats, 'streak' | 'lastStudyDay'> {
  if (stats.lastStudyDay === day) return { streak: stats.streak, lastStudyDay: day }
  if (stats.lastStudyDay === day - 1) return { streak: stats.streak + 1, lastStudyDay: day }
  return { streak: 1, lastStudyDay: day }
}

// ---------------------------------------------------------------------------
// Convenience selectors (call with the current language's card list).
// ---------------------------------------------------------------------------

/** All cards for a language as an array (empty if none). */
export function cardsOf(progress: Record<string, LanguageProgress>, code: string): SRSCard[] {
  const lang = progress[code]
  return lang ? Object.values(lang.cards) : []
}

export function statsOf(progress: Record<string, LanguageProgress>, code: string): StudyStats {
  return progress[code]?.stats ?? emptyStats()
}
