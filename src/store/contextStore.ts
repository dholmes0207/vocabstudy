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
  /**
   * A question some screen wants the assistant to answer (e.g. "is my sentence
   * right?"). The floating assistant opens itself and sends it once.
   */
  pendingAsk: string | null
  ask: (text: string) => void
  /** Hand over the pending question exactly once. */
  takeAsk: () => string | null
  /** Whether the floating assistant is open (lives here so ask() can open it). */
  assistantOpen: boolean
  setAssistantOpen: (open: boolean) => void
}

export const useContextStore = create<ContextState>((set, get) => ({
  title: 'Trang chủ',
  word: undefined,
  setContext: (ctx) => set({ title: ctx.title, word: ctx.word }),
  pendingAsk: null,
  ask: (text) => set({ pendingAsk: text, assistantOpen: true }),
  takeAsk: () => {
    const text = get().pendingAsk
    if (text !== null) set({ pendingAsk: null })
    return text
  },
  assistantOpen: false,
  setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
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
