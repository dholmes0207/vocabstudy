import type { SRSCard, Word } from '@/types'

// "Nghe thụ động": a hands-free playlist for the bus, the kitchen or a tired
// evening — word, meaning, word again, example, next. Nothing to tap and
// nothing graded, so it never feels like a test; it only keeps the words in
// the ear. Pure planning lives here (unit-tested); Listen.tsx plays it.

export type ListenSource = 'learned' | 'hard' | 'upcoming'
export type ListenPace = 'short' | 'normal' | 'long'

/** Words per playlist — about five minutes at the normal pace. */
export const LISTEN_SIZE = 20

const PACE: Record<ListenPace, number> = { short: 0.6, normal: 1, long: 1.6 }

/** A card the learner keeps missing — same rule as the "Từ hay quên" quiz. */
export function isHard(card: SRSCard | undefined): boolean {
  return !!card && card.wrongCount > card.correctCount
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The words for one playlist:
 *  - learned: the most recently studied (they are the ones still settling), shuffled;
 *  - hard: the most-missed first;
 *  - upcoming: the next words not learned yet, in learning order — hearing them
 *    first makes the real lesson feel familiar.
 */
export function pickListenWords(
  words: Word[],
  cards: Record<number, SRSCard>,
  source: ListenSource,
  size = LISTEN_SIZE,
  rand: () => number = Math.random
): Word[] {
  if (source === 'upcoming') return words.filter((w) => !cards[w.id]).slice(0, size)
  if (source === 'hard') {
    const miss = (w: Word) => cards[w.id].wrongCount - cards[w.id].correctCount
    return words
      .filter((w) => isHard(cards[w.id]))
      .sort((a, b) => miss(b) - miss(a))
      .slice(0, size)
  }
  const seen = (w: Word) => cards[w.id].lastReviewedDay ?? cards[w.id].createdDay
  const recent = words
    .filter((w) => cards[w.id])
    .sort((a, b) => seen(b) - seen(a))
    .slice(0, size)
  return shuffle(recent, rand)
}

/** Which playlist to offer first: what was learned, else a preview of what's next. */
export function defaultSource(learned: number): ListenSource {
  return learned > 0 ? 'learned' : 'upcoming'
}

export type ListenStep =
  | { kind: 'word'; rate: number }
  /** `ms`: reading time when there is no Vietnamese voice to say it aloud. */
  | { kind: 'meaning'; ms: number }
  | { kind: 'example' }
  | { kind: 'pause'; ms: number }

/**
 * What to play for one word. The word is said twice (the second time slower),
 * with the meaning in between, so the sound and the sense land together.
 */
export function listenSteps(word: Word, pace: ListenPace = 'normal'): ListenStep[] {
  const k = PACE[pace]
  const ms = (n: number) => Math.round(n * k)
  const steps: ListenStep[] = [
    { kind: 'word', rate: 1 },
    { kind: 'pause', ms: ms(700) },
    { kind: 'meaning', ms: ms(1600) },
    { kind: 'pause', ms: ms(700) },
    { kind: 'word', rate: 0.8 },
  ]
  if (word.exampleEn.trim()) {
    steps.push({ kind: 'pause', ms: ms(600) }, { kind: 'example' })
  }
  steps.push({ kind: 'pause', ms: ms(1500) })
  return steps
}
