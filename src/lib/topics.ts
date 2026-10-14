// Topic decks — "Công sở", "Sức khoẻ"… (docs/design/topics.md). The list lives
// in public/data/topics/<lang>.json and points at words of the language pack.

export interface Topic {
  id: string
  emoji: string
  title: [vi: string, en: string]
  wordIds: number[]
}

/** The topics in a fetched file; anything malformed is dropped, never thrown. */
export function parseTopics(json: unknown): Topic[] {
  const list = (json as { topics?: unknown } | null)?.topics
  if (!Array.isArray(list)) return []
  return list.filter(
    (t): t is Topic =>
      !!t &&
      typeof t.id === 'string' &&
      typeof t.emoji === 'string' &&
      Array.isArray(t.title) &&
      t.title.length === 2 &&
      t.title.every((s: unknown) => typeof s === 'string') &&
      Array.isArray(t.wordIds) &&
      t.wordIds.every((n: unknown) => Number.isInteger(n))
  )
}

const cache = new Map<string, Promise<Topic[]>>()

/** Topics for a language pack; [] when it has none (or offline without a copy). */
export function loadTopics(lang: string): Promise<Topic[]> {
  let p = cache.get(lang)
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/topics/${lang}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(parseTopics)
      .catch(() => [])
    cache.set(lang, p)
  }
  return p
}
