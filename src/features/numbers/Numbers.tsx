import { useEffect, useState } from 'react'
import { ArrowRight, Check, Volume2, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { pronounce } from '@/lib/audio'
import { numberPinyin, numberQuiz, numbersXp, type NumberQuestion } from '@/lib/zhNumbers'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import GameShell, { GameResult } from '@/features/games/GameShell'

// "Nghe số" (docs/design/numbers.md): hear a number, a price, a clock time, a
// date or a weekday in Chinese and pick what was said.

const RULES: [vi: string, en: string][] = [
  [
    '十四 (14) và 四十 (40): chữ 十 đứng sau là "mười mấy", đứng giữa là "mấy mươi".',
    '十四 (14) vs 四十 (40): 十 first is the teens, 十 in the middle is the tens.',
  ],
  [
    'Đếm "hai cái gì đó" dùng 两: 两块 (2 tệ), 两点 (2 giờ) — nhưng 十二, 二十 vẫn là 二.',
    'Two of something is 两: 两块, 两点 — but 十二 and 二十 keep 二.',
  ],
  [
    'Số 0 ở giữa đọc là 零: 一百零五 (105). 30 phút là 半: 七点半 (7:30).',
    'A zero inside is 零: 一百零五 (105). Half past is 半: 七点半 (7:30).',
  ],
  [
    'Ngày tháng nói tháng trước: 三月十二号 là ngày 12/3. Chủ nhật là 星期天.',
    'Dates go month first: 三月十二号 is 12 March. Sunday is 星期天.',
  ],
]

export default function Numbers() {
  const t = useT()
  const [round, setRound] = useState<{ n: number; questions: NumberQuestion[] } | null>(null)
  const start = () => setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: numberQuiz() }))

  if (round) return <Round key={round.n} questions={round.questions} onAgain={start} />

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Nghe số', 'Hear the numbers')}</span>{' '}
          <span aria-hidden="true">🔢</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            'Giá tiền, giờ giấc, ngày tháng xuất hiện liên tục trong phần nghe của HSK. Nghe rồi chọn đúng con số.',
            'Prices, times and dates come up again and again in the HSK listening parts. Listen, then pick what was said.'
          )}
        </p>
      </header>
      <ul className="card space-y-2 p-5 text-sm text-slate-600 dark:text-slate-300">
        {RULES.map((r) => (
          <li key={r[0]}>• {t(...r)}</li>
        ))}
      </ul>
      <button className="btn-primary h-12 w-full" onClick={start}>
        <Volume2 className="h-5 w-5" /> {t('Nghe 10 câu', 'Hear 10 questions')}
      </button>
    </div>
  )
}

function Round({ questions, onAgain }: { questions: NumberQuestion[]; onAgain: () => void }) {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)
  const q = questions[idx]
  const say = (text: string) => pronounce({ text, lang: ttsLang, rate })

  // Each question plays as it appears.
  useEffect(() => {
    const text = questions[idx]?.item.han
    if (!text || xp !== null) return
    const timer = setTimeout(() => pronounce({ text, lang: ttsLang, rate }), 250)
    return () => clearTimeout(timer)
  }, [idx, questions, ttsLang, rate, xp])

  if (xp !== null)
    return (
      <GameShell title={t('Nghe số', 'Hear the numbers')} stats={null}>
        <GameResult
          emoji={correct === questions.length ? '🏆' : '🔢'}
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

  const answered = picked !== null
  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) (ok ? playCorrect : playWrong)()
  }
  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const earned = numbersXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  return (
    <GameShell
      title={t('Nghe số', 'Hear the numbers')}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t('Nghe rồi chọn điều bạn nghe được', 'Listen, then pick what you heard')}
        </p>
        <button
          type="button"
          onClick={() => say(q.item.han)}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg transition hover:scale-105 active:scale-95"
          aria-label={t('Nghe lại', 'Play again')}
        >
          <Volume2 className="h-9 w-9" />
        </button>
        <div className="grid grid-cols-2 gap-3">
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
                key={o.label[0]}
                type="button"
                onClick={() => pick(i)}
                disabled={answered}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-xl font-bold tabular-nums transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {t(...o.label)}
                {state === 'right' && <Check className="h-5 w-5" aria-hidden="true" />}
                {state === 'wrong' && <X className="h-5 w-5" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60" aria-live="polite">
            <p lang="zh" className="text-2xl font-bold">
              {q.item.han}
            </p>
            <p className="text-slate-600 dark:text-slate-300">{numberPinyin(q.item.han)}</p>
            <p className="text-sm text-slate-500">= {t(...q.item.label)}</p>
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
