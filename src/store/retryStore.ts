import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Part5Kind } from '@/lib/toeicPart5'

// TOEIC Part 5 questions of the bank missed in practice, by sentence, so they
// can be done again (lib/toeicPart5.ts retryRound). A question answered right
// leaves the list. Also every TOEIC answer by Part, every Part 5 answer, and every HSK practice answer,
// counted by kind of question, so the weakest kind shows across rounds
// (weakestKind). Device-only like examStore; the "vocab." prefix puts it in
// backups.

/** The list keeps at most this many, the latest misses. */
export const RETRY_MAX = 50

interface RetryState {
  part5: string[]
  /** [right, asked] per kind of Part 5 question, all rounds together. */
  kinds: Partial<Record<Part5Kind, [number, number]>>
  /** Count one Part 5 answer of a kind. */
  tally: (kind: Part5Kind, correct: boolean) => void
  /** [right, asked] per HSK level and kind of question, keyed "hsk1:judge". */
  hsk: Record<string, [number, number]>
  /** Count one HSK practice answer of a kind at a level. */
  tallyHsk: (level: string, kind: string, correct: boolean) => void
  /** [right, asked] per TOEIC Part ("1"…"7"), all rounds together. */
  parts: Record<string, [number, number]>
  /** Count one TOEIC answer of a Part. */
  tallyPart: (part: number, correct: boolean) => void
  /** Record an answer to a bank question: a miss joins the list, a right answer leaves it. */
  answer: (sentence: string, correct: boolean) => void
}

export const useRetry = create<RetryState>()(
  persist(
    (set) => ({
      part5: [],
      kinds: {},
      hsk: {},
      parts: {},
      tallyPart: (part, correct) =>
        set((s) => {
          const [right, asked] = s.parts[part] ?? [0, 0]
          return { parts: { ...s.parts, [part]: [right + (correct ? 1 : 0), asked + 1] } }
        }),
      tallyHsk: (level, kind, correct) =>
        set((s) => {
          const key = `${level}:${kind}`
          const [right, asked] = s.hsk[key] ?? [0, 0]
          return { hsk: { ...s.hsk, [key]: [right + (correct ? 1 : 0), asked + 1] } }
        }),
      tally: (kind, correct) =>
        set((s) => {
          const [right, asked] = s.kinds[kind] ?? [0, 0]
          return { kinds: { ...s.kinds, [kind]: [right + (correct ? 1 : 0), asked + 1] } }
        }),
      answer: (sentence, correct) =>
        set((s) => {
          const rest = s.part5.filter((x) => x !== sentence)
          return { part5: correct ? rest : [...rest, sentence].slice(-RETRY_MAX) }
        }),
    }),
    { name: 'vocab.retry.v1', version: 1 }
  )
)
