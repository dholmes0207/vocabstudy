// Thin wrapper over the Web Speech API (SpeechSynthesis) for pronunciation.
// Gracefully degrades when the browser has no speech support / no voices.
//
// Voice quality with the browser API is capped by the voices installed on the
// user's machine. We rank the available voices to prefer natural/neural ones
// (Google, Microsoft, Apple "Siri"/enhanced, etc.) and avoid low-quality ones
// (espeak). The user can also pin a specific voice from Settings.

let cachedVoices: SpeechSynthesisVoice[] = []
let preferredVoiceURI: string | null = null

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

/** Pin a preferred voice by its voiceURI (or null to auto-select best). */
export function setPreferredVoiceURI(uri: string | null): void {
  preferredVoiceURI = uri
}

/** All installed voices matching a language (base code), for a settings picker. */
export function listVoices(lang: string): SpeechSynthesisVoice[] {
  const base = lang.toLowerCase().split('-')[0]
  return loadVoices()
    .filter((v) => v.lang.toLowerCase().startsWith(base))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
}

// Higher score = likely better quality. Tuned for English voices across OSes.
function voiceScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase()
  let s = 0
  if (/espeak|festival|pico/.test(n)) s -= 100 // known robotic engines
  if (/google/.test(n)) s += 40 // Chrome's networked voices are quite natural
  if (/natural|neural|premium|enhanced|wavenet/.test(n)) s += 45
  if (/microsoft/.test(n)) s += 30
  if (/siri|samantha|alex|daniel|karen|moira|aaron|nicky/.test(n)) s += 25 // Apple voices
  if (!v.localService) s += 10 // remote voices tend to be higher quality
  if (v.default) s += 3
  // Prefer common learner accents (US/GB) slightly.
  if (/en-us/i.test(v.lang)) s += 4
  else if (/en-gb/i.test(v.lang)) s += 3
  return s
}

/** Pick the best voice for a language, honouring the user's pinned choice. */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = loadVoices()
  if (!voices.length) return undefined
  if (preferredVoiceURI) {
    const pinned = voices.find((v) => v.voiceURI === preferredVoiceURI)
    if (pinned) return pinned
  }
  const ranked = listVoices(lang)
  if (ranked.length) return ranked[0]
  // Fall back to any voice for the exact tag, then any voice at all.
  return voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ?? voices[0]
}

export interface SpeakOptions {
  lang?: string
  rate?: number
  /** Override the auto/pinned voice for this one utterance. */
  voiceURI?: string
  onEnd?: () => void
  onStart?: () => void
}

/**
 * Speak a piece of text. Cancels any in-flight utterance first so rapid taps
 * don't queue up. Returns false if speech is unsupported or no voice exists.
 */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!isTTSSupported() || !text.trim()) return false
  const synth = window.speechSynthesis
  synth.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = opts.lang ?? 'en-US'
  utter.rate = clampRate(opts.rate ?? 1)
  utter.pitch = 1
  const voice = opts.voiceURI
    ? loadVoices().find((v) => v.voiceURI === opts.voiceURI) ?? pickVoice(utter.lang)
    : pickVoice(utter.lang)
  if (voice) {
    utter.voice = voice
    utter.lang = voice.lang
  }
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
