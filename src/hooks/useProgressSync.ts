import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy, normalizeProgress } from '@/store/studyStore'
import { supabase } from '@/lib/supabase'
import { mergeProgress } from '@/lib/sync'

// Syncs the active language's progress with Supabase (table `progress`, guarded
// by RLS so each user only sees their own rows):
//  - on login / language change: pull server data (or push local up on first
//    login = migration from localStorage);
//  - on subsequent local changes: debounced upsert.
// Guests (or when Supabase isn't configured) keep using localStorage only.

/**
 * One-shot sessionStorage flag set by "Khôi phục" (backup import) when the user
 * is logged in. On the next sync after reload we push local up instead of
 * pulling server down, so a restored backup isn't clobbered. See F3.
 */
export const RESTORE_FLAG = 'vocab.restoredBackup'

export function useProgressSync(): void {
  const userId = useAuth((s) => s.user?.id ?? null)
  const lang = useSettings((s) => s.currentLang)
  const syncedKey = useRef<string | null>(null)

  // Pull (and migrate on first login).
  useEffect(() => {
    syncedKey.current = null
    if (!userId || !supabase) return
    const sb = supabase
    let alive = true
    const key = `${userId}:${lang}`
    ;(async () => {
      try {
        // Just restored a backup while logged in? The freshly-imported local
        // data must WIN — push every language up to the server instead of
        // pulling the (older) server rows down over it. Otherwise the restore
        // would be silently overwritten right after the reload.
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(RESTORE_FLAG)) {
          sessionStorage.removeItem(RESTORE_FLAG)
          const all = useStudy.getState().progress
          const stamp = new Date().toISOString()
          await Promise.all(
            Object.entries(all).map(([lc, lp]) =>
              lp
                ? sb.from('progress').upsert({
                    user_id: userId,
                    lang_code: lc,
                    data: lp,
                    updated_at: stamp,
                  })
                : Promise.resolve()
            )
          )
          if (!alive) return
          syncedKey.current = key
          return
        }
        const { data, error } = await sb
          .from('progress')
          .select('data')
          .eq('user_id', userId)
          .eq('lang_code', lang)
          .maybeSingle()
        if (!alive) return
        // supabase-js resolves a failed request as { data: null, error }, not a
        // throw. Read as "no row", it pushed this device's cards over the whole
        // server copy. Stay unsynced: pushes wait for the next successful pull.
        if (error) return
        const local = useStudy.getState().progress[lang]
        if (data?.data) {
          // MERGE, never overwrite. A blind `setLanguageProgress(remote)` here
          // erased work done while the connection was flaky (the earlier pull
          // failed, so pushes stayed blocked and the session lived only on this
          // device) and work done on a second device. See src/lib/sync.ts.
          const remote = normalizeProgress(data.data)
          const merged = mergeProgress(local, remote)
          useStudy.getState().setLanguageProgress(lang, merged)
          // Only write back when this device actually contributed something.
          if (JSON.stringify(merged) !== JSON.stringify(remote)) {
            await sb.from('progress').upsert({
              user_id: userId,
              lang_code: lang,
              data: merged,
              updated_at: new Date().toISOString(),
            })
          }
        } else if (local && Object.keys(local.cards).length > 0) {
          await sb.from('progress').upsert({
            user_id: userId,
            lang_code: lang,
            data: local,
            updated_at: new Date().toISOString(),
          })
        }
        syncedKey.current = key
      } catch {
        /* offline / not fatal — keep local */
      }
    })()
    return () => {
      alive = false
    }
  }, [userId, lang])

  // Push local changes (debounced) once synced. Each push merges the server row
  // first: a plain upsert let a second open device (phone + laptop) overwrite
  // what the other had saved meanwhile.
  // shortcut: read-merge-write is not atomic; two pushes landing in the same
  // instant can still drop one side until its next push. A server-side merge
  // (Postgres function) closes that if it ever shows up.
  useEffect(() => {
    if (!userId || !supabase) return
    const sb = supabase
    const key = `${userId}:${lang}`
    let timer: ReturnType<typeof setTimeout> | undefined
    // Set while adopting the merged copy, so taking in another device's cards
    // does not count as new study and schedule another push.
    let adopting = false
    const push = async () => {
      if (!useStudy.getState().progress[lang]) return
      const { data, error } = await sb
        .from('progress')
        .select('data')
        .eq('user_id', userId)
        .eq('lang_code', lang)
        .maybeSingle()
      // Unreadable: skip this push; the next change tries again.
      if (error || syncedKey.current !== key) return
      // Read local only now, so study done while the row was loading is kept.
      const local = useStudy.getState().progress[lang]
      if (!local) return
      const remote = data?.data ? normalizeProgress(data.data) : undefined
      const merged = remote ? mergeProgress(local, remote) : local
      if (JSON.stringify(merged) !== JSON.stringify(local)) {
        adopting = true
        useStudy.getState().setLanguageProgress(lang, merged)
        adopting = false
      }
      if (remote && JSON.stringify(merged) === JSON.stringify(remote)) return
      await sb.from('progress').upsert({
        user_id: userId,
        lang_code: lang,
        data: merged,
        updated_at: new Date().toISOString(),
      })
    }
    const unsub = useStudy.subscribe((state, prev) => {
      if (adopting || syncedKey.current !== key) return
      if (state.progress[lang] === prev.progress[lang]) return
      clearTimeout(timer)
      timer = setTimeout(() => void push(), 1500)
    })
    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [userId, lang])
}
