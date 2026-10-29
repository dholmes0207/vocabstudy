import { create } from 'zustand'
import type { AudioVoice, DataManifest, LanguagePack } from '@/types'
import { loadDetails, loadManifest, loadPack } from '@/lib/dataLoader'
import type { PackDetails } from '@/lib/packDetails'
import { loadAudioManifest, setAudioLang, setAudioVoices } from '@/lib/audio'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface DataState {
  manifest: DataManifest | null
  pack: LanguagePack | null
  /** Collocations, tips and word families of the active pack; null until fetched. */
  details: PackDetails | null
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
  details: null,
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
    set({ status: 'loading', error: null, details: null })
    try {
      // The pre-rendered voice manifest (if any) lets the app prefer neural
      // audio and offer a voice picker. Fetched alongside the pack, not after
      // it: on a slow phone network each round trip is a visible wait.
      const [pack, audio] = await Promise.all([loadPack(code), loadAudioManifest(code)])
      setAudioLang(code)
      const voices = audio?.voices ?? []
      setAudioVoices(
        voices.map((v) => v.key),
        audio?.default ?? null
      )
      set({ pack, audioVoices: voices, status: 'ready' })
      // After the first screen, not before it: only an opened card shows these.
      void loadDetails(code).then((details) => {
        if (get().pack?.meta.code === code) set({ details })
      })
    } catch (e) {
      set({ status: 'error', error: msg(e) })
    }
  },
}))

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
