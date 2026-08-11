import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { LanguagePack } from '@/types'

// Guards the shipped English pack against the F2 regression: the file once
// claimed 1000 words but held only 374 unique ones (the rest were exact
// duplicates under fresh ids). These invariants keep the count honest.

const pack: LanguagePack = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../public/data/en.json', import.meta.url)), 'utf-8')
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

  it('every word carries the fields the UI needs', () => {
    for (const w of pack.words) {
      expect(w.word.trim(), `id ${w.id}`).not.toBe('')
      expect(w.meaning.trim(), `id ${w.id} (${w.word})`).not.toBe('')
    }
  })
})
