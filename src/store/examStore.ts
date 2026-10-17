import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Best score in each exam's vocabulary check (docs/design/exam-track.md).
// Device-only like readingStore; the "vocab." prefix puts it in backups.

export interface ExamRecord {
  best: number
  total: number
  /** Epoch day of the latest attempt. */
  day: number
  tries: number
}

interface ExamState {
  records: Record<string, ExamRecord>
  record: (examId: string, correct: number, total: number, day: number) => void
}

export const useExam = create<ExamState>()(
  persist(
    (set) => ({
      records: {},
      record: (examId, correct, total, day) =>
        set((s) => {
          const prev = s.records[examId]
          return {
            records: {
              ...s.records,
              [examId]: {
                best: Math.max(prev?.best ?? 0, correct),
                total,
                day,
                tries: (prev?.tries ?? 0) + 1,
              },
            },
          }
        }),
    }),
    { name: 'vocab.exam.v1', version: 1 }
  )
)
