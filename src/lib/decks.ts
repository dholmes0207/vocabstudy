import type { SRSCard, Word } from '@/types'
import { phaseOf } from './srs'

export const DECK_SIZE = 20

export interface Deck {
  index: number
  title: string
  words: Word[]
  /** Number of words in this deck the learner has started (has a card). */
  started: number
  /** Number of words in this deck that are mastered. */
  mastered: number
  /** Curriculum stage of the deck (1 = core A1–A2, 2 = extension B1). */
  stage: number
}

/** Split an ordered word list into fixed-size decks, annotated with progress. */
export function buildDecks(
  words: Word[],
  cards: Record<number, SRSCard>,
  size = DECK_SIZE
): Deck[] {
  const decks: Deck[] = []
  for (let i = 0; i < words.length; i += size) {
    const slice = words.slice(i, i + size)
    let started = 0
    let mastered = 0
    let stage = 1
    for (const w of slice) {
      stage = Math.max(stage, w.stage ?? 1)
      const card = cards[w.id]
      if (card) started++
      if (phaseOf(card) === 'mastered') mastered++
    }
    decks.push({
      index: decks.length,
      title: `Bộ ${decks.length + 1}`,
      words: slice,
      started,
      mastered,
      stage,
    })
  }
  return decks
}
