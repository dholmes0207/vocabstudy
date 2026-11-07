import type { ActivityKind } from '@/store/activityStore'
import { TOEIC_WORDS } from './toeic'

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
      'Vốn từ học thuật và đọc hiểu dài hơn. Bài luyện riêng cho 4 kỹ năng IELTS đang được viết.',
      'Academic words and longer reading. Practice for the four IELTS skills is being written.',
    ],
    cefr: 'B1–B2',
    tone: 'from-rose-500 to-fuchsia-600',
    soon: true,
    steps: [
      words(1600, 2500, 'en6-words'),
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

/** The path of a language pack; null when it has none yet. */
export function pathFor(code: string): PathLevel[] | null {
  return code === 'en' ? EN_PATH : null
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
