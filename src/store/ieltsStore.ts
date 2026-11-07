import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Luyện IELTS" progress: the best score per reading passage, so the page can
// tick the ones done and offer a fresh one first. Device-only; backed up
// through the vocab. prefix.

export interface IeltsRecord {
  best: number
  total: number
}

interface IeltsState {
  reading: Record<string, IeltsRecord>
  recordReading: (id: string, correct: number, total: number) => void
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
    }),
    { name: 'vocab.ielts.v1', version: 1 }
  )
)
