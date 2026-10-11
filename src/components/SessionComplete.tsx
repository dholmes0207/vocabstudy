import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { celebrate } from '@/lib/confetti'
import { skyCelebrate } from '@/lib/skyEvents'
import GoalNudge from './GoalNudge'
import { useT } from '@/lib/i18n'

interface Props {
  title?: string
  emoji?: string
  correct: number
  total: number
  /**
   * Show the accuracy read-out + score-based praise. Off for "Học mới" sessions,
   * where scoring a first encounter as a pass/fail feels like a failed exam. When
   * off, we show an encouraging `note` instead. See F5.
   */
  showScore?: boolean
  /** Encouraging line shown when `showScore` is false. */
  note?: string
  children?: React.ReactNode
}

/** Friendly end-of-session celebration with a light accuracy readout. */
export default function SessionComplete({
  title,
  emoji = '🎉',
  correct,
  total,
  showScore = true,
  note,
  children,
}: Props) {
  const t = useT()
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const praise = !showScore
    ? (note ?? t('Cứ đều đặn mỗi ngày nhé!', 'Keep it up a little every day!'))
    : pct >= 90
      ? t('Tuyệt vời!', 'Amazing!')
      : pct >= 70
        ? t('Làm tốt lắm!', 'Well done!')
        : pct >= 50
          ? t('Cố lên nhé!', 'Keep going!')
          : t('Đừng nản, ôn lại nào!', "Don't give up — let's review!")

  // Throw a little confetti to reward finishing. For learning sessions there's
  // no "score" to scale by, so give a generous, fixed celebration.
  useEffect(() => {
    if (showScore) {
      if (total > 0) {
        celebrate(0.6 + (pct / 100) * 0.8)
        skyCelebrate(0.4 + pct / 100)
      }
    } else {
      celebrate(1.2)
      skyCelebrate(1.2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-md animate-fade-in text-center">
      <div className="card glow-ring p-8">
        <p className="pop-in text-6xl">{emoji}</p>
        <h1 className="mt-4 text-2xl font-extrabold">
          <span className="text-aurora">{title ?? t('Hoàn thành!', 'All done!')}</span>
        </h1>
        <p className="mt-1 text-slate-500">{praise}</p>
        <GoalNudge />

        {showScore && total > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label={t('Đúng', 'Correct')} value={correct} tone="text-emerald-600" />
            <Stat
              label={t('Tổng', 'Total')}
              value={total}
              tone="text-slate-700 dark:text-slate-200"
            />
            <Stat label={t('Chính xác', 'Accuracy')} value={pct} suffix="%" tone="text-brand-600" />
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>

        <Link to="/" className="btn-ghost mt-4 w-full">
          {t('Về trang chủ', 'Back to home')}
        </Link>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  suffix = '',
  tone,
}: {
  label: string
  value: number
  suffix?: string
  tone: string
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className={`text-2xl font-extrabold tabular-nums ${tone}`}>
        <CountUp to={value} />
        {suffix}
      </p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

/**
 * Counts from 0 up to `to` once, easing out. Writes straight into the DOM
 * (no re-render per frame); the final number is what React renders, so
 * screen readers, reduced motion and tests always see the real value.
 */
function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || to <= 0) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.textContent = String(to)
    }
  }, [to, ms])
  return <span ref={ref}>{to}</span>
}
