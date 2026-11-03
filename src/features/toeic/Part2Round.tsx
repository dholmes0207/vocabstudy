import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { Part2Question } from '@/lib/toeicPart2'
import { prefetchAudio, pronounce, stopPronounce, textAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// TOEIC Part 2 practice (docs/design/toeic.md): the question, then responses
// (A), (B), (C) are read one after another and none is printed, as in the
// test. After the answer, everything shows with why the traps are traps.

const LETTERS = ['A', 'B', 'C'] as const
/** Pause between two clips, as on the test recording. */
const GAP_MS = 600

export default function Part2Round({
  questions,
  onAgain,
  onExit,
}: {
  questions: Part2Question[]
  onAgain: () => void
  onExit: () => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'en-US')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  // What is being read: -1 the question, 0–2 a response, null nothing.
  const [reading, setReading] = useState<number | null>(null)
  const run = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const title = t('Part 2 · Hỏi – đáp', 'Part 2 · Question–response')
  const q = questions[idx]

  const stop = () => {
    run.current++
    window.clearTimeout(timer.current)
    stopPronounce()
    setReading(null)
  }

  /** The question, then each response, a short pause between them. */
  const play = (qn: Part2Question) => {
    stop()
    const id = run.current
    const clips = [qn.prompt, ...qn.options]
    const step = (i: number) => {
      if (id !== run.current) return
      if (i >= clips.length) return setReading(null)
      setReading(i - 1)
      pronounce({
        audioSrc: textAudio(clips[i]),
        text: clips[i],
        lang,
        rate,
        onEnd: () => {
          if (id !== run.current) return
          timer.current = window.setTimeout(() => step(i + 1), GAP_MS)
        },
      })
    }
    step(0)
  }

  useEffect(
    () => prefetchAudio(questions.flatMap((qn) => [qn.prompt, ...qn.options].map(textAudio))),
    [questions]
  )
  // Each item plays as it appears; leaving the round stops the voice.
  useEffect(() => {
    if (q && picked === null) {
      const start = window.setTimeout(() => play(q), 300)
      return () => window.clearTimeout(start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per item
  }, [idx])
  useEffect(() => stop, [])

  if (xp !== null || !q)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="🎧"
          title={t('Xong một lượt Part 2!', 'Part 2 round done!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    stop()
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    stop()
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {answered
            ? t('Câu hỏi:', 'The question:')
            : t(
                'Nghe câu hỏi và 3 câu đáp, rồi chọn câu đáp phù hợp.',
                'Hear the question and three responses, then pick the one that fits.'
              )}
        </p>
        <p
          className={`text-lg font-semibold ${reading === -1 ? 'text-brand-600 dark:text-brand-300' : ''}`}
        >
          {answered ? q.prompt : reading === -1 ? '🔊 …' : '🎧'}
        </p>
        <button
          type="button"
          onClick={() => play(q)}
          className="btn-secondary h-10 text-sm"
          aria-label={t('Nghe lại', 'Play again')}
        >
          <RotateCcw className="h-4 w-4" /> {t('Nghe lại', 'Play again')}
        </button>
        <div className="grid gap-2">
          {q.options.map((o, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={o}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                aria-label={answered ? `(${LETTERS[i]}) ${o}` : `(${LETTERS[i]})`}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-medium transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : reading === i
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/60'
                        : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-mono font-bold">({LETTERS[i]})</span>
                <span className="flex-1">{answered ? o : reading === i ? '🔊 …' : ''}</span>
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <p
            className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
            aria-live="polite"
          >
            <b
              className={
                picked === q.answer
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }
            >
              {picked === q.answer ? t('Đúng rồi! ', 'Right! ') : t('Chưa đúng. ', 'Not quite. ')}
            </b>
            {q.why}
          </p>
        )}
      </div>
      {answered && (
        <div className="session-actions mt-4">
          <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
            {idx + 1 < questions.length
              ? t('Câu tiếp theo', 'Next')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </GameShell>
  )
}
