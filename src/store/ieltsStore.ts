import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Luyện IELTS" progress: the best score per reading passage (True/False/Not Given and Matching headings), so the page can
// tick the ones done and offer a fresh one first. Device-only; backed up
// through the vocab. prefix.

export interface IeltsRecord {
  best: number
  total: number
}

interface IeltsState {
  reading: Record<string, IeltsRecord>
  recordReading: (id: string, correct: number, total: number) => void
  /** Best Matching headings score per passage. */
  headings: Record<string, IeltsRecord>
  recordHeadings: (id: string, correct: number, total: number) => void
}

export const useIelts = create<IeltsState>()(
  persist(
    (set) => ({
      reading: {},
      recordReading: (id, correct, total) =>
        set((s) => ({
          reading: {
            ...s.reading,
            [id]: { best: Math.max(correct, s.reading[id]?.best ?? 0), total },
          },
        })),
      headings: {},
      recordHeadings: (id, correct, total) =>
        set((s) => ({
          headings: {
            ...s.headings,
            [id]: { best: Math.max(correct, s.headings[id]?.best ?? 0), total },
          },
        })),
    }),
    { name: 'vocab.ielts.v1', version: 1 }
  )
)
