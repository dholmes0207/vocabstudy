import type { Word } from '@/types'

// TOEIC vocabulary by theme (docs/design/toeic.md). ETS publishes no TOEIC word
// list: these are the workplace words of the English pack, grouped by the
// situations the Listening & Reading test is built around (ordering, hiring,
// business travel…). Each word belongs to one theme only.

type Pair = [vi: string, en: string]

export interface ToeicTheme {
  id: string
  emoji: string
  title: Pair
  /** Headwords of the English pack, space-separated. */
  words: string
}

export const TOEIC_THEMES: readonly ToeicTheme[] = [
  {
    id: 'office',
    emoji: '🗂️',
    title: ['Văn phòng', 'The office'],
    words:
      'office desk copy printer file document folder memo deadline schedule reschedule meeting agenda colleague coworker supervisor manager assistant department division staff employee shift task project report presentation handout projector extension workload overtime cabinet photocopier stapler',
  },
  {
    id: 'hr',
    emoji: '🧑‍💼',
    title: ['Tuyển dụng & nhân sự', 'Hiring & HR'],
    words:
      'hire recruit applicant candidate interview qualification experience position vacancy salary wage bonus benefit promotion retire resign train trainee orientation evaluation performance contract permanent temporary personnel reference skill career employer',
  },
  {
    id: 'finance',
    emoji: '💰',
    title: ['Tài chính & kế toán', 'Finance & accounting'],
    words:
      'budget profit loss revenue expense cost invoice payment account bank loan interest tax receipt refund reimburse reimbursement balance deposit withdraw transaction fee charge estimate investment investor shareholder fund financial quarterly',
  },
  {
    id: 'business',
    emoji: '🏢',
    title: ['Công ty & hợp tác', 'Companies & deals'],
    words:
      'company firm branch headquarters subsidiary merger acquisition stakeholder competitor strategy policy procedure regulation proposal negotiate agreement partner partnership executive director board',
  },
  {
    id: 'sales',
    emoji: '🛍️',
    title: ['Bán hàng & tiếp thị', 'Sales & marketing'],
    words:
      'customer client sale discount price purchase order supplier vendor retail retailer wholesale product brand advertise advertisement campaign marketing survey launch demand commercial catalog brochure coupon voucher warranty complaint',
  },
  {
    id: 'shipping',
    emoji: '📦',
    title: ['Đặt hàng & vận chuyển', 'Orders & shipping'],
    words:
      'ship shipment deliver delivery package parcel warehouse stock inventory supply distribute distribution freight cargo courier dispatch track tracking container load logistics procurement',
  },
  {
    id: 'manufacturing',
    emoji: '🏭',
    title: ['Nhà máy & sản xuất', 'Factories & production'],
    words:
      'factory plant produce production manufacture manufacturer machine equipment assemble assembly quality inspect inspection defect safety operate operator maintenance repair component material output capacity',
  },
  {
    id: 'travel',
    emoji: '✈️',
    title: ['Đi công tác', 'Business travel'],
    words:
      'travel trip flight airline airport boarding passenger luggage baggage ticket reservation reserve book itinerary hotel accommodation depart departure arrive arrival delay cancel cancellation destination tour passport visa commute commuter confirmation',
  },
  {
    id: 'dining',
    emoji: '🍽️',
    title: ['Ăn uống & tiệc', 'Dining & catering'],
    words:
      'restaurant menu waiter waitress chef cuisine dish meal catering banquet dessert beverage bill tip serve server snack lunch dinner complimentary',
  },
  {
    id: 'housing',
    emoji: '🏠',
    title: ['Nhà cửa & văn phòng thuê', 'Property & premises'],
    words:
      'rent tenant landlord lease apartment property agent building floor lobby elevator renovate renovation premises relocate relocation utility electricity plumber furniture move',
  },
  {
    id: 'health',
    emoji: '🩺',
    title: ['Sức khoẻ', 'Health'],
    words:
      'clinic hospital doctor nurse patient appointment insurance medicine prescription pharmacy treatment symptom checkup emergency dentist health medical',
  },
  {
    id: 'tech',
    emoji: '💻',
    title: ['Máy tính & công nghệ', 'Computers & tech'],
    words:
      'computer software hardware program website internet email password download upload update install network technician online device screen keyboard data database',
  },
  {
    id: 'events',
    emoji: '🎤',
    title: ['Hội nghị & sự kiện', 'Conferences & events'],
    words:
      'event conference seminar workshop exhibition fair venue register registration attend attendee participant speaker keynote host invitation ceremony award celebrate session enclose notify',
  },
]

/** Every TOEIC headword, theme by theme. */
export const TOEIC_WORDS: readonly string[] = TOEIC_THEMES.flatMap((t) => t.words.split(' '))

/** The pack's words of a theme, in the theme's order. */
export function themeWords(theme: ToeicTheme, words: readonly Word[]): Word[] {
  const byWord = new Map(words.map((w) => [w.word, w]))
  return theme.words.split(' ').flatMap((h) => {
    const w = byWord.get(h)
    return w ? [w] : []
  })
}

export interface ToeicPart {
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7
  section: 'listening' | 'reading'
  name: Pair
  /** Questions in the real test. */
  questions: number
  /** What the part asks, in one or two sentences. */
  asks: Pair
  tip: Pair
}

/**
 * The seven parts of the Listening & Reading test, as IIBC publishes the
 * format (checked 03/11/2026, see lib/exams.ts). The tips are the app's own.
 */
export const TOEIC_PARTS: readonly ToeicPart[] = [
  {
    n: 1,
    section: 'listening',
    name: ['Mô tả tranh', 'Photographs'],
    questions: 6,
    asks: [
      'Nhìn một bức ảnh, nghe 4 câu mô tả (không in trong đề), chọn câu đúng nhất.',
      'Look at a photo, hear four statements (not printed), pick the one that describes it best.',
    ],
    tip: [
      'Trước khi nghe, nhìn tranh: ai, đang làm gì, ở đâu. Cẩn thận câu có đúng đồ vật trong tranh nhưng sai hành động.',
      'Before the audio, study the photo: who, doing what, where. Watch for statements that name the right object but the wrong action.',
    ],
  },
  {
    n: 2,
    section: 'listening',
    name: ['Hỏi – đáp', 'Question–response'],
    questions: 25,
    asks: [
      'Nghe một câu hỏi hoặc câu nói, rồi 3 câu đáp (không in trong đề), chọn câu đáp phù hợp.',
      'Hear a question or statement, then three responses (not printed), pick the one that fits.',
    ],
    tip: [
      'Nghe thật kỹ từ để hỏi ở đầu câu (Who, When, Where…). Câu đáp lặp lại từ trong câu hỏi, hoặc có từ phát âm gần giống, thường là bẫy.',
      'Catch the question word at the start (Who, When, Where…). A response that repeats a word from the question, or one that sounds like it, is usually a trap.',
    ],
  },
  {
    n: 3,
    section: 'listening',
    name: ['Hội thoại', 'Conversations'],
    questions: 39,
    asks: [
      '13 đoạn hội thoại giữa 2 hoặc 3 người, mỗi đoạn 3 câu hỏi; vài câu đi kèm bảng hoặc hình.',
      '13 conversations between two or three people, three questions each; some come with a table or graphic.',
    ],
    tip: [
      'Dùng lúc chờ để đọc trước 3 câu hỏi, biết mình cần nghe tên người, thời gian hay lý do.',
      'Use the pause to read the three questions first, so you know whether to listen for a name, a time or a reason.',
    ],
  },
  {
    n: 4,
    section: 'listening',
    name: ['Bài nói ngắn', 'Talks'],
    questions: 30,
    asks: [
      '10 bài nói của một người (thông báo, tin nhắn thoại, quảng cáo, giới thiệu), mỗi bài 3 câu hỏi.',
      'Ten talks by one speaker (announcements, voicemails, ads, introductions), three questions each.',
    ],
    tip: [
      'Câu đầu thường nói mục đích của bài. Các câu hỏi thường đi theo thứ tự của bài nói.',
      'The first sentence usually gives the purpose. The questions tend to follow the order of the talk.',
    ],
  },
  {
    n: 5,
    section: 'reading',
    name: ['Điền câu', 'Incomplete sentences'],
    questions: 30,
    asks: [
      'Một câu có chỗ trống, chọn từ hoặc cụm đúng trong 4 phương án.',
      'A sentence with a gap: pick the right word or phrase from four options.',
    ],
    tip: [
      'Nhìn 4 phương án trước. Cùng gốc khác đuôi (decide, decision, decisive…) là câu từ loại: chỉ cần xem vị trí chỗ trống. Khác nghĩa thì mới cần đọc cả câu.',
      'Look at the options first. One root with different endings (decide, decision, decisive…) is a word-form question: the position of the gap is enough. Different meanings need the whole sentence.',
    ],
  },
  {
    n: 6,
    section: 'reading',
    name: ['Điền đoạn văn', 'Text completion'],
    questions: 16,
    asks: [
      '4 đoạn văn (email, thông báo, thư), mỗi đoạn 4 chỗ trống; một chỗ phải chọn cả một câu.',
      'Four texts (emails, notices, letters), four gaps each; one gap takes a whole sentence.',
    ],
    tip: [
      'Đọc cả đoạn, đừng chỉ đọc câu có chỗ trống: thì của động từ và câu cần điền phụ thuộc vào câu trước và câu sau.',
      'Read the whole text, not just the line with the gap: the verb tense and the missing sentence depend on what comes before and after.',
    ],
  },
  {
    n: 7,
    section: 'reading',
    name: ['Đọc hiểu', 'Reading comprehension'],
    questions: 54,
    asks: [
      'Email, quảng cáo, bài báo, tin nhắn, biểu mẫu; một đoạn (29 câu) hoặc 2–3 đoạn liên quan (25 câu).',
      'Emails, ads, articles, chats and forms; single passages (29 questions) or two or three linked ones (25 questions).',
    ],
    tip: [
      'Đọc câu hỏi trước rồi mới tìm thông tin. Câu hỏi nhiều đoạn thường cần ghép một chi tiết ở đoạn này với một chi tiết ở đoạn kia.',
      'Read the question first, then look for the answer. Multiple-passage questions often need a detail from one text joined with one from another.',
    ],
  },
]
