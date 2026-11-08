import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The practice screens this device has opened ("/roleplay", "/games/blitz"…),
// so the home screen can suggest one not tried yet (lib/discover.ts) and the
// practice hub can mark the rest as new. Device-only; backed up through the
// vocab. prefix.

interface VisitedState {
  seen: string[]
  visit: (path: string) => void
}

export const useVisited = create<VisitedState>()(
  persist(
    (set) => ({
      seen: [],
      visit: (path) => set((s) => (s.seen.includes(path) ? s : { seen: [...s.seen, path] })),
    }),
    { name: 'vocab.visited.v1', version: 1 }
  )
)
