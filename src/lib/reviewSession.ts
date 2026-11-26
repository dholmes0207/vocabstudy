// How many due words one review session takes (task 2.2 in docs/PLAN.md). A
// big pile is split: past BIG_BACKLOG due words, a session reviews the
// SESSION_CAP most overdue ones (getDueCards sorts them first) and the learner
// chooses whether to go on or leave the rest for later. Pure.

/** Due words above which a session no longer takes them all at once. */
export const BIG_BACKLOG = 50
/** Words in one session of a big pile: a few minutes, not an hour. */
export const SESSION_CAP = 30

/**
 * The session size for `due` words. `setting` is the review limit chosen in
 * Settings and `asked` a limit in the address (?limit=N); 0 means none. The
 * smallest positive limit wins; with none, a big pile is split.
 */
export function reviewSessionSize(due: number, setting: number, asked: number): number {
  const limits = [setting, asked].filter((n) => Number.isFinite(n) && n > 0)
  if (limits.length) return Math.min(due, ...limits)
  return due > BIG_BACKLOG ? SESSION_CAP : due
}
