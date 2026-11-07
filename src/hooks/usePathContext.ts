import { useMemo } from 'react'
import { useData } from '@/store/dataStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useGrammar } from '@/store/grammarStore'
import { useReading } from '@/store/readingStore'
import { NO_ACTIVITY, useActivity } from '@/store/activityStore'
import { useRetry } from '@/store/retryStore'
import { useExam } from '@/store/examStore'
import { usePlacement } from '@/store/placementStore'
import { NO_PASSED, openedByTests, usePath } from '@/store/pathStore'
import { isPassed } from '@/lib/grammar'
import {
  levelForPlacement,
  pathState,
  type LevelState,
  type PathContext,
  type PathLevel,
} from '@/lib/learningPath'

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
  const hsk = useRetry((s) => s.hsk)
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
      hskAnswered: (level) =>
        Object.entries(hsk)
          .filter(([key]) => key.startsWith(`${level}:`))
          .reduce((n, [, [, asked]]) => n + asked, 0),
    }
  }, [words, cards, grammar, reading, activity, parts, exams, placedAt, hsk])
}

/**
 * Every level of a path with its progress, opened as far as the placement
 * result or a won level test allows (whichever reaches higher).
 */
export function usePathStates(code: string, levels: readonly PathLevel[]): LevelState[] {
  const ctx = usePathContext(code)
  const placedAt = usePlacement((s) => s.results[code]?.start ?? 0)
  const passed = usePath((s) => s.passed[code] ?? NO_PASSED)
  return useMemo(() => {
    const openTo = Math.max(levelForPlacement(levels, placedAt), openedByTests(passed))
    return pathState(levels, ctx, openTo)
  }, [levels, ctx, placedAt, passed])
}
