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

/** Current access token (for authenticated calls to Pages Functions), or null. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
