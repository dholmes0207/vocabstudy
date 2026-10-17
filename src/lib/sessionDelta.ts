import type { CardPhase, SRSCard } from '@/types'
import { phaseOf } from '@/lib/srs'

// End-of-session changes (docs/design/learning-depth.md): what the session did
// to the words in it — "+2 đã thuộc" says more than "8/10 đúng". Taken from a
// snapshot of phases before the first answer and the cards after the last.

export type PhaseSnapshot = Record<number, CardPhase>

const RANK: Record<CardPhase, number> = { new: 0, learning: 1, review: 2, mastered: 3 }

export function snapshotPhases(
  ids: readonly number[],
  cards: Readonly<Record<number, SRSCard>>
): PhaseSnapshot {
  return Object.fromEntries(ids.map((id) => [id, phaseOf(cards[id])]))
}

export interface PhaseDelta {
  /** New words that entered the review schedule. */
  started: number
  /** Words already in the schedule that moved up a stage (not counting `mastered`). */
  up: number
  /** Words that reached "mastered". */
  mastered: number
  /** Words sent back a stage — forgotten, to be relearned. */
  down: number
}

export function phaseDelta(
  before: PhaseSnapshot,
  cards: Readonly<Record<number, SRSCard>>
): PhaseDelta {
  const d: PhaseDelta = { started: 0, up: 0, mastered: 0, down: 0 }
  for (const [key, was] of Object.entries(before)) {
    const now = phaseOf(cards[Number(key)])
    if (now === was) continue
    if (RANK[now] < RANK[was]) d.down++
    else if (was === 'new') d.started++
    else if (now === 'mastered') d.mastered++
    else d.up++
  }
  return d
}
