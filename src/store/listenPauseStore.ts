import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// "Hiện không nghe được" (docs/design/learning-depth.md): on a bus or in a
// library, listening questions turn into reading ones for a while instead of
// being failed or skipped. Device-only; survives a reload so the next session
// in the same quarter-hour stays quiet too.

export const LISTEN_PAUSE_MINUTES = 15

interface ListenPauseState {
  /** Epoch ms until which listening questions are shown as reading ones. */
  until: number
  pause: (now?: number) => void
  resume: () => void
}

export const useListenPause = create<ListenPauseState>()(
  persist(
    (set) => ({
      until: 0,
      pause: (now = Date.now()) => set({ until: now + LISTEN_PAUSE_MINUTES * 60_000 }),
      resume: () => set({ until: 0 }),
    }),
    { name: 'vocab.listenpause.v1', version: 1 }
  )
)

/** Whether listening is paused right now (checked on each render). */
export function useListenPaused(now: () => number = Date.now): boolean {
  return useListenPause((s) => s.until > now())
}
