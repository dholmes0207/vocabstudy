// Grading a spoken attempt against a target headword.
//
// Input is whatever the speech recognizer produced — usually several competing
// alternatives. We score every (target form x alternative) pair and keep the
// best, because the recognizer's top guess is often not its most charitable one.

import type { Strictness } from '@/types'
import { phoneticKey, similarity } from './phonetic'
import { decompose } from './hangul'
import type { UiLang } from '@/types'

export type { Strictness }

export type PronunciationVerdict = 'great' | 'good' | 'retry'

export interface PronunciationResult {
  /** 0..100. */
  score: number
  verdict: PronunciationVerdict
  /** The alternative that scored best, as the recognizer spelled it. */
  heard: string
  /** The spelling matched a target form exactly. */
  exact: boolean
  /** Sounds the same but is spelled differently ("four" heard as "for"). */
  homophone: boolean
}

/**
 * Pass marks. "Hard" still lets a homophone through (88) but rejects every
 * partial match, since partials are capped at PARTIAL_MAX.
 */
export const STRICTNESS: Record<Strictness, number> = { easy: 45, normal: 60, hard: 80 }

const HOMOPHONE_SCORE = 88
const PARTIAL_MAX = 80
/** Below this, "good" is not offered. */
const GOOD_MIN = 60

/** Lowercase, drop punctuation, collapse whitespace. Keeps inner apostrophes. */
export function normalizeSpoken(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The acceptable spellings of a headword ("a / an" -> ["a", "an"]). */
export function targetForms(target: string): string[] {
  return target.split('/').map(normalizeSpoken).filter(Boolean)
}

/** True when `haystack` contains `needle` as a whole word. */
function containsWord(haystack: string, needle: string): boolean {
  return haystack === needle || new RegExp(`(^| )${escapeRe(needle)}( |$)`).test(haystack)
}

/** Hangul blocks spelled out as letters (사람 → ㅅㅏㄹㅏㅁ), without spaces. */
function spellOut(s: string): string {
  return [...s.replace(/ /g, '')]
    .map((ch) => {
      const p = decompose(ch)
      return p ? p.initial + p.medial + p.final : ch
    })
    .join('')
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function scorePair(form: string, heard: string): { score: number; exact: boolean; homo: boolean } {
  if (!heard) return { score: 0, exact: false, homo: false }

  // Learners often wrap the word in filler: "uh, ability". Accept the word when
  // it appears whole inside the transcript — but not for 1-2 letter forms like
  // "a" or "an", which would match almost any sentence.
  if (form.length >= 3 ? containsWord(heard, form) : heard === form) {
    return { score: 100, exact: true, homo: false }
  }

  // Compared without spaces: recognizers split words unreliably, so "ice cream"
  // often comes back as "i scream" even when the learner said it perfectly.
  const fk = phoneticKey(form).replace(/ /g, '')
  const hk = phoneticKey(heard).replace(/ /g, '')
  // The phonetic key is built for English letters; Korean has none, and two
  // empty keys would count as a perfect sound match. Compare letter by letter
  // instead, squared because without a sound model one wrong letter in a short
  // word is usually another word (사람 "person" / 바람 "wind").
  if (!fk || !hk) {
    const near = similarity(spellOut(form), spellOut(heard))
    return { score: Math.round(near * near * PARTIAL_MAX), exact: false, homo: false }
  }
  if (fk && hk && fk === hk) return { score: HOMOPHONE_SCORE, exact: false, homo: true }

  // Weight sound over spelling: the learner is being graded on how it sounded,
  // and the recognizer's spelling is only a proxy for that.
  const blended =
    0.4 * similarity(form.replace(/ /g, ''), heard.replace(/ /g, '')) + 0.6 * similarity(fk, hk)
  return { score: Math.round(blended * PARTIAL_MAX), exact: false, homo: false }
}

/**
 * Score a spoken attempt. `alternatives` is the recognizer's n-best list
 * (pass a single-element array if you only have one transcript).
 */
export function scorePronunciation(target: string, alternatives: string[]): PronunciationResult {
  const forms = targetForms(target)
  const heards = alternatives.map(normalizeSpoken).filter(Boolean)

  if (!forms.length || !heards.length) {
    return { score: 0, verdict: 'retry', heard: heards[0] ?? '', exact: false, homophone: false }
  }

  let best = { score: -1, exact: false, homo: false, heard: heards[0] }
  for (const heard of heards) {
    for (const form of forms) {
      const r = scorePair(form, heard)
      if (r.score > best.score) best = { ...r, heard }
    }
  }

  return {
    score: Math.max(0, best.score),
    // Never award "great" on a spelling the learner did not actually produce:
    // a matching phonetic key can also mean a vowel slip (cat -> cut).
    verdict: best.exact ? 'great' : best.score >= GOOD_MIN ? 'good' : 'retry',
    heard: best.heard,
    exact: best.exact,
    homophone: best.homo,
  }
}

/** Did the attempt clear the learner's chosen pass mark? Feeds the SRS. */
export function isPass(result: PronunciationResult, strictness: Strictness): boolean {
  return result.score >= STRICTNESS[strictness]
}

/** Short coaching line for a result, in the interface language. */
export function feedbackFor(
  result: PronunciationResult,
  target: string,
  lang: UiLang = 'vi'
): string {
  const en = lang === 'en'
  if (result.exact)
    return en ? 'Spot on! It heard exactly your word.' : 'Chuẩn! Máy nhận đúng từ bạn đọc.'
  if (!result.heard)
    return en
      ? "Didn't hear anything — try again a little louder."
      : 'Chưa nghe thấy gì — thử lại và đọc to hơn nhé.'
  if (result.homophone) {
    return en
      ? `It heard “${result.heard}” — which sounds just like “${target}”. If it isn't a homophone, watch the vowel.`
      : `Máy nghe thành “${result.heard}” — nghe rất giống “${target}”. Nếu không phải từ đồng âm thì để ý nguyên âm.`
  }
  if (result.score >= GOOD_MIN) {
    return en
      ? `Close — it heard “${result.heard}”. Say it a bit slower and clearer.`
      : `Gần đúng — máy nghe thành “${result.heard}”. Đọc chậm và rõ hơn một chút.`
  }
  return en
    ? `It heard “${result.heard}”. Listen to the model again, then retry.`
    : `Máy nghe thành “${result.heard}”. Nghe lại mẫu rồi thử lại nhé.`
}
