import { GraduationCap, Mic } from 'lucide-react'

export interface PracticeEntry {
  to: string
  icon: typeof Mic | string
  title: string
  desc: string
  titleEn: string
  descEn: string
  tone: string
}

// Entries written for one pack only (grammar, topics, Hangul…) are listed in
// lib/packContent.ts; the hub hides them for every other pack.
export const PRACTICE: PracticeEntry[] = [
  {
    to: '/pinyin',
    icon: '🎵',
    title: 'Pinyin & thanh điệu',
    desc: '4 thanh và thanh nhẹ, biến điệu, phụ âm đầu và vần khó — chạm để nghe, kiểm tra nhanh.',
    titleEn: 'Pinyin & tones',
    descEn:
      'The four tones and the neutral one, tone changes, initials and tricky finals — tap to hear, then a quick check.',
    tone: 'from-red-500 to-amber-500',
  },
  {
    to: '/measure-words',
    icon: '🧮',
    title: 'Lượng từ, đơn vị đếm',
    desc: 'Đặt cạnh "cái, quyển, cốc, con" của tiếng Việt: 个 本 杯 (tiếng Trung), 개 권 잔 (tiếng Hàn), kèm bài luyện 10 câu.',
    titleEn: 'Measure words, counters',
    descEn:
      'Next to their Vietnamese counterparts: 个 本 杯 in Chinese, 개 권 잔 in Korean, with a 10-question round.',
    tone: 'from-amber-500 to-red-500',
  },
  {
    to: '/numbers',
    icon: '🔢',
    title: 'Nghe số',
    desc: 'Nghe giá tiền, giờ giấc, ngày tháng rồi chọn đúng — như phần nghe của đề HSK, TOPIK.',
    titleEn: 'Hear the numbers',
    descEn:
      'Hear prices, times and dates and pick the right one — like the HSK and TOPIK listening parts.',
    tone: 'from-sky-500 to-indigo-600',
  },
  {
    to: '/han-viet',
    icon: '🀄',
    title: 'Chữ Hán qua âm Hán Việt',
    desc: 'Chữ dùng chung trong nhiều từ, kèm âm Hán Việt: biết 学 là "học" là đoán được 学校, 学习.',
    titleEn: 'Characters by Sino-Vietnamese',
    descEn:
      'Characters shared by several words, with their Sino-Vietnamese reading: know 学 is "học", guess 学校 and 学习.',
    tone: 'from-red-600 to-rose-500',
  },
  {
    to: '/radicals',
    icon: '🧩',
    title: 'Bộ thủ',
    desc: 'Những bộ phận ghép nên chữ Hán, kèm tên Hán Việt: 氵 thuỷ (nước) có trong 洗, 河, 游, 酒. Kèm bài đoán bộ 10 câu.',
    titleEn: 'Radicals',
    descEn:
      'The parts Chinese characters are built from, with their Sino-Vietnamese names: 氵 "water" is in 洗, 河, 游, 酒. With a 10-question round.',
    tone: 'from-rose-500 to-amber-500',
  },
  {
    to: '/hangul',
    icon: '🔤',
    title: 'Bảng chữ cái Hangul',
    desc: '14 phụ âm, 10 nguyên âm cơ bản: nghe từng chữ, tự ghép thành chữ, kiểm tra nhanh.',
    titleEn: 'The Hangul alphabet',
    descEn: '14 consonants and 10 basic vowels: hear each letter, build blocks, quick check.',
    tone: 'from-rose-500 to-fuchsia-600',
  },
  {
    to: '/grammar',
    icon: '📐',
    title: 'Ngữ pháp căn bản',
    desc: 'Bài ngắn cho người mới, giải thích bằng tiếng Việt, kèm lỗi hay gặp và bài luyện.',
    titleEn: 'Grammar basics',
    descEn: 'Short beginner lessons explained in Vietnamese, with common mistakes and practice.',
    tone: 'from-indigo-500 to-violet-600',
  },
  {
    to: '/topics',
    icon: '🗂️',
    title: 'Học theo chủ đề',
    desc: 'Ăn uống, đi lại, sức khoẻ, công việc… từ vựng gom thành bộ theo tình huống, mỗi bộ có Học và Ôn.',
    titleEn: 'Learn by topic',
    descEn:
      'Food, getting around, health, work… word decks for real situations, each with Learn and Review.',
    tone: 'from-sky-500 to-cyan-600',
  },
  {
    to: '/exam',
    icon: '🎯',
    title: 'Lộ trình luyện thi',
    desc: 'A2 Key, B1 Preliminary, HSK 1–2 hoặc TOPIK I: học gì, theo thứ tự nào, bạn đã tới đâu — kèm bài kiểm tra từ vựng 20 câu.',
    titleEn: 'Exam roadmap',
    descEn:
      'A2 Key, B1 Preliminary, HSK 1–2 or TOPIK I: what to learn, in what order, how far you have got — plus a 20-question vocabulary check.',
    tone: 'from-emerald-500 to-teal-600',
  },
  {
    to: '/phrases',
    icon: '💬',
    title: 'Mẫu câu giao tiếp',
    desc: 'Câu nói dùng được ngay theo tình huống: chào hỏi, gọi món, hỏi đường… nghe, hiểu, xếp câu.',
    titleEn: 'Everyday phrases',
    descEn:
      'Ready-made sentences by situation: greetings, ordering, directions… hear, understand, build.',
    tone: 'from-sky-500 to-violet-600',
  },
  {
    to: '/reading',
    icon: '📖',
    title: 'Đọc truyện ngắn',
    desc: 'Truyện ngắn dễ hiểu — chạm vào từ để xem nghĩa, có bản dịch và câu hỏi.',
    titleEn: 'Short stories',
    descEn: 'Easy short stories — tap a word for its meaning, with translations and questions.',
    tone: 'from-orange-400 to-rose-500',
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
    desc: 'Xếp các mảnh thành câu đúng — hiểu từ đứng ở đâu trong câu.',
    titleEn: 'Build a sentence',
    descEn: 'Put the pieces into a correct sentence — see where each word goes.',
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
    desc: 'th, ship/sheep (tiếng Anh); thanh điệu, zh/z (tiếng Trung); âm căng, âm cuối (tiếng Hàn)… cách phát âm và trò thử tai phân biệt.',
    titleEn: 'Tricky sounds for Vietnamese speakers',
    descEn:
      'th, ship/sheep in English; tones, zh/z in Chinese; tense consonants, final sounds in Korean… how to shape them, plus an ear test.',
    tone: 'from-pink-500 to-rose-600',
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
