import { useEffect } from 'react'
import { create } from 'zustand'

// Tracks WHAT the learner is currently looking at, so the floating AI assistant
// can read the page context (route + focused word) and tailor its suggestions
// and answers. Not persisted — it only reflects the live view.

export interface FocusedWord {
  word: string
  meaning: string
  ipa?: string
  pos?: string
  exampleEn?: string
}

export interface PageContext {
  /** Short human label, e.g. "Đang ôn tập" or 'Đang xem từ "ability"'. */
  title: string
  /** The word currently in focus, if any. */
  word?: FocusedWord
}

interface ContextState extends PageContext {
  setContext: (ctx: PageContext) => void
}

export const useContextStore = create<ContextState>((set) => ({
  title: 'Trang chủ',
  word: undefined,
  setContext: (ctx) => set({ title: ctx.title, word: ctx.word }),
}))

/**
 * Register the current page context for the AI assistant. Call from a screen;
 * it updates whenever the provided values change.
 */
export function useProvideContext(title: string, word?: FocusedWord): void {
  const setContext = useContextStore((s) => s.setContext)
  // Serialize word to a stable dependency.
  const wordKey = word ? `${word.word}::${word.meaning}` : ''
  useEffect(() => {
    setContext({ title, word })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, wordKey, setContext])
}
