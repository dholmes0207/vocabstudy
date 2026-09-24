import { useEffect } from 'react'
import { create } from 'zustand'

// Transient UI state shared across the shell. Not persisted.
//
// `immersive` is on while a study session is on screen: on a phone the bottom
// navigation and the floating assistant step aside, and the session's main
// action bar sticks to the bottom of the screen (see `.session-actions`).
// A counter rather than a boolean, so nested/overlapping sessions can't switch
// it off for each other.

interface UiState {
  immersiveCount: number
  enterImmersive: () => void
  leaveImmersive: () => void
}

export const useUi = create<UiState>((set) => ({
  immersiveCount: 0,
  enterImmersive: () => set((s) => ({ immersiveCount: s.immersiveCount + 1 })),
  leaveImmersive: () => set((s) => ({ immersiveCount: Math.max(0, s.immersiveCount - 1) })),
}))

/** Put the shell in focus mode for as long as the calling component is mounted. */
export function useImmersive(): void {
  useEffect(() => {
    useUi.getState().enterImmersive()
    return () => useUi.getState().leaveImmersive()
  }, [])
}

export const useIsImmersive = () => useUi((s) => s.immersiveCount > 0)
