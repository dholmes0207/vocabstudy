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

/**
 * Matching headings: more headings than paragraphs, one right per paragraph,
 * the rest there to tempt. `answers[i]` is the heading of paragraph i.
 */
export interface HeadingsTask {
  options: string[]
  answers: number[]
  /** Why each paragraph gets its heading, in Vietnamese. */
  why: string[]
}

export interface ReadingPassage {
  id: string
  emoji: string
  title: Pair
  passage: string[]
  questions: TfngQuestion[]
  headings: HeadingsTask
}

/** Headings are listed i, ii, iii… as on the paper. */
export const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']

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

/** A kind of Task 2 essay, with how to build it. */
export interface EssayType {
  id: string
  emoji: string
  title: Pair
  /** A question of this kind. */
  sample: string
  /** The words in a question that give the kind away. */
  signal: string
  /** One line per paragraph, in Vietnamese. */
  plan: string[]
  /** Sentence starters for those paragraphs. */
  frames: string[]
}

export type DrillKind = 'link' | 'trend' | 'formal'

export const DRILL_KIND: Record<DrillKind, Pair> = {
  link: ['Từ nối', 'Linking words'],
  trend: ['Tả xu hướng (Task 1)', 'Describing trends (Task 1)'],
  formal: ['Văn phong học thuật', 'Academic style'],
}

export interface WritingDrill {
  kind: DrillKind
  prompt: string
  options: string[]
  answer: number
  why: string
}

export interface EssayPrompt {
  id: string
  /** An EssayType id. */
  type: string
  text: string
}

/** Listening Part 1: a call, and the form the learner fills from it. */
export interface ListeningSet {
  id: string
  emoji: string
  title: Pair
  lines: { speaker: 'W' | 'M'; text: string }[]
  form: { title: string; fields: { label: string; answer: string; accept?: string[] }[] }
  /** A test-taking tip for this kind of form, in Vietnamese. */
  tip: string
}

export interface IeltsBank {
  version: string
  listening: readonly ListeningSet[]
  reading: readonly ReadingPassage[]
  speaking: { part1: readonly Part1Topic[]; part2: readonly CueCard[] }
  writing: {
    types: readonly EssayType[]
    drills: readonly WritingDrill[]
    prompts: readonly EssayPrompt[]
  }
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
    const h = r.headings
    const n = r.passage.length
    check(
      !!h &&
        Array.isArray(h.options) &&
        h.options.length > n &&
        h.options.length <= ROMAN.length &&
        h.options.every(text),
      `"${r.id}" needs more headings than paragraphs`
    )
    check(
      Array.isArray(h.answers) &&
        h.answers.length === n &&
        new Set(h.answers).size === n &&
        h.answers.every((a) => Number.isInteger(a) && a >= 0 && a < h.options.length),
      `"${r.id}" needs one different heading per paragraph`
    )
    check(
      Array.isArray(h.why) && h.why.length === n && h.why.every(text),
      `"${r.id}" needs a reason per heading`
    )
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
  const writing = bank!.writing
  check(
    !!writing &&
      Array.isArray(writing.types) &&
      Array.isArray(writing.drills) &&
      Array.isArray(writing.prompts),
    '"writing" is missing'
  )
  const typeIds = new Set(writing!.types.map((w) => w.id))
  for (const w of writing!.types) {
    check(
      text(w?.id) && strings(w.title, 2) && text(w.sample),
      `essay type "${w?.id}" is incomplete`
    )
    check(
      strings(w.plan, 3) && strings(w.frames, 3),
      `essay type "${w.id}" needs a plan and frames`
    )
  }
  for (const d of writing!.drills) {
    check(d?.kind in DRILL_KIND, `drill "${d?.prompt}" has a bad kind`)
    check(text(d.prompt) && strings(d.options, 3), `drill "${d.prompt}" needs options`)
    check(new Set(d.options).size === d.options.length, `drill "${d.prompt}" repeats an option`)
    check(
      Number.isInteger(d.answer) && d.answer >= 0 && d.answer < d.options.length,
      `drill "${d.prompt}" has a bad answer`
    )
    check(text(d.why), `drill "${d.prompt}" has no explanation`)
  }
  for (const pr of writing!.prompts)
    check(text(pr?.text) && typeIds.has(pr.type), `essay prompt "${pr?.id}" has no known type`)
  const listening = bank!.listening
  check(Array.isArray(listening) && listening.length > 0, '"listening" is missing')
  for (const l of listening!) {
    check(text(l?.id) && strings(l.title, 2) && text(l.tip), `listening "${l?.id}" is incomplete`)
    check(
      Array.isArray(l.lines) &&
        l.lines.length > 0 &&
        l.lines.every((x) => (x?.speaker === 'W' || x?.speaker === 'M') && text(x.text)),
      `listening "${l.id}" has a bad line`
    )
    check(
      text(l.form?.title) &&
        Array.isArray(l.form.fields) &&
        l.form.fields.length >= 3 &&
        l.form.fields.every((f) => text(f?.label) && text(f.answer)),
      `listening "${l.id}" needs a form of three fields`
    )
  }
  return {
    version: bank!.version ?? '0',
    listening: listening!,
    reading: bank!.reading!,
    speaking: speaking!,
    writing: writing!,
  }
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

/** How many paragraphs got their right heading. */
export const headingsRight = (h: HeadingsTask, picks: readonly (number | null)[]): number =>
  h.answers.filter((a, i) => picks[i] === a).length

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

/** Ten drills in random order, each with its options shuffled. */
export function drillRound(
  drills: readonly WritingDrill[],
  count = 10,
  rand: () => number = Math.random
): WritingDrill[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(drills)
    .slice(0, count)
    .map((d) => {
      const order = shuffle(d.options.map((_, i) => i))
      return { ...d, options: order.map((i) => d.options[i]), answer: order.indexOf(d.answer) }
    })
}

/** Words in an essay, as an examiner counts them roughly: runs of letters and digits. */
export const wordCount = (essay: string): number =>
  (essay.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length

/** Paragraphs: blocks of text separated by an empty line. */
export const paragraphCount = (essay: string): number =>
  essay.split(/\n\s*\n/).filter((p) => p.trim()).length

/** Linking words a Task 2 essay is expected to use, longest first. */
export const LINKERS = [
  'on the other hand',
  'in conclusion',
  'as a result',
  'for example',
  'for instance',
  'in addition',
  'furthermore',
  'moreover',
  'however',
  'therefore',
  'although',
  'whereas',
  'firstly',
  'secondly',
  'finally',
  'overall',
  'such as',
  'because',
]

/** The linking words an essay uses, each once. */
export function linkersUsed(essay: string): string[] {
  const lower = essay.toLowerCase()
  return LINKERS.filter((l) => new RegExp(`\\b${l}\\b`).test(lower))
}

/** Spoken forms an IELTS essay should not have: contractions and slang. */
export function informalBits(essay: string): string[] {
  const found = essay.match(
    /\b(?:\w+n['’]t|\w+['’](?:re|ll|ve|d|m)|it['’]s|that['’]s|gonna|wanna|gotta|kids|stuff|a lot of|lots of)\b/gi
  )
  return [...new Set((found ?? []).map((f) => f.toLowerCase()))]
}

/** The minimum length of a Task 2 essay. */
export const TASK2_WORDS = 250

/** How an answer is compared: case, punctuation and extra spaces don't count. */
const normal = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.,!?'’"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Whether a typed blank is right: the answer or one of its accepted forms,
 * ignoring case and punctuation; a number (a price, a phone) also with its
 * spaces left out.
 */
export function blankRight(input: string, field: { answer: string; accept?: string[] }): boolean {
  const typed = normal(input)
  if (!typed) return false
  return [field.answer, ...(field.accept ?? [])].some((a) => {
    const want = normal(a)
    return typed === want || typed.replace(/ /g, '') === want.replace(/ /g, '')
  })
}
