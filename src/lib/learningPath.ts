import type { ActivityKind } from '@/store/activityStore'
import { TOEIC_WORDS } from './toeic'
import { HSK1, HSK2, HSK3 } from './exams'

// "Lộ trình theo cấp" (docs/design/learning-path.md): the pieces the app already
// has (words, grammar, stories, listening, speaking, exam practice) in the order
// a learner needs them, as levels to climb instead of a menu to pick from. Each
// step counts something the app already records, so the path fills in from what
// the learner did anywhere, not only from inside it. Pure and unit-tested; the
// page reads it through hooks/usePathContext.ts.

export type Pair = [vi: string, en: string]

/** What the path reads from the stores, for one language pack. */
export interface PathContext {
  /** Pack words in learning order with a card, between `from` (included) and `to`. */
  learnedInRange: (from: number, to: number) => number
  /** Of these headwords, how many have a card. */
  learnedWords: (words: readonly string[]) => number
  /** Grammar units passed (best score at the pass mark). */
  grammarPassed: (unitIds: readonly string[]) => number
  /** Stories read to the end. */
  storiesRead: (storyIds: readonly string[]) => number
  /** Finished sessions of a skill. */
  activity: (kind: ActivityKind) => number
  /** Questions answered in a TOEIC part: [right, asked]. */
  toeicPart: (part: number) => [number, number]
  /** Best score of an exam record, as a share of its questions. */
  examBest: (examId: string) => number
  /** Questions answered in the HSK drills of one level ("hsk1"…). */
  hskAnswered: (level: string) => number
}

export interface PathStep {
  id: string
  icon: string
  title: Pair
  /** What to do, said in a line. */
  desc: Pair
  /** Where to do it. */
  to: string
  /** The step is done once `measure` reaches it. */
  goal: number
  measure: (ctx: PathContext) => number
  /** How a count is said: "từ", "bài"… */
  unit: Pair
  /** For a words step: the slice of the learning order it covers, [from, to). */
  range?: [number, number]
  /** For a grammar step: its units, which the level test asks about. */
  units?: string[]
}

export interface PathLevel {
  n: number
  icon: string
  title: Pair
  /** What the level gives the learner, in a line. */
  tagline: Pair
  cefr: string
  /** Tailwind gradient of the level's medal and map node. */
  tone: string
  steps: PathStep[]
  /** Shown but not finished yet: its practice is still being written. */
  soon?: boolean
  /** Headwords the level test asks, when the level has no slice of the learning order. */
  testWords?: readonly string[]
}

const words = (from: number, to: number, id: string): PathStep => ({
  id,
  icon: '📖',
  title: [`Từ ${from + 1}–${to}`, `Words ${from + 1}–${to}`],
  desc: [
    `Học ${to - from} từ tiếp theo theo thứ tự của khoá, mỗi lần 5 từ.`,
    `The next ${to - from} words in course order, five at a time.`,
  ],
  to: '/learn',
  goal: to - from,
  measure: (ctx) => ctx.learnedInRange(from, to),
  unit: ['từ', 'words'],
  range: [from, to],
})

const grammar = (id: string, units: string[], title: Pair, desc: Pair): PathStep => ({
  id,
  icon: '🧩',
  title,
  desc,
  to: '/grammar',
  goal: units.length,
  measure: (ctx) => ctx.grammarPassed(units),
  unit: ['bài', 'units'],
  units,
})

const stories = (id: string, ids: string[], title: Pair): PathStep => ({
  id,
  icon: '📚',
  title,
  desc: [
    `Đọc hết ${ids.length} truyện ngắn và trả lời câu hỏi cuối truyện.`,
    `Read ${ids.length} short stories to the end and answer their questions.`,
  ],
  to: '/reading',
  goal: ids.length,
  measure: (ctx) => ctx.storiesRead(ids),
  unit: ['truyện', 'stories'],
})

const sessions = (
  id: string,
  kind: ActivityKind,
  goal: number,
  icon: string,
  to: string,
  title: Pair,
  desc: Pair
): PathStep => ({
  id,
  icon,
  title,
  desc,
  to,
  goal,
  measure: (ctx) => ctx.activity(kind),
  unit: ['lượt', 'sessions'],
})

/** The English path: six levels from the first words to the certificates. */
export const EN_PATH: PathLevel[] = [
  {
    n: 1,
    icon: '🌱',
    title: ['Khởi động', 'Warm-up'],
    tagline: [
      'Những từ đầu tiên, động từ "to be" và câu hiện tại đơn: đủ để giới thiệu bản thân.',
      'The first words, "to be" and the present simple: enough to introduce yourself.',
    ],
    cefr: 'A1',
    tone: 'from-emerald-400 to-teal-500',
    steps: [
      words(0, 150, 'en1-words'),
      grammar(
        'en1-grammar',
        ['to-be', 'present-simple', 'pronouns', 'articles'],
        ['Ngữ pháp nền: to be, hiện tại đơn', 'First grammar: to be, present simple'],
        [
          'Bốn bài đầu: to be, hiện tại đơn, đại từ, mạo từ a/an/the. Đạt 80% mỗi bài.',
          'The first four units: to be, present simple, pronouns, a/an/the. Score 80% in each.',
        ]
      ),
      stories(
        'en1-stories',
        ['lans-morning', 'at-the-market'],
        ['Hai truyện đầu tiên', 'Your first two stories']
      ),
    ],
  },
  {
    n: 2,
    icon: '⏳',
    title: ['Các thì cơ bản', 'Basic tenses'],
    tagline: [
      'Nói việc đang làm, đã làm và sẽ làm; hỏi và trả lời được.',
      'Say what you are doing, did and will do; ask and answer.',
    ],
    cefr: 'A1–A2',
    tone: 'from-sky-400 to-blue-500',
    steps: [
      words(150, 500, 'en2-words'),
      grammar(
        'en2-grammar',
        ['present-continuous', 'past-simple', 'future', 'questions'],
        ['Hiện tại tiếp diễn, quá khứ, tương lai', 'Continuous, past and future'],
        [
          'Bốn bài: hiện tại tiếp diễn, quá khứ đơn, tương lai, câu hỏi. Đạt 80% mỗi bài.',
          'Four units: present continuous, past simple, future, questions. Score 80% in each.',
        ]
      ),
      sessions(
        'en2-dictation',
        'dictation',
        3,
        '✍️',
        '/dictation',
        ['Nghe – chép', 'Dictation'],
        [
          'Nghe câu ví dụ rồi gõ lại: tai quen dần với tốc độ thật.',
          'Hear an example and type it back: your ear gets used to real speed.',
        ]
      ),
      stories(
        'en2-stories',
        ['my-best-friend', 'rainy-weekend', 'first-day-at-work'],
        ['Ba truyện A2', 'Three A2 stories']
      ),
    ],
  },
  {
    n: 3,
    icon: '🧱',
    title: ['Cấu trúc câu', 'Sentence building'],
    tagline: [
      'Ghép câu dài hơn: so sánh, giới từ, động từ khuyết thiếu; nói thành tiếng.',
      'Longer sentences: comparisons, prepositions, modals; and say them out loud.',
    ],
    cefr: 'A2',
    tone: 'from-violet-400 to-purple-500',
    steps: [
      words(500, 1000, 'en3-words'),
      grammar(
        'en3-grammar',
        ['countable', 'prepositions', 'comparatives', 'modals'],
        [
          'Danh từ đếm được, giới từ, so sánh, can/must',
          'Countables, prepositions, comparisons, modals',
        ],
        [
          'Bốn bài để câu dài và chính xác hơn. Đạt 80% mỗi bài.',
          'Four units for longer, more precise sentences. Score 80% in each.',
        ]
      ),
      grammar(
        'en3-tenses',
        ['present-perfect', 'past-continuous'],
        ['Hiện tại hoàn thành, quá khứ tiếp diễn', 'Present perfect, past continuous'],
        [
          'Hai thì để kể chuyện: đã từng làm gì, và đang làm gì thì việc khác xen vào.',
          'Two tenses for telling stories: what you have done, and what was happening when something else did.',
        ]
      ),
      sessions(
        'en3-patterns',
        'patterns',
        3,
        '🧱',
        '/patterns',
        ['Cấu trúc câu', 'Sentence patterns'],
        [
          'Học 8 khung câu dạng khối màu (chủ ngữ, động từ, tân ngữ, nơi chốn…) rồi tự xếp câu.',
          'Eight sentence frames as coloured blocks (subject, verb, object, place…), then build them.',
        ]
      ),
      sessions(
        'en3-order',
        'order',
        3,
        '🧩',
        '/games/order',
        ['Xếp câu', 'Build the sentence'],
        [
          'Xếp các mảnh thành câu đúng trật tự: chủ ngữ, động từ, tân ngữ, trạng từ.',
          'Put the pieces in order: subject, verb, object, adverb.',
        ]
      ),
      sessions(
        'en3-speaking',
        'speaking',
        3,
        '🎙️',
        '/speaking',
        ['Luyện nói', 'Speaking'],
        [
          'Đọc từ vào micro, nghe lại giọng mình cạnh giọng mẫu.',
          'Say the words into the mic and hear yourself next to the model.',
        ]
      ),
    ],
  },
  {
    n: 4,
    icon: '🎧',
    title: ['Nghe & nói', 'Listening & speaking'],
    tagline: [
      'Nghe hiểu ở tốc độ thật và nói tự tin hơn: chuẩn bị cho phần Nghe của đề thi.',
      'Understand real-speed English and speak with more confidence: ready for the listening paper.',
    ],
    cefr: 'A2–B1',
    tone: 'from-amber-400 to-orange-500',
    steps: [
      words(1000, 1600, 'en4-words'),
      grammar(
        'en4-grammar',
        ['passive', 'conditionals', 'relative-clauses', 'reported-speech'],
        ['Ngữ pháp B1', 'B1 grammar'],
        [
          'Bị động, câu điều kiện, mệnh đề quan hệ, câu tường thuật: nền cho phần đọc của TOEIC và IELTS.',
          'The passive, conditionals, relative clauses, reported speech: the base for TOEIC and IELTS reading.',
        ]
      ),
      sessions(
        'en4-listen',
        'listen',
        5,
        '🎧',
        '/listen',
        ['Nghe thụ động', 'Hands-free listening'],
        [
          'Nghe từ và câu ví dụ liên tục, như một danh sách phát, lúc đi đường hay nấu ăn.',
          'Words and examples played back to back, like a playlist, on the bus or while cooking.',
        ]
      ),
      sessions(
        'en4-dictation',
        'dictation',
        8,
        '✍️',
        '/dictation',
        ['Nghe – chép nâng cao', 'More dictation'],
        [
          'Tổng cộng 8 lượt nghe – chép: bắt được từ trong câu nói nhanh.',
          '8 dictation sessions in all: catch words inside fast speech.',
        ]
      ),
      sessions(
        'en4-speaking',
        'speaking',
        8,
        '🎙️',
        '/speaking',
        ['Nói thêm', 'More speaking'],
        [
          'Tổng cộng 8 lượt luyện nói, thử mức Vừa hoặc Khó.',
          '8 speaking sessions in all; try the Medium or Hard setting.',
        ]
      ),
      stories(
        'en4-stories',
        ['trip-to-da-lat', 'at-the-doctor', 'a-job-interview', 'moving-house'],
        ['Truyện A2–B1', 'A2–B1 stories']
      ),
    ],
  },
  {
    n: 5,
    icon: '💼',
    title: ['Luyện thi TOEIC', 'TOEIC'],
    tagline: [
      'Từ vựng công sở và đủ 7 Part của đề Listening & Reading, kết thúc bằng bài thi nhỏ.',
      'Workplace words and all seven parts of Listening & Reading, finished with a mini test.',
    ],
    cefr: 'B1',
    tone: 'from-indigo-500 to-sky-600',
    testWords: TOEIC_WORDS,
    steps: [
      {
        id: 'en5-words',
        icon: '🏢',
        title: ['Từ vựng TOEIC', 'TOEIC words'],
        desc: [
          'Học 200 từ công sở theo chủ đề: văn phòng, tuyển dụng, đặt hàng, đi công tác…',
          'Learn 200 workplace words by theme: the office, hiring, orders, business travel…',
        ],
        to: '/toeic',
        goal: 200,
        measure: (ctx) => ctx.learnedWords(TOEIC_WORDS),
        unit: ['từ', 'words'],
      },
      {
        id: 'en5-parts',
        icon: '🗂️',
        title: ['Đủ 7 Part', 'All seven parts'],
        desc: [
          'Làm ít nhất 10 câu ở mỗi Part, từ mô tả tranh tới đọc hiểu.',
          'Answer at least 10 questions in each part, from photographs to reading.',
        ],
        to: '/toeic',
        goal: 7,
        measure: (ctx) => [1, 2, 3, 4, 5, 6, 7].filter((p) => ctx.toeicPart(p)[1] >= 10).length,
        unit: ['Part', 'parts'],
      },
      {
        id: 'en5-mini',
        icon: '⏱️',
        title: ['Bài thi nhỏ đạt 60%', 'Mini test at 60%'],
        desc: [
          'Bài thi 26 câu đủ 7 Part, đúng từ 16 câu trở lên.',
          'The 26-question test across all parts, 16 or more right.',
        ],
        to: '/toeic',
        goal: 1,
        measure: (ctx) => (ctx.examBest('toeic-mini') >= 0.6 ? 1 : 0),
        unit: ['lần', 'pass'],
      },
    ],
  },
  {
    n: 6,
    icon: '🎓',
    title: ['Hướng tới IELTS', 'Towards IELTS'],
    tagline: [
      'Vốn từ học thuật, đọc, nói và viết kiểu IELTS. Bài luyện Nghe của IELTS đang được viết.',
      'Academic words and IELTS-style reading, speaking and writing. IELTS listening practice is being written.',
    ],
    cefr: 'B1–B2',
    tone: 'from-rose-500 to-fuchsia-600',
    soon: true,
    steps: [
      words(1600, 2500, 'en6-words'),
      sessions(
        'en6-ielts-reading',
        'ielts-reading',
        4,
        '🎓',
        '/ielts',
        ['Đọc IELTS: True / False / Not Given', 'IELTS reading: True / False / Not Given'],
        [
          'Bài đọc học thuật ngắn, mỗi câu phải chọn Đúng, Sai hay Bài không nói.',
          'Short academic passages: is each statement true, false or not given?',
        ]
      ),
      sessions(
        'en6-ielts-speaking',
        'ielts-speaking',
        4,
        '🗣️',
        '/ielts',
        ['Nói IELTS: Part 1, 2, 3', 'IELTS speaking: Parts 1, 2, 3'],
        [
          'Trả lời câu hỏi của giám khảo, nói 2 phút theo thẻ chủ đề, ghi âm và nghe lại.',
          'Answer the examiner, talk for two minutes on a task card, record and listen back.',
        ]
      ),
      sessions(
        'en6-ielts-writing',
        'ielts-writing',
        2,
        '✍️',
        '/ielts',
        ['Viết IELTS: 2 bài Task 2', 'IELTS writing: two Task 2 essays'],
        [
          'Viết đủ 250 từ theo khung 4 đoạn, dùng từ nối và văn phong học thuật.',
          'Write 250 words in four paragraphs, with linking words and an academic style.',
        ]
      ),
      stories(
        'en6-stories',
        [
          'cooking-dinner',
          'a-new-phone',
          'lost-in-the-city',
          'the-soccer-match',
          'a-letter-to-grandma',
        ],
        ['Đọc hết kho truyện', 'Every remaining story']
      ),
    ],
  },
]

const hskWords = (id: string, list: readonly string[], goal: number, title: Pair): PathStep => ({
  id,
  icon: '🀄',
  title,
  desc: [
    `Học ${goal} từ trong danh sách này, mỗi lần 5 từ, có pinyin và âm Hán Việt.`,
    `Learn ${goal} words from this list, five at a time, with pinyin and Sino-Vietnamese readings.`,
  ],
  to: '/learn',
  goal,
  measure: (ctx) => ctx.learnedWords(list),
  unit: ['từ', 'words'],
})

const hskDrills = (level: string, name: string): PathStep => ({
  id: `zh-${level}-drills`,
  icon: '📝',
  title: [`Dạng câu ${name}`, `${name} question types`],
  desc: [
    `Làm 40 câu theo đúng các dạng của đề ${name}: nghe, nhìn tranh, điền từ, sắp xếp câu.`,
    `Answer 40 questions in the ${name} formats: listening, pictures, fill the gap, word order.`,
  ],
  to: '/hsk',
  goal: 40,
  measure: (ctx) => ctx.hskAnswered(level),
  unit: ['câu', 'questions'],
})

const hskMini = (level: string, name: string): PathStep => ({
  id: `zh-${level}-mini`,
  icon: '⏱️',
  title: [`Bài thi nhỏ ${name} đạt 60%`, `${name} mini test at 60%`],
  desc: [
    `Bài thi ngắn theo tỉ lệ đề thật, đúng từ 60% trở lên.`,
    `The short test in the real paper's proportions, 60% or more right.`,
  ],
  to: '/hsk',
  goal: 1,
  measure: (ctx) => (ctx.examBest(`${level}-mini`) >= 0.6 ? 1 : 0),
  unit: ['lần', 'pass'],
})

/** The Chinese path: from pinyin and tones to HSK 3. */
export const ZH_PATH: PathLevel[] = [
  {
    n: 1,
    icon: '🎵',
    title: ['Làm quen: pinyin & thanh điệu', 'First steps: pinyin & tones'],
    tagline: [
      'Nghe ra 4 thanh, đọc được pinyin, những từ và câu đầu tiên: 是, 不, 吗, 很.',
      'Hear the four tones, read pinyin, the first words and sentences: 是, 不, 吗, 很.',
    ],
    cefr: 'HSK 1',
    tone: 'from-red-400 to-amber-500',
    testWords: HSK1,
    steps: [
      sessions(
        'zh1-pinyin',
        'pinyin',
        3,
        '🎵',
        '/pinyin',
        ['Pinyin & thanh điệu', 'Pinyin & tones'],
        [
          'Chạm để nghe 4 thanh, phụ âm đầu và vần khó, rồi làm bài nghe chọn thanh.',
          'Tap to hear the four tones, initials and tricky finals, then a listen-and-pick check.',
        ]
      ),
      hskWords('zh1-words', HSK1, 60, ['60 từ HSK 1 đầu tiên', 'Your first 60 HSK 1 words']),
      grammar(
        'zh1-grammar',
        ['zh-shi', 'zh-bu-mei', 'zh-questions', 'zh-hen'],
        ['Câu đầu tiên: 是, 不/没, 吗, 很', 'First sentences: 是, 不/没, 吗, 很'],
        [
          'Bốn bài: câu với 是, phủ định 不 và 没, câu hỏi 吗, tính từ với 很. Đạt 80% mỗi bài.',
          'Four units: 是 sentences, 不 and 没, 吗 questions, adjectives with 很. Score 80% in each.',
        ]
      ),
      stories(
        'zh1-stories',
        ['zh-my-day', 'zh-shopping'],
        ['Hai truyện đầu tiên', 'Your first two stories']
      ),
    ],
  },
  {
    n: 2,
    icon: '🏮',
    title: ['HSK 1', 'HSK 1'],
    tagline: [
      'Đủ 150 từ và các mẫu câu của HSK 1, đếm số và lượng từ, sẵn sàng thi HSK 1.',
      'The 150 words and sentence patterns of HSK 1, numbers and measure words: ready for HSK 1.',
    ],
    cefr: 'HSK 1',
    tone: 'from-rose-500 to-red-600',
    testWords: HSK1,
    steps: [
      hskWords('zh2-words', HSK1, 140, ['Trọn bộ từ HSK 1', 'The whole HSK 1 list']),
      grammar(
        'zh2-grammar',
        [
          'zh-de',
          'zh-measure',
          'zh-zai',
          'zh-word-order',
          'zh-le',
          'zh-ji-duoshao',
          'zh-ye-dou',
          'zh-xiang-yao',
        ],
        ['Ngữ pháp HSK 1', 'HSK 1 grammar'],
        [
          'Tám bài: 的, lượng từ, 在, trật tự câu, 了, 几 và 多少, 也 và 都, 想 và 要.',
          'Eight units: 的, measure words, 在, word order, 了, 几 and 多少, 也 and 都, 想 and 要.',
        ]
      ),
      sessions(
        'zh2-measure',
        'measure',
        2,
        '🧮',
        '/measure-words',
        ['Lượng từ', 'Measure words'],
        [
          '个, 本, 杯… đặt cạnh "cái, quyển, cốc" của tiếng Việt.',
          '个, 本, 杯… next to their Vietnamese counterparts.',
        ]
      ),
      sessions(
        'zh2-numbers',
        'numbers',
        2,
        '🔢',
        '/numbers',
        ['Nghe số', 'Numbers by ear'],
        [
          'Nghe giá tiền, giờ, ngày tháng rồi chọn đúng, như phần nghe của đề HSK.',
          'Hear prices, times and dates and pick the right one, as in HSK listening.',
        ]
      ),
      hskDrills('hsk1', 'HSK 1'),
      hskMini('hsk1', 'HSK 1'),
    ],
  },
  {
    n: 3,
    icon: '🐉',
    title: ['HSK 2', 'HSK 2'],
    tagline: [
      'Thêm 150 từ, so sánh với 比, kinh nghiệm với 过, đọc truyện dài hơn và nhận mặt bộ thủ.',
      'Another 150 words, comparisons with 比, experience with 过, longer stories and the radicals.',
    ],
    cefr: 'HSK 2',
    tone: 'from-amber-400 to-orange-600',
    testWords: HSK2,
    steps: [
      hskWords('zh3-words', HSK2, 130, ['Từ vựng HSK 2', 'HSK 2 words']),
      grammar(
        'zh3-grammar',
        [
          'zh-can',
          'zh-because',
          'zh-de-degree',
          'zh-bi',
          'zh-guo',
          'zh-yao-le',
          'zh-youdianr',
          'zh-he',
          'zh-ba',
        ],
        ['Ngữ pháp HSK 2', 'HSK 2 grammar'],
        [
          'Chín bài: 会/能/可以, 因为…所以, bổ ngữ 得, so sánh 比, 过, 要…了, 有点儿, 和, 吧.',
          'Nine units: 会/能/可以, 因为…所以, 得 complements, 比, 过, 要…了, 有点儿, 和, 吧.',
        ]
      ),
      sessions(
        'zh3-radicals',
        'radicals',
        2,
        '🧩',
        '/radicals',
        ['Bộ thủ', 'Radicals'],
        [
          'Nhận mặt các bộ thủ hay gặp qua tên Hán Việt: đoán nghĩa chữ mới dễ hơn.',
          'The common radicals by their Sino-Vietnamese names: new characters get easier to guess.',
        ]
      ),
      stories(
        'zh3-stories',
        ['zh-rainy-day', 'zh-my-family', 'zh-sick-day', 'zh-beijing-trip', 'zh-restaurant'],
        ['Truyện A1–A2', 'A1–A2 stories']
      ),
      hskDrills('hsk2', 'HSK 2'),
      hskMini('hsk2', 'HSK 2'),
    ],
  },
  {
    n: 4,
    icon: '🏯',
    title: ['HSK 3', 'HSK 3'],
    tagline: [
      'Câu 把 và 被, bổ ngữ kết quả và xu hướng, nghe – chép, đọc truyện B1 và bài thi HSK 3 có phần viết.',
      '把 and 被, result and direction complements, dictation, B1 stories and the HSK 3 test with writing.',
    ],
    cefr: 'HSK 3',
    tone: 'from-fuchsia-500 to-purple-700',
    testWords: HSK3,
    steps: [
      hskWords('zh4-words', HSK3, 270, ['Từ vựng HSK 3', 'HSK 3 words']),
      grammar(
        'zh4-grammar',
        [
          'zh-ba-sentence',
          'zh-bei',
          'zh-yue',
          'zh-suiran',
          'zh-yibian',
          'zh-chule',
          'zh-result',
          'zh-direction',
          'zh-ruguo',
        ],
        ['Ngữ pháp HSK 3', 'HSK 3 grammar'],
        [
          'Chín bài B1: câu 把, câu 被, 越…越, 虽然…但是, 一边…一边, 除了, bổ ngữ kết quả và xu hướng, 如果.',
          'Nine B1 units: 把, 被, 越…越, 虽然…但是, 一边…一边, 除了, result and direction complements, 如果.',
        ]
      ),
      sessions(
        'zh4-hanviet',
        'hanviet',
        2,
        '🈶',
        '/han-viet',
        ['Âm Hán Việt', 'Sino-Vietnamese readings'],
        [
          'Bảng chữ theo âm Hán Việt: lợi thế riêng của người Việt khi nhớ chữ Hán.',
          'Characters by their Sino-Vietnamese reading: a head start only Vietnamese learners have.',
        ]
      ),
      sessions(
        'zh4-dictation',
        'dictation',
        5,
        '✍️',
        '/dictation',
        ['Nghe – chép', 'Dictation'],
        [
          'Nghe câu rồi xếp hoặc gõ pinyin, luyện tai cho phần nghe HSK 3.',
          'Hear a sentence and build it, training your ear for HSK 3 listening.',
        ]
      ),
      stories(
        'zh4-stories',
        [
          'zh-first-time',
          'zh-weekend',
          'zh-new-phone',
          'zh-fruit-shopping',
          'zh-lost-wallet',
          'zh-new-city',
          'zh-hsk-exam',
          'zh-birthday-gift',
          'zh-catch-cold',
        ],
        ['Truyện A2–B1', 'A2–B1 stories']
      ),
      hskDrills('hsk3', 'HSK 3'),
      hskMini('hsk3', 'HSK 3'),
    ],
  },
]

/** The path of a language pack; null when it has none yet. */
export function pathFor(code: string): PathLevel[] | null {
  if (code === 'en') return EN_PATH
  if (code === 'zh') return ZH_PATH
  return null
}

export interface StepState {
  step: PathStep
  value: number
  done: boolean
}

export interface LevelState {
  level: PathLevel
  steps: StepState[]
  /** Share of the level done, 0..1, each step weighted the same. */
  ratio: number
  complete: boolean
  unlocked: boolean
}

/** A level counts as cleared at this share, so one stubborn step never walls off the next. */
export const CLEAR_AT = 0.8

/** XP for clearing a level, given once (store/pathStore.ts). */
export const LEVEL_XP = 30

export function levelState(level: PathLevel, ctx: PathContext): Omit<LevelState, 'unlocked'> {
  const steps = level.steps.map((step) => {
    const value = Math.min(step.goal, Math.max(0, step.measure(ctx)))
    return { step, value, done: value >= step.goal }
  })
  const ratio = steps.reduce((sum, s) => sum + s.value / s.step.goal, 0) / (steps.length || 1)
  return { level, steps, ratio, complete: steps.every((s) => s.done) }
}

/**
 * Every level with its progress. A level opens when the one before is cleared
 * (CLEAR_AT), or when `openTo` says the learner may start higher: a placement
 * result, or a level test passed (docs/design/learning-path.md).
 */
export function pathState(
  levels: readonly PathLevel[],
  ctx: PathContext,
  openTo = 1
): LevelState[] {
  const out: LevelState[] = []
  for (const level of levels) {
    const state = levelState(level, ctx)
    const prev = out[out.length - 1]
    const unlocked = level.n <= openTo || !prev || (prev.unlocked && prev.ratio >= CLEAR_AT)
    out.push({ ...state, unlocked })
  }
  return out
}

/** The level to work on: the first open one not finished, else the last open one. */
export function currentLevel(states: readonly LevelState[]): LevelState | undefined {
  const open = states.filter((s) => s.unlocked)
  return open.find((s) => !s.complete) ?? open[open.length - 1]
}

/** The first unfinished step of a level, the one "Continue" opens. */
export function nextStep(state: LevelState): StepState | undefined {
  return state.steps.find((s) => !s.done)
}

/**
 * The level a placement result opens: the last level whose words start at or
 * before where placement put the learner (an index into the learning order).
 */
export function levelForPlacement(levels: readonly PathLevel[], start: number): number {
  let n = 1
  for (const level of levels) {
    const from = level.steps.find((s) => s.range)?.range?.[0]
    if (from !== undefined && from <= start) n = level.n
  }
  return n
}
