import { currentLevel, nextStep, type LevelState } from './learningPath'

// "Nhiệm vụ hôm nay" on the learning path (docs/design/learning-path.md): one
// small goal a day, taken from the step the learner is on, so opening the app
// always has an obvious, finishable thing to do. It is done as soon as that
// step moves forward today, whatever moved it. Pure; stored in pathStore.

export interface Quest {
  day: number
  stepId: string
  /** The step's count when the quest was set, to tell when it moves. */
  base: number
  claimed: boolean
}

/** XP for finishing the day's quest. */
export const QUEST_XP = 15

function findStep(states: readonly LevelState[], stepId: string) {
  for (const s of states) {
    const step = s.steps.find((x) => x.step.id === stepId)
    if (step) return step
  }
  return undefined
}

/**
 * Today's quest: the stored one when it was set today, else the next step of
 * the current level, from where it stands now. Undefined when every step is done.
 */
export function questFor(
  states: readonly LevelState[],
  day: number,
  stored?: Quest
): Quest | undefined {
  if (stored && stored.day === day && findStep(states, stored.stepId)) return stored
  const level = currentLevel(states)
  const step = level && nextStep(level)
  if (!step) return undefined
  return { day, stepId: step.step.id, base: step.value, claimed: false }
}

/** Whether the quest's step has moved since it was set (or is finished). */
export function questDone(quest: Quest, states: readonly LevelState[]): boolean {
  const step = findStep(states, quest.stepId)
  return !!step && (step.value > quest.base || step.done)
}

/** The step a quest is about, for its title and link. */
export function questStep(quest: Quest, states: readonly LevelState[]) {
  return findStep(states, quest.stepId)?.step
}
