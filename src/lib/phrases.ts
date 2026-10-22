// "Mẫu câu giao tiếp" — everyday phrases by situation (docs/design/phrases.md).
// Words alone don't make a conversation; a beginner needs ready-made sentences
// they can say tomorrow: "Could you say that again?", "Can I pay by card?".
// This module is pure (loading aside): pack validation, progress maths and the
// practice-session builder are all unit-tested.

import { tokenize } from './games'

export interface Phrase {
  id: number
  en: string
  /** Meaning in Vietnamese — learning content, shown in both interface languages. */
  vi: string
  /** Optional usage tip, in Vietnamese. */
  note?: string
  /** How the phrase reads, for packs not written in Latin letters (Chinese pinyin). */
  read?: string
}

export interface PhraseTopic {
  id: string
  emoji: string
  title: string
  titleEn: string
  phrases: Phrase[]
}

export interface PhrasePack {
  version: string
  topics: PhraseTopic[]
}

/** Refuse a malformed pack rather than render half a lesson. */
export function validatePhrasePack(data: unknown): PhrasePack {
  const pack = data as Partial<PhrasePack>
  if (!pack || !Array.isArray(pack.topics) || pack.topics.length === 0) {
    throw new Error('Phrase pack has no topics')
  }
  const ids = new Set<number>()
  for (const t of pack.topics) {
    if (!t.id || !t.title || !t.titleEn || !Array.isArray(t.phrases) || !t.phrases.length) {
      throw new Error(`Phrase topic "${t.id}" is incomplete`)
    }
    for (const p of t.phrases) {
      if (!Number.isInteger(p.id) || !p.en?.trim() || !p.vi?.trim()) {
        throw new Error(`Phrase ${p.id} in "${t.id}" is incomplete`)
      }
      if (ids.has(p.id)) throw new Error(`Duplicate phrase id ${p.id}`)
      ids.add(p.id)
    }
  }
  return { version: pack.version ?? '0', topics: pack.topics }
}

/**
 * Each pack numbers its phrases from its own base (English 1…, Korean 2001…,
 * Chinese 3001…),
 * because progress is stored by phrase id alone: a Korean phrase must never
 * inherit the record of an English one.
 */
export const PHRASE_ID_BASE: Record<string, number> = { en: 0, ko: 2000, zh: 3000 }

/** Whether a phrase id belongs to a pack's range. */
export function phraseInPack(id: number, code: string): boolean {
  const base = PHRASE_ID_BASE[code]
  return base !== undefined && id > base && id <= base + 999
}

export async function loadPhrasePack(code: string): Promise<PhrasePack> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/phrases/${code}.json`)
  if (!res.ok) throw new Error(`Phrase pack "${code}" (${res.status})`)
  return validatePhrasePack(await res.json())
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface PhraseRecord {
  right: number
  wrong: number
  lastDay: number
}

export type PhraseProgress = Record<number, PhraseRecord>

/** Right answers after which a phrase counts as known. */
export const KNOWN_AT = 2

export function isKnown(rec: PhraseRecord | undefined): boolean {
  return !!rec && rec.right >= KNOWN_AT
}

export function topicProgress(
  topic: PhraseTopic,
  progress: PhraseProgress
): { known: number; total: number; ratio: number } {
  const total = topic.phrases.length
  const known = topic.phrases.filter((p) => isKnown(progress[p.id])).length
  return { known, total, ratio: total ? known / total : 0 }
}

/** Record one answer for a phrase (pure: returns the new progress). */
export function recordPhrase(
  progress: PhraseProgress,
  id: number,
  correct: boolean,
  day: number
): PhraseProgress {
  const prev = progress[id] ?? { right: 0, wrong: 0, lastDay: day }
  return {
    ...progress,
    [id]: {
      right: prev.right + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      lastDay: day,
    },
  }
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export type PhraseQuestion =
  /** Hear the phrase, pick its meaning. */
  | { kind: 'meaning'; phrase: Phrase; options: string[]; answer: number }
  /** Read the meaning, pick the phrase (with each option's reading, if the pack has them). */
  | { kind: 'phrase'; phrase: Phrase; options: string[]; reads?: string[]; answer: number }
  /** Put the words of the phrase in order. */
  | { kind: 'build'; phrase: Phrase; tokens: string[] }

/** Phrases short enough to rebuild from tiles without it becoming a chore. */
export function canBuild(p: Phrase): boolean {
  const n = tokenize(p.en).length
  return n >= 3 && n <= 9
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Three wrong options, preferring the same topic (harder to guess). */
function distractors(
  phrase: Phrase,
  topic: PhraseTopic,
  all: Phrase[],
  rand: () => number
): Phrase[] {
  const same = shuffle(
    topic.phrases.filter((p) => p.id !== phrase.id),
    rand
  )
  const others = shuffle(
    all.filter((p) => p.id !== phrase.id && !topic.phrases.includes(p)),
    rand
  )
  return [...same, ...others].slice(0, 3)
}

function choice(
  kind: 'meaning' | 'phrase',
  phrase: Phrase,
  wrong: Phrase[],
  rand: () => number
): PhraseQuestion {
  const options = shuffle([phrase, ...wrong], rand)
  const answer = options.indexOf(phrase)
  if (kind === 'meaning') return { kind, phrase, options: options.map((p) => p.vi), answer }
  const reads = options.every((p) => p.read) ? options.map((p) => p.read!) : undefined
  return { kind, phrase, options: options.map((p) => p.en), ...(reads && { reads }), answer }
}

/**
 * One practice round for a topic: the least-practised phrases first, each
 * asked one way, the three kinds taking turns so it never feels like a drill.
 */
export function buildPhraseSession(
  topic: PhraseTopic,
  all: Phrase[],
  progress: PhraseProgress,
  size = 8,
  rand: () => number = Math.random
): PhraseQuestion[] {
  const right = (p: Phrase) => progress[p.id]?.right ?? 0
  const picked = shuffle(topic.phrases, rand)
    .sort((a, b) => right(a) - right(b))
    .slice(0, size)
  const kinds = ['meaning', 'phrase', 'build'] as const
  return shuffle(picked, rand).map((p, i) => {
    const kind = kinds[i % kinds.length]
    if (kind === 'build' && canBuild(p)) return { kind, phrase: p, tokens: tokenize(p.en) }
    return choice(kind === 'build' ? 'meaning' : kind, p, distractors(p, topic, all, rand), rand)
  })
}

/** XP for a finished round: a little for showing up, more for getting it right. */
export function phraseXp(correct: number, total: number): number {
  return Math.max(3, correct * 3 + (correct === total && total > 0 ? 5 : 0))
}
