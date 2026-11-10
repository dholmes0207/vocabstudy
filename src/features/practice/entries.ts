import { GraduationCap, Mic } from 'lucide-react'

export interface PracticeEntry {
  to: string
  icon: typeof Mic | string
  title: string
  desc: string
  titleEn: string
  descEn: string
  /**
   * For a page several packs share: what to show for one pack, so learners of
   * English do not read Chinese examples and the other way round.
   */
  byPack?: Partial<Record<string, { desc: string; descEn: string }>>
  tone: string
}

/** What to say about an entry for one pack: its own words when it has them. */
export const entryDesc = (e: PracticeEntry, code: string): { desc: string; descEn: string } =>
  e.byPack?.[code] ?? e

// Entries written for one pack only (grammar, topics, Hangul…) are listed in
// lib/packContent.ts; the hub hides them for every other pack.
export const PRACTICE: PracticeEntry[] = [
  {
    to: '/hsk',
    icon: '🀄',
    title: 'Luyện thi HSK',
    desc: 'Đúng các dạng câu của đề HSK 1–3: nghe hiểu, chọn từ điền chỗ trống, sắp xếp câu, và bài thi nhỏ có điểm ước lượng.',
    titleEn: 'HSK practice',
    descEn:
      'The question types of HSK 1–3: listening, fill the gap, build the sentence, and a mini test with an estimated score.',
    tone: 'from-red-600 to-amber-500',
  },
  {
    to: '/hskk',
    icon: '🎙️',
    title: 'Luyện nói HSKK',
    desc: 'Sơ cấp và trung cấp, mỗi bậc ba phần như đề thật: nghe rồi nhắc lại, trả lời, nói về chủ đề hoặc tả tranh. Ghi âm, nghe lại, so với câu mẫu.',
    titleEn: 'HSKK speaking',
    descEn:
      'Elementary and Intermediate, three parts each as in the test: repeat, answer, talk on a topic or describe a picture. Record, play back, compare with a sample.',
    tone: 'from-red-500 to-amber-500',
  },
  {
    to: '/toeic',
    icon: '💼',
    title: 'Luyện thi TOEIC',
    desc: '318 từ công sở theo 13 chủ đề (văn phòng, tuyển dụng, đặt hàng, đi công tác…) và 7 Part của đề Listening & Reading.',
    titleEn: 'TOEIC practice',
    descEn:
      '318 workplace words in 13 themes (the office, hiring, orders, business travel…) and the 7 parts of the Listening & Reading test.',
    tone: 'from-sky-600 to-indigo-600',
  },
  {
    to: '/toeic-speaking',
    icon: '🎤',
    title: 'TOEIC Speaking',
    desc: 'Đọc to đoạn văn, trả lời câu hỏi qua điện thoại, nêu quan điểm 60 giây: đúng thời gian của đề, ghi âm rồi so với câu mẫu.',
    titleEn: 'TOEIC Speaking',
    descEn:
      'Read a text aloud, answer survey questions, give a 60-second opinion: with the test’s timings, recorded and compared with a sample.',
    tone: 'from-sky-500 to-blue-700',
  },
  {
    to: '/toeic-writing',
    icon: '✉️',
    title: 'TOEIC Writing: trả lời email',
    desc: 'Đọc email rồi viết thư trả lời đúng yêu cầu đề (hỏi 2 câu, đưa 1 đề xuất…), checklist tự đánh dấu, so với thư mẫu.',
    titleEn: 'TOEIC Writing: reply to an email',
    descEn:
      'Read an email and reply doing what the directions ask (two questions, one suggestion…), with a checklist and a model reply.',
    tone: 'from-cyan-500 to-blue-600',
  },
  {
    to: '/patterns',
    icon: '🧱',
    title: 'Cấu trúc câu',
    desc: 'Khung câu dạng khối màu (chủ ngữ, động từ, tân ngữ, nơi chốn, thời gian…) cho tiếng Anh và tiếng Trung, rồi tự xếp câu.',
    titleEn: 'Sentence patterns',
    descEn:
      'Sentence frames as coloured blocks (subject, verb, object, place, time…) for English and Chinese, then build sentences yourself.',
    tone: 'from-sky-500 to-rose-500',
  },
  {
    to: '/phrasal-verbs',
    icon: '🧩',
    title: 'Cụm động từ',
    desc: 'Give up, turn off, pick up…: học theo nghĩa của tiểu từ up, out, off, on, down, back rồi điền vào câu. Gặp nhiều trong TOEIC, IELTS.',
    titleEn: 'Phrasal verbs',
    descEn:
      'Give up, turn off, pick up…: learn what up, out, off, on, down and back add, then fill the gap. Common in TOEIC and IELTS.',
    tone: 'from-teal-500 to-cyan-600',
  },
  {
    to: '/idioms',
    icon: '🍰',
    title: 'Thành ngữ tiếng Anh',
    desc: 'A piece of cake = dễ như ăn kẹo, kill two birds with one stone = một công đôi việc…: nghĩa đen, nghĩa thật, câu ví dụ, giúp nói tự nhiên khi thi IELTS.',
    titleEn: 'English idioms',
    descEn:
      'A piece of cake, kill two birds with one stone…: what the words say, what they mean, an example; sound natural in IELTS Speaking.',
    tone: 'from-orange-400 to-pink-500',
  },
  {
    to: '/collocations',
    icon: '🧲',
    title: 'Kết hợp từ',
    desc: 'Turn on the light chứ không phải open the light (tiếng Anh), 吃药 chứ không phải 喝药 (tiếng Trung): từ nào đi với từ nào, tránh dịch từng chữ từ tiếng Việt.',
    titleEn: 'Collocations',
    descEn:
      'Turn on the light, not open the light (English); 吃药, not 喝药 (Chinese): which words go together, so you don’t translate word for word.',
    byPack: {
      en: {
        desc: 'Turn on the light chứ không phải open the light, take medicine chứ không phải drink medicine: từ nào đi với từ nào, tránh dịch từng chữ từ tiếng Việt.',
        descEn:
          'Turn on the light, not open the light; take medicine, not drink it: which words go together, so you don’t translate word for word.',
      },
      zh: {
        desc: 'Uống thuốc là 吃药 chứ không phải 喝药, đội mũ là 戴帽子: động từ nào đi với danh từ nào, tránh dịch từng chữ từ tiếng Việt.',
        descEn:
          'Medicine is 吃药, not 喝药; a hat is 戴帽子: which verb each noun takes, so you don’t translate word for word.',
      },
    },
    tone: 'from-lime-500 to-emerald-600',
  },
  {
    to: '/ielts',
    icon: '🎓',
    title: 'Luyện IELTS',
    desc: 'Đủ 4 kỹ năng, từng dạng câu một: Đọc 7 dạng (True/False/Not Given, Yes/No/Not Given, nối tiêu đề, điền câu…), Nghe Part 1–4, Nói có câu mẫu và ghi âm, Viết Task 1–2 có bài mẫu.',
    titleEn: 'IELTS practice',
    descEn:
      'All four skills, one question type at a time: 7 Reading types (True/False/Not Given, Yes/No/Not Given, headings, sentence completion…), Listening Parts 1–4, Speaking with sample answers and recording, Writing Tasks 1–2 with model answers.',
    tone: 'from-rose-500 to-fuchsia-600',
  },
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
    to: '/confusables',
    icon: '🔍',
    title: 'Chữ, từ dễ nhầm',
    desc: '在/再, 的/得/地, 买/卖… (tiếng Trung), make/do, say/tell, borrow/lend… (tiếng Anh): học mẹo phân biệt rồi điền vào câu.',
    titleEn: 'Easily confused words',
    descEn:
      '在/再, 的/得/地, 买/卖… in Chinese, make/do, say/tell, borrow/lend… in English: learn the trick, then fill the gap.',
    byPack: {
      en: {
        desc: 'make/do, say/tell, borrow/lend, bored/boring…: học mẹo phân biệt rồi điền vào câu.',
        descEn:
          'make/do, say/tell, borrow/lend, bored/boring…: learn the trick, then fill the gap.',
      },
      zh: {
        desc: '在/再, 的/得/地, 买/卖, 他/她/它…: học mẹo phân biệt rồi điền vào câu.',
        descEn: '在/再, 的/得/地, 买/卖, 他/她/它…: learn the trick, then fill the gap.',
      },
    },
    tone: 'from-violet-500 to-fuchsia-500',
  },
  {
    to: '/chengyu',
    icon: '🐉',
    title: 'Thành ngữ',
    desc: '半信半疑 = bán tín bán nghi: thành ngữ bốn chữ qua âm Hán Việt, kèm chuyện kể "ôm cây đợi thỏ", "vẽ rắn thêm chân"… rồi đoán nghĩa, điền chữ thiếu.',
    titleEn: 'Chinese idioms',
    descEn:
      '半信半疑 = bán tín bán nghi: four-character idioms through their Sino-Vietnamese sounds, with the fables behind some; then guess the meaning, fill the missing character.',
    tone: 'from-rose-500 to-amber-500',
  },
  {
    to: '/han-viet-traps',
    icon: '🪤',
    title: 'Bẫy Hán Việt',
    desc: '大家 đọc "đại gia" mà nghĩa là "mọi người", 便宜 "tiện nghi" mà là "rẻ": những từ âm Hán Việt đánh lừa người Việt, kèm ví dụ và lượt né bẫy.',
    titleEn: 'Hán Việt traps',
    descEn:
      '大家 reads "đại gia" (tycoon) yet means everyone, 便宜 "tiện nghi" (comfortable) yet means cheap: words whose Hán Việt sound misleads, with examples and a round.',
    tone: 'from-orange-500 to-red-600',
  },
  {
    to: '/slang',
    icon: '📱',
    title: 'Tiếng lóng mạng',
    desc: '内卷 nội quyển, 躺平, 学霸, 吃瓜…: từ giới trẻ Trung Quốc dùng trên Douyin, Weibo, kèm âm Hán Việt và câu ví dụ.',
    titleEn: 'Internet slang',
    descEn:
      '内卷, 躺平, 学霸, 吃瓜…: the words young Chinese use on Douyin and Weibo, with Hán Việt sounds and examples.',
    tone: 'from-pink-500 to-violet-600',
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
    to: '/games/blitz',
    icon: '⚡',
    title: 'Đúng hay sai?',
    desc: '60 giây, từ và nghĩa có khớp không? Đúng liền tay để nhân điểm, sai bị trừ giờ. Phá kỷ lục!',
    titleEn: 'True or false?',
    descEn:
      '60 seconds: does the word match the meaning? Answer right in a row to multiply your points; a miss costs time. Beat your record!',
    tone: 'from-orange-500 to-rose-500',
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
    to: '/tongue-twisters',
    icon: '👅',
    title: 'Câu nói líu lưỡi',
    desc: '"She sells seashells…", "四是四，十是十…": luyện các cặp âm khó (s/sh, r/l, th, n/l, bốn thanh), nghe chậm, ghi âm rồi nghe lại.',
    titleEn: 'Tongue twisters',
    descEn:
      '"She sells seashells…", "四是四，十是十…": drill the hard sounds (s/sh, r/l, th, n/l, the four tones), hear them slowly, record and play back.',
    byPack: {
      en: {
        desc: '"She sells seashells…", "Red lorry, yellow lorry": luyện các cặp âm khó (s/sh, r/l, th), nghe chậm, ghi âm rồi nghe lại.',
        descEn:
          '"She sells seashells…", "Red lorry, yellow lorry": drill the hard sounds (s/sh, r/l, th), hear them slowly, record and play back.',
      },
      zh: {
        desc: '"四是四，十是十…": luyện các cặp âm khó (s/sh, n/l, bốn thanh), nghe chậm, ghi âm rồi nghe lại.',
        descEn:
          '"四是四，十是十…": drill the hard sounds (s/sh, n/l, the four tones), hear them slowly, record and play back.',
      },
    },
    tone: 'from-pink-500 to-orange-500',
  },
  {
    to: '/sounds',
    icon: '👄',
    title: 'Âm khó cho người Việt',
    desc: 'th, ship/sheep (tiếng Anh); thanh điệu, zh/z (tiếng Trung); âm căng, âm cuối (tiếng Hàn)… cách phát âm và trò thử tai phân biệt.',
    titleEn: 'Tricky sounds for Vietnamese speakers',
    descEn:
      'th, ship/sheep in English; tones, zh/z in Chinese; tense consonants, final sounds in Korean… how to shape them, plus an ear test.',
    byPack: {
      en: {
        desc: 'th, ship/sheep, âm cuối, trọng âm…: cách phát âm và trò thử tai phân biệt.',
        descEn: 'th, ship/sheep, final sounds, word stress…: how to shape them, plus an ear test.',
      },
      zh: {
        desc: 'Thanh điệu, zh/z, ü, âm uốn lưỡi…: cách phát âm và trò thử tai phân biệt.',
        descEn: 'Tones, zh/z, ü, the retroflex sounds…: how to shape them, plus an ear test.',
      },
    },
    tone: 'from-pink-500 to-rose-600',
  },
  {
    to: '/roleplay',
    icon: '🎭',
    title: 'Nhập vai hội thoại',
    desc: 'Gọi đồ uống, hỏi đường, đi taxi, phỏng vấn…: người kia nói, bạn nói lời của mình, máy chấm từng câu.',
    titleEn: 'Role-play',
    descEn:
      'Order a drink, ask the way, take a taxi, a job interview…: they speak, you answer out loud, every line checked.',
    tone: 'from-fuchsia-500 to-purple-600',
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
