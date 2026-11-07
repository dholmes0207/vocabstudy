import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The learning path (lib/learningPath.ts) keeps its own small memory per pack:
// the highest level already celebrated, so a level-up throws confetti and gives
// its XP once. Device-only; backed up through the vocab. prefix.

interface PathState {
  celebrated: Record<string, number>
  celebrate: (code: string, level: number) => void
}

export const usePath = create<PathState>()(
  persist(
    (set) => ({
      celebrated: {},
      celebrate: (code, level) =>
        set((s) => ({
          celebrated: { ...s.celebrated, [code]: Math.max(level, s.celebrated[code] ?? 0) },
        })),
    }),
    { name: 'vocab.path.v1', version: 1 }
  )
)
