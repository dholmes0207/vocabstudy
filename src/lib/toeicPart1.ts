import type { Part2Question } from './toeicPart2'

// TOEIC Part 1, "Photographs" (docs/design/toeic.md). The app has no photos:
// each scene is a row of emoji with a short description in Vietnamese, and the
// four statements are only heard. What it trains is the ear for the sentences
// Part 1 is made of: "is being loaded", "is leaning against", "are stacked".
// The scenes are in public/data/toeic/en.json (lib/toeicBank.ts).

export interface Part1Item {
  emoji: string
  /** What the "photo" shows, in Vietnamese. */
  scene: string
  /** The right statement first; rounds shuffle them. */
  statements: [string, string, string, string]
  why: string
}

/** Items in one round, as many as Part 1 has on the test. */
export const PART1_ROUND = 6

export interface Part1Question extends Part2Question {
  emoji: string
  scene: string
}

/** A round: the scene in place of a question, four statements heard as (A)–(D). */
export function part1Round(
  bank: readonly Part1Item[],
  rand: () => number = Math.random
): Part1Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(bank)
    .slice(0, PART1_ROUND)
    .map((it) => {
      const options = shuffle(it.statements)
      return {
        prompt: '',
        responses: [it.statements[0], it.statements[1], it.statements[2]],
        options,
        answer: options.indexOf(it.statements[0]),
        why: it.why,
        emoji: it.emoji,
        scene: it.scene,
      }
    })
}
