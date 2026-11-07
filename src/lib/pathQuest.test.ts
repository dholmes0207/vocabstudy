import { describe, expect, it } from 'vitest'
import { EN_PATH, currentLevel, nextStep, pathState, type PathContext } from './learningPath'
import { questDone, questFor, questStep, type Quest } from './pathQuest'

function ctx(over: Partial<PathContext> = {}): PathContext {
  return {
    learnedInRange: () => 0,
    learnedWords: () => 0,
    grammarPassed: () => 0,
    storiesRead: () => 0,
    activity: () => 0,
    toeicPart: () => [0, 0],
    examBest: () => 0,
    hskAnswered: () => 0,
    ...over,
  }
}

const DAY = 20_000
const fresh = pathState(EN_PATH, ctx())
const first = nextStep(currentLevel(fresh)!)!

describe('the daily quest', () => {
  it('is the next step of the current level, from where it stands', () => {
    const q = questFor(fresh, DAY)!
    expect(q).toEqual({ day: DAY, stepId: first.step.id, base: 0, claimed: false })
    expect(questStep(q, fresh)?.id).toBe(first.step.id)
    expect(questDone(q, fresh)).toBe(false)
  })

  it('is done once that step moves, and stays the same quest all day', () => {
    const q = questFor(fresh, DAY)!
    const moved = pathState(EN_PATH, ctx({ learnedInRange: () => 3 }))
    expect(questFor(moved, DAY, q)).toBe(q)
    expect(questDone(q, moved)).toBe(true)
  })

  it('keeps a claimed quest for the day and sets a new one the next day', () => {
    const claimed: Quest = { ...questFor(fresh, DAY)!, claimed: true }
    expect(questFor(fresh, DAY, claimed)).toBe(claimed)
    const moved = pathState(EN_PATH, ctx({ learnedInRange: () => 3 }))
    const tomorrow = questFor(moved, DAY + 1, claimed)!
    expect(tomorrow.day).toBe(DAY + 1)
    expect(tomorrow.claimed).toBe(false)
    expect(tomorrow.base).toBe(nextStep(currentLevel(moved)!)!.value)
  })

  it('drops a stored quest whose step no longer exists', () => {
    const gone: Quest = { day: DAY, stepId: 'no-such-step', base: 0, claimed: false }
    expect(questFor(fresh, DAY, gone)?.stepId).toBe(first.step.id)
    expect(questStep(gone, fresh)).toBeUndefined()
    expect(questDone(gone, fresh)).toBe(false)
  })
})
