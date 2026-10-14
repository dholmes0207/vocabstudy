// Sign-in with Google (docs/design/google-login.md): the pure pieces — which
// providers the Supabase project has switched on, whether an account has a
// password at all, and the consent a person gave by tapping "Continue with
// Google" before the browser left for Google.

/** Which sign-in methods the Supabase project offers (GET /auth/v1/settings). */
export function parseProviders(json: unknown): { google: boolean } {
  const external = (json as { external?: Record<string, unknown> } | null)?.external
  return { google: external?.google === true }
}

/**
 * Can this account sign in with a password? Google-only accounts cannot, so
 * anything that re-checks a password must ask for something else. Unknown
 * (no identity list) counts as yes — the safer answer for deleting an account.
 */
export function hasPasswordLogin(user: { identities?: { provider: string }[] | null }): boolean {
  const ids = user.identities
  if (!ids || ids.length === 0) return true
  return ids.some((i) => i.provider === 'email')
}

export const PENDING_CONSENT_KEY = 'vocab.auth.pendingConsent'

/** How long a tap on "Continue with Google" stands as consent while away at Google. */
export const PENDING_CONSENT_TTL_MS = 15 * 60 * 1000

export interface PendingConsent {
  version: string
  at: string
  method: 'google'
}

/** Remember the consent given by the tap, for when Google sends the person back. */
export function savePendingConsent(
  storage: Pick<Storage, 'setItem'>,
  version: string,
  now: Date = new Date()
): void {
  try {
    const c: PendingConsent = { version, at: now.toISOString(), method: 'google' }
    storage.setItem(PENDING_CONSENT_KEY, JSON.stringify(c))
  } catch {
    // private mode: consent is then simply not recorded for this sign-in
  }
}

/** The consent saved before leaving for Google, if still fresh; always clears it. */
export function takePendingConsent(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  now: Date = new Date()
): PendingConsent | null {
  try {
    const raw = storage.getItem(PENDING_CONSENT_KEY)
    storage.removeItem(PENDING_CONSENT_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Partial<PendingConsent>
    if (typeof c.version !== 'string' || typeof c.at !== 'string' || c.method !== 'google')
      return null
    const age = now.getTime() - Date.parse(c.at)
    if (!(age >= 0 && age <= PENDING_CONSENT_TTL_MS)) return null
    return { version: c.version, at: c.at, method: 'google' }
  } catch {
    return null
  }
}
