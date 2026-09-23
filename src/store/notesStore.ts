import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { today } from '@/lib/date'

// "Câu của bạn" — a sentence the learner made up with a word. Generating a
// sentence about your own life is one of the strongest ways to remember a word
// (generation + self-reference), so the sentence is shown again whenever the
// word comes back.
//
// Kept apart from study progress on purpose: it never touches the SRS data that
// syncs to Supabase. It lives on this device, and — being under the "vocab."
// prefix — it is included in the backup file.

export interface MySentence {
  text: string
  /** Epoch day it was last written. */
  day: number
}

interface NotesState {
  /** lang code → word id → the learner's sentence. */
  sentences: Record<string, Record<number, MySentence>>
  /** Save (or, with empty text, delete) the learner's sentence for a word. */
  setSentence: (lang: string, wordId: number, text: string) => void
}

export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      sentences: {},
      setSentence: (lang, wordId, text) =>
        set((state) => {
          const forLang = { ...(state.sentences[lang] ?? {}) }
          const clean = text.trim().replace(/\s+/g, ' ')
          if (clean) forLang[wordId] = { text: clean, day: today() }
          else delete forLang[wordId]
          return { sentences: { ...state.sentences, [lang]: forLang } }
        }),
    }),
    { name: 'vocab.notes.v1', version: 1 }
  )
)

/** The learner's sentence for a word in the active language, if any. */
export function useMySentence(lang: string, wordId: number): MySentence | undefined {
  return useNotes((s) => s.sentences[lang]?.[wordId])
}
