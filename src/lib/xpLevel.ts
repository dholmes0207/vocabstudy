// Levels from XP: quick early wins (level 2 after ~10 right answers), then
// each level asks a little more. Level L starts at 50·L·(L−1) XP.

export interface XpLevel {
  level: number
  /** XP where this level started and where the next one begins. */
  floor: number
  next: number
  /** 0..1 through the current level. */
  ratio: number
}

const start = (level: number) => 50 * level * (level - 1)

export function levelForXp(xp: number): XpLevel {
  const x = Math.max(0, xp)
  let level = 1
  while (start(level + 1) <= x) level++
  const floor = start(level)
  const next = start(level + 1)
  return { level, floor, next, ratio: (x - floor) / (next - floor) }
}
