// Thin wrapper over the Web Speech API (SpeechSynthesis) for pronunciation.
// Gracefully degrades when the browser has no speech support.

let cachedVoices: SpeechSynthesisVoice[] = []

function loadVoices(): SpeechSynthesisVoice[] {
  if (!isTTSSupported()) return []
  const v = window.speechSynthesis.getVoices()
  if (v.length) cachedVoices = v
  return cachedVoices
}

// Voices load asynchronously in some browsers; keep our cache warm.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = () => loadVoices()
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

/** Pick the best available voice for a BCP-47 language tag. */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = loadVoices()
  if (!voices.length) return undefined
  const base = lang.toLowerCase().split('-')[0]
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
    undefined
  )
}

export interface SpeakOptions {
  lang?: string
  rate?: number
  onEnd?: () => void
  onStart?: () => void
}

/**
 * Speak a piece of text. Cancels any in-flight utterance first so rapid taps
 * don't queue up. Returns false if speech is unsupported.
 */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!isTTSSupported() || !text.trim()) return false
  const synth = window.speechSynthesis
  synth.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = opts.lang ?? 'en-US'
  utter.rate = clampRate(opts.rate ?? 1)
  const voice = pickVoice(utter.lang)
  if (voice) utter.voice = voice
  if (opts.onStart) utter.onstart = opts.onStart
  if (opts.onEnd) {
    utter.onend = opts.onEnd
    utter.onerror = opts.onEnd
  }
  synth.speak(utter)
  return true
}

export function stopSpeaking(): void {
  if (isTTSSupported()) window.speechSynthesis.cancel()
}

function clampRate(rate: number): number {
  return Math.max(0.5, Math.min(1.25, rate))
}
