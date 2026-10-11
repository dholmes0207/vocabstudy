// "Hành trình 7 ngày đầu": the first week, one small mission a day. The first
// days decide whether a beginner stays; a short path with a visible finish
// line beats an open-ended app, and each day shows them one more way to learn
// (so the app never feels like the same drill twice). Pure and unit-tested.

export interface Mission {
  emoji: string
  title: string
  desc: string
  titleEn: string
  descEn: string
  to: string
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
