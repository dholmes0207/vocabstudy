import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { summarize } from '@/lib/summary'
import { computeLevel } from '@/lib/level'

/**
 * The learner's effective level (1..5): auto-estimated from progress, or the
 * manual override when autoLevel is off.
 */
export function useEffectiveLevel(): number {
  const autoLevel = useSettings((s) => s.autoLevel)
  const manual = useSettings((s) => s.level)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const code = useSettings((s) => s.currentLang)
  const pack = useData((s) => s.pack)
  const progress = useStudy((s) => s.progress[code])

  if (!autoLevel || !pack) return manual

  const s = summarize(pack.words, progress, dailyNewLimit)
  const stats = progress?.stats
  const accuracy = stats && stats.totalReviews ? (stats.totalCorrect / stats.totalReviews) * 100 : 0
  return computeLevel({ mastered: s.mastered, learned: s.learned, accuracy })
}
