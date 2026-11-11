import { useEffect } from 'react'
import { usePath } from '@/store/pathStore'
import { useStudy } from '@/store/studyStore'
import { today } from '@/lib/date'
import { celebrate } from '@/lib/confetti'
import type { LevelState } from '@/lib/learningPath'
import { QUEST_XP, questDone, questFor, questStep } from '@/lib/pathQuest'

/**
 * Today's quest on the level path (lib/pathQuest.ts): sets it the first time
 * the path is seen each day, says whether it is done and claims its XP.
 */
export function useDailyQuest(code: string, states: readonly LevelState[]) {
  const stored = usePath((s) => s.quests[code])
  const setQuest = usePath((s) => s.setQuest)
  const claimQuest = usePath((s) => s.claimQuest)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const quest = questFor(states, today(), stored)

  useEffect(() => {
    if (quest && quest !== stored) setQuest(code, quest)
  }, [quest, stored, code, setQuest])

  if (!quest) return null
  const step = questStep(quest, states)
  if (!step) return null
  const done = questDone(quest, states)
  const claim = () => {
    if (!done || quest.claimed) return
    claimQuest(code)
    addPlayXp(code, QUEST_XP)
    celebrate(1)
  }
  return { quest, step, done, claim }
}
