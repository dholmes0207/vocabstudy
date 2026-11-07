// HSK 1 reading, part three (问答匹配), and the matching part of HSK 2
// reading: a sentence, and its answer among the others' answers. Hand-written
// with the words of the level and below only (lib/hskAnswers.test.ts checks
// every character), each pair with its Vietnamese. The pairs are in
// public/data/hsk/zh.json (lib/hskBank.ts), by level.

export interface AnswerPair {
  id: string
  q: string
  a: string
  qVi: string
  aVi: string
}

/**
 * HSK 2 reading, the matching part: a sentence and the one that answers or
 * follows it, with HSK 1–2 words.
 */
/** HSK 3 reading, part one: a sentence and the one that answers or follows it. */
/** The pairs of each level. */
export type AnswerPairs = Record<'hsk1' | 'hsk2' | 'hsk3', readonly AnswerPair[]>

export interface AnswerQuestion {
  pair: AnswerPair
  options: string[]
  answer: number
}

/** A round of questions, each answer among three others' answers. */
export function answerRound(
  pairsByLevel: AnswerPairs,
  level: keyof AnswerPairs,
  count = 10,
  rand: () => number = Math.random
): AnswerQuestion[] {
  const pairs = pairsByLevel[level]
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(pairs)
    .slice(0, count)
    .map((pair) => {
      const others = shuffle(pairs.filter((p) => p.id !== pair.id))
        .slice(0, 3)
        .map((p) => p.a)
      const options = shuffle([pair.a, ...others])
      return { pair, options, answer: options.indexOf(pair.a) }
    })
}
