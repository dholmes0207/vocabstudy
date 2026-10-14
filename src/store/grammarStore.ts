import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recordAttempt, type GrammarProgress } from '@/lib/grammar'
import { today } from '@/lib/date'

// "Ngữ pháp căn bản" progress: best score per unit. Device-only for now (like
// phrases); included in the backup file via the vocab. prefix.

interface GrammarState {
  progress: GrammarProgress
  record: (unitId: string, correct: number, total: number) => void
}

export const useGrammar = create<GrammarState>()(
  persist(
    (set, get) => ({
      progress: {},
      record: (unitId, correct, total) =>
        set({ progress: recordAttempt(get().progress, unitId, correct, total, today()) }),
    }),
    { name: 'vocab.grammar.v1', version: 1 }
  )
)
