import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Headphones, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useLogActivity } from '@/hooks/useLogActivity'
import { exampleAudio, prefetchAudio, pronounce, stopPronounce, wordAudio } from '@/lib/audio'
import { isTTSSupported, listVoices, speak } from '@/lib/tts'
import { skyBurstAt } from '@/lib/skyEvents'
import {
  LISTEN_SIZE,
  defaultSource,
  isHard,
  listenSteps,
  pickListenWords,
  type ListenPace,
  type ListenSource,
  type ListenStep,
} from '@/lib/listen'
import { quickStartPath } from '@/lib/motivation'
import { getDueCards } from '@/lib/srs'
import { today } from '@/lib/date'
import { Field, Segment } from '@/components/Choice'
import EmptyState from '@/components/EmptyState'
import SessionComplete from '@/components/SessionComplete'
import { tx, useT } from '@/lib/i18n'

// "Nghe thụ động" (docs/design/listen.md): tap once, then just listen.

const SOURCES: { key: ListenSource; label: string; labelEn: string }[] = [
  { key: 'learned', label: 'Từ đã học', labelEn: 'Learned' },
  { key: 'hard', label: 'Từ hay quên', labelEn: 'Often missed' },
  { key: 'upcoming', label: 'Từ sắp học', labelEn: 'Coming up' },
]

const PACES: { key: ListenPace; label: string; labelEn: string }[] = [
  { key: 'short', label: 'Nhanh', labelEn: 'Quick' },
  { key: 'normal', label: 'Vừa', labelEn: 'Normal' },
  { key: 'long', label: 'Thong thả', labelEn: 'Relaxed' },
]

/** About 11 seconds a word at the normal pace. */
const minutes = (words: number) => Math.max(1, Math.round((words * 11) / 60))

/** The best installed Vietnamese voice, if any — never read Vietnamese with an English one. */
function vietnameseVoice(): string | null {
  return isTTSSupported() ? (listVoices('vi')[0]?.voiceURI ?? null) : null
}

export default function Listen() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const progress = useStudy((s) => s.progress[code])
  const cards = progress?.cards ?? NO_CARDS

  const counts = useMemo(() => {
    const learned = pack.words.filter((w) => cards[w.id]).length
    return {
      learned,
      hard: pack.words.filter((w) => isHard(cards[w.id])).length,
      upcoming: pack.words.length - learned,
    }
  }, [pack.words, cards])

  const [source, setSource] = useState<ListenSource>(() => defaultSource(counts.learned))
  const [pace, setPace] = useState<ListenPace>('normal')
  const [viVoice, setViVoice] = useState<string | null>(vietnameseVoice)
  const [sayMeaning, setSayMeaning] = useState(true)
  const [playlist, setPlaylist] = useState<Word[] | null>(null)
  const t = useT()

  // Browsers load their voice list late; pick up a Vietnamese voice when it arrives.
  useEffect(() => {
    if (!isTTSSupported()) return
    const update = () => setViVoice(vietnameseVoice())
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  if (playlist) {
    return (
      <Player
        words={playlist}
        pace={pace}
        ttsLang={pack.meta.ttsLang}
        viVoice={sayMeaning ? viVoice : null}
        due={getDueCards(Object.values(cards), today()).length}
        preview={source === 'upcoming'}
        onRestart={() => setPlaylist(null)}
      />
    )
  }

  const available = counts[source]
  const size = Math.min(LISTEN_SIZE, available)
  const start = () => {
    const words = pickListenWords(pack.words, cards, source)
    if (words.length) setPlaylist(words)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Nghe thụ động', 'Hands-free listening')}</span>{' '}
          <span aria-hidden="true">🎧</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Mệt, bận tay, đang trên xe? Bấm một lần rồi cứ thế nghe: từ → nghĩa → câu ví dụ. Không chấm điểm, không áp lực.',
            'Tired, hands busy, on the bus? Tap once and just listen: word → meaning → example. No scores, no pressure.'
          )}
        </p>
      </header>

      <div className="card space-y-6 p-6">
        <Field label={t('Nghe gì', 'What to hear')}>
          <div className="grid grid-cols-3 gap-2">
            {SOURCES.map((s) => (
              <Segment
                key={s.key}
                active={source === s.key}
                onClick={() => setSource(s.key)}
                disabled={counts[s.key] === 0}
              >
                {t(s.label, s.labelEn)} <span className="opacity-60">({counts[s.key]})</span>
              </Segment>
            ))}
          </div>
          {source === 'upcoming' && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Nghe trước những từ sắp học — đến lúc học thật sẽ thấy quen tai.',
                "Hear the words you'll learn next — they'll sound familiar when you study them."
              )}
            </p>
          )}
        </Field>

        <Field label={t('Nhịp', 'Pace')}>
          <div className="grid grid-cols-3 gap-2">
            {PACES.map((p) => (
              <Segment key={p.key} active={pace === p.key} onClick={() => setPace(p.key)}>
                {t(p.label, p.labelEn)}
              </Segment>
            ))}
          </div>
        </Field>

        {viVoice && (
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={sayMeaning}
              onChange={(e) => setSayMeaning(e.target.checked)}
            />
            {t(
              'Đọc to nghĩa tiếng Việt (nghe mà không cần nhìn màn hình)',
              'Read the Vietnamese meaning aloud (no need to look at the screen)'
            )}
          </label>
        )}

        {available === 0 ? (
          <EmptyState
            emoji="🎧"
            title={t('Chưa có từ nào ở mục này', 'No words here yet')}
            description={t('Chọn mục khác nhé.', 'Pick another option.')}
          />
        ) : (
          <button onClick={start} className="btn-primary w-full py-3 text-base">
            <Headphones className="h-5 w-5" />{' '}
            {t(
              `Bắt đầu nghe ${size} từ (≈ ${minutes(size)} phút)`,
              `Listen to ${size} words (≈ ${minutes(size)} min)`
            )}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Mẹo: trên điện thoại, bạn có thể tạm dừng hoặc chuyển từ ngay ở màn hình khoá.',
          'Tip: on a phone you can pause or skip straight from the lock screen.'
        )}
      </p>
    </div>
  )
}

/** Resolve after `ms`, or as soon as the run is cancelled (never rejects). */
function wait(ms: number, cancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now()
    const tick = () => {
      if (cancelled() || Date.now() - started >= ms) resolve()
      else setTimeout(tick, Math.min(100, ms))
    }
    setTimeout(tick, Math.min(100, ms))
  })
}

/**
 * Play a clip (MP3 first, Web Speech fallback) and resolve when it ends. A
 * safety timeout keeps the playlist moving if a browser never reports the end.
 */
function playClip(opts: Parameters<typeof pronounce>[0], maxMs: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, maxMs)
    pronounce({
      ...opts,
      onEnd: () => {
        clearTimeout(t)
        resolve()
      },
    })
  })
}

function sayVietnamese(text: string, voiceURI: string, maxMs: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, maxMs)
    const done = () => {
      clearTimeout(t)
      resolve()
    }
    if (!speak(text, { lang: 'vi-VN', voiceURI, onEnd: done })) done()
  })
}

function Player({
  words,
  pace,
  ttsLang,
  viVoice,
  due,
  preview,
  onRestart,
}: {
  words: Word[]
  pace: ListenPace
  ttsLang: string
  viVoice: string | null
  due: number
  /** The playlist previewed words not learned yet: offer to learn them next. */
  preview: boolean
  onRestart: () => void
}) {
  const rate = useSettings((s) => s.ttsRate)
  const t = useT()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [step, setStep] = useState<ListenStep['kind'] | null>(null)
  const [done, setDone] = useState(false)
  useLogActivity('listen', done)
  const wordRef = useRef<HTMLParagraphElement>(null)
  const word = words[index]

  // Warm the cache for this word and the next, so there is no gap between clips.
  useEffect(() => {
    const next = words.slice(index, index + 2)
    prefetchAudio(next.flatMap((w) => [wordAudio(w.id), exampleAudio(w.id, w.exampleEn)]))
  }, [words, index])

  // The playlist itself: one run per word; pausing or skipping cancels it.
  useEffect(() => {
    if (!playing || done) return
    let cancelled = false
    const isCancelled = () => cancelled
    const w = words[index]

    const perform = async (s: ListenStep) => {
      switch (s.kind) {
        case 'word':
          return playClip(
            { audioSrc: wordAudio(w.id), text: w.word, lang: ttsLang, rate: s.rate * rate },
            6000
          )
        case 'meaning':
          return viVoice ? sayVietnamese(w.meaning, viVoice, 8000) : wait(s.ms, isCancelled)
        case 'example':
          return playClip(
            {
              audioSrc: exampleAudio(w.id, w.exampleEn),
              text: w.exampleEn,
              lang: ttsLang,
              rate,
            },
            15000
          )
        case 'pause':
          return wait(s.ms, isCancelled)
      }
    }

    const run = async () => {
      if (wordRef.current) skyBurstAt(wordRef.current, 0.35)
      for (const s of listenSteps(w, pace)) {
        if (cancelled) return
        setStep(s.kind)
        await perform(s)
      }
      if (cancelled) return
      if (index + 1 < words.length) setIndex(index + 1)
      else setDone(true)
    }
    const t = setTimeout(run, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
      stopPronounce()
    }
  }, [words, index, playing, done, pace, viVoice, ttsLang, rate])

  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(words.length - 1, i)))
    setPlaying(true)
  }

  // Lock-screen / headset controls: the whole point is not having to look.
  useEffect(() => {
    const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
    if (!ms || done) return
    if (typeof MediaMetadata !== 'undefined') {
      ms.metadata = new MediaMetadata({
        title: word.word,
        artist: word.meaning,
        album: tx('VocaStudy · Nghe thụ động', 'VocaStudy · Hands-free listening'),
      })
    }
    const handlers: [MediaSessionAction, () => void][] = [
      ['play', () => setPlaying(true)],
      ['pause', () => setPlaying(false)],
      ['nexttrack', () => go(index + 1)],
      ['previoustrack', () => go(index - 1)],
    ]
    for (const [action, fn] of handlers) {
      try {
        ms.setActionHandler(action, fn)
      } catch {
        // an action this browser doesn't support
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          ms.setActionHandler(action, null)
        } catch {
          // ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, index, done])

  if (done) {
    return (
      <SessionComplete
        emoji="🎧"
        title={t('Nghe xong rồi!', 'Listening done!')}
        correct={0}
        total={words.length}
        showScore={false}
        note={t(
          `${words.length} từ đã vào tai. Muốn chắc hơn, thử nhớ lại chúng trong 2 phút nhé.`,
          `${words.length} words heard. To make them stick, try recalling them in 2 minutes.`
        )}
      >
        <button onClick={onRestart} className="btn-secondary">
          {t('Nghe tiếp', 'Listen more')}
        </button>
        <Link to={preview ? '/learn?quick=1' : quickStartPath(due)} className="btn-primary">
          {preview
            ? t('Học ngay những từ vừa nghe', 'Learn these words now')
            : t('Học nhanh 2 phút', 'Quick 2-minute session')}
        </Link>
      </SessionComplete>
    )
  }

  const on = (kind: ListenStep['kind']) =>
    playing && step === kind ? 'ring-2 ring-brand-400/70 bg-brand-50/60 dark:bg-brand-950/40' : ''

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          🎧 {t('Từ', 'Word')} {index + 1}/{words.length}
        </span>
        <button onClick={onRestart} className="font-semibold text-brand-600 dark:text-brand-300">
          {t('Dừng nghe', 'Stop')}
        </button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-brand-500 transition-all duration-500"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
        />
      </div>

      <div className="card space-y-4 p-6 text-center" aria-live="polite">
        {word.emoji && (
          <p className="text-5xl" aria-hidden="true">
            {word.emoji}
          </p>
        )}
        <p
          ref={wordRef}
          className={`rounded-xl px-2 py-1 text-4xl font-extrabold tracking-tight transition ${on('word')}`}
        >
          {word.word}
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          {word.ipa && <>/{word.ipa}/ · </>}
          <span className="font-semibold">{word.viRead}</span>
        </p>
        <p className={`rounded-xl px-3 py-2 text-xl font-semibold transition ${on('meaning')}`}>
          {word.meaning}
        </p>
        {word.exampleEn && (
          <div className={`rounded-xl px-3 py-2 transition ${on('example')}`}>
            <p className="text-lg">{word.exampleEn}</p>
            {word.exampleRead && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{word.exampleRead}</p>
            )}
            <p className="text-sm text-slate-500">{word.exampleVi}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="btn-ghost h-12 w-12 rounded-full p-0 disabled:opacity-30"
          aria-label={t('Từ trước', 'Previous word')}
        >
          <SkipBack className="h-5 w-5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg transition hover:scale-105"
          aria-label={playing ? t('Tạm dừng', 'Pause') : t('Nghe tiếp', 'Resume')}
        >
          {playing ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
        </button>
        <button
          onClick={() => (index + 1 < words.length ? go(index + 1) : setDone(true))}
          className="btn-ghost h-12 w-12 rounded-full p-0"
          aria-label={t('Từ tiếp', 'Next word')}
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
