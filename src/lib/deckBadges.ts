import type { SRSCard, Word } from '@/types'
import { phaseOf } from './srs'

// "Huy hiệu chủ đề" (docs/design/toeic.md): a deck (a topic, a TOEIC theme)
// earns a medal as its words move through the review schedule. Bronze comes
// within a few sessions, silver once every word has passed a few reviews, gold
// only when all are mastered, so there is always a next medal in sight.
// Derived from the cards alone: nothing extra is stored.

type Pair = [vi: string, en: string]

export type BadgeTier = 'bronze' | 'silver' | 'gold'

export const TIERS: readonly BadgeTier[] = ['bronze', 'silver', 'gold']

export const TIER_INFO: Record<BadgeTier, { medal: string; name: Pair; rule: Pair }> = {
  bronze: {
    medal: '🥉',
    name: ['Đồng', 'Bronze'],
    rule: ['Đã học mọi từ của bộ', 'Every word of the deck started'],
  },
  silver: {
    medal: '🥈',
    name: ['Bạc', 'Silver'],
    rule: ['Mọi từ đã qua vài lần ôn', 'Every word through a few reviews'],
  },
  gold: {
    medal: '🥇',
    name: ['Vàng', 'Gold'],
    rule: ['Mọi từ đã thành thạo', 'Every word mastered'],
  },
}

/** Whether one word counts toward a tier. */
function meets(card: SRSCard | undefined, tier: BadgeTier): boolean {
  const phase = phaseOf(card)
  if (tier === 'gold') return phase === 'mastered'
  if (tier === 'silver') return phase === 'review' || phase === 'mastered'
  return phase !== 'new'
}

/** How many of the deck's words count toward each tier. */
export function tierCounts(
  words: readonly Word[],
  cards: Record<number, SRSCard>
): Record<BadgeTier, number> {
  const counts = { bronze: 0, silver: 0, gold: 0 }
  for (const w of words) for (const t of TIERS) if (meets(cards[w.id], t)) counts[t]++
  return counts
}

/** The highest medal the deck has earned (null for none, or an empty deck). */
export function deckTier(words: readonly Word[], cards: Record<number, SRSCard>): BadgeTier | null {
  if (!words.length) return null
  const counts = tierCounts(words, cards)
  let best: BadgeTier | null = null
  for (const t of TIERS) if (counts[t] === words.length) best = t
  return best
}

/** The next medal and how many words it still needs (null once gold). */
export function nextTier(
  words: readonly Word[],
  cards: Record<number, SRSCard>
): { tier: BadgeTier; left: number } | null {
  const counts = tierCounts(words, cards)
  const tier = TIERS.find((t) => counts[t] < words.length)
  return tier ? { tier, left: words.length - counts[tier] } : null
}

/** Whether `now` is a higher medal than `before`. */
export function isUpgrade(before: BadgeTier | null, now: BadgeTier | null): boolean {
  return now !== null && TIERS.indexOf(now) > (before === null ? -1 : TIERS.indexOf(before))
}
