import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recordChallenge, type ChallengeRecord } from '@/lib/dailyChallenge'

// "Thử thách hôm nay" results, per language (lib/dailyChallenge.ts).
// Device-only like examStore; the "vocab." prefix puts it in backups.

interface ChallengeState {
  records: Record<string, ChallengeRecord>
  finish: (code: string, day: number, correct: number, total: number) => void
}

export const useChallenge = create<ChallengeState>()(
  persist(
    (set) => ({
      records: {},
      finish: (code, day, correct, total) =>
        set((s) => ({
          records: { ...s.records, [code]: recordChallenge(s.records[code], day, correct, total) },
        })),
    }),
    { name: 'vocab.challenge.v1', version: 1 }
  )
)
