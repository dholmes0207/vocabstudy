import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Luyện IELTS" progress: the best score per reading passage (True/False/Not Given, Matching headings, Summary completion, Matching information, Sentence completion), so the page can
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
  /** Best Summary completion score per passage. */
  summary: Record<string, IeltsRecord>
  recordSummary: (id: string, correct: number, total: number) => void
  /** Best Matching information score per passage. */
  matching: Record<string, IeltsRecord>
  recordMatching: (id: string, correct: number, total: number) => void
  /** Best Sentence completion score per passage. */
  completion: Record<string, IeltsRecord>
  recordCompletion: (id: string, correct: number, total: number) => void
  /** Best "Choose TWO" score per passage. */
  chooseTwo: Record<string, IeltsRecord>
  recordChooseTwo: (id: string, correct: number, total: number) => void
  /** Best Yes / No / Not Given score per opinion passage. */
  opinion: Record<string, IeltsRecord>
  recordOpinion: (id: string, correct: number, total: number) => void
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
      summary: {},
      recordSummary: (id, correct, total) =>
        set((s) => ({
          summary: {
            ...s.summary,
            [id]: { best: Math.max(correct, s.summary[id]?.best ?? 0), total },
          },
        })),
      matching: {},
      recordMatching: (id, correct, total) =>
        set((s) => ({
          matching: {
            ...s.matching,
            [id]: { best: Math.max(correct, s.matching[id]?.best ?? 0), total },
          },
        })),
      chooseTwo: {},
      recordChooseTwo: (id, correct, total) =>
        set((s) => ({
          chooseTwo: {
            ...s.chooseTwo,
            [id]: { best: Math.max(correct, s.chooseTwo[id]?.best ?? 0), total },
          },
        })),
      completion: {},
      recordCompletion: (id, correct, total) =>
        set((s) => ({
          completion: {
            ...s.completion,
            [id]: { best: Math.max(correct, s.completion[id]?.best ?? 0), total },
          },
        })),
      opinion: {},
      recordOpinion: (id, correct, total) =>
        set((s) => ({
          opinion: {
            ...s.opinion,
            [id]: { best: Math.max(correct, s.opinion[id]?.best ?? 0), total },
          },
        })),
    }),
    { name: 'vocab.ielts.v1', version: 1 }
  )
)
