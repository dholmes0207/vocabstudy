import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// TOEIC Part 5 questions of the bank missed in practice, by sentence, so they
// can be done again (lib/toeicPart5.ts retryRound). A question answered right
// leaves the list. Device-only like examStore; the "vocab." prefix puts it in
// backups.

/** The list keeps at most this many, the latest misses. */
export const RETRY_MAX = 50

interface RetryState {
  part5: string[]
  /** Record an answer to a bank question: a miss joins the list, a right answer leaves it. */
  answer: (sentence: string, correct: boolean) => void
}

export const useRetry = create<RetryState>()(
  persist(
    (set) => ({
      part5: [],
      answer: (sentence, correct) =>
        set((s) => {
          const rest = s.part5.filter((x) => x !== sentence)
          return { part5: correct ? rest : [...rest, sentence].slice(-RETRY_MAX) }
        }),
    }),
    { name: 'vocab.retry.v1', version: 1 }
  )
)
