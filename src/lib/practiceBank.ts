// Hand-written exam practice (TOEIC, HSK) ships as JSON in public/data, fetched
// when its page opens instead of compiled into the code (docs/design/toeic.md).
// The files are not type-checked, so each bank is checked when it loads and a
// broken edit fails loudly instead of showing a broken question.

/** Throws `<name>: <what>` unless `ok`. */
export function checker(name: string) {
  return (ok: boolean, what: string): void => {
    if (!ok) throw new Error(`${name}: ${what}`)
  }
}

/** A non-empty string. */
export const text = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''

/** Exactly `n` non-empty strings. */
export const texts = (v: unknown, n: number): boolean =>
  Array.isArray(v) && v.length === n && v.every(text)

/**
 * A loader for a bank under public/data: fetched once per page load and
 * checked; a failed fetch is tried again on the next call.
 */
export function bankLoader<T>(path: string, validate: (raw: unknown) => T): () => Promise<T> {
  let cached: Promise<T> | null = null
  return () => {
    if (!cached) {
      cached = fetch(`${import.meta.env.BASE_URL}${path}`)
        .then((res) => {
          if (!res.ok) throw new Error(`${path} (${res.status})`)
          return res.json()
        })
        .then(validate)
      cached.catch(() => {
        cached = null
      })
    }
    return cached
  }
}
