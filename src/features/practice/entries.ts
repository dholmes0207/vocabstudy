import { GraduationCap, Mic } from 'lucide-react'

export interface PracticeEntry {
  to: string
  icon: typeof Mic | string
  title: string
  desc: string
  tone: string
}

export const PRACTICE: PracticeEntry[] = [
  {
    to: '/games/match',
    icon: '🧩',
    title: 'Ghép cặp',
    desc: 'Nối 6 từ với nghĩa của chúng, đua với đồng hồ. Phá kỷ lục của chính mình!',
    tone: 'from-amber-400 to-orange-500',
  },
  {
    to: '/games/order',
    icon: '🔤',
    title: 'Xếp câu',
    desc: 'Xếp các mảnh thành câu tiếng Anh đúng — hiểu từ đứng ở đâu trong câu.',
    tone: 'from-emerald-500 to-teal-600',
  },
  {
    to: '/quiz',
    icon: GraduationCap,
    title: 'Kiểm tra',
    desc: '6 dạng câu hỏi: chọn nghĩa, nghe, điền vào câu, gõ từ…',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    to: '/speaking',
    icon: Mic,
    title: 'Luyện nói',
    desc: 'Đọc vào micro, nghe lại và so với giọng mẫu.',
    tone: 'from-rose-500 to-rose-700',
  },
]
