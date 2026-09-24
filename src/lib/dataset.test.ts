import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'
import { findWordInSentence } from './wordForms'

// Guards the shipped English pack against the F2 regression: the file once
// claimed 1000 words but held only 374 unique ones (the rest were exact
// duplicates under fresh ids). These invariants keep the count honest — and
// keep the promise the product makes on the box ("1000 từ cơ bản") true.

const url = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))

const pack: LanguagePack = JSON.parse(readFileSync(url('../../public/data/en.json'), 'utf-8'))

interface VoiceManifest {
  default: string
  voices: { key: string; label: string; voice: string }[]
}
const manifest: VoiceManifest = JSON.parse(
  readFileSync(url('../../public/audio/en/index.json'), 'utf-8')
)

describe('en.json dataset integrity', () => {
  it('has no duplicate headwords', () => {
    const seen = new Map<string, number[]>()
    for (const w of pack.words) {
      const key = w.word.trim().toLowerCase()
      seen.set(key, [...(seen.get(key) ?? []), w.id])
    }
    const dups = [...seen.entries()].filter(([, ids]) => ids.length > 1)
    expect(dups, `trùng từ: ${dups.map(([w]) => w).join(', ')}`).toHaveLength(0)
  })

  it('has no duplicate ids', () => {
    const ids = pack.words.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('meta.count matches the real number of words', () => {
    expect(pack.meta.count).toBe(pack.words.length)
  })

  it('delivers at least the promised 1000 core words, with contiguous ids', () => {
    expect(pack.words.length).toBeGreaterThanOrEqual(1000)
    const ids = pack.words.map((w) => w.id).sort((a, b) => a - b)
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(pack.words.length)
    // The first 1000 in learning order are the core stage.
    expect(pack.words.slice(0, 1000).every((w) => (w.stage ?? 1) === 1)).toBe(true)
  })

  // Words past the core 1000 are the extension (stage 2, B1). They only ship
  // with the full depth a learner gets for the core words — never bare.
  it('every extension word is stage 2, placed after the core, and fully deep', () => {
    const ext = pack.words.slice(1000)
    const bad = ext
      .filter((w) => w.stage !== 2 || !w.collocations?.length || !w.tip?.trim())
      .map((w) => `${w.id}:${w.word}`)
    expect(bad).toEqual([])
    expect(pack.words.slice(0, 1000).some((w) => w.stage === 2)).toBe(false)
  })

  // Learn/decks walk the array in order, so array order IS the curriculum: the
  // first lesson a beginner ever sees must be the commonest words in English,
  // not whatever happens to sort first alphabetically.
  it('opens the curriculum with the highest-frequency words', () => {
    const firstDeck = pack.words.slice(0, 20).map((w) => w.word.toLowerCase())
    for (const w of ['the', 'of', 'to', 'you', 'is']) {
      expect(firstDeck, `"${w}" phải nằm trong bộ đầu tiên`).toContain(w)
    }
  })

  // The sentence is where the word is understood, and where the context
  // questions come from — it has to contain the word (in any form).
  it('every example sentence uses its own word', () => {
    const missing = pack.words
      .filter((w) => !findWordInSentence(w.word, w.exampleEn, w.posCategory))
      .map((w) => `${w.id}:${w.word} → "${w.exampleEn}"`)
    expect(missing).toEqual([])
  })

  it('no two words share an example sentence', () => {
    const seen = new Map<string, number>()
    const dups: string[] = []
    for (const w of pack.words) {
      const key = w.exampleEn.trim().toLowerCase()
      if (seen.has(key)) dups.push(`${seen.get(key)} & ${w.id}: "${w.exampleEn}"`)
      else seen.set(key, w.id)
    }
    expect(dups).toEqual([])
  })

  it('every word carries the fields the UI needs', () => {
    for (const w of pack.words) {
      expect(w.word.trim(), `id ${w.id}`).not.toBe('')
      expect(w.meaning.trim(), `id ${w.id} (${w.word})`).not.toBe('')
      expect(w.exampleEn.trim(), `id ${w.id} (${w.word})`).not.toBe('')
      expect(w.exampleVi.trim(), `id ${w.id} (${w.word})`).not.toBe('')
    }
  })
})

// Phát âm là lý do chính người học mở app — thiếu một mảnh là hỏng trải nghiệm.
describe('en.json pronunciation coverage', () => {
  it('every word has an IPA transcription and a Vietnamese reading', () => {
    const missing = pack.words.filter((w) => !w.ipa.trim() || !w.viRead.trim())
    expect(
      missing.map((w) => `${w.id}:${w.word}`),
      'thiếu phiên âm / cách đọc'
    ).toEqual([])
  })

  // The auto-transcriber sometimes drops the stress mark inside the opening
  // consonant cluster (mˈjuzɪk, kˈwɛʃən): it reads as if the word began on
  // a stray consonant. Stress always goes before the whole cluster.
  it('no IPA puts the stress mark inside the opening consonant cluster', () => {
    const split = pack.words.filter((w) => /^[^ˈˌɪəiæɛɔɑʊuaeoʌɜ\s]+ˈ/.test(w.ipa))
    expect(
      split.map((w) => `${w.id}:${w.word} ${w.ipa}`),
      'dấu trọng âm nằm giữa cụm phụ âm đầu'
    ).toEqual([])
  })

  // A rewritten example with its old clip is worse than no clip: the learner
  // hears one sentence while reading another. generate_audio.py records which
  // sentence each clip was made from and re-records any that changed.
  it('every example clip says the sentence the card shows', () => {
    const recorded: Record<string, string> = JSON.parse(
      readFileSync(url('../../scripts/audio-texts/en.json'), 'utf-8')
    )
    const stale = pack.words
      .filter((w) => recorded[String(w.id)] !== w.exampleEn)
      .map((w) => `${w.id}:${w.word}`)
    expect(stale, 'chạy lại scripts/generate_audio.py').toEqual([])
  })

  it('every word has a headword + example clip for every voice', () => {
    const missing: string[] = []
    for (const v of manifest.voices) {
      for (const w of pack.words) {
        for (const kind of ['w', 'e']) {
          const rel = `../../public/audio/en/${v.key}/${kind}${w.id}.mp3`
          if (!existsSync(url(rel))) missing.push(`${v.key}/${kind}${w.id}.mp3 (${w.word})`)
        }
      }
    }
    expect(missing.slice(0, 20), `thiếu ${missing.length} file audio`).toEqual([])
  })
})

// The depth fields are optional, but when present they must be usable as-is.
describe('en.json depth fields', () => {
  it('collocations, family, tip and emoji have the expected shape', () => {
    const bad: string[] = []
    const pairs = (v: unknown, a: string, b: string) =>
      Array.isArray(v) &&
      v.length > 0 &&
      v.every(
        (x) =>
          x &&
          typeof x === 'object' &&
          typeof (x as Record<string, unknown>)[a] === 'string' &&
          typeof (x as Record<string, unknown>)[b] === 'string'
      )
    for (const w of pack.words) {
      if (w.collocations !== undefined && !pairs(w.collocations, 'en', 'vi'))
        bad.push(`${w.id} collocations`)
      if (w.family !== undefined && !pairs(w.family, 'word', 'vi')) bad.push(`${w.id} family`)
      if (w.tip !== undefined && !w.tip.trim()) bad.push(`${w.id} tip`)
      if (w.emoji !== undefined && !w.emoji.trim()) bad.push(`${w.id} emoji`)
    }
    expect(bad).toEqual([])
  })

  it('every collocation actually contains its word, so it teaches the word', () => {
    const bad = pack.words.flatMap((w) =>
      (w.collocations ?? [])
        .filter((c) => !findWordInSentence(w.word, c.en, w.posCategory))
        .map((c) => `${w.id}:${w.word} → "${c.en}"`)
    )
    expect(bad).toEqual([])
  })
})
