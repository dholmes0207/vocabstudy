import type { Word } from '@/types'

// Word details a card only shows when opened (collocations, memory tip, word
// family) are over half of the English pack. The build ships them in
// data/<code>.details.json, fetched after the pack, so the first screen waits
// for the core words only (vite.config.ts, docs/design/latency.md).

export const DETAIL_FIELDS = ['collocations', 'tip', 'family'] as const

export type WordDetails = Pick<Word, (typeof DETAIL_FIELDS)[number]>

/** Details by word id. */
export type PackDetails = Record<number, WordDetails>

/** The pack without its details, and the details by word id (empty when it has none). */
export function splitPack<P extends { words: Word[] }>(pack: P): { core: P; details: PackDetails } {
  const details: PackDetails = {}
  const words = pack.words.map((w) => {
    const core = { ...w }
    const d: WordDetails = {}
    for (const f of DETAIL_FIELDS) {
      if (w[f] === undefined) continue
      ;(d as Record<string, unknown>)[f] = w[f]
      delete core[f]
    }
    if (Object.keys(d).length) details[w.id] = d
    return core
  })
  return { core: { ...pack, words }, details }
}
