import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'

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

  it('delivers the promised 1000 words with contiguous ids', () => {
    expect(pack.words).toHaveLength(1000)
    const ids = pack.words.map((w) => w.id).sort((a, b) => a - b)
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(1000)
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
