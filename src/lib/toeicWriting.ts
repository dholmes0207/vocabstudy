import { wordCount } from './ielts'

// "TOEIC Writing" (docs/design/toeic-writing.md). Questions 1–5: write one
// sentence about a picture using two given words. Questions 6–7: read an
// email and reply doing exactly what the directions ask (ask two questions,
// make one suggestion…). The page ticks a checklist as the answer grows and
// shows a model. Pure; data inline like lib/toeicSpeaking.ts.

export interface EmailTask {
  id: string
  from: string
  subject: string
  body: string
  /** The directions, as the test prints them. */
  directions: string
  /** What the directions ask for, in Vietnamese, for the checklist. */
  asks: [vi: string, en: string]
  /** How many questions the reply must ask (counted by question marks). */
  questions: number
  model: string
}

export const EMAIL_TASKS: EmailTask[] = [
  {
    id: 'fitness',
    from: 'Linda Park, Riverside Fitness Center',
    subject: 'New pool and classes',
    body: 'Dear member, We are pleased to announce that Riverside Fitness Center will open a new swimming pool next month. We are also planning to offer evening yoga classes. We would like to hear what our members think about these plans.',
    directions:
      'Respond to the email as if you are a member of the fitness center. In your email, ask TWO questions and make ONE suggestion.',
    asks: ['Hỏi 2 câu và đưa ra 1 đề xuất', 'Ask two questions and make one suggestion'],
    questions: 2,
    model:
      'Dear Ms. Park,\n\nThank you for letting us know about the new swimming pool. I have two questions. First, will members have to pay extra to use the pool? Second, what time will the evening yoga classes start? I work until six, so I hope they will begin after seven.\n\nI would also suggest offering swimming lessons for beginners on weekends, because many members, including me, cannot swim very well.\n\nBest regards,\nMinh Tran',
  },
  {
    id: 'laptop',
    from: 'Customer Service, BrightTech Electronics',
    subject: 'Your recent order',
    body: 'Dear Customer, Thank you for your recent purchase of a BrightTech laptop. We hope you are enjoying it. We would appreciate it if you could tell us about your experience with our product and our service.',
    directions:
      'Respond to the email as if you are the customer. In your email, describe ONE problem you have had and make TWO requests.',
    asks: ['Nêu 1 vấn đề và đưa ra 2 yêu cầu', 'Describe one problem and make two requests'],
    questions: 2,
    model:
      'Dear BrightTech Customer Service,\n\nThank you for your email. I am generally happy with my new laptop, but I have had one problem: the battery only lasts about two hours, even though the website said it would last eight.\n\nI have two requests. Could you please send me a replacement battery or explain how to fix the problem? Also, could you tell me whether the laptop is still under warranty if I need to send it back?\n\nI look forward to hearing from you.\n\nSincerely,\nLan Nguyen',
  },
  {
    id: 'picnic',
    from: 'Mark Wilson, Human Resources',
    subject: 'Company picnic',
    body: 'Dear all, We are organizing a picnic for all staff next month. We have not decided on the place or the date yet, and we would welcome your ideas.',
    directions:
      'Respond to the email as if you are an employee. In your email, give TWO suggestions and ask ONE question.',
    asks: ['Đưa ra 2 đề xuất và hỏi 1 câu', 'Give two suggestions and ask one question'],
    questions: 1,
    model:
      'Dear Mr. Wilson,\n\nThank you for organizing the company picnic. I think it is a great idea, and I have two suggestions. First, Green Lake Park would be a good place, because it is close to the office and has plenty of space for games. Second, a Saturday in the middle of the month might be best, since many people are busy at the end of the month.\n\nI also have one question: will employees be allowed to bring their families?\n\nKind regards,\nHoa Le',
  },
]

/** Fewest words for a reply that does the whole task. */
export const EMAIL_MIN_WORDS = 50

export interface EmailCheck {
  greeting: boolean
  closing: boolean
  questions: number
  words: number
}

/** What the checklist looks at: a greeting, a sign-off, questions asked, length. */
export function checkEmail(reply: string): EmailCheck {
  const text = reply.trim()
  return {
    greeting: /^(dear|hi|hello)\b/i.test(text),
    closing: /\b(regards|sincerely|best wishes|thank you|thanks|look forward)\b/i.test(
      text.split(/\n/).slice(-4).join(' ')
    ),
    questions: (text.match(/\?/g) ?? []).length,
    words: wordCount(text),
  }
}

/** XP for handing in a reply. */
export const EMAIL_XP = 10

/** Questions 1–5: a picture (an emoji scene and what it shows) and two words to use. */
export interface PictureTask {
  id: string
  scene: string
  /** What the photo shows, in Vietnamese. */
  shows: string
  words: [string, string]
  /** How each word may appear: its forms (prepare → preparing, box → boxes). */
  forms: [string[], string[]]
  model: string
}

const pic = (
  id: string,
  scene: string,
  shows: string,
  words: [string, string],
  forms: [string[], string[]],
  model: string
): PictureTask => ({ id, scene, shows, words, forms, model })

export const PICTURE_TASKS: PictureTask[] = [
  pic(
    'phone',
    '👩‍💼📞',
    'Một người phụ nữ đang nói điện thoại ở bàn làm việc.',
    ['woman', 'phone'],
    [['woman'], ['phone', 'phones']],
    'The woman is talking on the phone at her desk.'
  ),
  pic(
    'bus',
    '🚏🌧️👥',
    'Mấy người đứng chờ ở trạm xe buýt dưới trời mưa.',
    ['bus', 'because'],
    [['bus', 'buses'], ['because']],
    'People are waiting at the bus stop because the bus is late.'
  ),
  pic(
    'chef',
    '👨‍🍳🍲',
    'Một đầu bếp đang nấu ăn trong bếp nhà hàng.',
    ['chef', 'prepare'],
    [
      ['chef', 'chefs'],
      ['prepare', 'prepares', 'preparing', 'prepared'],
    ],
    'The chef is preparing a meal in the kitchen.'
  ),
  pic(
    'library',
    '🧑‍🎓📚',
    'Hai sinh viên đang ngồi học trong thư viện.',
    ['student', 'library'],
    [['student', 'students'], ['library']],
    'Two students are studying together in the library.'
  ),
  pic(
    'market',
    '🛒🍎',
    'Một người đàn ông đang mua trái cây ở chợ.',
    ['buy', 'fruit'],
    [
      ['buy', 'buys', 'buying', 'bought'],
      ['fruit', 'fruits'],
    ],
    'A man is buying some fruit at the market.'
  ),
  pic(
    'meeting',
    '💼🗣️📝',
    'Trong một cuộc họp, một người ghi chép còn những người khác đang nói.',
    ['meeting', 'while'],
    [['meeting', 'meetings'], ['while']],
    'One man is taking notes while the others are talking in the meeting.'
  ),
  pic(
    'park',
    '🚲🌳',
    'Một cô gái đạp xe trong công viên.',
    ['ride', 'park'],
    [['ride', 'rides', 'riding', 'rode'], ['park']],
    'A girl is riding her bicycle in the park.'
  ),
  pic(
    'airport',
    '✈️🧳',
    'Một hành khách kéo vali đi trong sân bay.',
    ['suitcase', 'airport'],
    [['suitcase', 'suitcases'], ['airport']],
    'A traveler is pulling a suitcase through the airport.'
  ),
  pic(
    'delivery',
    '🚚📦',
    'Một tài xế đang giao những thùng hàng tới văn phòng.',
    ['deliver', 'box'],
    [
      ['deliver', 'delivers', 'delivering', 'delivered'],
      ['box', 'boxes'],
    ],
    'The driver is delivering some boxes to the office.'
  ),
  pic(
    'coffee',
    '😴☕',
    'Một người ngồi ở bàn làm việc, trông buồn ngủ, đang uống cà phê.',
    ['tired', 'so'],
    [['tired'], ['so']],
    'He is very tired, so he is drinking a cup of coffee.'
  ),
]

/** How many pictures a round takes, as in the test. */
export const PICTURE_ROUND = 5

export interface SentenceCheck {
  /** Each given word, in one of its forms. */
  used: [boolean, boolean]
  /** Starts with a capital letter and ends with a full stop. */
  shaped: boolean
  /** One sentence, not a list of words. */
  long: boolean
}

export function checkSentence(task: PictureTask, sentence: string): SentenceCheck {
  const text = sentence.trim()
  const words = (text.toLowerCase().match(/[a-z]+/g) ?? []) as string[]
  const has = (forms: string[]) => forms.some((f) => words.includes(f))
  return {
    used: [has(task.forms[0]), has(task.forms[1])],
    shaped:
      /^[A-Z]/.test(text) &&
      /[.!?]$/.test(text) &&
      text.split(/[.!?](\s|$)/).filter((p) => p.trim()).length === 1,
    long: words.length >= 5,
  }
}

/** A round of pictures in random order. */
export function pictureRound(rand: () => number = Math.random): PictureTask[] {
  const a = [...PICTURE_TASKS]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, PICTURE_ROUND)
}
