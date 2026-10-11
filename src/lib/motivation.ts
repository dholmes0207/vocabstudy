// Small mechanics that keep a discouraged beginner coming back: a streak that
// forgives one missed day, a tiny daily goal, a warm welcome after a break,
// and a sense of how far their words already reach. Pure functions — the
// stores and screens call these — so every rule here is unit-tested.

import type { UiLang } from '@/types'

/** A streak shield is earned for every full week of streak… */
export const SHIELD_EVERY = 7
/** …and you can hold at most this many. */
export const MAX_SHIELDS = 2

export interface StreakState {
  streak: number
  lastStudyDay: number | null
  shields?: number
  bestStreak?: number
  shieldUsedDay?: number | null
}

export interface StreakUpdate {
  streak: number
  lastStudyDay: number
  shields: number
  bestStreak: number
  shieldUsedDay: number | null
}

/**
 * The streak after studying on `day`. Missing exactly one day costs a shield
 * instead of the whole streak — losing a long streak to one busy day is the
 * moment many beginners give up for good.
 */
export function nextStreak(s: StreakState, day: number): StreakUpdate {
  let shields = s.shields ?? 0
  let shieldUsedDay = s.shieldUsedDay ?? null
  let streak: number
  const last = s.lastStudyDay

  if (last === day) {
    streak = s.streak
  } else if (last === day - 1) {
    streak = s.streak + 1
  } else if (last === day - 2 && shields > 0 && s.streak > 0) {
    // The day in between is forgiven; the shield is spent.
    streak = s.streak + 1
    shields -= 1
    shieldUsedDay = day - 1
  } else {
    streak = 1
  }

  // A new full week on the streak earns a shield (only when the streak grows).
  if (streak !== s.streak && streak % SHIELD_EVERY === 0) {
    shields = Math.min(MAX_SHIELDS, shields + 1)
  }

  return {
    streak,
    lastStudyDay: day,
    shields,
    bestStreak: Math.max(s.bestStreak ?? 0, streak),
    shieldUsedDay,
  }
}

/** Whole days since the last study day (null = never studied). */
export function daysAway(lastStudyDay: number | null, day: number): number | null {
  return lastStudyDay === null ? null : Math.max(0, day - lastStudyDay)
}

/**
 * Whether to greet a returning learner, and how. Coming back is the win —
 * never mention what was lost.
 */
export function welcomeBack(
  away: number | null,
  lang: UiLang = 'vi'
): { title: string; body: string } | null {
  if (away === null || away < 2) return null
  const en = lang === 'en'
  if (away < 7) {
    return en
      ? {
          title: 'Welcome back! 👋',
          body: `It's been ${away} days — that's fine. Today, just 2 minutes and a few words is enough.`,
        }
      : {
          title: 'Chào mừng bạn quay lại! 👋',
          body: `Đã ${away} ngày rồi — không sao cả. Hôm nay chỉ cần 2 phút cho vài từ là đủ.`,
        }
  }
  return en
    ? {
        title: 'So good to see you again! 🌱',
        body: "It's been a while — let's restart gently: 5 words, 2 minutes, no pressure.",
      }
    : {
        title: 'Rất vui được gặp lại bạn! 🌱',
        body: 'Lâu rồi mới gặp — mình bắt đầu lại thật nhẹ nhàng nhé: 5 từ, 2 phút, không áp lực.',
      }
}

/** Daily goal choices (answers per day), from "barely anything" up. */
export const GOAL_OPTIONS = [5, 10, 20, 40] as const

export interface GoalProgress {
  done: number
  goal: number
  /** 0..1 */
  ratio: number
  reached: boolean
  left: number
}

export function goalProgress(done: number, goal: number): GoalProgress {
  const g = Math.max(1, goal)
  const d = Math.max(0, done)
  return { done: d, goal: g, ratio: Math.min(1, d / g), reached: d >= g, left: Math.max(0, g - d) }
}

/**
 * Rough share of the words in everyday English text covered by the N most
 * frequent words (corpus studies: ~100 → half, ~1000 → three quarters).
 * Interpolated on a log scale; an encouragement, not a measurement.
 */
const COVERAGE: [number, number][] = [
  [0, 0],
  [10, 22],
  [50, 40],
  [100, 50],
  [300, 63],
  [1000, 75],
  [2000, 80],
  [3000, 84],
  [5000, 88],
]

export function coverageEstimate(known: number): number {
  if (known <= 0) return 0
  for (let i = 1; i < COVERAGE.length; i++) {
    const [n1, c1] = COVERAGE[i]
    if (known <= n1) {
      const [n0, c0] = COVERAGE[i - 1]
      if (n0 === 0) return Math.round((known / n1) * c1)
      const t = Math.log(known / n0) / Math.log(n1 / n0)
      return Math.round(c0 + t * (c1 - c0))
    }
  }
  return COVERAGE[COVERAGE.length - 1][1]
}

const MILESTONES = [10, 25, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000]

/** The next round number of words to aim for, and how far it is. */
export function nextMilestone(known: number): { target: number; left: number; from: number } {
  const target = MILESTONES.find((m) => m > known) ?? Math.ceil((known + 1) / 1000) * 1000
  const idx = MILESTONES.indexOf(target)
  const from = idx > 0 ? MILESTONES[idx - 1] : 0
  return { target, left: target - known, from }
}

/** Where the "2 phút" button goes: due reviews first, else five new words. */
export function quickStartPath(due: number): string {
  return due > 0 ? '/review' : '/learn?quick=1'
}

/** The text shared by "Khoe bầu trời" — progress in one friendly line. */
export function shareText(learned: number, streak: number, lang: UiLang = 'vi'): string {
  if (lang === 'en') {
    const en = [`I've lit up ${learned} stars (English words) on VocaStudy 🌟`]
    if (streak >= 2) en.push(`a ${streak}-day streak 🔥`)
    return `${en.join(', ')}. Learn with me!`
  }
  const parts = [`Mình đã thắp sáng ${learned} ngôi sao (từ tiếng Anh) trên VocaStudy 🌟`]
  if (streak >= 2) parts.push(`chuỗi ${streak} ngày liên tục 🔥`)
  return `${parts.join(', ')}. Học cùng mình nhé!`
}

export interface EnergyOption {
  emoji: string
  label: string
  to: string
}

/**
 * "Hôm nay còn bao nhiêu sức?" — three doors sized to the learner's energy, so a
 * tired evening still has something small enough to say yes to.
 */
export function energyOptions(due: number, lang: UiLang = 'vi'): EnergyOption[] {
  const en = lang === 'en'
  return [
    { emoji: '🪫', label: en ? 'Tired: just listen' : 'Mệt: chỉ nghe', to: '/listen' },
    { emoji: '⚡', label: en ? '2 minutes' : '2 phút', to: quickStartPath(due) },
    { emoji: '💪', label: en ? 'Full session' : 'Học đầy đủ', to: due > 0 ? '/review' : '/learn' },
  ]
}
