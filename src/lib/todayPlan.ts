// "Hôm nay" on the home page (task 2.1 in docs/PLAN.md): one card, one main
// button, chosen by where the learner stands today. Reviews first (they decay),
// then five new words while today's allowance lasts, then a practice step of the
// level path, and otherwise the day is done. Pure.

/** Words in the quick lesson the home button starts (Learn's ?quick=1). */
export const QUICK_WORDS = 5

export type TodayAction =
  | { kind: 'review'; to: '/review'; count: number }
  | { kind: 'learn'; to: '/learn?quick=1'; count: number }
  | { kind: 'path'; to: string; stepId: string }
  | { kind: 'done'; to: '/practice' }

export function todayPlan(input: {
  /** Words due for review today (srs.dueCount). */
  due: number
  /** New words still allowed today (summary.newRemainingToday). */
  newLeft: number
  /** The next practice step on the level path, if the pack has one (practiceSuggestion). */
  pathStep?: { id: string; to: string } | null
}): TodayAction {
  if (input.due > 0) return { kind: 'review', to: '/review', count: input.due }
  if (input.newLeft > 0)
    return { kind: 'learn', to: '/learn?quick=1', count: Math.min(QUICK_WORDS, input.newLeft) }
  if (input.pathStep) return { kind: 'path', to: input.pathStep.to, stepId: input.pathStep.id }
  return { kind: 'done', to: '/practice' }
}
