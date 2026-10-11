// Thin wrapper over the Web Speech *Recognition* API (the counterpart to
// tts.ts, which wraps synthesis).
//
// Support is uneven and that shapes the whole feature: Chrome, Edge and Safari
// implement it (Chrome/Safari behind the `webkit` prefix); **Firefox does not**.
// Callers must check `isRecognitionSupported()` and fall back to self-grading —
// see PronounceTrainer. On Chrome the audio is sent to Google for recognition,
// which is why the trainer asks before starting rather than listening silently.

import { tx } from './i18n'

/** Minimal structural types — TS DOM lib does not ship SpeechRecognition. */
interface RecognitionAlternative {
  transcript: string
  confidence: number
}
interface RecognitionResult {
  length: number
  isFinal: boolean
  [index: number]: RecognitionAlternative
}
interface RecognitionResultList {
  length: number
  [index: number]: RecognitionResult
}
interface RecognitionEvent extends Event {
  results: RecognitionResultList
  resultIndex: number
}
interface RecognitionErrorEvent extends Event {
  error: string
}
interface RecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onaudiostart: (() => void) | null
}
type RecognitionCtor = new () => RecognitionInstance

function ctor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function isRecognitionSupported(): boolean {
  return !!ctor()
}

/** Why a listening session ended without a transcript. */
export type RecognitionFailure =
  | 'unsupported' // browser has no SpeechRecognition (Firefox)
  | 'not-allowed' // user denied the microphone, or the page is not secure
  | 'no-speech' // nothing audible
  | 'audio-capture' // no microphone device
  | 'network' // the recognition service could not be reached
  | 'aborted'
  | 'error'

export interface ListenHandle {
  /** Stop listening and let any pending result arrive. */
  stop: () => void
  /** Stop listening and discard the result. */
  abort: () => void
}

export interface ListenOptions {
  lang: string
  /** Called once with the recognizer's n-best list, best first. */
  onResult: (alternatives: string[]) => void
  onError: (reason: RecognitionFailure) => void
  /** Fired when the microphone actually opens — use it to show "đang nghe". */
  onStart?: () => void
  /** Fired exactly once when the session is over, whatever the outcome. */
  onEnd?: () => void
}

const MAX_ALTERNATIVES = 5

/**
 * Listen for a single utterance. Returns null when recognition is unavailable
 * (the caller should have checked `isRecognitionSupported()` first).
 *
 * Guarantees `onResult` **or** `onError` fires exactly once, then `onEnd` —
 * the underlying API is loose about this and can fire `onend` with no result.
 */
export function listenOnce(opts: ListenOptions): ListenHandle | null {
  const Ctor = ctor()
  if (!Ctor) {
    opts.onError('unsupported')
    opts.onEnd?.()
    return null
  }

  const rec = new Ctor()
  rec.lang = opts.lang
  rec.continuous = false
  rec.interimResults = false
  // Ask for several guesses: the top one is often not the most charitable
  // reading of a learner's accent, and the scorer checks them all.
  rec.maxAlternatives = MAX_ALTERNATIVES

  let settled = false
  const settle = (fn: () => void) => {
    if (settled) return
    settled = true
    fn()
  }

  rec.onaudiostart = () => opts.onStart?.()

  rec.onresult = (e) => {
    const result = e.results[e.results.length - 1]
    const alts: string[] = []
    for (let i = 0; i < result.length; i++) alts.push(result[i].transcript)
    settle(() => opts.onResult(alts))
  }

  rec.onerror = (e) => {
    const reason: RecognitionFailure =
      e.error === 'not-allowed' || e.error === 'service-not-allowed'
        ? 'not-allowed'
        : e.error === 'no-speech' ||
            e.error === 'audio-capture' ||
            e.error === 'network' ||
            e.error === 'aborted'
          ? e.error
          : 'error'
    settle(() => opts.onError(reason))
  }

  rec.onend = () => {
    // The session can end silently — treat that as "heard nothing" rather than
    // leaving the UI stuck on "đang nghe".
    settle(() => opts.onError('no-speech'))
    opts.onEnd?.()
  }

  try {
    rec.start()
  } catch {
    // start() throws if a session is already running.
    settle(() => opts.onError('error'))
    opts.onEnd?.()
    return null
  }

  return {
    stop: () => {
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    },
    abort: () => {
      settled = true
      try {
        rec.abort()
      } catch {
        /* already stopped */
      }
    },
  }
}

/** Vietnamese explanation for a failure, shown directly to the learner. */
export function recognitionErrorMessage(reason: RecognitionFailure): string {
  switch (reason) {
    case 'unsupported':
      return tx(
        'Trình duyệt này không chấm điểm phát âm được (Firefox chưa hỗ trợ). Bạn vẫn ghi âm và tự so sánh với giọng mẫu được.',
        "This browser can't score pronunciation (Firefox doesn't support it). You can still record and compare with the model voice."
      )
    case 'not-allowed':
      return tx(
        'Chưa được phép dùng micro. Bấm vào biểu tượng khoá 🔒 trên thanh địa chỉ để cấp quyền.',
        'Microphone access is blocked. Click the lock 🔒 in the address bar to allow it.'
      )
    case 'no-speech':
      return tx(
        'Không nghe thấy gì. Thử lại và đọc to, rõ hơn nhé.',
        "Didn't hear anything. Try again, louder and clearer."
      )
    case 'audio-capture':
      return tx('Không tìm thấy micro nào trên thiết bị.', 'No microphone found on this device.')
    case 'network':
      return tx(
        'Mất kết nối tới dịch vụ nhận dạng giọng nói. Kiểm tra mạng rồi thử lại.',
        'Lost connection to the speech service. Check your network and try again.'
      )
    default:
      return tx('Có lỗi khi nghe. Thử lại nhé.', 'Something went wrong while listening. Try again.')
  }
}
