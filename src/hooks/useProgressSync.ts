import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy, normalizeProgress } from '@/store/studyStore'
import { supabase } from '@/lib/supabase'

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
        const { data } = await sb
          .from('progress')
          .select('data')
          .eq('user_id', userId)
          .eq('lang_code', lang)
          .maybeSingle()
        if (!alive) return
        if (data?.data) {
          useStudy.getState().setLanguageProgress(lang, normalizeProgress(data.data))
        } else {
          const local = useStudy.getState().progress[lang]
          if (local && Object.keys(local.cards).length > 0) {
            await sb.from('progress').upsert({
              user_id: userId,
              lang_code: lang,
              data: local,
              updated_at: new Date().toISOString(),
            })
          }
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

  // Push local changes (debounced) once synced.
  useEffect(() => {
    if (!userId || !supabase) return
    const sb = supabase
    const key = `${userId}:${lang}`
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsub = useStudy.subscribe((state, prev) => {
      if (syncedKey.current !== key) return
      if (state.progress[lang] === prev.progress[lang]) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const lp = useStudy.getState().progress[lang]
        if (lp)
          void sb.from('progress').upsert({
            user_id: userId,
            lang_code: lang,
            data: lp,
            updated_at: new Date().toISOString(),
          })
      }, 1500)
    })
    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [userId, lang])
}
