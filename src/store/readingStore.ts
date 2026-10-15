import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recordReading, type ReadingProgress } from '@/lib/reading'

// "Đọc truyện ngắn" progress: best quiz score per story. Device-only (like
// phrases and grammar); included in the backup file via the vocab. prefix.

interface ReadingState {
  progress: ReadingProgress
  record: (storyId: string, correct: number, total: number) => void
}

export const useReading = create<ReadingState>()(
  persist(
    (set, get) => ({
      progress: {},
      record: (storyId, correct, total) =>
        set({ progress: recordReading(get().progress, storyId, correct, total) }),
    }),
    { name: 'vocab.reading.v1', version: 1 }
  )
)
