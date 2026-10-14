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
import { JOURNEY, journeyState, type Mission } from '@/lib/journey'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import {
  coverageEstimate,
  daysAway,
  energyOptions,
  goalProgress,
  nextMilestone,
  quickStartPath,
  shareText,
  welcomeBack,
} from '@/lib/motivation'
import type { StudyStats } from '@/types'
import { useT, useUiLang } from '@/lib/i18n'
import { useData } from '@/store/dataStore'

// Dashboard pieces that bring a discouraged learner back (docs/design/comeback.md):
// a warm welcome after a break, a tiny daily goal with a one-tap 2-minute
// start, a streak that one missed day can't break, and a personal sky that
// gains a star for every word learned.

const GOAL_KEY = 'vocab.goalCelebrated'

export function WelcomeBack({ stats, day, due }: { stats?: StudyStats; day: number; due: number }) {
  const t = useT()
  const lang = useUiLang()
  const msg = welcomeBack(daysAway(stats?.lastStudyDay ?? null, day), lang)
  if (!msg) return null
  return (
    <section className="card relative overflow-hidden border-amber-200/70 p-5 dark:border-amber-500/20">
      <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 opacity-20" />
      <p className="text-lg font-bold">{msg.title}</p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{msg.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={quickStartPath(due)} className="btn-primary">
          <Zap className="h-4 w-4" /> {t('Học nhanh 2 phút', 'Quick 2-minute session')}
        </Link>
        <Link to="/listen" className="btn-secondary">
          🎧 {t('Chỉ nghe thôi', 'Just listen')}
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
  const t = useT()
  const lang = useUiLang()
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
            <p className="text-[10px] text-slate-400">{t('hôm nay', 'today')}</p>
          </div>
        </ProgressRing>
        <div className="min-w-0">
          <p className="font-bold">
            {g.reached
              ? t('Đạt mục tiêu hôm nay!', 'Goal reached today!')
              : t(`Mục tiêu nhỏ: ${g.goal} câu mỗi ngày`, `Small goal: ${g.goal} answers a day`)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {g.reached
              ? t(
                  'Giỏi lắm! Mai quay lại giữ chuỗi nhé.',
                  'Great job! Come back tomorrow to keep your streak.'
                )
              : g.done === 0
                ? t('Chỉ cần bắt đầu — vài câu là đủ.', 'Just start — a few answers is enough.')
                : t(`Còn ${g.left} câu nữa thôi.`, `Only ${g.left} to go.`)}{' '}
            <Link to="/settings" className="font-semibold text-brand-600 dark:text-brand-300">
              {t('Đổi', 'Change')}
            </Link>
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            <span title={t('Chuỗi ngày học', 'Study streak')}>
              🔥 {streak} {t('ngày', streak === 1 ? 'day' : 'days')}
            </span>
            <span
              title={t(
                'Mỗi khiên tha cho một ngày lỡ học. Cứ 7 ngày liên tục được thêm một khiên.',
                'Each shield forgives one missed day. Every 7-day streak earns another.'
              )}
            >
              🛡️ {shields} {t('khiên', shields === 1 ? 'shield' : 'shields')}
            </span>
            {best > 1 && (
              <span title={t('Chuỗi dài nhất', 'Longest streak')}>
                🏅 {t('kỷ lục', 'best')} {best}
              </span>
            )}
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
              🎁 {t('Quà hôm nay:', "Today's gift:")} <b className="text-base">{gift.en}</b> —{' '}
              {gift.vi}
            </p>
            <Link to="/stats" className="font-semibold text-brand-600 dark:text-brand-300">
              {t('Bộ sưu tập', 'Collection')} {collected(owned ?? {}).size}/{ALL_STICKERS.length} →
            </Link>
          </div>
          <SpeakButton text={gift.en} lang="en-US" size="sm" />
        </div>
      ) : (
        !g.reached && (
          <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            🎁{' '}
            {t(
              'Đạt mục tiêu để mở quà hôm nay — một nhãn dán mới cho bộ sưu tập.',
              "Reach the goal to open today's gift — a new sticker for your collection."
            )}
          </p>
        )
      )}
      {savedYesterday && (
        <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
          🛡️{' '}
          {t(
            'Hôm qua bạn lỡ một ngày — khiên đã giữ chuỗi giúp bạn.',
            'You missed a day yesterday — a shield kept your streak alive.'
          )}
        </p>
      )}
      {!g.reached && (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('Hôm nay bạn còn bao nhiêu sức?', 'How much energy do you have today?')}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {energyOptions(due, lang).map((o, i) => (
              <Link
                key={o.label}
                to={o.to}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-center text-sm font-semibold transition hover:-translate-y-0.5 ${
                  i === 1
                    ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md'
                    : 'border border-slate-200 bg-white/60 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900/50'
                }`}
              >
                <span className="text-xl" aria-hidden="true">
                  {o.emoji}
                </span>
                {o.label}
              </Link>
            ))}
          </div>
        </>
      )}
      {!hasReminder && (
        <details className="mt-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <summary className="cursor-pointer text-sm font-semibold text-brand-600 dark:text-brand-300">
            🔔{' '}
            {t(
              'Hay quên mở app? Nhờ điện thoại nhắc mỗi ngày',
              'Often forget to study? Get a daily reminder on your phone'
            )}
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
  const t = useT()
  const lang = useUiLang()
  // Phones open the system share sheet (Zalo, Messenger…); elsewhere copy it.
  const share = async () => {
    const text = shareText(learned, streak, lang)
    const url = 'https://vocastudy.app/'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VocaStudy', text, url })
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
  // The estimate comes from English word-frequency data; other packs skip it.
  const englishPack = useData((st) => st.pack?.meta.code ?? 'en') === 'en'
  const m = nextMilestone(learned)
  const toNext = (learned - m.from) / Math.max(1, m.target - m.from)

  return (
    <section className="my-sky relative overflow-hidden rounded-2xl p-5 text-white shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
        🌌 {t('Bầu trời của bạn', 'Your sky')}
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
          t(
            'Mỗi từ bạn học sẽ thắp sáng một ngôi sao. Bắt đầu với từ đầu tiên nhé!',
            'Every word you learn lights up a star. Start with your first one!'
          )
        ) : lang === 'en' ? (
          <>
            You've lit up <b className="text-white">{learned}</b> stars
            {mastered > 0 && (
              <>
                {' '}
                — <b className="text-amber-200">{mastered}</b> shine bright
              </>
            )}
            {englishPack ? (
              <>
                . With that many common words you understand about{' '}
                <b className="text-white">{coverage}%</b> of the words in everyday English text.
              </>
            ) : (
              '.'
            )}
          </>
        ) : (
          <>
            Bạn đã thắp sáng <b className="text-white">{learned}</b> ngôi sao
            {mastered > 0 && (
              <>
                {' '}
                — <b className="text-amber-200">{mastered}</b> sao đã thật sáng
              </>
            )}
            {englishPack ? (
              <>
                . Với chừng ấy từ thông dụng, bạn hiểu khoảng{' '}
                <b className="text-white">{coverage}%</b> số từ trong một đoạn tiếng Anh thường
                ngày.
              </>
            ) : (
              '.'
            )}
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
          {lang === 'en' ? (
            <>
              <b className="text-white">{m.left}</b> more words to reach {m.target} ⭐
            </>
          ) : (
            <>
              Còn <b className="text-white">{m.left}</b> từ nữa để chạm mốc {m.target} ⭐
            </>
          )}
        </p>
      </div>
      {learned > 0 && (
        <button
          onClick={share}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" />{' '}
          {copied
            ? t('Đã chép — dán để khoe nhé!', 'Copied — paste it to share!')
            : t('Khoe bầu trời', 'Share my sky')}
        </button>
      )}
    </section>
  )
}

const STEPS = [
  [
    '1',
    ['Học 5 từ đầu tiên', 'Learn your first 5 words'],
    [
      'Nghe, xem câu ví dụ, rồi tự nhớ lại ngay — khoảng 2 phút.',
      'Listen, see an example, then recall it right away — about 2 minutes.',
    ],
  ],
  [
    '2',
    ['Mai quay lại ôn', 'Come back tomorrow to review'],
    [
      'App tự nhắc đúng từ sắp quên. Nhớ lại sau một đêm mới là nhớ thật.',
      'The app brings back the words you are about to forget. Recalling after a night is real memory.',
    ],
  ],
  [
    '3',
    ['Mỗi ngày một chút', 'A little every day'],
    [
      'Mục tiêu nhỏ 10 câu. Lỡ một ngày cũng không sao — đã có khiên giữ chuỗi.',
      'A small goal of 10 answers. Missing a day is fine — shields protect your streak.',
    ],
  ],
] as const

/** First visit: three plain steps, so a beginner knows exactly what to do. */
export function FirstSteps() {
  const t = useT()
  return (
    <section className="card p-5">
      <p className="text-lg font-bold">
        {t('Bắt đầu thật đơn giản 🌱', 'Getting started is easy 🌱')}
      </p>
      <ol className="mt-3 space-y-3">
        {STEPS.map(([n, title, desc]) => (
          <li key={n} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
              {n}
            </span>
            <span>
              <b>{t(title[0], title[1])}</b>
              <span className="block text-sm text-slate-500 dark:text-slate-400">
                {t(desc[0], desc[1])}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <Link to="/learn?quick=1" className="btn-primary mt-4 w-full">
        <Zap className="h-4 w-4" /> {t('Học 5 từ đầu tiên', 'Learn your first 5 words')}
      </Link>
    </section>
  )
}

const JOURNEY_KEY = 'vocab.journeyCelebrated'

/** "Hành trình 7 ngày đầu": one small mission a day through the first week. */
export function Journey({
  reviewsByDay,
  day,
}: {
  reviewsByDay: Record<number, number>
  day: number
}) {
  const t = useT()
  const lang = useUiLang()
  const title = (m: Mission) => (lang === 'en' ? m.titleEn : m.title)
  const j = journeyState(reviewsByDay, day)
  const finished = j?.finished ?? false

  // Finishing the first week deserves the whole sky — once.
  useEffect(() => {
    if (!finished) return
    try {
      if (localStorage.getItem(JOURNEY_KEY)) return
      localStorage.setItem(JOURNEY_KEY, String(day))
    } catch {
      return
    }
    skyCelebrate(1.5)
  }, [finished, day])

  if (!j) return null
  const mission = JOURNEY[j.current]
  const tomorrow = JOURNEY[j.done]

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-bold">{t('Hành trình 7 ngày đầu 🗺️', 'Your first 7 days 🗺️')}</p>
        <span className="text-sm text-slate-500">
          {j.done}/{JOURNEY.length} {t('ngày', 'days')}
        </span>
      </div>
      <ol className="mt-3 grid max-w-md grid-cols-7 gap-1.5">
        {JOURNEY.map((m, i) => (
          <li
            key={m.title}
            title={t(`Ngày ${i + 1}: ${m.title}`, `Day ${i + 1}: ${m.titleEn}`)}
            className={`grid aspect-square place-items-center rounded-xl text-lg font-bold transition ${
              i < j.done
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                : i === j.current
                  ? 'bg-brand-50 ring-2 ring-brand-400 dark:bg-brand-950'
                  : 'bg-slate-100 opacity-60 dark:bg-slate-800'
            }`}
          >
            {i < j.done ? '✓' : m.emoji}
          </li>
        ))}
      </ol>
      {j.finished ? (
        <p className="mt-3 text-sm">
          🎉 <b>{t('Bạn đã đi hết tuần đầu tiên!', 'You finished your first week!')}</b>{' '}
          {t(
            'Phần khó nhất — bắt đầu và giữ nhịp — bạn đã làm được. Từ giờ cứ mỗi ngày một chút như vậy nhé.',
            'The hardest part — starting and keeping a rhythm — is done. Keep going a little every day.'
          )}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {j.studiedToday
                ? t(
                    `Xong ngày ${j.done} ✓ — nhiệm vụ hôm nay`,
                    `Day ${j.done} done ✓ — today's mission`
                  )
                : t(`Nhiệm vụ ngày ${j.current + 1}`, `Day ${j.current + 1} mission`)}
            </p>
            <p className="font-semibold">
              {mission.emoji} {title(mission)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {j.studiedToday && tomorrow
                ? t(
                    `Mai: ${tomorrow.emoji} ${tomorrow.title}`,
                    `Tomorrow: ${tomorrow.emoji} ${tomorrow.titleEn}`
                  )
                : lang === 'en'
                  ? mission.descEn
                  : mission.desc}
            </p>
          </div>
          <Link to={mission.to} className={j.studiedToday ? 'btn-secondary' : 'btn-primary'}>
            {j.studiedToday ? t('Thử luôn', 'Try it') : t('Làm ngay', 'Do it now')}
          </Link>
        </div>
      )}
    </section>
  )
}
