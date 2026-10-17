import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Lưu để học" (docs/design/saved-words.md): words picked while reading, waiting
// for a Learn session. Device-only like notesStore and readingStore — it never
// touches the SRS data that syncs — and under the "vocab." prefix, so the
// backup file includes it.

interface SavedWordsState {
  /** lang code → word ids, oldest first. */
  saved: Record<string, number[]>
  toggle: (lang: string, wordId: number) => void
  remove: (lang: string, wordIds: readonly number[]) => void
}

export const useSavedWords = create<SavedWordsState>()(
  persist(
    (set) => ({
      saved: {},
      toggle: (lang, wordId) =>
        set((s) => {
          const list = s.saved[lang] ?? []
          const next = list.includes(wordId)
            ? list.filter((id) => id !== wordId)
            : [...list, wordId]
          return { saved: { ...s.saved, [lang]: next } }
        }),
      remove: (lang, wordIds) =>
        set((s) => {
          const drop = new Set(wordIds)
          const list = s.saved[lang] ?? []
          if (!list.some((id) => drop.has(id))) return s
          return { saved: { ...s.saved, [lang]: list.filter((id) => !drop.has(id)) } }
        }),
    }),
    { name: 'vocab.saved.v1', version: 1 }
  )
)

const NONE: readonly number[] = Object.freeze([])

/** Saved word ids for one language (a stable empty array when there are none). */
export function useSavedIds(lang: string): readonly number[] {
  return useSavedWords((s) => s.saved[lang] ?? NONE)
}
