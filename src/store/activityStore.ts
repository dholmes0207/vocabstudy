import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Finished sessions of the skills that keep no record of their own (listening,
// dictation, speaking, sentence building), per language pack. The learning
// path (lib/learningPath.ts) counts them; device-only like grammar progress,
// and part of the backup file through the vocab. prefix.

export type ActivityKind = 'dictation' | 'listen' | 'speaking' | 'order' | 'ielts-reading'

export type ActivityCounts = Partial<Record<ActivityKind, number>>

/** Nothing logged yet; one shared object so selectors stay stable. */
export const NO_ACTIVITY: ActivityCounts = {}

interface ActivityState {
  counts: Record<string, ActivityCounts>
  log: (code: string, kind: ActivityKind) => void
}

export const useActivity = create<ActivityState>()(
  persist(
    (set) => ({
      counts: {},
      log: (code, kind) =>
        set((s) => {
          const mine = s.counts[code] ?? {}
          return { counts: { ...s.counts, [code]: { ...mine, [kind]: (mine[kind] ?? 0) + 1 } } }
        }),
    }),
    { name: 'vocab.activity.v1', version: 1 }
  )
)
