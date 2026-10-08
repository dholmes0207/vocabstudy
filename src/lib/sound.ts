// Tiny WebAudio blips for quiz feedback — no audio assets needed.
// Lazily created so the AudioContext starts only after a user gesture.

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

function tone(freq: number, start: number, duration: number, gain = 0.08): void {
  const context = ac()
  if (!context) return
  if (context.state === 'suspended') void context.resume()
  const osc = context.createOscillator()
  const vol = context.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  vol.gain.value = gain
  osc.connect(vol).connect(context.destination)
  const t0 = context.currentTime + start
  osc.start(t0)
  // Simple attack/decay envelope to avoid clicks.
  vol.gain.setValueAtTime(gain, t0)
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.stop(t0 + duration + 0.02)
}

/** Pleasant rising two-note chime. */
export function playCorrect(): void {
  tone(660, 0, 0.14)
  tone(880, 0.1, 0.18)
}

/** Soft low buzz. */
export function playWrong(): void {
  tone(220, 0, 0.22, 0.06)
}

/**
 * A tiny buzz on phones that support it (Android): a tap for right, a double
 * tap for wrong. Silently does nothing elsewhere (iOS Safari has no vibrate).
 */
export function buzz(correct: boolean): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(correct ? 15 : [25, 40, 25])
    }
  } catch {
    // some browsers throw when vibration is blocked; feedback is optional
  }
}
