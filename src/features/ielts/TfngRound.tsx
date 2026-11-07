import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { TFNG_LABEL, type ReadingPassage, type Tfng } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// One IELTS reading passage, its statements one at a time: TRUE, FALSE or NOT
// GIVEN, and after each answer where the passage says it (or doesn't).

const CHOICES: Tfng[] = ['T', 'F', 'NG']

/** XP per right answer, as in the other reading practice. */
const XP_PER_RIGHT = 3

export default function TfngRound({
  passage,
  onAgain,
  onExit,
}: {
  passage: ReadingPassage
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const record = useIelts((s) => s.recordReading)
  const log = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Tfng | null>(null)
  const [right, setRight] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = passage.questions.length
  const q = passage.questions[idx]

  const choose = (c: Tfng) => {
    if (picked) return
    setPicked(c)
    const ok = c === q.answer
    if (ok) setRight((r) => r + 1)
    if (soundOn) buzz(ok)
  }
  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    record(passage.id, right, total)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-reading')
    if (right === total) celebrate(1.2)
    setFinished(true)
  }

  if (finished)
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center animate-fade-in">
        <p className="text-6xl" aria-hidden="true">
          {right === total ? '🏆' : right >= total - 1 ? '🎉' : '📖'}
        </p>
        <h1 className="text-2xl font-extrabold">
          {t(`${right}/${total} câu đúng`, `${right} of ${total} right`)}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          {right === total
            ? t('Không sai câu nào. Phong độ band cao!', 'Not a single slip. High-band form!')
            : t(
                'Mẹo: câu NOT GIVEN là câu bài không hề nhắc. Nếu phải đoán thêm điều bài không nói, đó là NOT GIVEN.',
                'Tip: NOT GIVEN means the passage never says it. If you need to add something it doesn’t say, it’s NOT GIVEN.'
              )}{' '}
          +{right * XP_PER_RIGHT} XP
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Xong', 'Done')}
          </button>
          <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
            {t('Bài khác', 'Another passage')}
          </button>
        </div>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="btn-ghost h-9 w-9 p-0"
          aria-label={t('Thoát', 'Exit')}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 transition-all"
            style={{ width: `${((idx + (picked ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {idx + 1}/{total}
        </span>
      </div>

      <article className="card space-y-3 p-5" lang="en">
        <h1 className="font-bold">
          <span aria-hidden="true">{passage.emoji}</span> {passage.title[1]}
        </h1>
        {passage.passage.map((para, i) => (
          <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-200">
            <span className="mr-1 text-xs font-bold text-slate-400">{i + 1}</span>
            {para}
          </p>
        ))}
      </article>

      <div className="card space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('Câu này đúng với bài đọc không?', 'Does the passage agree?')}
        </p>
        <p className="text-lg font-bold" lang="en">
          {q.statement}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {CHOICES.map((c) => {
            const state = !picked
              ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
              : c === q.answer
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                : c === picked
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-60 dark:border-slate-700'
            return (
              <button
                key={c}
                type="button"
                disabled={!!picked}
                onClick={() => choose(c)}
                className={`rounded-xl border-2 p-3 font-bold transition ${state}`}
              >
                {t(...TFNG_LABEL[c])}
              </button>
            )
          })}
        </div>
        {picked && (
          <p
            role="status"
            className={`rounded-xl p-3 text-sm ${
              picked === q.answer
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
            }`}
          >
            <b>
              {picked === q.answer
                ? t('Chính xác!', 'Right!')
                : t(`Đáp án: ${TFNG_LABEL[q.answer][1]}.`, `Answer: ${TFNG_LABEL[q.answer][1]}.`)}
            </b>{' '}
            {q.why}
          </p>
        )}
      </div>
      {picked && (
        <button type="button" className="btn-primary h-12 w-full" onClick={next}>
          {idx + 1 < total ? t('Câu tiếp', 'Next') : t('Xem kết quả', 'See results')}{' '}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
