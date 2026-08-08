import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings, ThemeSetting } from '@/types'
import { setPreferredVoiceURI } from '@/lib/tts'
import { setAudioVoiceKey } from '@/lib/audio'

interface SettingsState extends Settings {
  setTheme: (t: ThemeSetting) => void
  setCurrentLang: (code: string) => void
  setDailyNewLimit: (n: number) => void
  setDailyReviewLimit: (n: number) => void
  setTtsRate: (n: number) => void
  setAudioVoice: (key: string) => void
  setTtsVoiceURI: (uri: string | null) => void
  setAutoSpeak: (b: boolean) => void
}

const DEFAULTS: Settings = {
  theme: 'system',
  currentLang: 'en',
  dailyNewLimit: 15,
  dailyReviewLimit: 0,
  ttsRate: 0.9,
  audioVoice: 'aria',
  ttsVoiceURI: null,
  autoSpeak: false,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setCurrentLang: (currentLang) => set({ currentLang }),
      setDailyNewLimit: (dailyNewLimit) => set({ dailyNewLimit: clamp(dailyNewLimit, 1, 100) }),
      setDailyReviewLimit: (dailyReviewLimit) => set({ dailyReviewLimit: clamp(dailyReviewLimit, 0, 500) }),
      setTtsRate: (ttsRate) => set({ ttsRate: clamp(ttsRate, 0.5, 1.25) }),
      setAudioVoice: (audioVoice) => set({ audioVoice }),
      setTtsVoiceURI: (ttsVoiceURI) => set({ ttsVoiceURI }),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
    }),
    {
      name: 'vocab.settings.v1',
      version: 1,
    },
  ),
)

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo
  return Math.max(lo, Math.min(hi, n))
}

// ---------------------------------------------------------------------------
// Theme application: reflect the active theme onto <html class="dark"> and keep
// it in sync with the OS when the setting is "system".
// ---------------------------------------------------------------------------

function resolveDark(theme: ThemeSetting): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: ThemeSetting): void {
  const dark = resolveDark(theme)
  document.documentElement.classList.toggle('dark', dark)
}

/** Wire up theme + TTS-voice reactivity. Call once at app startup. */
export function initTheme(): void {
  const s0 = useSettings.getState()
  applyTheme(s0.theme)
  setPreferredVoiceURI(s0.ttsVoiceURI)
  setAudioVoiceKey(s0.audioVoice)

  // React to setting changes.
  useSettings.subscribe((s) => {
    applyTheme(s.theme)
    setPreferredVoiceURI(s.ttsVoiceURI)
    setAudioVoiceKey(s.audioVoice)
  })

  // React to OS changes while on "system".
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (useSettings.getState().theme === 'system') applyTheme('system')
  })
}
