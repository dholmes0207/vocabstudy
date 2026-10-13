import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recordPhrase, type PhraseProgress } from '@/lib/phrases'
import { today } from '@/lib/date'

// "Mẫu câu giao tiếp" progress: right/wrong per phrase. Device-only for now
// (like the game records); included in the backup via the vocab. prefix.

interface PhrasesState {
  progress: PhraseProgress
  record: (id: number, correct: boolean) => void
}

export const usePhrases = create<PhrasesState>()(
  persist(
    (set, get) => ({
      progress: {},
      record: (id, correct) =>
        set({ progress: recordPhrase(get().progress, id, correct, today()) }),
    }),
    { name: 'vocab.phrases.v1', version: 1 }
  )
)
