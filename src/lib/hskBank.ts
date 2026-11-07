import type { HskDialogue, PictureDialogue } from './hskDialogues'
import type { AnswerPairs } from './hskAnswers'
import type { HskReading } from './hskReadings'
import { HSK_LEVELS } from './hskPractice'
import { bankLoader, checker, text, texts } from './practiceBank'

// The hand-written HSK practice (docs/design/toeic.md, giai đoạn B) lives in
// public/data/hsk/zh.json, fetched when the HSK page opens, like the TOEIC
// questions (lib/toeicBank.ts). Checked here when it loads; the tests next to
// lib/hsk*.ts also check that every character belongs to the level.

export interface HskBank {
  version: string
  /** HSK 2–3 listening: a dialogue, a question, three options. */
  dialogues: readonly HskDialogue[]
  /** HSK 2 listening, part two: a dialogue and its picture. */
  pictureDialogues: readonly PictureDialogue[]
  /** Question–answer pairs (问答匹配), by level. */
  pairs: AnswerPairs
  /** HSK 3 reading, part three: a passage, a question, three options. */
  readings: readonly HskReading[]
}

const check = checker('HSK bank')

function checkLines(lines: HskDialogue['lines'] | undefined, id: string): void {
  check(
    Array.isArray(lines) &&
      lines.length > 0 &&
      lines.every((l) => (l?.speaker === 'W' || l?.speaker === 'M') && text(l.zh) && text(l.vi)),
    `"${id}" has a bad line`
  )
}

function checkChoice(it: { q: string; qVi: string; options: string[]; why: string }, id: string) {
  check(text(it.q) && text(it.qVi), `"${id}" has no question`)
  check(texts(it.options, 3), `"${id}" needs three options`)
  check(new Set(it.options).size === 3, `"${id}" repeats an option`)
  check(text(it.why), `"${id}" has no explanation`)
}

/** Each id once within its list. */
function checkIds(list: readonly { id: string }[], what: string): void {
  const seen = new Set<string>()
  for (const it of list) {
    check(text(it?.id) && !seen.has(it.id), `${what}: id "${it?.id}" is empty or repeated`)
    seen.add(it.id)
  }
}

/** The bank as loaded, checked; throws on the first thing wrong with it. */
export function validateHskBank(raw: unknown): HskBank {
  const bank = raw as Partial<HskBank> | null
  check(!!bank && typeof bank === 'object', 'not an object')
  for (const key of ['dialogues', 'pictureDialogues', 'readings'] as const)
    check(Array.isArray(bank![key]), `"${key}" is missing`)
  check(!!bank!.pairs && typeof bank!.pairs === 'object', '"pairs" is missing')
  const b = bank as HskBank

  checkIds(b.dialogues, 'dialogues')
  for (const d of b.dialogues) {
    check(d.level === 'hsk2' || d.level === 'hsk3', `"${d.id}" is not HSK 2 or 3`)
    checkLines(d.lines, d.id)
    checkChoice(d, d.id)
  }
  checkIds(b.pictureDialogues, 'pictureDialogues')
  for (const d of b.pictureDialogues) {
    check(text(d.picture), `"${d.id}" has no picture`)
    checkLines(d.lines, d.id)
  }
  for (const level of HSK_LEVELS) {
    const pairs = b.pairs[level]
    check(Array.isArray(pairs) && pairs.length >= 4, `"pairs.${level}" needs four pairs or more`)
    checkIds(pairs, `pairs.${level}`)
    for (const p of pairs)
      check(text(p.q) && text(p.a) && text(p.qVi) && text(p.aVi), `"${p.id}" is incomplete`)
  }
  checkIds(b.readings, 'readings')
  for (const r of b.readings) {
    check(text(r.text) && text(r.vi), `"${r.id}" has no passage`)
    checkChoice(r, r.id)
  }
  return { ...b, version: typeof b.version === 'string' ? b.version : '0' }
}

/** The bank, fetched once per page load; a failed fetch is tried again on the next call. */
export const loadHskBank = bankLoader('data/hsk/zh.json', validateHskBank)
