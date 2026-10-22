import { useMemo, useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import {
  MEASURES,
  measureOf,
  measureQuiz,
  measureXp,
  phrase,
  type MeasureQuestion,
} from '@/lib/measureWords'
import { playCorrect, playWrong } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import SpeakButton from '@/components/SpeakButton'
import { textAudio } from '@/lib/audio'
import GameShell, { GameResult } from '@/features/games/GameShell'
import KoCounters from './KoCounters'

// "Lượng từ" (docs/design/measure-words.md): the table of measure words next to
// their Vietnamese classifiers, then a 10-question round: pick the one that
// goes with the noun, see the whole phrase with its pinyin.

const ROUND = 10

export default function MeasureWords() {
  const code = useSettings((s) => s.currentLang)
  // Korean has counters (단위 명사) where Chinese has measure words.
  return code === 'ko' ? <KoCounters /> : <ChineseMeasureWords />
}

function ChineseMeasureWords() {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const [round, setRound] = useState<{ n: number; questions: MeasureQuestion[] } | null>(null)
  const start = () => setRound((r) => ({ n: (r?.n ?? 0) + 1, questions: measureQuiz(ROUND) }))

  if (round) return <Round key={round.n} questions={round.questions} onAgain={start} />

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Lượng từ', 'Measure words')}</span>{' '}
          <span lang="zh">量词</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Tiếng Trung đặt một lượng từ giữa số và danh từ: 一本书 — y như "một quyển sách" của tiếng Việt. Cái khó chỉ là nhớ danh từ nào đi với lượng từ nào.',
            'Chinese puts a measure word between a number and a noun: 一本书, just like Vietnamese "một quyển sách". The only hard part is remembering which noun takes which.'
          )}
        </p>
      </header>

      <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
        {MEASURES.map((m) => (
          <li key={m.ch} className="flex items-center gap-3 px-4 py-3">
            <span lang="zh" className="w-10 shrink-0 text-center text-3xl font-bold">
              {m.ch}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {m.pinyin} · <span className="text-brand-600 dark:text-brand-300">“{m.vi}”</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t(...m.use)}</p>
            </div>
            <SpeakButton
              text={`一${m.ch}`}
              lang={ttsLang}
              audioSrc={textAudio(`一${m.ch}`)}
              size="sm"
            />
          </li>
        ))}
      </ul>

      <button className="btn-primary h-12 w-full" onClick={start}>
        {t(`Luyện ${ROUND} câu`, `Practise ${ROUND} questions`)} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function Round({ questions, onAgain }: { questions: MeasureQuestion[]; onAgain: () => void }) {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const words = useMemo(() => new Map(pack.words.map((w) => [w.word, w])), [pack.words])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [xp, setXp] = useState<number | null>(null)

  if (xp !== null)
    return (
      <GameShell title={t('Lượng từ', 'Measure words')} stats={null}>
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
  const word = words.get(q.item.noun)
  const shown = phrase(q.item, word?.viRead ?? '')
  const m = measureOf(q.item.measure)
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
    const earned = measureXp(correct, questions.length)
    addPlayXp(code, earned)
    setXp(earned)
  }

  const gapped = q.item.frame ? q.item.frame.zh.replace('{}', ' ___ ') : `一 ___ ${q.item.noun}`

  return (
    <GameShell
      title={t('Lượng từ', 'Measure words')}
      stats={
        <span>
          {idx + 1}/{questions.length}
        </span>
      }
    >
      <div className="card space-y-5 p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('Chọn lượng từ đúng', 'Pick the right measure word')}
          </p>
          <p lang="zh" className="mt-3 text-4xl font-extrabold">
            {gapped}
          </p>
          {word && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {q.item.noun} · {word.viRead} · {word.meaning}
            </p>
          )}
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
                aria-label={`${ch} ${measureOf(ch).pinyin}`}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-2xl font-bold transition ${
                  state === 'right'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <span lang="zh">{ch}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {measureOf(ch).pinyin}
                </span>
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
              <SpeakButton
                text={shown.zh}
                lang={pack.meta.ttsLang}
                audioSrc={textAudio(shown.zh)}
                size="sm"
              />
              <div>
                <p lang="zh" className="text-lg font-bold">
                  {shown.zh}
                </p>
                <p className="text-slate-600 dark:text-slate-300">{shown.pinyin}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {q.item.frame?.vi ?? q.item.vi}
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              <b lang="zh">{m.ch}</b> “{m.vi}”: {t(...m.use)}
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
