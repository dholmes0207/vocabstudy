import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/authStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy, normalizeProgress } from '@/store/studyStore'
import { api } from '@/lib/api'

// Syncs the active language's progress with the server when logged in:
//  - on login / language change: pull server data (or push local up on first
//    login = migration from localStorage);
//  - on subsequent local changes: debounced push to the server.
// Guests keep using localStorage only.

export function useProgressSync(): void {
  const userId = useAuth((s) => s.user?.id ?? null)
  const lang = useSettings((s) => s.currentLang)
  const syncedKey = useRef<string | null>(null)

  // Pull (and migrate on first login).
  useEffect(() => {
    syncedKey.current = null
    if (!userId) return
    let alive = true
    const key = `${userId}:${lang}`
    ;(async () => {
      try {
        const { data } = await api.getProgress(lang)
        if (!alive) return
        if (data && typeof data === 'object') {
          useStudy.getState().setLanguageProgress(lang, normalizeProgress(data))
        } else {
          const local = useStudy.getState().progress[lang]
          if (local && Object.keys(local.cards).length > 0) {
            await api.putProgress(lang, local) // migrate localStorage -> server
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
    if (!userId) return
    const key = `${userId}:${lang}`
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsub = useStudy.subscribe((state, prev) => {
      if (syncedKey.current !== key) return
      if (state.progress[lang] === prev.progress[lang]) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const lp = useStudy.getState().progress[lang]
        if (lp) api.putProgress(lang, lp).catch(() => {})
      }, 1500)
    })
    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [userId, lang])
}
