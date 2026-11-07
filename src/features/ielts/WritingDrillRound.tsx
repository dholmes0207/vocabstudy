import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useImmersive } from '@/store/uiStore'
import { DRILL_KIND, type WritingDrill } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// Ten quick questions on the language of an IELTS essay: linking words, the
// words of a Task 1 trend, and formal style, each answer explained.

const XP_PER_RIGHT = 2

export default function WritingDrillRound({
  drills,
  onAgain,
  onExit,
}: {
  drills: WritingDrill[]
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [right, setRight] = useState(0)
  const [done, setDone] = useState(false)
  const d = drills[idx]

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === d.answer
    if (ok) setRight((r) => r + 1)
    if (soundOn) buzz(ok)
  }
  const next = () => {
    if (idx + 1 < drills.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    addPlayXp(code, right * XP_PER_RIGHT)
    if (right === drills.length) celebrate(1.2)
    setDone(true)
  }

  if (done)
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center animate-fade-in">
        <p className="text-6xl" aria-hidden="true">
          {right === drills.length ? '🏆' : '✍️'}
        </p>
        <h1 className="text-2xl font-extrabold">
          {t(`${right}/${drills.length} câu đúng`, `${right} of ${drills.length} right`)}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(
            `+${right * XP_PER_RIGHT} XP. Dùng ngay vài từ nối vừa ôn trong bài viết thử nhé.`,
            `+${right * XP_PER_RIGHT} XP. Use a few of these linking words in a practice essay.`
          )}
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Xong', 'Done')}
          </button>
          <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
            {t('Làm lượt khác', 'Another round')}
          </button>
        </div>
      </div>
    )

  const answered = picked !== null
  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
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
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all"
            style={{ width: `${((idx + (answered ? 1 : 0)) / drills.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {idx + 1}/{drills.length}
        </span>
      </div>
      <section className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(...DRILL_KIND[d.kind])}
        </p>
        <p className="text-lg font-bold" lang="en">
          {d.prompt}
        </p>
        <div className="grid gap-2">
          {d.options.map((o, i) => {
            const state = !answered
              ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
              : i === d.answer
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                : i === picked
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-60 dark:border-slate-700'
            return (
              <button
                key={o}
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                lang="en"
                className={`rounded-xl border-2 p-3 text-left font-semibold transition ${state}`}
              >
                {o}
              </button>
            )
          })}
        </div>
        {answered && (
          <p
            role="status"
            className={`rounded-xl p-3 text-sm ${
              picked === d.answer
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
            }`}
          >
            <b>{picked === d.answer ? t('Chính xác!', 'Right!') : t('Chưa đúng.', 'Not quite.')}</b>{' '}
            {d.why}
          </p>
        )}
      </section>
      {answered && (
        <button type="button" className="btn-primary h-12 w-full" onClick={next}>
          {idx + 1 < drills.length ? t('Câu tiếp', 'Next') : t('Xem kết quả', 'See results')}{' '}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
