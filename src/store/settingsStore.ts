import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReviewStyle, Settings, SkyEffects, Strictness, ThemeSetting } from '@/types'
import { setPreferredVoiceURI } from '@/lib/tts'
import { setAudioVoiceKey } from '@/lib/audio'

interface SettingsState extends Settings {
  setTheme: (t: ThemeSetting) => void
  setCurrentLang: (code: string) => void
  setDailyNewLimit: (n: number) => void
  setDailyReviewLimit: (n: number) => void
  setTtsRate: (n: number) => void
  setAutoLevel: (b: boolean) => void
  setLevel: (n: number) => void
  setAudioVoice: (key: string) => void
  setTtsVoiceURI: (uri: string | null) => void
  setAutoSpeak: (b: boolean) => void
  setSpeechStrictness: (s: Strictness) => void
  setSoundEnabled: (b: boolean) => void
  setReviewStyle: (s: ReviewStyle) => void
  setSkyEffects: (s: SkyEffects) => void
  setSnow: (b: boolean) => void
  setCursorTrail: (b: boolean) => void
}

const DEFAULTS: Settings = {
  theme: 'system',
  currentLang: 'en',
  dailyNewLimit: 15,
  dailyReviewLimit: 0,
  ttsRate: 0.9,
  autoLevel: true,
  level: 1,
  audioVoice: 'aria',
  ttsVoiceURI: null,
  autoSpeak: false,
  speechStrictness: 'normal',
  soundEnabled: true,
  reviewStyle: 'recall',
  // New fields need no migration: persist merges the saved state over these
  // defaults, so existing learners simply get the sky switched on.
  skyEffects: 'auto',
  snow: true,
  cursorTrail: true,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setCurrentLang: (currentLang) => set({ currentLang }),
      setDailyNewLimit: (dailyNewLimit) => set({ dailyNewLimit: clamp(dailyNewLimit, 1, 100) }),
      setDailyReviewLimit: (dailyReviewLimit) =>
        set({ dailyReviewLimit: clamp(dailyReviewLimit, 0, 500) }),
      setTtsRate: (ttsRate) => set({ ttsRate: clamp(ttsRate, 0.5, 1.25) }),
      setAutoLevel: (autoLevel) => set({ autoLevel }),
      setLevel: (level) => set({ level: clamp(level, 1, 5) }),
      setAudioVoice: (audioVoice) => set({ audioVoice }),
      setTtsVoiceURI: (ttsVoiceURI) => set({ ttsVoiceURI }),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      setSpeechStrictness: (speechStrictness) => set({ speechStrictness }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setReviewStyle: (reviewStyle) => set({ reviewStyle }),
      setSkyEffects: (skyEffects) => set({ skyEffects }),
      setSnow: (snow) => set({ snow }),
      setCursorTrail: (cursorTrail) => set({ cursorTrail }),
    }),
    {
      name: 'vocab.settings.v1',
      version: 1,
    }
  )
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

/** Where the next theme change should ripple out from (the button that was pressed). */
let themeOrigin: { x: number; y: number } | null = null
export function setThemeOrigin(x: number, y: number): void {
  themeOrigin = { x, y }
}

export function applyTheme(theme: ThemeSetting): void {
  const root = document.documentElement
  const dark = resolveDark(theme)
  if (root.classList.contains('dark') === dark) return
  const flip = () => root.classList.toggle('dark', dark)
  // Night falls (or day breaks) as a circle spreading from the theme button.
  // Browsers without View Transitions, or with reduced motion, just switch.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || calm) {
    flip()
    return
  }
  const o = themeOrigin ?? { x: window.innerWidth / 2, y: 0 }
  themeOrigin = null
  root.style.setProperty('--vt-x', `${o.x}px`)
  root.style.setProperty('--vt-y', `${o.y}px`)
  doc.startViewTransition(flip)
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
