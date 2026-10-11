// Microphone capture via MediaRecorder.
//
// This is the layer that works *everywhere* — Chrome, Edge, Safari (iOS 14.3+)
// and Firefox — so the "record and compare against the native audio" loop is
// available to every learner, even where speech recognition is not. It needs a
// secure context (https or localhost), which production already has.

import { tx } from './i18n'

export type RecorderFailure = 'unsupported' | 'not-allowed' | 'no-device' | 'error'

export interface Recording {
  /** Object URL for playback. Call `releaseRecording` when done with it. */
  url: string
  blob: Blob
  /** Milliseconds captured. */
  durationMs: number
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  )
}

/** Pick a container the browser will actually produce. Safari only does mp4. */
function pickMimeType(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported?.(type)) return type
  }
  return undefined // let the browser choose
}

export interface ActiveRecording {
  /** Stop capturing and resolve the recording. Safe to call twice. */
  stop: () => Promise<Recording>
  /** Stop capturing and throw the audio away. */
  cancel: () => void
}

/**
 * Start recording from the default microphone.
 *
 * Throws a `RecorderFailure` string when the mic is unavailable, so callers can
 * map it to a message without parsing DOMException names themselves.
 */
export async function startRecording(): Promise<ActiveRecording> {
  if (!isRecordingSupported()) throw 'unsupported' as RecorderFailure

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      // Leave the learner's own voice as untouched as the browser allows:
      // aggressive noise suppression can mangle what they are trying to hear.
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true },
    })
  } catch (e) {
    const name = e instanceof DOMException ? e.name : ''
    if (name === 'NotAllowedError' || name === 'SecurityError')
      throw 'not-allowed' as RecorderFailure
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      throw 'no-device' as RecorderFailure
    }
    throw 'error' as RecorderFailure
  }

  const mimeType = pickMimeType()
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks: BlobPart[] = []
  const startedAt = Date.now()

  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }
  rec.start()

  // Always release the mic — a live track keeps the browser's recording
  // indicator on and can block the next getUserMedia call.
  const releaseMic = () => stream.getTracks().forEach((t) => t.stop())

  let settled: Promise<Recording> | null = null

  return {
    stop: () => {
      if (settled) return settled
      settled = new Promise<Recording>((resolve) => {
        rec.onstop = () => {
          releaseMic()
          const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
          resolve({ url: URL.createObjectURL(blob), blob, durationMs: Date.now() - startedAt })
        }
        if (rec.state === 'inactive') rec.onstop?.(new Event('stop'))
        else rec.stop()
      })
      return settled
    },
    cancel: () => {
      try {
        if (rec.state !== 'inactive') rec.stop()
      } catch {
        /* already stopped */
      }
      releaseMic()
    },
  }
}

/** Revoke a recording's object URL. Forgetting this leaks memory per attempt. */
export function releaseRecording(rec: Recording | null): void {
  if (rec) URL.revokeObjectURL(rec.url)
}

/** Vietnamese explanation for a microphone failure. */
export function recorderErrorMessage(reason: RecorderFailure): string {
  switch (reason) {
    case 'unsupported':
      return tx(
        'Trình duyệt này không ghi âm được. Thử Chrome, Edge hoặc Safari bản mới.',
        "This browser can't record. Try a recent Chrome, Edge or Safari."
      )
    case 'not-allowed':
      return tx(
        'Chưa được phép dùng micro. Bấm biểu tượng khoá 🔒 trên thanh địa chỉ để cấp quyền rồi thử lại.',
        'Microphone access is blocked. Click the lock 🔒 in the address bar to allow it, then retry.'
      )
    case 'no-device':
      return tx('Không tìm thấy micro nào trên thiết bị.', 'No microphone found on this device.')
    default:
      return tx('Không mở được micro. Thử lại nhé.', "Couldn't open the microphone. Try again.")
  }
}
