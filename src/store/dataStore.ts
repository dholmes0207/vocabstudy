import { create } from 'zustand'
import type { AudioVoice, DataManifest, LanguagePack } from '@/types'
import { loadManifest, loadPack } from '@/lib/dataLoader'
import { loadAudioManifest, setAudioLang, setAudioVoices } from '@/lib/audio'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface DataState {
  manifest: DataManifest | null
  pack: LanguagePack | null
  /** Pre-rendered voices available for the active language (edge-tts). */
  audioVoices: AudioVoice[]
  status: Status
  error: string | null
  ensureManifest: () => Promise<void>
  loadLanguage: (code: string) => Promise<void>
}

export const useData = create<DataState>((set, get) => ({
  manifest: null,
  pack: null,
  audioVoices: [],
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
      // Load the pre-rendered voice manifest (if any) so the app can prefer
      // neural audio and offer a voice picker.
      const audio = await loadAudioManifest(code)
      const voices = audio?.voices ?? []
      setAudioVoices(
        voices.map((v) => v.key),
        audio?.default ?? null
      )
      set({ pack, audioVoices: voices, status: 'ready' })
    } catch (e) {
      set({ status: 'error', error: msg(e) })
    }
  },
}))

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
