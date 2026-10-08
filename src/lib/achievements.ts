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
  /** Distinct days with at least one answer — rewards coming back, streak or not. */
  daysStudied?: number
  /** Longest streak ever reached. */
  bestStreak?: number
  /** Distinct stickers in the "Quà mỗi ngày" album. */
  stickers?: number
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
    id: 'learn500',
    icon: '🏅',
    title: 'Nửa chặng đường',
    desc: 'Chạm tới 500 từ',
    value: (m) => m.learned,
    target: 500,
  },
  {
    id: 'learn1000',
    icon: '🏆',
    title: 'Trọn bộ 1000',
    desc: 'Chạm tới đủ 1000 từ',
    value: (m) => m.learned,
    target: 1000,
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
    id: 'learn2000',
    icon: '🌌',
    title: 'Dải ngân hà',
    desc: 'Học 2000 từ',
    value: (m) => m.learned,
    target: 2000,
  },
  {
    id: 'learn3000',
    icon: '🪐',
    title: 'Vũ trụ từ vựng',
    desc: 'Học 3000 từ',
    value: (m) => m.learned,
    target: 3000,
  },
  {
    id: 'days10',
    icon: '📅',
    title: 'Quay lại',
    desc: 'Học vào 10 ngày khác nhau (không cần liên tục)',
    value: (m) => m.daysStudied ?? 0,
    target: 10,
  },
  {
    id: 'days30',
    icon: '🗓️',
    title: 'Thói quen',
    desc: 'Học vào 30 ngày khác nhau',
    value: (m) => m.daysStudied ?? 0,
    target: 30,
  },
  {
    id: 'days100',
    icon: '🏔️',
    title: 'Bền bỉ',
    desc: 'Học vào 100 ngày khác nhau',
    value: (m) => m.daysStudied ?? 0,
    target: 100,
  },
  {
    id: 'stickers12',
    icon: '🎁',
    title: 'Nhà sưu tầm',
    desc: 'Mở 12 nhãn dán quà mỗi ngày',
    value: (m) => m.stickers ?? 0,
    target: 12,
  },
  {
    id: 'stickers48',
    icon: '🏆',
    title: 'Đủ bộ sưu tập',
    desc: 'Mở đủ 48 nhãn dán',
    value: (m) => m.stickers ?? 0,
    target: 48,
  },
  {
    id: 'best14',
    icon: '🛡️',
    title: 'Hai tuần vững vàng',
    desc: 'Chuỗi 14 ngày (khiên giúp cũng tính)',
    value: (m) => Math.max(m.bestStreak ?? 0, m.streak),
    target: 14,
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
