import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSettings } from './settingsStore'
import { keyboardGuide } from '@/lib/keyboardHelp'

// "Làm không cần gõ" (docs/design/typing-help.md): for someone who has no
// Hangul or pinyin keyboard yet, typing questions become tap-and-choose ones —
// dictation by tiles, a gap by its four options. Per language and per device:
// the phone may have the keyboard while the office PC does not.

interface NoTypingState {
  /** Pack codes where typing is off. */
  langs: Record<string, true>
  set: (code: string, on: boolean) => void
}

export const useNoTypingStore = create<NoTypingState>()(
  persist(
    (set) => ({
      langs: {},
      set: (code, on) =>
        set((s) => {
          const langs = { ...s.langs }
          if (on) langs[code] = true
          else delete langs[code]
          return { langs }
        }),
    }),
    { name: 'vocab.notyping.v1', version: 1 }
  )
)

/**
 * Whether typing is off for the current pack. Only packs with a keyboard guide
 * can turn it off: English is typed on the keyboard everyone already has.
 */
export function useNoTyping(): boolean {
  const code = useSettings((s) => s.currentLang)
  const off = useNoTypingStore((s) => !!s.langs[code])
  return off && keyboardGuide(code) !== null
}
