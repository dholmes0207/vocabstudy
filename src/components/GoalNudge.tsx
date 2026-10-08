import { useEffect } from 'react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { goalProgress } from '@/lib/motivation'
import { ALL_STICKERS } from '@/lib/stickers'
import { today } from '@/lib/date'

/**
 * End-of-session line about the day's small goal: how close the gift is, or
 * the gift itself the moment the session reaches the goal — the reward lands
 * right when the work is done, not on some later screen.
 */
export default function GoalNudge() {
  const code = useSettings((s) => s.currentLang)
  const goal = useSettings((s) => s.dailyGoal)
  const stats = useStudy((s) => s.progress[code]?.stats)
  const claimSticker = useStudy((s) => s.claimSticker)
  const day = today()
  const g = goalProgress(stats?.reviewsByDay[day] ?? 0, goal)

  useEffect(() => {
    if (g.reached) claimSticker(code, day)
  }, [g.reached, code, day, claimSticker])

  if (!stats) return null
  const giftIdx = stats.stickers?.[day]
  const gift = giftIdx !== undefined ? ALL_STICKERS[giftIdx] : undefined

  if (g.reached && gift) {
    return (
      <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-pink-50 px-4 py-3 dark:from-amber-950/40 dark:to-pink-950/30">
        <span className="pop-in text-4xl" aria-hidden="true">
          {gift.emoji}
        </span>
        <p className="text-left text-sm">
          🎁 Đạt mục tiêu hôm nay! Quà của bạn: <b className="text-base">{gift.en}</b> — {gift.vi}
        </p>
      </div>
    )
  }
  if (g.reached) return null
  return (
    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      Còn <b>{g.left}</b> câu nữa là đạt mục tiêu hôm nay và mở quà 🎁
    </p>
  )
}
