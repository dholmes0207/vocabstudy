import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import {
  COUNTERS,
  counterMeaning,
  counterOf,
  counterPhrase,
  koCounterQuiz,
  type CounterQuestion,
} from '@/lib/koCounters'
import { measureXp } from '@/lib/measureWords'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import SpeakButton from '@/components/SpeakButton'
import GameShell, { GameResult } from '@/features/games/GameShell'

// Korean counters on the "Lượng từ" page (docs/design/measure-words.md): the
// table next to the Vietnamese classifiers, then ten "책 두 ___" questions.

const ROUND = 10

export default function KoCounters() {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const [round, setRound] = useState<{ n: number; questions: CounterQuestion[] } | null>(null)
  const start = () => setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: koCounterQuiz(ROUND) }))

  if (round) return <Round key={round.n} questions={round.questions} onAgain={start} />

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Đơn vị đếm', 'Counters')}</span>{' '}
          <span lang="ko">단위 명사</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Tiếng Hàn đếm theo thứ tự danh từ + số + đơn vị: 책 두 권 = "hai quyển sách". Số là số thuần Hàn ở dạng rút gọn: 한, 두, 세, 네, 다섯.',
            'Korean counts as noun + number + counter: 책 두 권 = "two books". The number is native Korean, in its short form: 한, 두, 세, 네, 다섯.'
          )}
        </p>
      </header>

      <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
        {COUNTERS.map((c) => (
          <li key={c.ch} className="flex items-center gap-3 px-4 py-3">
            <span lang="ko" className="w-14 shrink-0 text-center text-2xl font-bold">
              {c.ch}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-600 dark:text-brand-300">“{c.vi}”</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t(...c.use)}</p>
            </div>
            <SpeakButton text={`한 ${c.ch}`} lang={ttsLang} size="sm" />
          </li>
        ))}
      </ul>

      <button className="btn-primary h-12 w-full" onClick={start}>
        {t(`Luyện ${ROUND} câu`, `Practise ${ROUND} questions`)} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function Round({ questions, onAgain }: { questions: CounterQuestion[]; onAgain: () => void }) {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const title = t('Đơn vị đếm', 'Counters')

  if (xp !== null)
    return (
      <GameShell title={title} stats={null}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🧮'}
          title={t('Xong một lượt!', 'Round complete!')}
          lines={[
            t(`Đúng ${correct}/${questions.length} câu`, `${correct} of ${questions.length} right`),
          ]}
          xp={xp}
          record={false}
          onAgain={onAgain}
        />
      </GameShell>
    )

  const q = questions[idx]
  const c = counterOf(q.item.counter)
  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((n) => n + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = measureXp(correct, questions.length)
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
      <div className="card space-y-5 p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('Chọn đơn vị đếm đúng', 'Pick the right counter')}
          </p>
          <p lang="ko" className="mt-3 text-4xl font-extrabold">
            {counterPhrase(q, true)}
          </p>
          {/* The noun's meaning only: the whole phrase ("hai quyển sách") would give the counter away. */}
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {q.item.noun} · {pack.words.find((w) => w.word === q.item.noun)?.meaning}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((ch, i) => {
            const state = !answered
              ? 'idle'
              : i === q.answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <button
                key={ch}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-2xl font-bold transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span lang="ko">{ch}</span>
                {state === 'right' && <Check className="h-5 w-5" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            <p
              className={`font-semibold ${picked === q.answer ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {picked === q.answer ? t('Đúng rồi!', 'Right!') : t('Chưa đúng.', 'Not quite.')}
            </p>
            <div className="flex items-center gap-3">
              <SpeakButton text={counterPhrase(q)} lang={pack.meta.ttsLang} size="sm" />
              <div>
                <p lang="ko" className="text-lg font-bold">
                  {counterPhrase(q)}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{t(...counterMeaning(q))}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              <b lang="ko">{c.ch}</b> “{c.vi}”: {t(...c.use)}
            </p>
            {q.item.tip && (
              <p className="text-slate-600 dark:text-slate-300">💡 {t(...q.item.tip)}</p>
            )}
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
