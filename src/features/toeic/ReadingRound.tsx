import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import type { ReadingSet, ShuffledQuestion } from '@/lib/toeicReading'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// TOEIC Part 6 and Part 7 practice (docs/design/toeic.md): the text (or two
// linked texts), then its questions, each explained as soon as it is answered.
// In Part 6 the gaps of the text fill in as they are answered.

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function ReadingRound({
  set,
  questions,
  onAgain,
  onExit,
}: {
  set: ReadingSet
  questions: ShuffledQuestion[]
  onAgain: () => void
  onExit: () => void
}) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const [xp, setXp] = useState<number | null>(null)
  const title =
    set.part === 6
      ? t('Part 6 · Điền đoạn văn', 'Part 6 · Text completion')
      : t('Part 7 · Đọc hiểu', 'Part 7 · Reading comprehension')
  const correct = questions.filter((qn, i) => picked[i] === qn.answer).length
  const done = picked.every((p) => p !== null)

  if (xp !== null)
    return (
      <GameShell title={title} stats={null} onExit={onExit}>
        <GameResult
          emoji="📖"
          title={t('Xong một bài!', 'Text done!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const pick = (qi: number, i: number) => {
    if (picked[qi] !== null) return
    setPicked((p) => p.map((v, j) => (j === qi ? i : v)))
    if (soundOn) (i === questions[qi].answer ? playCorrect : playWrong)()
  }
  const finish = () => {
    const earned = pinyinXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  /** A Part 6 text with its gaps: the number until answered, then the right option. */
  const withGaps = (text: string) =>
    text.split(/(\[\d\])/).map((piece, k) => {
      const m = /^\[(\d)\]$/.exec(piece)
      if (!m) return <span key={k}>{piece}</span>
      const qi = Number(m[1]) - 1
      const qn = questions[qi]
      return (
        <mark
          key={k}
          className="rounded bg-brand-50 px-1 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          {picked[qi] === null ? `(${qi + 1}) ______` : qn.options[qn.answer]}
        </mark>
      )
    })

  return (
    <GameShell
      title={title}
      onExit={onExit}
      stats={
        <span>
          {picked.filter((p) => p !== null).length}/{questions.length}
        </span>
      }
    >
      <div className="space-y-4">
        {set.passages.map((p, i) => (
          <article key={i} className="card p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {set.passages.length > 1 && `${i + 1}. `}
              {t(...p.kind)}
            </p>
            <div lang="en" className="whitespace-pre-line text-[15px] leading-relaxed">
              {set.part === 6 ? withGaps(p.text) : p.text}
            </div>
          </article>
        ))}

        <ol className="space-y-3">
          {questions.map((qn, qi) => {
            const answered = picked[qi] !== null
            return (
              <li key={qi} className="card space-y-3 p-4">
                <p lang="en" className="font-semibold">
                  {qi + 1}. {qn.q || t(`Chỗ trống (${qi + 1})`, `Gap (${qi + 1})`)}
                </p>
                <div className="grid gap-2">
                  {qn.options.map((o, i) => {
                    const state = !answered
                      ? 'idle'
                      : i === qn.answer
                        ? 'right'
                        : i === picked[qi]
                          ? 'wrong'
                          : 'idle'
                    return (
                      <button
                        key={o}
                        type="button"
                        lang="en"
                        onClick={() => pick(qi, i)}
                        disabled={answered}
                        className={`flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-medium transition ${
                          state === 'right'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : state === 'wrong'
                              ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                              : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-mono text-xs text-slate-500">({LETTERS[i]})</span>
                        <span className="flex-1">{o}</span>
                        {state === 'right' && (
                          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        {state === 'wrong' && <X className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
                {answered && (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    <b
                      className={
                        picked[qi] === qn.answer
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-300'
                      }
                    >
                      {picked[qi] === qn.answer
                        ? t('Đúng rồi! ', 'Right! ')
                        : t('Chưa đúng. ', 'Not quite. ')}
                    </b>
                    {qn.why}
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        {done && (
          <div className="session-actions">
            <button className="btn-primary h-12 w-full" onClick={finish} autoFocus>
              {t('Xem kết quả', 'See results')}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
