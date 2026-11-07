// TOEIC Part 2, "Question–response" (docs/design/toeic.md): hear a question or
// statement, then three responses, none of them printed; pick the one that
// fits. Hand-written, each with why the right one fits and how the others trap
// the ear: a repeated word, a word that sounds alike, Yes/No to a Wh- question,
// an answer to a different question word. The items are in
// public/data/toeic/en.json (lib/toeicBank.ts).

export interface Part2Item {
  prompt: string
  /** The right response first; rounds shuffle them. */
  responses: [string, string, string]
  why: string
}

/** Items in one round. */
export const PART2_ROUND = 10

export interface Part2Question extends Part2Item {
  /** The responses as heard: (A), (B), (C) — and (D) for a Part 1 statement. */
  options: string[]
  answer: number
}

export function part2Round(
  bank: readonly Part2Item[],
  rand: () => number = Math.random
): Part2Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(bank)
    .slice(0, PART2_ROUND)
    .map((it) => {
      const options = shuffle(it.responses)
      return { ...it, options, answer: options.indexOf(it.responses[0]) }
    })
}
