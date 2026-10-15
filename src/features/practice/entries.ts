import { GraduationCap, Mic } from 'lucide-react'

export interface PracticeEntry {
  to: string
  icon: typeof Mic | string
  title: string
  desc: string
  titleEn: string
  descEn: string
  tone: string
  /** Content written for English only (grammar, topics, sounds): hidden for other packs. */
  englishOnly?: boolean
}

export const PRACTICE: PracticeEntry[] = [
  {
    to: '/grammar',
    icon: '📐',
    title: 'Ngữ pháp căn bản',
    desc: '12 bài ngắn: to be, các thì, a/an/the, giới từ… giải thích bằng tiếng Việt, có bài luyện.',
    titleEn: 'Grammar basics',
    descEn:
      '12 short lessons: to be, tenses, a/an/the, prepositions… explained simply, with practice.',
    tone: 'from-indigo-500 to-violet-600',
    englishOnly: true,
  },
  {
    to: '/topics',
    icon: '🗂️',
    title: 'Học theo chủ đề',
    desc: 'Công sở, ăn uống, sức khoẻ, công nghệ… 19 bộ từ theo tình huống.',
    titleEn: 'Learn by topic',
    descEn: 'Work, food, health, tech… 19 word decks for real situations.',
    tone: 'from-sky-500 to-cyan-600',
    englishOnly: true,
  },
  {
    to: '/reading',
    icon: '📖',
    title: 'Đọc truyện ngắn',
    desc: 'Truyện ngắn tiếng Anh dễ hiểu — chạm vào từ để xem nghĩa, có bản dịch và câu hỏi.',
    titleEn: 'Short stories',
    descEn: 'Easy English stories — tap a word for its meaning, with translations and questions.',
    tone: 'from-orange-400 to-rose-500',
    englishOnly: true,
  },
  {
    to: '/dictation',
    icon: '✍️',
    title: 'Nghe – chép',
    desc: 'Nghe một câu rồi gõ lại — luyện tai và chính tả, xem từng từ bạn nghe được.',
    titleEn: 'Dictation',
    descEn: 'Hear a sentence, then type it — train your ear and spelling, word by word.',
    tone: 'from-teal-500 to-emerald-600',
  },
  {
    to: '/games/match',
    icon: '🧩',
    title: 'Ghép cặp',
    desc: 'Nối 6 từ với nghĩa của chúng, đua với đồng hồ. Phá kỷ lục của chính mình!',
    titleEn: 'Match',
    descEn: 'Pair 6 words with their meanings against the clock. Beat your own record!',
    tone: 'from-amber-400 to-orange-500',
  },
  {
    to: '/games/order',
    icon: '🔤',
    title: 'Xếp câu',
    desc: 'Xếp các mảnh thành câu tiếng Anh đúng — hiểu từ đứng ở đâu trong câu.',
    titleEn: 'Build a sentence',
    descEn: 'Put the pieces into a correct English sentence — see where each word goes.',
    tone: 'from-emerald-500 to-teal-600',
  },
  {
    to: '/quiz',
    icon: GraduationCap,
    title: 'Kiểm tra',
    desc: '6 dạng câu hỏi: chọn nghĩa, nghe, điền vào câu, gõ từ…',
    titleEn: 'Quiz',
    descEn: '6 question types: meanings, listening, gaps, typing…',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    to: '/quiz?scope=hard',
    icon: '🎯',
    title: 'Từ hay quên',
    desc: 'Luyện riêng những từ bạn hay sai — gỡ từng "nút thắt" một.',
    titleEn: 'Often-missed words',
    descEn: 'Practise only the words you keep getting wrong — untie them one by one.',
    tone: 'from-violet-500 to-fuchsia-600',
  },
  {
    to: '/listen',
    icon: '🎧',
    title: 'Nghe thụ động',
    desc: 'Bận tay, đang trên xe? Bấm một lần rồi cứ nghe: từ, nghĩa, câu ví dụ.',
    titleEn: 'Hands-free listening',
    descEn: 'Hands busy, on the bus? Tap once and just listen: word, meaning, example.',
    tone: 'from-sky-500 to-cyan-600',
  },
  {
    to: '/sounds',
    icon: '👄',
    title: 'Âm khó cho người Việt',
    desc: 'th, âm cuối, ship/sheep… cách đặt lưỡi và trò thử tai phân biệt.',
    titleEn: 'Tricky sounds for Vietnamese speakers',
    descEn: 'th, final sounds, ship/sheep… how to shape them, plus an ear test.',
    tone: 'from-pink-500 to-rose-600',
    englishOnly: true,
  },
  {
    to: '/speaking',
    icon: Mic,
    title: 'Luyện nói',
    desc: 'Đọc vào micro, nghe lại và so với giọng mẫu.',
    titleEn: 'Speaking',
    descEn: 'Speak into the mic, play it back and compare with the model.',
    tone: 'from-rose-500 to-rose-700',
  },
]
