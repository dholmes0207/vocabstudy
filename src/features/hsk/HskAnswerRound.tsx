import { useEffect, useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { AnswerQuestion } from '@/lib/hskAnswers'
import { prefetchAudio, pronounce, stopPronounce, textAudio } from '@/lib/audio'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// HSK 1 reading, part three (lib/hskAnswers.ts): read a question, pick its
// answer among four. Once answered, both are read aloud, the question in a
// woman's voice and the answer in a man's, with their Vietnamese.

export default function HskAnswerRound({
  title,
  questions,
  onAgain,
  onExit,
  onDone,
  onAnswer,
}: {
  title: string
  questions: AnswerQuestion[]
  onAgain: () => void
  onExit: () => void
  onDone?: (correct: number, total: number) => void
  /** Each answer as it is given, for the weak-spot count. */
  onAnswer?: (correct: boolean) => void
}) {
  const t = useT()
  const lang = useData((s) => s.pack?.meta.ttsLang ?? 'zh-CN')
  const rate = useSettings((s) => s.ttsRate)
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const q = questions[idx]

  useEffect(
    () =>
      prefetchAudio(
        questions.flatMap((qn) => [textAudio(qn.pair.q, 'female'), textAudio(qn.pair.a, 'male')])
      ),
    [questions]
  )
  useEffect(() => () => stopPronounce(), [])

  if (xp !== null || !q)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="💬"
          title={t('Xong một lượt!', 'Round complete!')}
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
  const say = () =>
    pronounce({
      audioSrc: textAudio(q.pair.q, 'female'),
      text: q.pair.q,
      lang,
      rate,
      onEnd: () => pronounce({ audioSrc: textAudio(q.pair.a, 'male'), text: q.pair.a, lang, rate }),
    })
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    onAnswer?.(ok)
    if (soundOn) (ok ? playCorrect : playWrong)()
    say()
  }
  const next = () => {
    stopPronounce()
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    if (onDone) return onDone(correct, questions.length)
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
          {t('Đọc câu hỏi, chọn câu trả lời phù hợp.', 'Read the question and pick its answer.')}
        </p>
        <p lang="zh" className="text-center text-2xl font-bold">
          {q.pair.q}
        </p>
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
                lang="zh"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-lg font-medium transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-bold text-slate-400">{'ABCD'[i]}</span>
                <span className="flex-1">{o}</span>
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <div
            className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${picked === q.answer ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {picked === q.answer ? t('Đúng rồi!', 'Right!') : t('Chưa đúng.', 'Not quite.')}
            </p>
            <p>
              <span lang="zh">{q.pair.q}</span>{' '}
              <span className="text-slate-500 dark:text-slate-400">{q.pair.qVi}</span>
            </p>
            <p>
              <span lang="zh">{q.pair.a}</span>{' '}
              <span className="text-slate-500 dark:text-slate-400">{q.pair.aVi}</span>
            </p>
          </div>
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
