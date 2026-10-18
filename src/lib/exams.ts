import type { QuizQuestion, Word } from '@/types'
import { makeQuestion } from '@/lib/quiz'

// "Lộ trình luyện thi" (docs/design/exam-track.md). Exam facts were checked on
// 2026-10-17 against the sources listed with each exam; the page links them and
// asks learners to confirm on the official site before registering.

type Pair = [vi: string, en: string]

export interface Exam {
  id: 'hsk1' | 'hsk2' | 'topik1'
  /** The pack this exam belongs to. */
  lang: string
  name: string
  facts: Pair[]
  /** What the learner should know before relying on this page. */
  caveat: Pair
  sources: { label: string; url: string }[]
  /** When the facts were last checked against the sources. */
  checked: Pair
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

/**
 * The HSK 2 vocabulary added on top of HSK 1 (2012 syllabus), as compiled in the
 * open complete-hsk-vocabulary lists ("old" levels): 147 headwords. Printed
 * editions differ by a few entries, which the exam page says.
 */
export const HSK2: readonly string[] =
  `吧 白 百 帮助 报纸 比 便宜 别 唱歌 出 穿 船 次 从 错 打篮球 大家 但是 到 得 弟弟 第一 懂 房间 非常 服务员 高 告诉 哥哥 给 公共汽车 公斤 公司 贵 还 孩子 好吃 号
黑 红 欢迎 回答 机场 鸡蛋 件 教室 介绍 姐姐 近 进 就 觉得 咖啡 开始 考试 可能 可以 课 快 快乐 累 离 两 路 旅游 卖 慢 忙 每 妹妹 门 男人 您 牛奶 女人 旁边 跑步
票 妻子 起床 千 晴 去年 让 上班 身体 生病 生日 时间 事情 手表 手机 送 所以 它 踢 题 跳舞 外 完 玩 晚上 为 问 问题 希望 洗 西瓜 向 小时 笑 新 姓 休息 雪 颜色
眼睛 羊肉 药 要 也 一起 已经 意思 因为 阴 游泳 右边 鱼 元 远 运动 再 早上 张 长 丈夫 找 着 真 正在 知道 准备 自行车 走 最 左边`.split(
    /\s+/
  )

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
    checked: ['17/10/2026', '17 Oct 2026'],
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
    id: 'hsk2',
    lang: 'zh',
    name: 'HSK 2',
    facts: [
      [
        '60 câu: 35 câu nghe (khoảng 25 phút), 25 câu đọc (22 phút); cả bài khoảng 55 phút.',
        '60 questions: 35 listening (about 25 minutes), 25 reading (22 minutes); about 55 minutes in all.',
      ],
      ['Tổng 200 điểm, đạt từ 120 điểm.', '200 points in total; 120 or more passes.'],
      [
        'Cần khoảng 300 từ: các từ HSK 1 cộng thêm từ HSK 2. Danh sách HSK 2 trong app có 147 mục.',
        'About 300 words: the HSK 1 words plus the HSK 2 ones. The app’s HSK 2 list has 147 entries.',
      ],
    ],
    caveat: [
      'Danh sách HSK 2 lấy từ bảng tổng hợp mở complete-hsk-vocabulary; các bản in khác nhau vài mục. HSK cũng đang chuyển sang chuẩn mới (HSK 3.0) — trước khi đăng ký, hãy hỏi nơi tổ chức thi bạn sẽ thi theo chuẩn nào.',
      'The HSK 2 list comes from the open complete-hsk-vocabulary compilation; printed editions differ by a few words. HSK is also moving to a new standard (HSK 3.0) — before you register, ask your test centre which standard your exam uses.',
    ],
    checked: ['19/10/2026', '19 Oct 2026'],
    sources: [
      {
        label: 'Confucius Institute — HSK 2',
        url: 'https://www.confuciusinstitute.ac.uk/wp-content/uploads/2020/12/HSK-level-2.pdf',
      },
      {
        label: 'complete-hsk-vocabulary',
        url: 'https://github.com/drkameleon/complete-hsk-vocabulary',
      },
    ],
    wordList: HSK2,
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
    checked: ['17/10/2026', '17 Oct 2026'],
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

/** The exams of a pack, easiest first (HSK 1, HSK 2…). */
export function examsFor(lang: string): Exam[] {
  return EXAMS.filter((e) => e.lang === lang)
}

/** One exam of a pack: the one with `id`, or the first. */
export function examFor(lang: string, id?: string | null): Exam | undefined {
  const all = examsFor(lang)
  return all.find((e) => e.id === id) ?? all[0]
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

const listSets = new Map<string, Set<string>>()

/**
 * The exam whose official list has this word ("HSK 1"), for a badge on the word
 * card. Only exams with a list the pack covers — TOPIK I has none, so no badge.
 */
export function examLabelFor(lang: string, word: Pick<Word, 'word'>): string | null {
  // Easiest level first: a word on both lists (号) is an HSK 1 word.
  for (const exam of examsFor(lang)) {
    if (!exam.wordList) continue
    let set = listSets.get(exam.id)
    if (!set) listSets.set(exam.id, (set = new Set(exam.wordList)))
    if (set.has(word.word)) return exam.name
  }
  return null
}
