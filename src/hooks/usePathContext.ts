import { useMemo } from 'react'
import { useData } from '@/store/dataStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useGrammar } from '@/store/grammarStore'
import { useReading } from '@/store/readingStore'
import { NO_ACTIVITY, useActivity } from '@/store/activityStore'
import { useRetry } from '@/store/retryStore'
import { useExam } from '@/store/examStore'
import { usePlacement } from '@/store/placementStore'
import { isPassed } from '@/lib/grammar'
import type { PathContext } from '@/lib/learningPath'

/**
 * What the learning path reads (lib/learningPath.ts), for one pack, from the
 * stores the rest of the app already writes. Words before the placement start
 * count as known: placement sent the learner past them on purpose.
 */
export function usePathContext(code: string): PathContext {
  const words = useData((s) => s.pack?.words)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const grammar = useGrammar((s) => s.progress)
  const reading = useReading((s) => s.progress)
  const activity = useActivity((s) => s.counts[code] ?? NO_ACTIVITY)
  const parts = useRetry((s) => s.parts)
  const exams = useExam((s) => s.records)
  const placedAt = usePlacement((s) => s.results[code]?.start ?? 0)

  return useMemo<PathContext>(() => {
    const list = words ?? []
    const known = new Set(list.filter((w) => cards[w.id]).map((w) => w.word))
    return {
      learnedInRange: (from, to) => {
        let n = 0
        for (let i = from; i < Math.min(to, list.length); i++)
          if (i < placedAt || cards[list[i].id]) n++
        return n
      },
      learnedWords: (headwords) => headwords.filter((w) => known.has(w)).length,
      grammarPassed: (ids) => ids.filter((id) => isPassed(grammar[id])).length,
      storiesRead: (ids) => ids.filter((id) => reading[id]).length,
      activity: (kind) => activity[kind] ?? 0,
      toeicPart: (part) => parts[part] ?? [0, 0],
      examBest: (id) => {
        const rec = exams[id]
        return rec && rec.total ? rec.best / rec.total : 0
      },
    }
  }, [words, cards, grammar, reading, activity, parts, exams, placedAt])
}
