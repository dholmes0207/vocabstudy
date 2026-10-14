import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Browser Supabase client (Auth + Postgres with RLS). Configured via Vite env
// (public anon key — safe for the browser; RLS protects the data). When the env
// is missing the app still runs in guest / localStorage-only mode.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anon)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

/**
 * The project's public auth settings — which sign-in providers are switched on.
 * Read by the sign-in page so "Continue with Google" appears as soon as Google
 * is enabled in Supabase, with no redeploy. Null when unreachable.
 */
export async function fetchAuthSettings(): Promise<unknown> {
  if (!url || !anon) return null
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anon } })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

/** Current access token (for authenticated calls to Pages Functions), or null. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
