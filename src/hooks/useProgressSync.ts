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
            await sb
              .from('progress')
              .upsert({
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
          void sb
            .from('progress')
            .upsert({
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
