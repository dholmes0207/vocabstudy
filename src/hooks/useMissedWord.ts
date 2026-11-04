import { useCallback } from 'react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'

/**
 * Exam practice (TOEIC, HSK) asks about the pack's own words. A word missed
 * there that is already in the review schedule is recorded as a wrong answer,
 * so it comes back soon. Nothing else is: a right answer outside the schedule
 * would push a card further than its reviews have earned, and a word never
 * studied is not started by a practice round.
 */
export function useMissedWord(): (wordId: number | undefined) => void {
  const code = useSettings((s) => s.currentLang)
  const recordAnswer = useStudy((s) => s.recordAnswer)
  return useCallback(
    (wordId) => {
      if (wordId === undefined) return
      if (useStudy.getState().progress[code]?.cards[wordId]) recordAnswer(code, wordId, false)
    },
    [code, recordAnswer]
  )
}
