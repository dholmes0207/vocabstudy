// TOEIC Part 6 ("Text completion") and Part 7 ("Reading comprehension"),
// docs/design/toeic.md. Hand-written workplace texts: an email, a notice, an
// ad, a text-message chat… Part 6 texts carry four gaps written [1]–[4], one of
// them for a whole sentence; Part 7 sets have one passage or two linked ones,
// and a question on a pair needs a detail from each. Every answer is explained
// in Vietnamese. The sets are in public/data/toeic/en.json (lib/toeicBank.ts).

type Pair = [vi: string, en: string]

export interface ReadingQuestion {
  /** The question; empty for a Part 6 gap, which is named by its number. */
  q: string
  /** The right option first; rounds shuffle them. */
  options: [string, string, string, string]
  why: string
}

export interface ReadingSet {
  id: string
  part: 6 | 7
  passages: { kind: Pair; text: string }[]
  questions: ReadingQuestion[]
}

export interface ShuffledQuestion extends ReadingQuestion {
  answer: number
}

/** A set with each question's options shuffled; `answer` points at the right one. */
export function shuffleSet<S extends { questions: readonly ReadingQuestion[] }>(
  set: S,
  rand: () => number = Math.random
): { set: S; questions: ShuffledQuestion[] } {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return {
    set,
    questions: set.questions.map((qn) => {
      const options = shuffle(qn.options) as ReadingQuestion['options']
      return { ...qn, options, answer: options.indexOf(qn.options[0]) }
    }),
  }
}

/** A set of the part, not the one just done when there is another. */
export function pickSet(
  sets: readonly ReadingSet[],
  part: 6 | 7,
  lastId?: string,
  rand: () => number = Math.random
): ReadingSet {
  const all = sets.filter((s) => s.part === part)
  const pool = all.length > 1 ? all.filter((s) => s.id !== lastId) : all
  return pool[Math.floor(rand() * pool.length)]
}
