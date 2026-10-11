import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Play, Square, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Word } from '@/types'
import { pronounce, stopPronounce, wordAudio } from '@/lib/audio'
import { useSettings } from '@/store/settingsStore'
import {
  isRecordingSupported,
  releaseRecording,
  startRecording,
  recorderErrorMessage,
  type ActiveRecording,
  type RecorderFailure,
  type Recording,
} from '@/lib/recorder'
import {
  isRecognitionSupported,
  listenOnce,
  recognitionErrorMessage,
  type ListenHandle,
} from '@/lib/speech'
import {
  feedbackFor,
  isPass,
  scorePronunciation,
  type PronunciationResult,
} from '@/lib/pronunciation'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT, useUiLang } from '@/lib/i18n'

interface Props {
  word: Word
  ttsLang: string
  /** Called once per graded attempt. `passed` feeds the SRS. */
  onAttempt?: (passed: boolean, score: number) => void
  /** Rendered under the result panel — usually a "next word" button. */
  footer?: React.ReactNode
}

type Phase = 'idle' | 'listening' | 'scoring' | 'done'

// Hard cap so a stuck session can never hold the microphone open forever.
const MAX_LISTEN_MS = 10_000

const canRecord = isRecordingSupported()
const canRecognize = isRecognitionSupported()

export default function PronounceTrainer({ word, ttsLang, onAttempt, footer }: Props) {
  const ttsRate = useSettings((s) => s.ttsRate)
  const strictness = useSettings((s) => s.speechStrictness)

  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<PronunciationResult | null>(null)
  const [recording, setRecording] = useState<Recording | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  /** Set when the attempt produced audio but no machine grade (Firefox). */
  const [selfRate, setSelfRate] = useState(false)
  const t = useT()

  const activeRec = useRef<ActiveRecording | null>(null)
  const listener = useRef<ListenHandle | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null)
  const playback = useRef<HTMLAudioElement | null>(null)
  /** Guards the async finish path against a word change or unmount. */
  const attemptId = useRef(0)
  /** Attempt that has already been graded, so it cannot be graded twice. */
  const finishedId = useRef(-1)

  const clearTimers = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    if (ticker.current) clearInterval(ticker.current)
    timeout.current = null
    ticker.current = null
  }, [])

  /** Tear everything down: mic, recognizer, timers, and the previous blob URL. */
  const reset = useCallback(() => {
    attemptId.current++
    clearTimers()
    listener.current?.abort()
    listener.current = null
    activeRec.current?.cancel()
    activeRec.current = null
    playback.current?.pause()
    playback.current = null
    setRecording((prev) => {
      releaseRecording(prev)
      return null
    })
    setResult(null)
    setError(null)
    setSelfRate(false)
    setElapsed(0)
    setPhase('idle')
  }, [clearTimers])

  // A new word means a new attempt; also cleans up on unmount.
  useEffect(() => reset, [word.id, reset])

  const playModel = () =>
    pronounce({ audioSrc: wordAudio(word.id), text: word.word, lang: ttsLang, rate: ttsRate })

  const playMine = () => {
    if (!recording) return
    stopPronounce()
    playback.current?.pause() // tapping twice must not stack two copies
    const el = new Audio(recording.url)
    playback.current = el
    void el
      .play()
      .catch(() => setError(t('Không phát lại được bản ghi.', "Couldn't play the recording back.")))
  }

  const finish = useCallback(
    (id: number, alternatives: string[] | null, failure: string | null) => {
      // Bail if a newer attempt superseded this one, or if this attempt already
      // finished — a recognizer can fire onresult and onend for one session.
      if (id !== attemptId.current || finishedId.current === id) return
      finishedId.current = id
      clearTimers()

      void activeRec.current?.stop().then((rec) => {
        if (id !== attemptId.current) {
          releaseRecording(rec)
          return
        }
        setRecording(rec)
      })
      activeRec.current = null

      if (alternatives) {
        const r = scorePronunciation(word.word, alternatives)
        setResult(r)
        const passed = isPass(r, strictness)
        if (passed) playCorrect()
        else playWrong()
        onAttempt?.(passed, r.score)
      } else {
        // No machine grade available — hand the judgement to the learner.
        setSelfRate(true)
        if (failure) setError(failure)
      }
      setPhase('done')
    },
    [clearTimers, onAttempt, strictness, word.word]
  )

  const start = async () => {
    reset()
    const id = ++attemptId.current
    stopPronounce()
    setPhase('listening')

    // Layer 1: capture the learner's voice. Available in every browser, and the
    // only part of this feature that works without a recognition service.
    let recFailure: RecorderFailure | null = null
    if (canRecord) {
      try {
        activeRec.current = await startRecording()
      } catch (e) {
        recFailure = (typeof e === 'string' ? e : 'error') as RecorderFailure
        activeRec.current = null
      }
    }
    // getUserMedia is async, so the learner may have moved on while the
    // permission prompt was up. Release the mic rather than leaving it open.
    if (id !== attemptId.current) {
      activeRec.current?.cancel()
      activeRec.current = null
      return
    }

    // Layer 2: machine grading, where the browser supports it. Deliberately
    // independent of layer 1 — one failing must not disable the other.
    if (canRecognize) {
      listener.current = listenOnce({
        lang: ttsLang,
        onResult: (alts) => finish(id, alts, null),
        onError: (reason) =>
          finish(id, null, reason === 'no-speech' ? null : recognitionErrorMessage(reason)),
      })
    }

    if (!canRecognize && !activeRec.current) {
      setPhase('idle')
      setError(
        recFailure ? recorderErrorMessage(recFailure) : recognitionErrorMessage('unsupported')
      )
      return
    }
    if (recFailure && canRecognize) {
      // Grading still works; just say why there is nothing to play back.
      setError(recorderErrorMessage(recFailure))
    }

    ticker.current = setInterval(() => setElapsed((e) => e + 100), 100)
    timeout.current = setTimeout(() => {
      setPhase('scoring')
      if (listener.current) listener.current.stop()
      else finish(id, null, null)
    }, MAX_LISTEN_MS)
  }

  const stop = () => {
    if (phase !== 'listening') return
    setPhase('scoring')
    clearTimers()
    if (listener.current) listener.current.stop()
    else finish(attemptId.current, null, null)
  }

  const rateSelf = (good: boolean) => {
    if (good) playCorrect()
    else playWrong()
    onAttempt?.(good, good ? 100 : 0)
    setSelfRate(false)
  }

  const listening = phase === 'listening'
  const scoring = phase === 'scoring'

  return (
    <div className="space-y-5">
      {/* Model pronunciation ------------------------------------------------ */}
      <div className="flex flex-col items-center gap-2">
        <button type="button" onClick={playModel} className="btn-secondary h-11 px-5">
          <Play className="h-4 w-4" /> {t('Nghe mẫu', 'Hear the model')}
        </button>
        {!canRecognize && (
          <p className="text-center text-xs text-slate-400">
            {t(
              'Trình duyệt này không chấm điểm được — bạn ghi âm rồi tự so với giọng mẫu nhé.',
              "This browser can't score — record yourself and compare with the model voice."
            )}
          </p>
        )}
      </div>

      {/* Microphone --------------------------------------------------------- */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={scoring}
          aria-label={
            listening
              ? t('Dừng ghi âm', 'Stop recording')
              : t(`Đọc từ "${word.word}"`, `Say "${word.word}"`)
          }
          className={`grid h-24 w-24 place-items-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-60 ${
            listening
              ? 'animate-pulse bg-rose-500 ring-8 ring-rose-200 dark:ring-rose-900/50'
              : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          {scoring ? (
            <Loader2 className="h-9 w-9 animate-spin" />
          ) : listening ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </button>

        <p className="text-sm font-medium text-slate-500" aria-live="polite">
          {listening
            ? t(
                `Đang nghe… ${(elapsed / 1000).toFixed(1)}s — bấm để dừng`,
                `Listening… ${(elapsed / 1000).toFixed(1)}s — tap to stop`
              )
            : scoring
              ? t('Đang chấm…', 'Scoring…')
              : phase === 'done'
                ? t('Bấm micro để thử lại', 'Tap the mic to try again')
                : t('Bấm micro rồi đọc to từ trên', 'Tap the mic and say the word above')}
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {error}
        </p>
      )}

      {/* Grade -------------------------------------------------------------- */}
      {result && <ScorePanel result={result} target={word.word} />}

      {/* A/B playback: the heart of the practice loop ------------------------ */}
      {recording && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={playModel} className="btn-secondary h-11">
            <Play className="h-4 w-4" /> {t('Giọng mẫu', 'Model voice')}
          </button>
          <button type="button" onClick={playMine} className="btn-secondary h-11">
            <Play className="h-4 w-4" /> {t('Giọng của bạn', 'Your voice')}
          </button>
        </div>
      )}

      {/* Self-grading fallback ---------------------------------------------- */}
      {selfRate && recording && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/60">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('Nghe lại hai giọng rồi tự chấm:', 'Listen to both, then grade yourself:')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => rateSelf(true)} className="btn-secondary h-11">
              <ThumbsUp className="h-4 w-4" /> {t('Giống rồi', 'Sounds the same')}
            </button>
            <button type="button" onClick={() => rateSelf(false)} className="btn-secondary h-11">
              <ThumbsDown className="h-4 w-4" /> {t('Chưa giống', 'Not yet')}
            </button>
          </div>
        </div>
      )}

      {footer}
    </div>
  )
}

const VERDICT_STYLE = {
  great: {
    ring: 'text-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    label: ['Chuẩn! 🎉', 'Spot on! 🎉'],
  },
  good: {
    ring: 'text-amber-500',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    label: ['Gần đúng 👍', 'Close 👍'],
  },
  retry: {
    ring: 'text-rose-500',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    label: ['Thử lại nhé 💪', 'Try again 💪'],
  },
} as const

function ScorePanel({ result, target }: { result: PronunciationResult; target: string }) {
  const style = VERDICT_STYLE[result.verdict]
  const t = useT()
  const lang = useUiLang()
  return (
    <div className="space-y-3 rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-800/60">
      <div className="flex items-center justify-center gap-4">
        <div className={`text-5xl font-extrabold tabular-nums ${style.ring}`}>{result.score}</div>
        <div className="text-left">
          <span className={`chip ${style.chip}`}>{t(style.label[0], style.label[1])}</span>
          {result.heard && (
            <p className="mt-1.5 text-sm text-slate-500">
              {t('Máy nghe được:', 'It heard:')}{' '}
              <b className="text-slate-700 dark:text-slate-200">{result.heard}</b>
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {feedbackFor(result, target, lang)}
      </p>
    </div>
  )
}
