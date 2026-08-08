import { create } from 'zustand'
import type { DataManifest, LanguagePack } from '@/types'
import { loadManifest, loadPack } from '@/lib/dataLoader'
import { setAudioLang } from '@/lib/audio'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface DataState {
  manifest: DataManifest | null
  pack: LanguagePack | null
  status: Status
  error: string | null
  ensureManifest: () => Promise<void>
  loadLanguage: (code: string) => Promise<void>
}

export const useData = create<DataState>((set, get) => ({
  manifest: null,
  pack: null,
  status: 'idle',
  error: null,

  ensureManifest: async () => {
    if (get().manifest) return
    try {
      const manifest = await loadManifest()
      set({ manifest })
    } catch (e) {
      set({ status: 'error', error: msg(e) })
    }
  },

  loadLanguage: async (code) => {
    if (get().pack?.meta.code === code && get().status === 'ready') return
    set({ status: 'loading', error: null })
    try {
      const pack = await loadPack(code)
      setAudioLang(code)
      set({ pack, status: 'ready' })
    } catch (e) {
      set({ status: 'error', error: msg(e) })
    }
  },
}))

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
