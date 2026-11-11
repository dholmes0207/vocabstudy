import { useEffect, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'
import {
  isRecordingSupported,
  recorderErrorMessage,
  releaseRecording,
  startRecording,
  type ActiveRecording,
  type Recording,
  type RecorderFailure,
} from '@/lib/recorder'
import { clock } from '@/lib/ielts'
import { useT } from '@/lib/i18n'

/**
 * Record an answer, then hear it back. `limit` stops the recording after that
 * many seconds (the two minutes of a Part 2 talk); `autoStart` begins at once.
 */
export default function AnswerRecorder({
  limit,
  autoStart = false,
  onRecorded,
}: {
  limit?: number
  autoStart?: boolean
  onRecorded?: () => void
}) {
  const t = useT()
  const [active, setActive] = useState<ActiveRecording | null>(null)
  const [recording, setRecording] = useState<Recording | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<RecorderFailure | null>(null)
  const started = useRef(false)
  const latest = useRef<Recording | null>(null)

  const start = async () => {
    setError(null)
    releaseRecording(latest.current)
    latest.current = null
    setRecording(null)
    setSeconds(0)
    try {
      setActive(await startRecording())
    } catch (reason) {
      setError(reason as RecorderFailure)
    }
  }
  const stopping = useRef(false)
  const stop = async () => {
    if (!active || stopping.current) return
    stopping.current = true
    const rec = await active.stop()
    stopping.current = false
    setActive(null)
    latest.current = rec
    setRecording(rec)
    onRecorded?.()
  }

  // Count the seconds while recording, and stop at the limit.
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  useEffect(() => {
    if (active && limit && seconds >= limit) void stop()
  })

  useEffect(() => {
    if (autoStart && !started.current && isRecordingSupported()) {
      started.current = true
      void start()
    }
  })

  // Let go of the mic and the audio when the learner leaves this question.
  const live = useRef<ActiveRecording | null>(null)
  useEffect(() => {
    live.current = active
  }, [active])
  useEffect(
    () => () => {
      live.current?.cancel()
      releaseRecording(latest.current)
    },
    []
  )

  if (!isRecordingSupported())
    return (
      <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        {t(
          'Trình duyệt này không ghi âm được: hãy trả lời thành tiếng, tự bấm giờ.',
          'This browser can’t record: answer out loud and time yourself.'
        )}
      </p>
    )

  return (
    <div className="space-y-2">
      {active ? (
        <button
          type="button"
          onClick={() => void stop()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 font-bold text-white shadow"
        >
          <Square className="h-4 w-4 fill-current" aria-hidden="true" />
          {t('Dừng', 'Stop')} · {clock(seconds)}
          {limit ? ` / ${clock(limit)}` : ''}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void start()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/50 dark:text-rose-200 dark:hover:bg-rose-950/40"
        >
          <Mic className="h-5 w-5" aria-hidden="true" />
          {recording ? t('Ghi lại', 'Record again') : t('Ghi âm câu trả lời', 'Record your answer')}
        </button>
      )}
      {recording && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t(
              `Bạn đã nói ${clock(Math.round(recording.durationMs / 1000))}. Nghe lại:`,
              `You spoke for ${clock(Math.round(recording.durationMs / 1000))}. Listen back:`
            )}
          </p>
          <audio controls src={recording.url} className="w-full" />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {recorderErrorMessage(error)}
        </p>
      )}
    </div>
  )
}
