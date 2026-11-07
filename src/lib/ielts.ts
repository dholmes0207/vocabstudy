import { bankLoader, checker, text } from './practiceBank'

// "Luyện IELTS" (docs/design/ielts.md): level 6 of the learning path. The
// practice lives in public/data/ielts/en.json, hand-written: short academic
// passages, never past papers. Checked when it loads, like the TOEIC bank.

export type Pair = [vi: string, en: string]

/** IELTS Reading's three answers for a statement about the passage. */
export type Tfng = 'T' | 'F' | 'NG'

export const TFNG_LABEL: Record<Tfng, Pair> = {
  T: ['TRUE · Đúng như bài', 'TRUE'],
  F: ['FALSE · Ngược với bài', 'FALSE'],
  NG: ['NOT GIVEN · Bài không nói', 'NOT GIVEN'],
}

export interface TfngQuestion {
  statement: string
  answer: Tfng
  /** Where the passage says it (or that it doesn't), in Vietnamese. */
  why: string
}

export interface ReadingPassage {
  id: string
  emoji: string
  title: Pair
  passage: string[]
  questions: TfngQuestion[]
}

/** Speaking Part 1: a familiar topic and the examiner's short questions on it. */
export interface Part1Topic {
  id: string
  emoji: string
  title: Pair
  questions: string[]
}

/** Speaking Part 2: a task card for the long turn, and Part 3 questions that follow it. */
export interface CueCard {
  id: string
  emoji: string
  /** "Describe a…" */
  cue: string
  /** "You should say:" — the points on the card. */
  points: string[]
  /** A plan for the minute of preparation, in Vietnamese. */
  plan: string[]
  /** Phrases to open, link and close the talk. */
  phrases: string[]
  /** The discussion that follows (Part 3). */
  part3: string[]
}

export interface IeltsBank {
  version: string
  reading: readonly ReadingPassage[]
  speaking: { part1: readonly Part1Topic[]; part2: readonly CueCard[] }
}

const check = checker('IELTS bank')

export function validateIeltsBank(raw: unknown): IeltsBank {
  const bank = raw as Partial<IeltsBank> | null
  check(!!bank && typeof bank === 'object', 'not an object')
  check(Array.isArray(bank!.reading) && bank!.reading.length > 0, '"reading" is missing')
  const ids = new Set<string>()
  for (const r of bank!.reading!) {
    check(text(r?.id) && !ids.has(r.id), `passage id "${r?.id}" is empty or repeated`)
    ids.add(r.id)
    check(
      Array.isArray(r.title) && r.title.length === 2 && r.title.every(text),
      `"${r.id}" has no title`
    )
    check(
      Array.isArray(r.passage) && r.passage.length > 0 && r.passage.every(text),
      `"${r.id}" has no text`
    )
    check(Array.isArray(r.questions) && r.questions.length >= 3, `"${r.id}" needs three statements`)
    for (const q of r.questions) {
      check(text(q?.statement), `"${r.id}": a statement is empty`)
      check(q.answer in TFNG_LABEL, `"${r.id}": "${q.statement}" has a bad answer`)
      check(text(q.why), `"${r.id}": "${q.statement}" has no explanation`)
    }
  }
  const speaking = bank!.speaking
  check(
    !!speaking && Array.isArray(speaking.part1) && Array.isArray(speaking.part2),
    '"speaking" is missing'
  )
  const strings = (v: unknown, min: number) => Array.isArray(v) && v.length >= min && v.every(text)
  for (const tp of speaking!.part1) {
    check(text(tp?.id) && text(tp.emoji), 'a Part 1 topic has no id')
    check(strings(tp.title, 2), `Part 1 "${tp.id}" has no title`)
    check(strings(tp.questions, 3), `Part 1 "${tp.id}" needs three questions`)
  }
  for (const c of speaking!.part2) {
    check(text(c?.id) && text(c.cue), 'a cue card has no task')
    check(strings(c.points, 3), `cue card "${c.id}" needs three points`)
    check(
      strings(c.plan, 2) && strings(c.phrases, 2),
      `cue card "${c.id}" needs a plan and phrases`
    )
    check(strings(c.part3, 2), `cue card "${c.id}" needs Part 3 questions`)
  }
  return { version: bank!.version ?? '0', reading: bank!.reading!, speaking: speaking! }
}

export const loadIeltsBank = bankLoader('data/ielts/en.json', validateIeltsBank)

/** A passage with its statements shuffled, so a second read is not a memory test. */
export function readingRound(p: ReadingPassage, rand: () => number = Math.random): ReadingPassage {
  const qs = [...p.questions]
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[qs[i], qs[j]] = [qs[j], qs[i]]
  }
  return { ...p, questions: qs }
}

/** A passage to read: one not done yet when there is one, else any but the last. */
export function pickPassage(
  passages: readonly ReadingPassage[],
  done: (id: string) => boolean,
  lastId?: string,
  rand: () => number = Math.random
): ReadingPassage {
  const fresh = passages.filter((p) => !done(p.id) && p.id !== lastId)
  const pool = fresh.length ? fresh : passages.filter((p) => p.id !== lastId)
  const from = pool.length ? pool : passages
  return from[Math.floor(rand() * from.length)]
}

/**
 * The test, as checked on 08/11/2026 (docs/design/ielts.md lists the sources).
 * The page asks learners to confirm on the official site before registering.
 */
export const IELTS_FORMAT: { icon: string; skill: Pair; time: Pair; what: Pair }[] = [
  {
    icon: '🎧',
    skill: ['Nghe', 'Listening'],
    time: ['30 phút', '30 minutes'],
    what: [
      '4 phần (2 hội thoại, 2 bài nói), 40 câu.',
      '4 parts (2 conversations, 2 talks), 40 questions.',
    ],
  },
  {
    icon: '📖',
    skill: ['Đọc', 'Reading'],
    time: ['60 phút', '60 minutes'],
    what: [
      '3 bài đọc dài, 40 câu: True/False/Not Given, điền từ, nối tiêu đề…',
      '3 long passages, 40 questions: True/False/Not Given, completion, matching headings…',
    ],
  },
  {
    icon: '✍️',
    skill: ['Viết', 'Writing'],
    time: ['60 phút', '60 minutes'],
    what: [
      'Task 1 tả biểu đồ (ít nhất 150 từ), Task 2 bài luận (ít nhất 250 từ, điểm gấp đôi Task 1).',
      'Task 1 describes a chart (150+ words), Task 2 an essay (250+ words, worth twice Task 1).',
    ],
  },
  {
    icon: '🗣️',
    skill: ['Nói', 'Speaking'],
    time: ['11–14 phút', '11–14 minutes'],
    what: [
      '3 phần nói trực tiếp với giám khảo: câu hỏi quen thuộc, nói 1 chủ đề, thảo luận.',
      '3 parts face to face with an examiner: familiar questions, a long turn, a discussion.',
    ],
  },
]

/** Seconds to prepare the long turn, and to speak, as on the test card. */
export const PART2_PREP = 60
export const PART2_TALK = 120

/** One item of a list, not the one just used when there is another. */
export function pickOther<T extends { id: string }>(
  items: readonly T[],
  lastId?: string,
  rand: () => number = Math.random
): T {
  const pool = items.length > 1 ? items.filter((i) => i.id !== lastId) : items
  return pool[Math.floor(rand() * pool.length)]
}

/** "1:05" for 65 seconds. */
export const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`
