import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { PART5_KINDS, part5Summary, type Part5Kind, type Part5Question } from '@/lib/toeicPart5'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// TOEIC Part 5 practice (docs/design/toeic.md): a sentence with a gap, four
// options, then why the answer is right. The end of the round tells which
// kinds of question (word form, prepositions…) went wrong.

export default function Part5Round({
  questions,
  onAgain,
  onExit,
  onDone,
}: {
  questions: Part5Question[]
  onAgain: () => void
  onExit: () => void
  /** Hand the score back (the mini test) instead of showing the round's result. */
  onDone?: (correct: number, total: number) => void
}) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<{ kind: Part5Kind; ok: boolean }[]>([])
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Part 5 · Điền câu', 'Part 5 · Incomplete sentences')
  const correct = results.filter((r) => r.ok).length

  if (xp !== null || questions.length === 0)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="📝"
          title={t('Xong một lượt Part 5!', 'Part 5 round done!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
            ...part5Summary(results).map(([kind, right, asked]) =>
              t(
                `${PART5_KINDS[kind][0]}: ${right}/${asked}`,
                `${PART5_KINDS[kind][1]}: ${right}/${asked}`
              )
            ),
          ]}
          xp={xp ?? 0}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const q = questions[idx]
  const answered = picked !== null
  const [before, after] = q.sentence.split('___')

  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    setResults((r) => [...r, { kind: q.kind, ok }])
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
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
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(...PART5_KINDS[q.kind])}
        </p>
        <p className="text-lg font-medium leading-relaxed">
          {before}
          <span className="mx-0.5 inline-block min-w-16 border-b-2 border-brand-500 text-center font-bold text-brand-700 dark:text-brand-300">
            {answered ? q.options[q.answer] : ' '}
          </span>
          {after}
        </p>
        {q.hint && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('Nghĩa của câu: ', 'The sentence means: ')}
            {q.hint}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
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
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 font-medium transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-mono text-xs text-slate-500">({'ABCD'[i]})</span> {o}
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
