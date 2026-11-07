import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Personal bests for the games — a reason to play "one more round".
// Device-only (like "Câu của bạn"); included in the backup via the vocab. prefix.

interface GamesState {
  /** Fastest "Ghép cặp" round, in seconds (null = never finished one). */
  bestMatchSeconds: number | null
  /** Fewest mistakes in a full "Xếp câu" round (null = never finished one). */
  bestOrderMistakes: number | null
  /** Highest "Đúng hay sai?" score (null = never played). */
  bestBlitz: number | null
  plays: number
  /** Record a finished round; returns true when it set a new personal best. */
  finishMatch: (seconds: number) => boolean
  finishOrder: (mistakes: number) => boolean
  finishBlitz: (score: number) => boolean
}

export const useGames = create<GamesState>()(
  persist(
    (set, get) => ({
      bestMatchSeconds: null,
      bestOrderMistakes: null,
      bestBlitz: null,
      plays: 0,
      finishMatch: (seconds) => {
        const best = get().bestMatchSeconds
        const record = best === null || seconds < best
        set({ plays: get().plays + 1, ...(record ? { bestMatchSeconds: seconds } : {}) })
        return record
      },
      finishOrder: (mistakes) => {
        const best = get().bestOrderMistakes
        const record = best === null || mistakes < best
        set({ plays: get().plays + 1, ...(record ? { bestOrderMistakes: mistakes } : {}) })
        return record
      },
      finishBlitz: (score) => {
        const best = get().bestBlitz
        const record = score > 0 && (best === null || score > best)
        set({ plays: get().plays + 1, ...(record ? { bestBlitz: score } : {}) })
        return record
      },
    }),
    { name: 'vocab.games.v1', version: 1 }
  )
)
