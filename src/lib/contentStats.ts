// How much content ships, counted from public/data at build time
// (vite.config.ts `contentStats`). The landing page quotes these instead of
// hand-written numbers, so a new story or lesson updates the page by itself.

export interface PackStats {
  words: number
  stories: number
  grammar: number
  topics: number
  phrases: number
  /** Has pre-recorded voices (public/audio/<code>/index.json); otherwise the browser reads it. */
  audio: boolean
}

export interface ContentStats {
  /** Packs listed in public/data/index.json. */
  languages: number
  /** Words across every pack. */
  words: number
  /** Short stories across every pack. */
  stories: number
  packs: Record<string, PackStats>
}

export const CONTENT: ContentStats = __CONTENT_STATS__

const NONE: PackStats = { words: 0, stories: 0, grammar: 0, topics: 0, phrases: 0, audio: false }

/** Counts for one pack; all zero for a pack that is not shipped. */
export function packStats(code: string): PackStats {
  return CONTENT.packs[code] ?? NONE
}

/**
 * A total as a promise that stays true while packs grow: rounded down to the
 * hundred, with "+" ("5.000+" in Vietnamese, "5,000+" in English).
 */
export function atLeast(n: number, lang: 'vi' | 'en'): string {
  const floor = Math.floor(n / 100) * 100
  return `${floor.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}+`
}
