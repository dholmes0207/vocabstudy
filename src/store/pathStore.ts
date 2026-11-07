import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The learning path (lib/learningPath.ts) keeps its own small memory per pack:
// the highest level already celebrated, so a level-up throws confetti and gives
// its XP once, and the level tests won (lib/levelTest.ts), each of which opens
// the level after it. Device-only; backed up through the vocab. prefix.

interface PathState {
  celebrated: Record<string, number>
  celebrate: (code: string, level: number) => void
  /** Levels whose test was won, per pack. */
  passed: Record<string, number[]>
  pass: (code: string, level: number) => void
}

/** Nothing won yet; one shared array so selectors stay stable. */
export const NO_PASSED: number[] = []

/** The highest level a pack's won tests open: one past the best test won. */
export const openedByTests = (passed: readonly number[]): number =>
  passed.length ? Math.max(...passed) + 1 : 1

export const usePath = create<PathState>()(
  persist(
    (set) => ({
      celebrated: {},
      celebrate: (code, level) =>
        set((s) => ({
          celebrated: { ...s.celebrated, [code]: Math.max(level, s.celebrated[code] ?? 0) },
        })),
      passed: {},
      pass: (code, level) =>
        set((s) => {
          const mine = s.passed[code] ?? []
          return mine.includes(level) ? s : { passed: { ...s.passed, [code]: [...mine, level] } }
        }),
    }),
    { name: 'vocab.path.v1', version: 1 }
  )
)
