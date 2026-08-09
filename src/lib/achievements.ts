// Achievements ("Huy hiệu") — light gamification derived purely from existing
// study stats, so nothing extra needs to be persisted.

export interface AchievementInput {
  learned: number
  mastered: number
  streak: number
  xp: number
  totalReviews: number
  /** Accuracy as a percentage 0..100. */
  accuracy: number
}

export interface Achievement {
  id: string
  icon: string
  title: string
  desc: string
  unlocked: boolean
  /** 0..1 progress toward unlocking. */
  progress: number
}

interface Def {
  id: string
  icon: string
  title: string
  desc: string
  value: (m: AchievementInput) => number
  target: number
}

const DEFS: Def[] = [
  {
    id: 'first',
    icon: '🌱',
    title: 'Khởi đầu',
    desc: 'Học từ đầu tiên',
    value: (m) => m.learned,
    target: 1,
  },
  {
    id: 'learn50',
    icon: '📖',
    title: 'Chăm chỉ',
    desc: 'Chạm tới 50 từ',
    value: (m) => m.learned,
    target: 50,
  },
  {
    id: 'learn200',
    icon: '📚',
    title: 'Ham học',
    desc: 'Chạm tới 200 từ',
    value: (m) => m.learned,
    target: 200,
  },
  {
    id: 'streak3',
    icon: '🔥',
    title: 'Bén lửa',
    desc: '3 ngày liên tiếp',
    value: (m) => m.streak,
    target: 3,
  },
  {
    id: 'streak7',
    icon: '🔥',
    title: 'Tuần hoàn hảo',
    desc: '7 ngày liên tiếp',
    value: (m) => m.streak,
    target: 7,
  },
  {
    id: 'streak30',
    icon: '🗓️',
    title: 'Kỷ luật thép',
    desc: '30 ngày liên tiếp',
    value: (m) => m.streak,
    target: 30,
  },
  {
    id: 'master10',
    icon: '⭐',
    title: 'Mười viên ngọc',
    desc: '10 từ thành thạo',
    value: (m) => m.mastered,
    target: 10,
  },
  {
    id: 'master100',
    icon: '💯',
    title: 'Trăm từ',
    desc: '100 từ thành thạo',
    value: (m) => m.mastered,
    target: 100,
  },
  {
    id: 'master500',
    icon: '👑',
    title: 'Bậc thầy',
    desc: '500 từ thành thạo',
    value: (m) => m.mastered,
    target: 500,
  },
  {
    id: 'master1000',
    icon: '💎',
    title: 'Chinh phục 1000',
    desc: 'Thành thạo toàn bộ',
    value: (m) => m.mastered,
    target: 1000,
  },
  {
    id: 'xp500',
    icon: '✨',
    title: 'Tỏa sáng',
    desc: 'Đạt 500 XP',
    value: (m) => m.xp,
    target: 500,
  },
  {
    id: 'xp2000',
    icon: '🚀',
    title: 'Bùng nổ',
    desc: 'Đạt 2000 XP',
    value: (m) => m.xp,
    target: 2000,
  },
  {
    id: 'sharp',
    icon: '🎯',
    title: 'Thiện xạ',
    desc: '≥90% chính xác (sau 50 lượt)',
    value: (m) => (m.totalReviews >= 50 ? m.accuracy : 0),
    target: 90,
  },
]

export function evaluateAchievements(m: AchievementInput): Achievement[] {
  return DEFS.map((d) => {
    const v = d.value(m)
    return {
      id: d.id,
      icon: d.icon,
      title: d.title,
      desc: d.desc,
      unlocked: v >= d.target,
      progress: Math.max(0, Math.min(1, v / d.target)),
    }
  })
}
