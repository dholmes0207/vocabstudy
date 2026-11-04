import { describe, expect, it } from 'vitest'
import type { SRSCard, Word } from '@/types'
import { deckTier, isUpgrade, nextTier, tierCounts } from './deckBadges'
import { MASTERED_BOX } from './srs'

const words = [1, 2, 3].map((id) => ({ id }) as Word)
const card = (id: number, box: number, reviewed = true): SRSCard =>
  ({ id, box, dueDay: 0, lastReviewedDay: reviewed ? 0 : null }) as SRSCard
const deck = (...boxes: (number | null)[]) =>
  Object.fromEntries(
    boxes.flatMap((b, i) => (b === null ? [] : [[i + 1, card(i + 1, b)]]))
  ) as Record<number, SRSCard>

describe('deck badges', () => {
  it('gives no medal until every word is started', () => {
    expect(deckTier(words, deck(1, 1, null))).toBeNull()
    // A card made but never answered is still new.
    expect(deckTier(words, { ...deck(1, 1), 3: card(3, 0, false) })).toBeNull()
    expect(deckTier([], {})).toBeNull()
  })

  it('climbs bronze, silver, gold as the words move through the schedule', () => {
    expect(deckTier(words, deck(0, 1, 2))).toBe('bronze')
    expect(deckTier(words, deck(3, 4, MASTERED_BOX))).toBe('silver')
    expect(deckTier(words, deck(MASTERED_BOX, MASTERED_BOX, MASTERED_BOX))).toBe('gold')
  })

  it('counts the words toward each medal and names the next one', () => {
    const cards = deck(3, MASTERED_BOX, 1)
    expect(tierCounts(words, cards)).toEqual({ bronze: 3, silver: 2, gold: 1 })
    expect(nextTier(words, cards)).toEqual({ tier: 'silver', left: 1 })
    expect(nextTier(words, deck(null, null, null))).toEqual({ tier: 'bronze', left: 3 })
    expect(nextTier(words, deck(MASTERED_BOX, MASTERED_BOX, MASTERED_BOX))).toBeNull()
  })

  it('tells a new medal from the same or a lower one', () => {
    expect(isUpgrade(null, 'bronze')).toBe(true)
    expect(isUpgrade('bronze', 'silver')).toBe(true)
    expect(isUpgrade('silver', 'silver')).toBe(false)
    expect(isUpgrade('gold', 'silver')).toBe(false)
    expect(isUpgrade(null, null)).toBe(false)
  })
})
