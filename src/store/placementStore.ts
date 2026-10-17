import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Placement results (docs/design/placement.md), per language. Device-only like
// readingStore; under the "vocab." prefix, so backups include it.

export interface PlacementResult {
  /** Index in the pack's order where new words start. */
  start: number
  /** Epoch day the test was taken. */
  day: number
  asked: number
  correct: number
}

interface PlacementState {
  results: Record<string, PlacementResult>
  setResult: (lang: string, result: PlacementResult) => void
  clear: (lang: string) => void
}

export const usePlacement = create<PlacementState>()(
  persist(
    (set) => ({
      results: {},
      setResult: (lang, result) => set((s) => ({ results: { ...s.results, [lang]: result } })),
      clear: (lang) =>
        set((s) => {
          if (!(lang in s.results)) return s
          const results = { ...s.results }
          delete results[lang]
          return { results }
        }),
    }),
    { name: 'vocab.placement.v1', version: 1 }
  )
)
