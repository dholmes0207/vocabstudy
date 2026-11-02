import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { radicalQuiz, radicalTable, type Radical, type RadicalQuestion } from '@/lib/radicals'
import { pinyinXp } from '@/lib/pinyin'
import { playCorrect, playWrong } from '@/lib/sound'
import { prefetchAudio, pronounce, wordAudio } from '@/lib/audio'
import { usePrefetchPackSay } from '@/hooks/usePackSay'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Bộ thủ" (docs/design/radicals.md): the components that recur across the
// pack's characters, each with its Sino-Vietnamese name and the characters of
// the pack that contain it, then a round of "which radical is in this one?".

const QUIZ_SIZE = 10
/** Radicals whose example words are warmed ahead: about what a phone shows before scrolling. */
const PREFETCH_RADICALS = 3

export default function Radicals() {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const table = useMemo(() => radicalTable(pack.words), [pack.words])
  const [round, setRound] = useState<{ n: number; questions: RadicalQuestion[] } | null>(null)
  const start = () =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: radicalQuiz(pack.words, QUIZ_SIZE) }))
  usePrefetchPackSay(
    table.slice(0, PREFETCH_RADICALS).flatMap((e) => e.members.map((m) => m.word.word))
  )

  if (round) return <QuizRound key={round.n} questions={round.questions} onAgain={start} />

  const say = (id: number, text: string) =>
    pronounce({ audioSrc: wordAudio(id), text, lang: pack.meta.ttsLang, rate })

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Bộ thủ', 'Radicals')}</span>{' '}
          <span aria-hidden="true">🧩</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Nhiều chữ Hán ghép từ những bộ phận quen thuộc. 氵 là bộ "thuỷ" (nước), nên 洗 (rửa), 河 (sông), 游泳 (bơi), 酒 (rượu) đều dính tới nước. Nhớ bộ thủ và tên Hán Việt của nó là có gợi ý cho cả chục chữ. Dưới đây là những bộ hay gặp nhất trong gói, kèm các chữ chứa nó.',
            'Many characters are built from familiar parts. 氵 is the "water" radical, so 洗 (wash), 河 (river), 游泳 (swim) and 酒 (alcohol) all have to do with water. Remember a radical and its Sino-Vietnamese name and you have a hint for a dozen characters. These are the radicals found most in the pack, with the characters that contain them.'
          )}
        </p>
        <button className="btn-primary mt-4 h-11" onClick={start}>
          {t(`Đoán bộ thủ (${QUIZ_SIZE} câu)`, `Spot the radical (${QUIZ_SIZE} questions)`)}
        </button>
      </header>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(`${table.length} bộ thủ`, `${table.length} radicals`)}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {table.map(({ radical, members }) => (
          <li key={radical.form} className="card p-4">
            <div className="flex items-baseline gap-3">
              <span lang={code} className="text-4xl font-bold">
                {radical.form}
              </span>
              {radical.base && (
                <span lang={code} className="text-lg text-slate-500 dark:text-slate-400">
                  ({radical.base})
                </span>
              )}
              <span className="text-lg font-extrabold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                {radical.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t(...radical.meaning)}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {members.map((m) => (
                <li key={m.char}>
                  <button
                    type="button"
                    onClick={() => say(m.word.id, m.word.word)}
                    title={`${m.word.word} ${m.word.viRead ?? ''} — ${m.word.meaning}`}
                    aria-label={t(
                      `Nghe ${m.word.word}: ${m.word.meaning}`,
                      `Hear ${m.word.word}: ${m.word.meaning}`
                    )}
                    className="flex flex-col items-center rounded-xl bg-slate-50 px-2.5 py-1.5 transition hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950"
                  >
                    <span lang={code} className="text-2xl font-bold leading-tight">
                      {m.char}
                    </span>
                    <span className="max-w-[6rem] truncate text-xs text-slate-500 dark:text-slate-400">
                      {m.word.word === m.char ? m.word.meaning : m.word.word}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "Đoán bộ thủ": a character of the pack, four radicals, one of which it contains. */
function QuizRound({ questions, onAgain }: { questions: RadicalQuestion[]; onAgain: () => void }) {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  useEffect(() => prefetchAudio(questions.map((qn) => wordAudio(qn.word.id))), [questions])
  const title = t('Đoán bộ thủ', 'Spot the radical')

  if (xp !== null || questions.length === 0)
    return (
      <GameShell title={title} stats={null}>
        <GameResult
          emoji="🧩"
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

  const q = questions[idx]
  const answered = picked !== null
  const right: Radical = q.options[q.answer]
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
    pronounce({ audioSrc: wordAudio(q.word.id), text: q.word.word, lang: pack.meta.ttsLang, rate })
  }
  const next = () => {
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
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-4 p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('Chữ này có bộ thủ nào?', 'Which radical is in this character?')}
          </p>
          <p lang={code} className="mt-3 text-6xl font-bold">
            {q.char}
          </p>
          {q.word.word !== q.char && (
            <p lang={code} className="mt-2 text-slate-500 dark:text-slate-400">
              {t('trong', 'in')} {q.word.word}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((r, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={r.form}
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
                <span lang={code} className="text-2xl font-bold">
                  {r.form}
                </span>
                <span className="text-sm">{r.name}</span>
                {state === 'right' && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
            <b lang={code}>{right.form}</b> {right.name}: {t(...right.meaning)}.{' '}
            <b lang={code}>{q.word.word}</b> {q.word.viRead} — {q.word.meaning}
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
