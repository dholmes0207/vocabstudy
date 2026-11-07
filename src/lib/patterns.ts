import { bankLoader, checker, text } from './practiceBank'

// "Cấu trúc câu" (docs/design/sentence-patterns.md): the sentence shapes of
// English and Chinese as coloured blocks — subject, verb, object, place,
// time… — so a learner sees why the words go in that order, then builds
// sentences block by block. Content in public/data/patterns/<pack>.json,
// checked when it loads.

export type Pair = [vi: string, en: string]

/** The part a block plays in its sentence. */
export type Role = 'S' | 'V' | 'O' | 'C' | 'P' | 'T' | 'Q' | 'A' | 'J' | 'M' | 'K' | 'D'

export const ROLES: Record<Role, { name: Pair; tone: string }> = {
  S: { name: ['Chủ ngữ', 'Subject'], tone: 'bg-sky-500' },
  V: { name: ['Động từ', 'Verb'], tone: 'bg-rose-500' },
  O: { name: ['Tân ngữ', 'Object'], tone: 'bg-amber-500' },
  C: { name: ['Bổ ngữ', 'Complement'], tone: 'bg-violet-500' },
  P: { name: ['Nơi chốn', 'Place'], tone: 'bg-emerald-500' },
  T: { name: ['Thời gian', 'Time'], tone: 'bg-cyan-600' },
  Q: { name: ['Từ hỏi', 'Question word'], tone: 'bg-fuchsia-500' },
  A: { name: ['Trợ động từ', 'Helper verb'], tone: 'bg-orange-500' },
  J: { name: ['Từ nối', 'Linking word'], tone: 'bg-slate-500' },
  M: { name: ['Tần suất', 'How often'], tone: 'bg-teal-500' },
  K: { name: ['Cụm giới từ', 'Preposition phrase'], tone: 'bg-lime-600' },
  D: { name: ['Phó từ', 'Adverb'], tone: 'bg-indigo-500' },
}

export interface PatternSentence {
  /** The sentence in blocks, in order: [text, role]. */
  chunks: [string, Role][]
  /** Pinyin of the whole sentence (Chinese). */
  py?: string
  vi: string
}

export interface SentencePattern {
  id: string
  emoji: string
  title: Pair
  /** The core shape, as roles. */
  formula: Role[]
  /** Why it is so, in Vietnamese, with the usual slip. */
  explain: string[]
  sentences: PatternSentence[]
}

export interface PatternsBank {
  version: string
  patterns: readonly SentencePattern[]
}

const check = checker('Patterns')

export function validatePatterns(raw: unknown): PatternsBank {
  const bank = raw as Partial<PatternsBank> | null
  check(!!bank && Array.isArray(bank.patterns) && bank.patterns.length > 0, '"patterns" is missing')
  const ids = new Set<string>()
  for (const p of bank!.patterns!) {
    check(text(p?.id) && !ids.has(p.id), `pattern id "${p?.id}" is empty or repeated`)
    ids.add(p.id)
    check(
      Array.isArray(p.title) && p.title.length === 2 && p.title.every(text),
      `"${p.id}" has no title`
    )
    check(
      Array.isArray(p.formula) && p.formula.every((r) => r in ROLES),
      `"${p.id}" has a bad formula`
    )
    check(
      Array.isArray(p.explain) && p.explain.length > 0 && p.explain.every(text),
      `"${p.id}" explains nothing`
    )
    check(Array.isArray(p.sentences) && p.sentences.length >= 3, `"${p.id}" needs three sentences`)
    for (const s of p.sentences) {
      check(text(s?.vi), `"${p.id}": a sentence has no Vietnamese`)
      check(s.py === undefined || text(s.py), `"${p.id}": "${s.vi}" has empty pinyin`)
      check(
        Array.isArray(s.chunks) &&
          s.chunks.length >= 3 &&
          s.chunks.every((c) => Array.isArray(c) && text(c[0]) && c[1] in ROLES),
        `"${p.id}": "${s.vi}" needs three blocks with roles`
      )
    }
  }
  return { version: bank!.version ?? '0', patterns: bank!.patterns! }
}

/** The packs with sentence patterns, and how each writes and reads them. */
export const PATTERN_PACKS = {
  en: { load: bankLoader('data/patterns/en.json', validatePatterns), speech: 'en-US', joiner: ' ' },
  zh: { load: bankLoader('data/patterns/zh.json', validatePatterns), speech: 'zh-CN', joiner: '' },
} as const

export type PatternPack = keyof typeof PATTERN_PACKS

export const isPatternPack = (code: string): code is PatternPack => code in PATTERN_PACKS

/** The whole sentence, its blocks joined (by spaces, or by nothing in Chinese). */
export const sentenceText = (s: PatternSentence, joiner = ' '): string =>
  s.chunks.map(([t]) => t).join(joiner)

/** The roles a bank uses, in ROLES order, for its legend. */
export const rolesUsed = (patterns: readonly SentencePattern[]): Role[] => {
  const used = new Set(
    patterns.flatMap((p) => p.sentences.flatMap((s) => s.chunks.map(([, r]) => r)))
  )
  return (Object.keys(ROLES) as Role[]).filter((r) => used.has(r))
}

export interface PatternItem {
  pattern: SentencePattern
  sentence: PatternSentence
}

/**
 * A round: `count` sentences of one pattern, or of every pattern when none is
 * given (one each, at random, then shuffled).
 */
export function patternRound(
  patterns: readonly SentencePattern[],
  only?: string,
  count = 6,
  rand: () => number = Math.random
): PatternItem[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const one = only ? patterns.find((p) => p.id === only) : undefined
  if (one)
    return shuffle(one.sentences.map((sentence) => ({ pattern: one, sentence }))).slice(0, count)
  return shuffle(
    patterns.map((pattern) => ({ pattern, sentence: shuffle(pattern.sentences)[0] }))
  ).slice(0, count)
}
