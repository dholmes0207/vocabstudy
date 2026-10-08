import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, Flame, Star, Target } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy, cardsOf, statsOf } from '@/store/studyStore'
import { INTERVALS, MASTERED_BOX } from '@/lib/srs'
import { summarize } from '@/lib/summary'
import { today, formatDay } from '@/lib/date'
import { evaluateAchievements } from '@/lib/achievements'
import EmptyState from '@/components/EmptyState'

const DAYS = 14

export default function Stats() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const progress = useStudy((s) => s.progress)

  const cards = cardsOf(progress, code)
  const stats = statsOf(progress, code)
  const s = summarize(pack.words, progress[code], dailyNewLimit)

  const boxCounts = useMemo(() => {
    const counts = new Array(MASTERED_BOX + 1).fill(0) as number[]
    cards.forEach((c) => {
      counts[Math.min(c.box, MASTERED_BOX)]++
    })
    return counts
  }, [cards])

  const activity = useMemo(() => {
    const t = today()
    const days: { day: number; reviews: number; news: number }[] = []
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = t - i
      days.push({ day: d, reviews: stats.reviewsByDay[d] ?? 0, news: stats.newByDay[d] ?? 0 })
    }
    return days
  }, [stats])

  const accuracy = stats.totalReviews
    ? Math.round((stats.totalCorrect / stats.totalReviews) * 100)
    : 0
  const maxActivity = Math.max(1, ...activity.map((a) => a.reviews + a.news))

  const achievements = evaluateAchievements({
    learned: s.learned,
    mastered: s.mastered,
    streak: stats.streak,
    xp: stats.xp,
    totalReviews: stats.totalReviews,
    accuracy,
    daysStudied: Object.values(stats.reviewsByDay).filter((n) => n > 0).length,
    bestStreak: stats.bestStreak ?? stats.streak,
  })
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  if (s.learned === 0) {
    return (
      <EmptyState
        emoji="📊"
        title="Chưa có dữ liệu thống kê"
        description="Bắt đầu học để xem tiến độ của bạn hiện lên ở đây."
      >
        <Link to="/learn" className="btn-primary">
          Học từ mới
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">Thống kê</span> <span aria-hidden="true">📈</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Theo dõi hành trình chinh phục {pack.meta.count} từ của bạn.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={Flame} tone="text-orange-500" value={`${stats.streak}`} label="Ngày liên tiếp" />
        <Kpi icon={Star} tone="text-amber-500" value={`${stats.xp}`} label="Điểm XP" />
        <Kpi icon={Target} tone="text-brand-600" value={`${accuracy}%`} label="Độ chính xác" />
        <Kpi icon={Award} tone="text-emerald-600" value={`${s.mastered}`} label="Từ thành thạo" />
      </div>

      {/* Overall composition */}
      <section className="card p-6">
        <h2 className="mb-4 font-bold">Tổng quan tiến độ</h2>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <Bar value={s.mastered} total={s.total} className="bg-emerald-500" />
          <Bar value={s.learning} total={s.total} className="bg-amber-400" />
          <Bar value={s.fresh} total={s.total} className="bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <Legend color="bg-emerald-500" label="Thành thạo" value={s.mastered} />
          <Legend color="bg-amber-400" label="Đang học" value={s.learning} />
          <Legend color="bg-slate-300 dark:bg-slate-600" label="Chưa học" value={s.fresh} />
        </div>
      </section>

      {/* SRS box distribution */}
      <section className="card p-6">
        <h2 className="mb-1 font-bold">Phân bố theo bậc ghi nhớ</h2>
        <p className="mb-4 text-sm text-slate-400">
          Càng lên bậc cao, khoảng cách ôn càng dài (lặp lại ngắt quãng).
        </p>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {boxCounts.map((cnt, box) => {
            const max = Math.max(1, ...boxCounts)
            const h = (cnt / max) * 100
            const isMaster = box === MASTERED_BOX
            return (
              <div key={box} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-semibold tabular-nums text-slate-500">{cnt}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${isMaster ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ height: `${Math.max(cnt ? 6 : 0, h)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  {isMaster ? '🏆' : box === 0 ? 'mới' : `${INTERVALS[box - 1]}n`}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          Nhãn = khoảng cách ôn của mỗi bậc (ngày) · 🏆 = đã thành thạo
        </p>
      </section>

      {/* Activity last 14 days */}
      <section className="card p-6">
        <h2 className="mb-4 font-bold">Hoạt động {DAYS} ngày gần đây</h2>
        <div className="flex items-end gap-1.5" style={{ height: 140 }}>
          {activity.map((a) => {
            const total = a.reviews + a.news
            const h = (total / maxActivity) * 100
            return (
              <div
                key={a.day}
                className="group flex flex-1 flex-col items-center gap-1"
                title={`${formatDay(a.day)}: ${a.news} từ mới, ${a.reviews} lượt ôn`}
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                    style={{ height: `${Math.max(total ? 4 : 0, h)}%` }}
                  >
                    <div
                      className="w-full bg-emerald-400"
                      style={{ height: `${total ? (a.news / total) * 100 : 0}%` }}
                    />
                    <div
                      className="w-full bg-brand-500"
                      style={{ height: `${total ? (a.reviews / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">{formatDay(a.day).slice(0, 2)}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Từ mới
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Ôn tập
          </span>
        </div>
      </section>

      {/* Achievements */}
      <section className="card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-bold">Huy hiệu 🏅</h2>
          <span className="text-sm text-slate-400">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              title={a.desc}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                a.unlocked
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <span className={`text-2xl ${a.unlocked ? '' : 'opacity-30 grayscale'}`}>
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${a.unlocked ? '' : 'text-slate-400'}`}>
                  {a.title}
                </p>
                <p className="truncate text-xs text-slate-400">{a.desc}</p>
                {!a.unlocked && a.progress > 0 && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${a.progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Kpi({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Award
  tone: string
  value: string
  label: string
}) {
  return (
    <div className="card p-4">
      <Icon className={`h-6 w-6 ${tone}`} />
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function Bar({ value, total, className }: { value: number; total: number; className: string }) {
  const pct = total ? (value / total) * 100 : 0
  if (pct === 0) return null
  return <div className={className} style={{ width: `${pct}%` }} />
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div>
      <span className={`mx-auto mb-1 block h-2.5 w-2.5 rounded-full ${color}`} />
      <p className="font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
