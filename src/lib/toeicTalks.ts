import type { ReadingQuestion } from './toeicReading'

// TOEIC Part 3 ("Conversations") and Part 4 ("Talks"), docs/design/toeic.md.
// Hand-written: two people at work (Part 3) or one speaker (Part 4) — a
// voicemail, an announcement, an introduction, an ad — each with three
// questions. As on the test, the questions and options are printed and the
// talk is only heard; the transcript shows once every question is answered.
// Some sets come with a graphic (a price list, a timetable…) printed beside the
// questions, and one question needs both: "Look at the graphic.". The sets are
// in public/data/toeic/en.json (lib/toeicBank.ts).

/** W and M take turns in a conversation; N is the one speaker of a talk. */
export type Speaker = 'W' | 'M' | 'N'

export interface TalkSet {
  id: string
  part: 3 | 4
  lines: { speaker: Speaker; text: string }[]
  /** A small table printed with the questions; its first row is the header. */
  graphic?: { title: string; rows: string[][] }
  questions: ReadingQuestion[]
}

/** A set of the part, not the one just done when there is another. */
export function pickTalk(
  talks: readonly TalkSet[],
  part: 3 | 4,
  lastId?: string,
  rand: () => number = Math.random
): TalkSet {
  const all = talks.filter((s) => s.part === part)
  const pool = all.length > 1 ? all.filter((s) => s.id !== lastId) : all
  return pool[Math.floor(rand() * pool.length)]
}
