import type { Part1Item } from './toeicPart1'
import type { Part2Item } from './toeicPart2'
import { PART5_KINDS, type Part5Question } from './toeicPart5'
import type { ReadingQuestion, ReadingSet } from './toeicReading'
import type { TalkSet } from './toeicTalks'
import { bankLoader, checker, text, texts } from './practiceBank'

// The hand-written TOEIC practice (docs/design/toeic.md) lives in
// public/data/toeic/en.json, fetched when the TOEIC page opens, not in the code:
// it grows every week and has no business in the JavaScript every learner
// downloads. The lib/toeic*.ts files keep the types and the logic of a round.
// The file is checked here when it loads (and by the tests against the real
// file): a broken edit fails loudly instead of showing a question with three
// options or no answer.

export interface ToeicBank {
  version: string
  part1: readonly Part1Item[]
  part2: readonly Part2Item[]
  /** Hand-written Part 5 questions; `answer` is the right option before shuffling. */
  part5: readonly Part5Question[]
  /** Part 6 and Part 7 sets. */
  reading: readonly ReadingSet[]
  /** Part 3 and Part 4 sets. */
  talks: readonly TalkSet[]
}

const check = checker('TOEIC bank')

function checkQuestions(questions: readonly ReadingQuestion[] | undefined, id: string): void {
  check(Array.isArray(questions) && questions.length > 0, `"${id}" has no questions`)
  for (const q of questions!) {
    check(typeof q?.q === 'string', `"${id}": a question has no text`)
    check(texts(q.options, 4), `"${id}": "${q.q}" needs four options`)
    check(new Set(q.options).size === 4, `"${id}": "${q.q}" repeats an option`)
    check(text(q.why), `"${id}": "${q.q}" has no explanation`)
  }
}

/** The bank as loaded, checked; throws on the first thing wrong with it. */
export function validateToeicBank(raw: unknown): ToeicBank {
  const bank = raw as Partial<ToeicBank> | null
  check(!!bank && typeof bank === 'object', 'not an object')
  for (const key of ['part1', 'part2', 'part5', 'reading', 'talks'] as const)
    check(Array.isArray(bank![key]), `"${key}" is missing`)
  const b = bank as ToeicBank

  for (const it of b.part1) {
    check(text(it?.emoji) && text(it.scene), 'a Part 1 item has no scene')
    check(texts(it.statements, 4), `Part 1 "${it.scene}" needs four statements`)
    check(text(it.why), `Part 1 "${it.scene}" has no explanation`)
  }
  for (const it of b.part2) {
    check(text(it?.prompt), 'a Part 2 item has no prompt')
    check(texts(it.responses, 3), `Part 2 "${it.prompt}" needs three responses`)
    check(text(it.why), `Part 2 "${it.prompt}" has no explanation`)
  }
  for (const q of b.part5) {
    check(text(q?.sentence) && q.sentence.includes('___'), 'a Part 5 sentence has no gap')
    check(q.kind in PART5_KINDS, `Part 5 "${q.sentence}": unknown kind "${q.kind}"`)
    check(texts(q.options, 4), `Part 5 "${q.sentence}" needs four options`)
    check(
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,
      `Part 5 "${q.sentence}": bad answer`
    )
    check(text(q.why), `Part 5 "${q.sentence}" has no explanation`)
  }
  const ids = new Set<string>()
  for (const s of [...b.reading, ...b.talks]) {
    check(text(s?.id) && !ids.has(s.id), `set id "${s?.id}" is empty or repeated`)
    ids.add(s.id)
  }
  for (const s of b.reading) {
    check(s.part === 6 || s.part === 7, `"${s.id}" is not Part 6 or 7`)
    check(
      Array.isArray(s.passages) &&
        s.passages.length > 0 &&
        s.passages.every((p) => texts(p?.kind, 2) && text(p.text)),
      `"${s.id}" has a bad passage`
    )
    checkQuestions(s.questions, s.id)
  }
  for (const s of b.talks) {
    check(s.part === 3 || s.part === 4, `"${s.id}" is not Part 3 or 4`)
    check(
      Array.isArray(s.lines) &&
        s.lines.length > 0 &&
        s.lines.every((l) => ['W', 'M', 'N'].includes(l?.speaker) && text(l.text)),
      `"${s.id}" has a bad line`
    )
    if (s.graphic !== undefined)
      check(
        text(s.graphic?.title) &&
          Array.isArray(s.graphic.rows) &&
          s.graphic.rows.every((r) => Array.isArray(r) && r.every((c) => typeof c === 'string')),
        `"${s.id}" has a bad graphic`
      )
    checkQuestions(s.questions, s.id)
  }
  return { ...b, version: typeof b.version === 'string' ? b.version : '0' }
}

/** The bank, fetched once per page load; a failed fetch is tried again on the next call. */
export const loadToeicBank = bankLoader('data/toeic/en.json', validateToeicBank)
