// HSK 3 reading, part three: a short passage, then a question (★…) with three
// options. Hand-written with HSK 1–3 words only (lib/hskReadings.test.ts
// checks every character), each with its Vietnamese and the reason. The
// passages are in public/data/hsk/zh.json (lib/hskBank.ts).

export interface HskReading {
  id: string
  text: string
  vi: string
  /** The question, without the ★ the test prints before it. */
  q: string
  qVi: string
  /** The right option first; rounds shuffle them. */
  options: [string, string, string]
  why: string
}

export interface ShuffledReading extends Omit<HskReading, 'options'> {
  options: string[]
  answer: number
}

/** A round of passages in random order, the options of each shuffled. */
export function readingRound(
  readings: readonly HskReading[],
  count = 5,
  rand: () => number = Math.random
): ShuffledReading[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(readings)
    .slice(0, count)
    .map((r) => {
      const options = shuffle(r.options)
      return { ...r, options, answer: options.indexOf(r.options[0]) }
    })
}
