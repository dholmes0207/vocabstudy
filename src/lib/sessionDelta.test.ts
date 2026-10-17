import { describe, expect, it } from 'vitest'
import type { SRSCard } from '@/types'
import { MASTERED_BOX } from './srs'
import { phaseDelta, snapshotPhases } from './sessionDelta'

const card = (id: number, box: number, reviewed = true): SRSCard => ({
  id,
  box,
  dueDay: 0,
  lastReviewedDay: reviewed ? 0 : null,
  correctCount: 0,
  wrongCount: 0,
  createdDay: 0,
})

describe('phaseDelta', () => {
  it('counts words started, moved up, mastered and forgotten', () => {
    const before = snapshotPhases([1, 2, 3, 4, 5], {
      2: card(2, 2), // learning
      3: card(3, 5), // review
      4: card(4, 3), // review
      5: card(5, 4), // review, stays
    })
    const after = {
      1: card(1, 1), // new → learning
      2: card(2, 3), // learning → review
      3: card(3, MASTERED_BOX), // review → mastered
      4: card(4, 0), // review → learning: forgotten
      5: card(5, 4),
    }
    expect(phaseDelta(before, after)).toEqual({ started: 1, up: 1, mastered: 1, down: 1 })
  })

  it('reports nothing when nothing changed', () => {
    const cards = { 1: card(1, 3) }
    expect(phaseDelta(snapshotPhases([1], cards), cards)).toEqual({
      started: 0,
      up: 0,
      mastered: 0,
      down: 0,
    })
  })
})
