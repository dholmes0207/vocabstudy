import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, Zap } from 'lucide-react'
import ProgressRing from '@/components/ProgressRing'
import SpeakButton from '@/components/SpeakButton'
import ReminderSetup from '@/components/ReminderSetup'
import { skyCelebrate } from '@/lib/skyEvents'
import { mulberry32 } from '@/lib/sky'
import { savedReminder } from '@/lib/reminder'
import { ALL_STICKERS, collected } from '@/lib/stickers'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import {
  coverageEstimate,
  daysAway,
  goalProgress,
  nextMilestone,
  quickStartPath,
  shareText,
  welcomeBack,
} from '@/lib/motivation'
import type { StudyStats } from '@/types'

// Dashboard pieces that bring a discouraged learner back (docs/design/comeback.md):
// a warm welcome after a break, a tiny daily goal with a one-tap 2-minute
// start, a streak that one missed day can't break, and a personal sky that
// gains a star for every word learned.

const GOAL_KEY = 'vocab.goalCelebrated'

export function WelcomeBack({ stats, day, due }: { stats?: StudyStats; day: number; due: number }) {
  const msg = welcomeBack(daysAway(stats?.lastStudyDay ?? null, day))
  if (!msg) return null
  return (
    <section className="card relative overflow-hidden border-amber-200/70 p-5 dark:border-amber-500/20">
      <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 opacity-20" />
      <p className="text-lg font-bold">{msg.title}</p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{msg.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={quickStartPath(due)} className="btn-primary">
          <Zap className="h-4 w-4" /> Học nhanh 2 phút
        </Link>
        <Link to="/listen" className="btn-secondary">
          🎧 Chỉ nghe thôi
        </Link>
      </div>
    </section>
  )
}

export function DailyGoal({
  stats,
  day,
  doneToday,
  goal,
  due,
}: {
  stats?: StudyStats
  day: number
  doneToday: number
  goal: number
  due: number
}) {
  const g = goalProgress(doneToday, goal)
  const streak = stats?.lastStudyDay != null && day - stats.lastStudyDay <= 1 ? stats.streak : 0
  const shields = stats?.shields ?? 0
  const best = Math.max(stats?.bestStreak ?? 0, streak)
  const savedYesterday = stats?.shieldUsedDay != null && day - stats.shieldUsedDay <= 1
  // Offer a reminder until the learner has set one up (then it lives in Settings).
  const [hasReminder] = useState(() => savedReminder() !== null)

  const code = useSettings((s) => s.currentLang)
  const claimSticker = useStudy((s) => s.claimSticker)
  const owned = stats?.stickers
  const gift = g.reached && owned?.[day] !== undefined ? ALL_STICKERS[owned[day]] : undefined

  // Reaching the goal opens the day's gift and lights up the sky — once per
  // day, however often the dashboard is opened afterwards.
  useEffect(() => {
    if (!g.reached) return
    claimSticker(code, day)
    try {
      if (localStorage.getItem(GOAL_KEY) === String(day)) return
      localStorage.setItem(GOAL_KEY, String(day))
    } catch {
      return
    }
    skyCelebrate(1)
  }, [g.reached, day, code, claimSticker])

  return (
    <section className="card p-5">
      <div className="flex items-center gap-4">
        <ProgressRing value={g.ratio} size={88} stroke={9}>
          <div className="text-center leading-tight">
            <p className="text-lg font-extrabold">{g.reached ? '🎉' : `${g.done}/${g.goal}`}</p>
            <p className="text-[10px] text-slate-400">hôm nay</p>
          </div>
        </ProgressRing>
        <div className="min-w-0">
          <p className="font-bold">
            {g.reached ? 'Đạt mục tiêu hôm nay!' : `Mục tiêu nhỏ: ${g.goal} câu mỗi ngày`}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {g.reached
              ? 'Giỏi lắm! Mai quay lại giữ chuỗi nhé.'
              : g.done === 0
                ? 'Chỉ cần bắt đầu — vài câu là đủ.'
                : `Còn ${g.left} câu nữa thôi.`}{' '}
            <Link to="/settings" className="font-semibold text-brand-600 dark:text-brand-300">
              Đổi
            </Link>
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            <span title="Chuỗi ngày học">🔥 {streak} ngày</span>
            <span title="Mỗi khiên tha cho một ngày lỡ học. Cứ 7 ngày liên tục được thêm một khiên.">
              🛡️ {shields} khiên
            </span>
            {best > 1 && <span title="Chuỗi dài nhất">🏅 kỷ lục {best}</span>}
          </p>
        </div>
      </div>
      {gift ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-pink-50 px-3 py-2 dark:from-amber-950/40 dark:to-pink-950/30">
          <span className="pop-in text-4xl" aria-hidden="true">
            {gift.emoji}
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">
              🎁 Quà hôm nay: <b className="text-base">{gift.en}</b> — {gift.vi}
            </p>
            <Link to="/stats" className="font-semibold text-brand-600 dark:text-brand-300">
              Bộ sưu tập {collected(owned ?? {}).size}/{ALL_STICKERS.length} →
            </Link>
          </div>
          <SpeakButton text={gift.en} lang="en-US" size="sm" />
        </div>
      ) : (
        !g.reached && (
          <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            🎁 Đạt mục tiêu để mở quà hôm nay — một nhãn dán mới cho bộ sưu tập.
          </p>
        )
      )}
      {savedYesterday && (
        <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
          🛡️ Hôm qua bạn lỡ một ngày — khiên đã giữ chuỗi giúp bạn.
        </p>
      )}
      {!g.reached && (
        <Link to={quickStartPath(due)} className="btn-primary mt-4 w-full">
          <Zap className="h-4 w-4" /> Học nhanh 2 phút
        </Link>
      )}
      {!hasReminder && (
        <details className="mt-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <summary className="cursor-pointer text-sm font-semibold text-brand-600 dark:text-brand-300">
            🔔 Hay quên mở app? Nhờ điện thoại nhắc mỗi ngày
          </summary>
          <div className="pb-1 pt-3">
            <ReminderSetup />
          </div>
        </details>
      )}
    </section>
  )
}

const SKY_STARS = 90

/**
 * "Bầu trời của bạn": every word learned lights a star. Stars sit in fixed
 * places (seeded), so the learner watches the same sky fill up day by day.
 */
export function MySky({
  learned,
  mastered,
  streak = 0,
}: {
  learned: number
  mastered: number
  streak?: number
}) {
  const [copied, setCopied] = useState(false)
  // Phones open the system share sheet (Zalo, Messenger…); elsewhere copy it.
  const share = async () => {
    const text = shareText(learned, streak)
    const url = 'https://vocastudy.app/'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VocabStudy', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // the learner closed the share sheet — nothing to do
    }
  }
  const stars = useMemo(() => {
    const rand = mulberry32(4242)
    return Array.from({ length: SKY_STARS }, () => ({
      x: 6 + rand() * 288,
      y: 6 + rand() * 98,
      r: 0.8 + rand() * 1.4,
      delay: rand() * 4,
    }))
  }, [])
  // Up to 90 words, one star each; beyond that each star stands for more words.
  const per = Math.max(1, Math.ceil(learned / SKY_STARS))
  const lit = Math.min(SKY_STARS, Math.ceil(learned / per))
  const bright = Math.min(lit, Math.ceil(mastered / per))
  const coverage = coverageEstimate(learned)
  const m = nextMilestone(learned)
  const toNext = (learned - m.from) / Math.max(1, m.target - m.from)

  return (
    <section className="my-sky relative overflow-hidden rounded-2xl p-5 text-white shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
        🌌 Bầu trời của bạn
      </p>
      <svg viewBox="0 0 300 110" className="mt-2 w-full" aria-hidden="true">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={i < lit ? s.r + 0.4 : s.r * 0.6}
            className={i < bright ? 'star-bright' : i < lit ? 'star-lit' : 'star-off'}
            style={i < lit ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}
      </svg>
      <p className="mt-2 text-sm text-indigo-100">
        {learned === 0 ? (
          <>Mỗi từ bạn học sẽ thắp sáng một ngôi sao. Bắt đầu với từ đầu tiên nhé!</>
        ) : (
          <>
            Bạn đã thắp sáng <b className="text-white">{learned}</b> ngôi sao
            {mastered > 0 && (
              <>
                {' '}
                — <b className="text-amber-200">{mastered}</b> sao đã thật sáng
              </>
            )}
            . Với chừng ấy từ thông dụng, bạn hiểu khoảng <b className="text-white">{coverage}%</b>{' '}
            số từ trong một đoạn tiếng Anh thường ngày.
          </>
        )}
      </p>
      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-amber-200"
            style={{ width: `${Math.round(toNext * 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-indigo-200">
          Còn <b className="text-white">{m.left}</b> từ nữa để chạm mốc {m.target} ⭐
        </p>
      </div>
      {learned > 0 && (
        <button
          onClick={share}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" /> {copied ? 'Đã chép — dán để khoe nhé!' : 'Khoe bầu trời'}
        </button>
      )}
    </section>
  )
}

const STEPS = [
  ['1', 'Học 5 từ đầu tiên', 'Nghe, xem câu ví dụ, rồi tự nhớ lại ngay — khoảng 2 phút.'],
  ['2', 'Mai quay lại ôn', 'App tự nhắc đúng từ sắp quên. Nhớ lại sau một đêm mới là nhớ thật.'],
  [
    '3',
    'Mỗi ngày một chút',
    'Mục tiêu nhỏ 10 câu. Lỡ một ngày cũng không sao — đã có khiên giữ chuỗi.',
  ],
] as const

/** First visit: three plain steps, so a beginner knows exactly what to do. */
export function FirstSteps() {
  return (
    <section className="card p-5">
      <p className="text-lg font-bold">Bắt đầu thật đơn giản 🌱</p>
      <ol className="mt-3 space-y-3">
        {STEPS.map(([n, title, desc]) => (
          <li key={n} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
              {n}
            </span>
            <span>
              <b>{title}</b>
              <span className="block text-sm text-slate-500 dark:text-slate-400">{desc}</span>
            </span>
          </li>
        ))}
      </ol>
      <Link to="/learn?quick=1" className="btn-primary mt-4 w-full">
        <Zap className="h-4 w-4" /> Học 5 từ đầu tiên
      </Link>
    </section>
  )
}
