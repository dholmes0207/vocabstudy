import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, Flame, Star, Target } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy, cardsOf, statsOf } from '@/store/studyStore'
import { INTERVALS, MASTERED_BOX } from '@/lib/srs'
import { summarize } from '@/lib/summary'
import { today, formatDay } from '@/lib/date'
import { compareWeeks, recentCalendar, type WeekTotals } from '@/lib/calendar'
import { ALL_STICKERS, STICKER_SETS, collected } from '@/lib/stickers'
import { evaluateAchievements } from '@/lib/achievements'
import EmptyState from '@/components/EmptyState'
import SkillsSection from './SkillsSection'
import PathBadges from './PathBadges'
import { useT, useUiLang } from '@/lib/i18n'

const DAYS = 14

export default function Stats() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const progress = useStudy((s) => s.progress)

  const cards = cardsOf(progress, code)
  const stats = statsOf(progress, code)
  const t = useT()
  const lang = useUiLang()
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
  const calendar = recentCalendar(stats.reviewsByDay, today())
  const week = compareWeeks(stats.reviewsByDay, stats.newByDay, today(), lang)
  const album = collected(stats.stickers ?? {})

  const achievements = evaluateAchievements(
    {
      learned: s.learned,
      mastered: s.mastered,
      streak: stats.streak,
      xp: stats.xp,
      totalReviews: stats.totalReviews,
      accuracy,
      daysStudied: Object.values(stats.reviewsByDay).filter((n) => n > 0).length,
      bestStreak: stats.bestStreak ?? stats.streak,
      stickers: collected(stats.stickers ?? {}).size,
    },
    lang
  )
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  if (s.learned === 0) {
    // No words yet, but stories or grammar may already have been done.
    return (
      <div className="space-y-6">
        <EmptyState
          emoji="📊"
          title={t('Chưa có dữ liệu thống kê', 'No stats yet')}
          description={t(
            'Bắt đầu học để xem tiến độ của bạn hiện lên ở đây.',
            'Start learning and your progress will show up here.'
          )}
        >
          <Link to="/learn" className="btn-primary">
            {t('Học từ mới', 'Learn new words')}
          </Link>
        </EmptyState>
        <SkillsSection key={code} code={code} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Thống kê', 'Stats')}</span>{' '}
          <span aria-hidden="true">📈</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            `Theo dõi hành trình chinh phục ${pack.meta.count} từ của bạn.`,
            `Follow your journey through ${pack.meta.count} words.`
          )}
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          icon={Flame}
          tone="text-orange-500"
          value={`${stats.streak}`}
          label={t('Ngày liên tiếp', 'Day streak')}
        />
        <Kpi icon={Star} tone="text-amber-500" value={`${stats.xp}`} label={t('Điểm XP', 'XP')} />
        <Kpi
          icon={Target}
          tone="text-brand-600"
          value={`${accuracy}%`}
          label={t('Độ chính xác', 'Accuracy')}
        />
        <Kpi
          icon={Award}
          tone="text-emerald-600"
          value={`${s.mastered}`}
          label={t('Từ thành thạo', 'Words mastered')}
        />
      </div>

      {/* Overall composition */}
      <section className="card p-6">
        <h2 className="mb-4 font-bold">{t('Tổng quan tiến độ', 'Progress overview')}</h2>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <Bar value={s.mastered} total={s.total} className="bg-emerald-500" />
          <Bar value={s.learning} total={s.total} className="bg-amber-400" />
          <Bar value={s.fresh} total={s.total} className="bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <Legend color="bg-emerald-500" label={t('Thành thạo', 'Mastered')} value={s.mastered} />
          <Legend color="bg-amber-400" label={t('Đang học', 'Learning')} value={s.learning} />
          <Legend
            color="bg-slate-300 dark:bg-slate-600"
            label={t('Chưa học', 'Not started')}
            value={s.fresh}
          />
        </div>
      </section>

      <SkillsSection key={code} code={code} />

      {/* SRS box distribution */}
      <section className="card p-6">
        <h2 className="mb-1 font-bold">{t('Phân bố theo bậc ghi nhớ', 'Cards by memory stage')}</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Càng lên bậc cao, khoảng cách ôn càng dài (lặp lại ngắt quãng).',
            'The higher the stage, the longer the gap before the next review (spaced repetition).'
          )}
        </p>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {boxCounts.map((cnt, box) => {
            const max = Math.max(1, ...boxCounts)
            const h = (cnt / max) * 100
            const isMaster = box === MASTERED_BOX
            return (
              <div key={box} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                  {cnt}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${isMaster ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ height: `${Math.max(cnt ? 6 : 0, h)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isMaster ? '🏆' : box === 0 ? 'mới' : `${INTERVALS[box - 1]}n`}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {t(
            'Nhãn = khoảng cách ôn của mỗi bậc (ngày) · 🏆 = đã thành thạo',
            'Labels = review gap for each stage (days) · 🏆 = mastered'
          )}
        </p>
      </section>

      {/* This week against the last: progress measured against yourself */}
      {week && (
        <section className="card p-5">
          <h2 className="font-bold">{t('7 ngày qua', 'Last 7 days')}</h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{week.message}</p>
          <div className="grid grid-cols-3 gap-3">
            {WEEK_TILES.map(([key, vi, en]) => (
              <WeekTile key={key} label={t(vi, en)} now={week.now[key]} before={week.before[key]} />
            ))}
          </div>
        </section>
      )}

      {/* Study calendar: the last 5 weeks */}
      <section className="card p-5">
        <h2 className="font-bold">{t('5 tuần gần đây', 'Last 5 weeks')}</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Mỗi ô sáng là một ngày bạn đã học — cố đừng để chuỗi đứt nhé.',
            'Each lit square is a day you studied — try not to break the chain.'
          )}
        </p>
        <div className="grid max-w-sm grid-cols-7 gap-1.5">
          {calendar.map((c) => (
            <div
              key={c.day}
              title={t(
                `${formatDay(c.day)}: ${c.count} câu`,
                `${formatDay(c.day)}: ${c.count} answers`
              )}
              className={`cal-cell cal-${c.level} aspect-square rounded-md ${c.isToday ? 'ring-2 ring-brand-500' : ''}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('Đã học', 'Studied on')} {calendar.filter((c) => c.count > 0).length}/{calendar.length}{' '}
          {t('ngày', 'days')}
        </p>
      </section>

      {/* Activity last 14 days */}
      <section className="card p-6">
        <h2 className="mb-4 font-bold">
          {t(`Hoạt động ${DAYS} ngày gần đây`, `Activity in the last ${DAYS} days`)}
        </h2>
        <div className="flex items-end gap-1.5" style={{ height: 140 }}>
          {activity.map((a) => {
            const total = a.reviews + a.news
            const h = (total / maxActivity) * 100
            return (
              <div
                key={a.day}
                className="group flex flex-1 flex-col items-center gap-1"
                title={t(
                  `${formatDay(a.day)}: ${a.news} từ mới, ${a.reviews} lượt ôn`,
                  `${formatDay(a.day)}: ${a.news} new words, ${a.reviews} reviews`
                )}
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
                <span className="text-[9px] text-slate-500 dark:text-slate-400">
                  {formatDay(a.day).slice(0, 2)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> {t('Từ mới', 'New words')}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-brand-500" /> {t('Ôn tập', 'Reviews')}
          </span>
        </div>
      </section>

      <PathBadges />

      {/* Achievements */}
      <section className="card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-bold">{t('Huy hiệu 🏅', 'Badges 🏅')}</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
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
                <p
                  className={`truncate text-sm font-bold ${a.unlocked ? '' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {a.title}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
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

      {/* "Quà mỗi ngày": the sticker album */}
      <section className="card p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold">{t('Bộ sưu tập nhãn dán 🎁', 'Sticker collection 🎁')}</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {album.size}/{ALL_STICKERS.length}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Mỗi ngày đạt mục tiêu nhỏ mở được một nhãn dán mới — mỗi nhãn là một từ tiếng Anh.',
            'Each day you reach your small goal opens a new sticker — every sticker is an English word.'
          )}
        </p>
        {STICKER_SETS.map((set) => {
          const got = set.stickers.filter((st) => album.has(ALL_STICKERS.indexOf(st))).length
          return (
            <div key={set.name} className="mt-4">
              <p className="mb-2 text-sm font-semibold">
                {t(set.name, set.nameEn)}{' '}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {got}/{set.stickers.length}
                </span>
                {got === set.stickers.length && ' ✅'}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                {set.stickers.map((st) =>
                  album.has(ALL_STICKERS.indexOf(st)) ? (
                    <div
                      key={st.en}
                      title={`${st.en} — ${st.vi}`}
                      className="pop-in flex flex-col items-center rounded-xl bg-amber-50 px-1 py-2 dark:bg-amber-950/30"
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {st.emoji}
                      </span>
                      <span className="mt-0.5 truncate text-[11px] font-semibold">{st.en}</span>
                    </div>
                  ) : (
                    <div
                      key={st.en}
                      aria-label={t('Chưa mở', 'Not opened yet')}
                      className="grid place-items-center rounded-xl bg-slate-100 py-2 text-2xl font-bold text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                    >
                      ?
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
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
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
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
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

const WEEK_TILES: [keyof WeekTotals, string, string][] = [
  ['answers', 'câu trả lời', 'answers'],
  ['words', 'từ mới', 'new words'],
  ['days', 'ngày học', 'study days'],
]

function WeekTile({ label, now, before }: { label: string; now: number; before: number }) {
  const t = useT()
  const diff = now - before
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
      <p className="text-2xl font-extrabold tabular-nums">{now}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-1 text-xs font-semibold ${diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
      >
        {diff > 0
          ? `▲ ${diff}`
          : diff < 0
            ? t(`tuần trước ${before}`, `last week ${before}`)
            : t('= tuần trước', '= last week')}
      </p>
    </div>
  )
}
