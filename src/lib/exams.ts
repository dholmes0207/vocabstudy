import type { QuizQuestion, Word } from '@/types'
import { makeQuestion } from '@/lib/quiz'

// "Lộ trình luyện thi" (docs/design/exam-track.md). Exam facts were checked on
// 2026-10-17 against the sources listed with each exam; the page links them and
// asks learners to confirm on the official site before registering.

type Pair = [vi: string, en: string]

export interface Exam {
  id: 'hsk1' | 'topik1'
  /** The pack this exam belongs to. */
  lang: string
  name: string
  facts: Pair[]
  /** What the learner should know before relying on this page. */
  caveat: Pair
  sources: { label: string; url: string }[]
  /** Headwords the exam expects; null = the whole pack (no list the pack covers). */
  wordList: readonly string[] | null
  /** The alphabet / sound step that opens the roadmap. */
  basics: { to: string; title: Pair }
}

/**
 * The HSK 1 vocabulary (2012 syllabus): 150 entries, two of which list a second
 * form — 哪（哪儿）and 那（那儿）— hence 152 headwords.
 */
export const HSK1: readonly string[] =
  `爱 八 爸爸 杯子 北京 本 不 不客气 菜 茶 吃 出租车 打电话 大 的 点 电脑 电视 电影 东西
都 读 对不起 多 多少 儿子 二 饭店 飞机 分钟 高兴 个 工作 狗 汉语 好 号 喝 和 很 后面 回 会 几 家
叫 今天 九 开 看 看见 块 来 老师 了 冷 里 六 吗 妈妈 买 猫 没关系 没有 米饭 名字 明天 哪 哪儿 那
那儿 呢 能 你 年 女儿 朋友 漂亮 苹果 七 前面 钱 请 去 热 人 认识 三 商店 上 上午 少 谁 什么 十 时候
是 书 水 水果 睡觉 说 四 岁 他 她 太 天气 听 同学 喂 我 我们 五 喜欢 下 下午 下雨 先生 现在 想 小
小姐 些 写 谢谢 星期 学生 学习 学校 一 一点儿 衣服 医生 医院 椅子 有 月 再见 在 怎么 怎么样 这
这儿 中国 中午 住 桌子 字 昨天 坐 做`.split(/\s+/)

export const EXAMS: readonly Exam[] = [
  {
    id: 'hsk1',
    lang: 'zh',
    name: 'HSK 1',
    facts: [
      ['40 câu: 20 câu nghe, 20 câu đọc.', '40 questions: 20 listening, 20 reading.'],
      ['Tổng 200 điểm, đạt từ 120 điểm.', '200 points in total; 120 or more passes.'],
      [
        'Danh sách 150 từ (chuẩn 2012). Hai từ có thêm dạng thứ hai (哪儿, 那儿), nên app tính 152 mục.',
        'A 150-word list (2012 syllabus). Two words have a second form (哪儿, 那儿), so the app counts 152 entries.',
      ],
    ],
    caveat: [
      'HSK đang chuyển sang chuẩn mới (HSK 3.0), cấp 1 có danh sách từ lớn hơn. Trước khi đăng ký, hãy xem trên trang của nơi tổ chức thi bạn sẽ thi theo chuẩn nào.',
      'HSK is moving to a new standard (HSK 3.0) with a longer level-1 word list. Before you register, check with your test centre which standard your exam uses.',
    ],
    sources: [
      { label: 'Wikipedia — HSK', url: 'https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi' },
      {
        label: 'eBLCU — HSK 1',
        url: 'https://www.eblcu.com/blogs/Introduction-to-HSK-1-Exam-en.html',
      },
    ],
    wordList: HSK1,
    basics: { to: '/pinyin', title: ['Pinyin & thanh điệu', 'Pinyin & tones'] },
  },
  {
    id: 'topik1',
    lang: 'ko',
    name: 'TOPIK I',
    facts: [
      ['Nghe: 30 câu, 40 phút.', 'Listening: 30 questions, 40 minutes.'],
      ['Đọc: 40 câu, 60 phút.', 'Reading: 40 questions, 60 minutes.'],
      [
        'Tổng 200 điểm: cấp 1 từ 80 điểm, cấp 2 từ 140 điểm.',
        '200 points in total: level 1 from 80, level 2 from 140.',
      ],
    ],
    caveat: [
      'Gói tiếng Hàn mới là phần nền: đủ để bắt đầu, nhưng TOPIK I cần nhiều từ hơn những gì app đang có. Chúng tôi đang bổ sung dần.',
      'The Korean pack is a foundation: enough to start, but TOPIK I needs more words than the app has today. We are adding more over time.',
    ],
    sources: [
      {
        label: 'Wikipedia — TOPIK',
        url: 'https://en.wikipedia.org/wiki/Test_of_Proficiency_in_Korean',
      },
    ],
    wordList: null,
    basics: { to: '/hangul', title: ['Bảng chữ Hangul', 'The Hangul alphabet'] },
  },
]

export function examFor(lang: string): Exam | undefined {
  return EXAMS.find((e) => e.lang === lang)
}

/** The pack's words the exam expects, in the pack's learning order. */
export function examWords(exam: Exam, words: readonly Word[]): Word[] {
  if (!exam.wordList) return [...words]
  const wanted = new Set(exam.wordList)
  return words.filter((w) => wanted.has(w.word))
}

/** Questions in the vocabulary check, half of them heard rather than read. */
export const MOCK_SIZE = 20

/**
 * The vocabulary check: MOCK_SIZE words drawn from the exam's list — the first
 * half heard ("listen"), the second half read (meaning, or the word in its
 * example sentence). Wrong options come from the same list.
 */
export function mockQuestions(
  words: readonly Word[],
  rng: () => number = Math.random
): QuizQuestion[] {
  const picked = [...words]
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  const pool = [...words]
  const chosen = picked.slice(0, MOCK_SIZE)
  const half = Math.ceil(chosen.length / 2)
  return chosen.map((w, i) =>
    makeQuestion(w, pool, i < half ? 'listen' : i % 2 ? 'en-to-vi' : 'context')
  )
}
