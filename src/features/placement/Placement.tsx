import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Gauge, LogOut, RotateCcw, Volume2 } from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useImmersive } from '@/store/uiStore'
import { usePlacement } from '@/store/placementStore'
import { PER_BAND, bandQuestions, passed, placementBands, type Band } from '@/lib/placement'
import { pronounce, wordAudio } from '@/lib/audio'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import { useReadingLabel } from '@/hooks/useReadingLabel'

// "Kiểm tra trình độ" (docs/design/placement.md): a few meaning questions per
// band of the pack's learning order, stopping at the first band the learner
// does not know, so Learn can start there. Moves the starting point only.

interface Outcome {
  start: number
  asked: number
  correct: number
}

export default function Placement() {
  const t = useT()
  const lang = useTargetLang()
  const words = useData((s) => s.pack!.words)
  const bands = useMemo(() => placementBands(words.length), [words.length])
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'quiz' | Outcome>('intro')

  if (phase === 'quiz')
    return (
      <Quiz key={run} bands={bands} onDone={(o) => setPhase(o)} onExit={() => setPhase('intro')} />
    )
  if (typeof phase === 'object')
    return (
      <Result
        outcome={phase}
        onAgain={() => {
          setRun((r) => r + 1)
          setPhase('quiz')
        }}
      />
    )

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Kiểm tra trình độ', 'Placement check')}</span>{' '}
          <span aria-hidden="true">🧭</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            `Khoảng 3 phút để biết bạn đã nắm chắc những từ ${lang.vi} nào, để bài Học bắt đầu đúng chỗ thay vì từ con số 0.`,
            `About 3 minutes to find which ${lang.en} words you already know well, so Learn starts at the right place instead of from zero.`
          )}
        </p>
      </header>
      <section className="card space-y-3 p-6 text-sm text-slate-600 dark:text-slate-300">
        <p>
          {t(
            'Mỗi câu là một từ — chọn nghĩa đúng. Từ dễ trước, khó dần, và bài dừng khi bạn bắt đầu gặp nhiều từ lạ.',
            'Each question is a word — pick its meaning. Easy words first, then harder, and it stops once you start meeting many new ones.'
          )}
        </p>
        <p>
          {t(
            'Không chắc thì bấm "Tôi chưa biết từ này". Đoán bừa sẽ khiến bài học bắt đầu quá xa.',
            'Not sure? Tap "I don’t know this word". Guessing would start your lessons too far ahead.'
          )}
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          {t(
            'Bài này không cộng XP và không đổi lịch ôn — nó chỉ chọn chỗ bắt đầu.',
            'No XP and no change to your reviews — it only picks where to start.'
          )}
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary h-12" onClick={() => setPhase('quiz')}>
          <Gauge className="h-5 w-5" /> {t('Bắt đầu kiểm tra', 'Start the check')}
        </button>
        <Link to="/learn" className="btn-secondary h-12">
          {t('Để sau', 'Not now')}
        </Link>
      </div>
    </div>
  )
}

function Quiz({
  bands,
  onDone,
  onExit,
}: {
  bands: Band[]
  onDone: (o: Outcome) => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const pack = useData((s) => s.pack!)
  const rate = useSettings((s) => s.ttsRate)
  const readLabel = useReadingLabel('đọc gần giống', 'sounds like')
  const [band, setBand] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    bandQuestions(pack.words, bands[0])
  )
  const [idx, setIdx] = useState(0)
  const [bandRight, setBandRight] = useState(0)
  const [totals, setTotals] = useState({ asked: 0, correct: 0 })

  const q = questions[idx]
  const word = pack.words.find((w) => w.id === q.wordId)!

  const answer = (ok: boolean) => {
    const right = bandRight + (ok ? 1 : 0)
    const sum = { asked: totals.asked + 1, correct: totals.correct + (ok ? 1 : 0) }
    setTotals(sum)
    if (idx + 1 < questions.length) {
      setBandRight(right)
      setIdx(idx + 1)
      return
    }
    const here = bands[band]
    if (!passed(right)) return onDone({ start: here.start, ...sum })
    if (band + 1 >= bands.length) return onDone({ start: here.end, ...sum })
    setBand(band + 1)
    setQuestions(bandQuestions(pack.words, bands[band + 1]))
    setIdx(0)
    setBandRight(0)
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500 dark:text-slate-400"
          aria-label={t('Dừng kiểm tra', 'Stop the check')}
        >
          <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
        </button>
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {Array.from({ length: PER_BAND }, (_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${i < idx ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500">
          {t(`Mức ${band + 1}/${bands.length}`, `Level ${band + 1}/${bands.length}`)}
        </span>
      </div>

      <div className="card space-y-5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('Từ này nghĩa là gì?', 'What does this word mean?')}
        </p>
        <div>
          <p className="break-words text-4xl font-bold">{q.prompt}</p>
          {word.viRead && (
            <p className="mt-2 text-sm text-slate-500">
              {readLabel} <b>{word.viRead}</b>
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              pronounce({
                audioSrc: wordAudio(word.id),
                text: word.word,
                lang: pack.meta.ttsLang,
                rate,
              })
            }
            className="mx-auto mt-3 grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
            aria-label={t('Nghe từ này', 'Listen to this word')}
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => (
            <button
              key={`${q.wordId}-${opt.wordId}`}
              onClick={() => answer(opt.correct)}
              className="rounded-xl border-2 border-slate-200 px-3 py-3 font-semibold transition hover:border-brand-400 dark:border-slate-700"
            >
              {opt.text}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => answer(false)} className="btn-ghost w-full">
          {t('Tôi chưa biết từ này', 'I don’t know this word')}
        </button>
      </div>
    </div>
  )
}

function Result({ outcome, onAgain }: { outcome: Outcome; onAgain: () => void }) {
  const t = useT()
  const navigate = useNavigate()
  const code = useSettings((s) => s.currentLang)
  const words = useData((s) => s.pack!.words)
  const setResult = usePlacement((s) => s.setResult)
  const clear = usePlacement((s) => s.clear)
  const { start, asked, correct } = outcome
  const next = words[start]

  const keep = () => {
    setResult(code, { start, day: today(), asked, correct })
    navigate('/learn')
  }
  const fromZero = () => {
    clear(code)
    navigate('/learn')
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-in">
      <section className="card space-y-3 p-6 text-center">
        <p className="text-5xl" aria-hidden="true">
          {start === 0 ? '🌱' : '🧭'}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {start === 0
            ? t('Bắt đầu từ đầu là hợp nhất', 'Starting from the beginning suits you best')
            : start >= words.length
              ? t('Bạn biết gần hết các từ này!', 'You know nearly all of these words!')
              : t(
                  `Bạn đã nắm khá chắc ${start.toLocaleString('vi-VN')} từ đầu tiên`,
                  `You know the first ${start.toLocaleString('en-US')} words quite well`
                )}
        </h1>
        {start === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">
            {t(
              'Đừng lo: mỗi từ đều có cách đọc, câu ví dụ và lời giải thích bằng tiếng Việt.',
              'No worries: every word comes with a reading, an example and a plain Vietnamese explanation.'
            )}
          </p>
        ) : next ? (
          <p className="text-slate-600 dark:text-slate-300">
            {t(
              `Bài Học sẽ bắt đầu từ từ thứ ${start + 1}:`,
              `Learn will start at word ${start + 1}:`
            )}{' '}
            <b className="text-brand-700 dark:text-brand-300">{next.word}</b> — {next.meaning}
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">
            {t(
              'Bài Học sẽ đưa lại những từ bạn chưa học, để chắc là không sót từ nào.',
              'Learn will bring back any words you have not studied, so none slip through.'
            )}
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            `Đây là ước lượng từ ${asked} câu (đúng ${correct}).`,
            `This is an estimate from ${asked} questions (${correct} right).`
          )}{' '}
          {start > 0 &&
            t(
              'Những từ bỏ qua vẫn nằm trong các bộ từ, học lại lúc nào cũng được.',
              'Skipped words stay in the word sets — study them any time.'
            )}
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary h-12" onClick={start === 0 ? fromZero : keep}>
          {start === 0
            ? t('Học từ đầu', 'Learn from the start')
            : t('Bắt đầu học từ đây', 'Start learning here')}
          <ArrowRight className="h-5 w-5" />
        </button>
        {start > 0 && (
          <button className="btn-secondary h-12" onClick={fromZero}>
            {t('Học từ đầu', 'Learn from the start')}
          </button>
        )}
        <button className="btn-ghost h-12" onClick={onAgain}>
          <RotateCcw className="h-4 w-4" /> {t('Làm lại', 'Try again')}
        </button>
      </div>
    </div>
  )
}
