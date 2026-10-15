// "Hành trình 7 ngày đầu": the first week, one small mission a day. The first
// days decide whether a beginner stays; a short path with a visible finish
// line beats an open-ended app, and each day shows them one more way to learn
// (so the app never feels like the same drill twice). Pure and unit-tested.

import { availableIn } from './packContent'

export interface Mission {
  emoji: string
  title: string
  desc: string
  titleEn: string
  descEn: string
  to: string
  /** Stand-ins, in order, for a pack that does not have `to` (Hangul, pinyin…). */
  alts?: Mission[]
}

export const JOURNEY: Mission[] = [
  {
    emoji: '🌱',
    title: 'Học 5 từ đầu tiên',
    desc: 'Khoảng 2 phút.',
    titleEn: 'Learn your first 5 words',
    descEn: 'About 2 minutes.',
    to: '/learn?quick=1',
  },
  {
    emoji: '🔁',
    title: 'Ôn lại từ hôm qua',
    desc: 'Nhớ lại sau một đêm mới là nhớ thật.',
    titleEn: "Review yesterday's words",
    descEn: 'Recalling after a night’s sleep is what makes it stick.',
    to: '/review',
  },
  {
    emoji: '🧩',
    title: 'Chơi Ghép cặp',
    desc: 'Đua với đồng hồ, phá kỷ lục.',
    titleEn: 'Play Match',
    descEn: 'Race the clock, beat your record.',
    to: '/games/match',
  },
  {
    emoji: '🎧',
    title: 'Nghe thụ động một lượt',
    desc: 'Bấm một lần rồi cứ nghe.',
    titleEn: 'One round of hands-free listening',
    descEn: 'Tap once, then just listen.',
    to: '/listen',
  },
  {
    emoji: '👄',
    title: 'Thử tai với "Âm khó"',
    desc: 'ship hay sheep? Nghe và chọn.',
    titleEn: 'Train your ear on tricky sounds',
    descEn: 'ship or sheep? Listen and choose.',
    to: '/sounds',
    alts: [
      {
        emoji: '🔤',
        title: 'Đọc bảng chữ Hangul',
        desc: 'Nhìn chữ, chọn cách đọc.',
        titleEn: 'Read the Hangul alphabet',
        descEn: 'See a letter, pick how it sounds.',
        to: '/hangul',
      },
      {
        emoji: '🎵',
        title: 'Nghe ra 4 thanh tiếng Trung',
        desc: 'Pinyin, thanh điệu và kiểm tra nhanh.',
        titleEn: 'Hear the four Chinese tones',
        descEn: 'Pinyin, tones and a quick check.',
        to: '/pinyin',
      },
    ],
  },
  {
    emoji: '🎙️',
    title: 'Luyện nói 5 từ',
    desc: 'Đọc vào micro, nghe lại giọng mình.',
    titleEn: 'Say 5 words out loud',
    descEn: 'Speak into the mic, hear yourself back.',
    to: '/speaking',
  },
  {
    emoji: '🏁',
    title: 'Đạt mục tiêu nhỏ',
    desc: 'Về đích tuần đầu tiên!',
    titleEn: 'Reach your small daily goal',
    descEn: 'Finish your first week!',
    to: '/review',
  },
]

export interface JourneyState {
  /** Days studied so far (capped at the journey length). */
  done: number
  studiedToday: boolean
  /** The mission to show: today's if not yet done, else the one just completed. */
  current: number
  finished: boolean
}

/** The week as the learner's pack sees it: a mission it lacks swaps to its stand-in. */
export function journeyFor(code: string): Mission[] {
  return JOURNEY.map((m) => [m, ...(m.alts ?? [])].find((x) => availableIn(x.to, code)) ?? m)
}

/**
 * Where the learner is on the journey: one step per day with any answers.
 * Null before the first study day (the first-steps card covers that) and once
 * the week is behind them — except on the day they finish, to celebrate.
 */
export function journeyState(
  reviewsByDay: Record<number, number>,
  today: number
): JourneyState | null {
  const days = Object.values(reviewsByDay).filter((n) => n > 0).length
  if (days === 0) return null
  const studiedToday = (reviewsByDay[today] ?? 0) > 0
  const done = Math.min(days, JOURNEY.length)
  const finished = days >= JOURNEY.length
  if (finished && !(days === JOURNEY.length && studiedToday)) return null
  return {
    done,
    studiedToday,
    current: studiedToday ? done - 1 : done,
    finished,
  }
}
