// Where a visit should land (docs/design/landing.md). Newcomers see the
// marketing page at "/"; anyone who has already used the app goes straight to
// it at "/home", like any product that remembers you.

/** Set the first time the app shell opens on this device. */
export const ENTERED_KEY = 'vocab.app.entered'

/**
 * The clean path for an old hash URL ("#/phrases?x=1" → "/phrases?x=1"), or
 * null when the hash is not a route — Supabase puts `#access_token=…` on email
 * confirmation links and that must be left alone for supabase-js to read.
 */
export function hashToPath(hash: string): string | null {
  if (!hash.startsWith('#/')) return null
  const path = hash.slice(1)
  return path === '/' ? '/home' : path
}

/**
 * Where a Supabase auth redirect (email confirmation, password reset, expired
 * link) should continue, or null when the URL is not one. These must land in
 * the app, not on the landing page, and the fragment must survive the move so
 * supabase-js can read it (docs/design/account.md).
 */
export function authCallbackPath(hash: string, search = ''): string | null {
  const callback =
    /^#(?:.*&)?(?:access_token|error_description|error)=/.test(hash) || /[?&]code=/.test(search)
  if (!callback) return null
  return /[#&]type=recovery(?:&|$)/.test(hash) ? '/reset-password' : '/home'
}

/** Has this device used the app before (studied, signed in, or opened it)? */
export function hasUsedApp(storage: Pick<Storage, 'getItem'>): boolean {
  try {
    if (storage.getItem(ENTERED_KEY)) return true
    if (storage.getItem('vocab.auth.user.v1')) return true
    const raw = storage.getItem('vocab.progress.v1')
    if (!raw) return false
    const progress = (JSON.parse(raw) as { state?: { progress?: Record<string, unknown> } }).state
      ?.progress
    return (
      !!progress &&
      Object.values(progress).some((lang) => {
        const l = lang as { cards?: Record<string, unknown>; stats?: { lastStudyDay?: unknown } }
        return Object.keys(l.cards ?? {}).length > 0 || l.stats?.lastStudyDay != null
      })
    )
  } catch {
    return false
  }
}

export function markEntered(storage: Pick<Storage, 'setItem'>): void {
  try {
    storage.setItem(ENTERED_KEY, '1')
  } catch {
    // private mode: the landing page simply shows again next time
  }
}
