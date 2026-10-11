// The signed-in user as last confirmed, kept on the device so the header can
// show the avatar the instant the page opens. Supabase answers a beat later
// (and on a slow phone, several seconds later); until then the menu used to be
// a grey placeholder nobody could tap. Display only: every server call still
// carries the real token and is checked server-side, so a stale copy here can
// never grant anything — at worst it shows a name for a moment.

export interface CachedUser {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
  status: 'active' | 'locked' | 'pending'
}

export const AUTH_CACHE_KEY = 'vocab.auth.user.v1'

/** A cached user, or null for anything missing, malformed or not usable. */
export function parseCachedUser(raw: string | null): CachedUser | null {
  if (!raw) return null
  try {
    const u = JSON.parse(raw) as Partial<CachedUser>
    if (typeof u.id !== 'string' || !u.id || typeof u.email !== 'string') return null
    // Only an active account is worth showing as signed in.
    if (u.status !== 'active') return null
    return {
      id: u.id,
      email: u.email,
      name: typeof u.name === 'string' ? u.name : '',
      role: u.role === 'admin' ? 'admin' : 'student',
      status: 'active',
    }
  } catch {
    return null
  }
}

export function readCachedUser(): CachedUser | null {
  try {
    return parseCachedUser(localStorage.getItem(AUTH_CACHE_KEY))
  } catch {
    return null
  }
}

export function writeCachedUser(user: CachedUser | null): void {
  try {
    if (user && user.status === 'active') localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_CACHE_KEY)
  } catch {
    // private mode / storage full — the avatar just appears a moment later
  }
}
