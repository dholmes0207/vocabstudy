import type { QuizQuestion, Word } from '@/types'
import { makeQuestion } from '@/lib/quiz'

// "Lộ trình luyện thi" (docs/design/exam-track.md). Exam facts were checked
// against the sources listed with each exam, on the date in `checked`; the page links them and
// asks learners to confirm on the official site before registering.

type Pair = [vi: string, en: string]

export interface Exam {
  id: 'hsk1' | 'hsk2' | 'hsk3' | 'topik1' | 'a2key' | 'b1prelim'
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
  /**
   * Without a list: the pack's words of this curriculum stage (English: 1 = the
   * core A1–A2 thousand, 2 = the B1 extension), named by `stageLabel`.
   */
  stage?: 1 | 2
  stageLabel?: Pair
  /** The alphabet / sound step that opens the roadmap, and why it comes first. */
  basics: { to: string; title: Pair; note?: Pair }
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

/**
 * The HSK 3 vocabulary added on top of HSK 2 (2012 syllabus), from the same
 * complete-hsk-vocabulary lists: 298 headwords, about 600 words with HSK 1 and 2.
 */
export const HSK3: readonly string[] =
  `阿姨 啊 矮 爱好 安静 把 班 搬 办法 办公室 半 帮忙 包 饱 北方 被 鼻子
比较 比赛 必须 变化 表示 表演 别人 宾馆 冰箱 才 菜单 参加 草 层 差 超市
衬衫 成绩 城市 迟到 出现 除了 厨房 春 词语 聪明 打扫 打算 带 担心 蛋糕
当然 地 地方 地铁 地图 灯 低 电梯 电子 东 冬 动物 短 段 锻炼 多么 饿
而且 耳朵 发烧 发现 方便 放 放心 分 附近 复习 敢 感冒 干净 刚才 根据 跟
更 公园 故事 刮 关 关系 关心 关于 国家 果汁 过去 还是 害怕 河 黑板 护照
花 花园 画 坏 环境 换 黄 会议 或者 机会 极 几乎 记得 季节 检查 简单 见面
健康 讲 角 脚 教 接 街道 节目 节日 结婚 结束 解决 借 经常 经过 经理 久
旧 举行 句子 决定 可爱 渴 刻 客人 空调 口 哭 裤子 筷子 蓝 老 了解 离开
礼物 历史 脸 练习 辆 邻居 楼 绿 马 马上 满意 帽子 米 面包 面条 明白 拿
奶奶 南 难 难过 年级 年轻 鸟 努力 爬山 盘子 胖 啤酒 葡萄 普通话 其实 其他
奇怪 骑 铅笔 清楚 秋 裙子 然后 热情 认为 认真 容易 如果 伞 上网 生气 声音
使 世界 瘦 叔叔 舒服 树 数学 刷 双 水平 司机 虽然 太阳 糖 特别 疼 提高
体育 甜 条 同事 同意 头发 突然 图书馆 腿 完成 碗 万 忘记 为了 为什么 位
文化 习惯 洗手间 洗澡 西 夏 先 相同 相信 香蕉 像 小心 校长 鞋 新闻 新鲜
信 行李箱 兴趣 熊猫 需要 选择 眼镜 要求 爷爷 一般 一边 一定 一共 一会儿
一样 一直 以后 以前 以为 音乐 银行 应该 影响 用 游戏 有名 又 遇到 愿意
月亮 越 云 站 照顾 照片 照相机 着急 只 中间 终于 种 重要 周末 主要 注意
祝 字典 自己 总是 最近 作业 作用`.split(/\s+/)

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
    id: 'hsk3',
    lang: 'zh',
    name: 'HSK 3',
    facts: [
      [
        '80 câu: 40 câu nghe (khoảng 35 phút), 30 câu đọc (30 phút), 10 câu viết (15 phút); cả bài khoảng 90 phút.',
        '80 questions: 40 listening (about 35 minutes), 30 reading (30 minutes), 10 writing (15 minutes); about 90 minutes in all.',
      ],
      ['Tổng 300 điểm, đạt từ 180 điểm.', '300 points in total; 180 or more passes.'],
      [
        'Cần khoảng 600 từ: các từ HSK 1, HSK 2 cộng thêm từ HSK 3. Danh sách HSK 3 trong app có 298 mục.',
        'About 600 words: the HSK 1 and HSK 2 words plus the HSK 3 ones. The app’s HSK 3 list has 298 entries.',
      ],
      [
        'Từ cấp này có phần viết: sắp xếp từ thành câu và điền chữ Hán.',
        'This level adds a writing part: putting words in order and filling in characters.',
      ],
    ],
    caveat: [
      'Danh sách HSK 3 lấy từ bảng tổng hợp mở complete-hsk-vocabulary; các bản in khác nhau vài mục. HSK cũng đang chuyển sang chuẩn mới (HSK 3.0) — trước khi đăng ký, hãy hỏi nơi tổ chức thi bạn sẽ thi theo chuẩn nào.',
      'The HSK 3 list comes from the open complete-hsk-vocabulary compilation; printed editions differ by a few words. HSK is also moving to a new standard (HSK 3.0) — before you register, ask your test centre which standard your exam uses.',
    ],
    checked: ['29/10/2026', '29 Oct 2026'],
    sources: [
      { label: 'Chinese Testing International — HSK 3', url: 'https://www.chinesetest.cn/HSK/3' },
      {
        label: 'complete-hsk-vocabulary',
        url: 'https://github.com/drkameleon/complete-hsk-vocabulary',
      },
    ],
    wordList: HSK3,
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
  {
    id: 'a2key',
    lang: 'en',
    name: 'A2 Key',
    facts: [
      [
        'Đọc và Viết: 1 giờ, 7 phần, 32 câu (50% số điểm).',
        'Reading and Writing: 1 hour, 7 parts, 32 questions (50% of the marks).',
      ],
      [
        'Nghe: 30 phút (gồm 6 phút chép đáp án), 5 phần, 25 câu (25%).',
        "Listening: 30 minutes (including 6 minutes' transfer time), 5 parts, 25 questions (25%).",
      ],
      [
        'Nói: 8–10 phút mỗi cặp thí sinh, 2 phần (25%).',
        'Speaking: 8–10 minutes per pair of candidates, 2 parts (25%).',
      ],
      [
        'Thang điểm Cambridge English: 120–139 đạt A2 (hạng C từ 120, hạng B từ 133); 140–150 là hạng A, tương đương B1; 100–119 nhận chứng chỉ A1.',
        'Cambridge English Scale: 120–139 is A2 (grade C from 120, grade B from 133); 140–150 is grade A, at B1; 100–119 gets an A1 certificate.',
      ],
    ],
    caveat: [
      'Từ vựng ở đây là 1.000 từ lõi bậc A1–A2 của app (theo Oxford 3000), gần với danh sách từ chính thức của Cambridge nhưng không trùng khớp. App luyện từ vựng, nghe và đọc; phần Viết chưa có, phần Nói có thể tập ở "Luyện nói". A2 Key for Schools cùng định dạng đề. Trước khi đăng ký, hãy xem lại trên trang của Cambridge.',
      "The vocabulary here is the app's core 1,000 A1–A2 words (based on the Oxford 3000): close to Cambridge's official word list, but not the same. The app trains vocabulary, listening and reading; there is no writing practice yet, and speaking can be practised in \"Speaking\". A2 Key for Schools has the same format. Check Cambridge's site before you register.",
    ],
    checked: ['28/10/2026', '28 Oct 2026'],
    sources: [
      {
        label: 'Cambridge English — A2 Key exam format',
        url: 'https://www.cambridgeenglish.org/exams-and-tests/key/exam-format/',
      },
      {
        label: 'Cambridge English — A2 Key results',
        url: 'https://www.cambridgeenglish.org/exams-and-tests/key/results/',
      },
    ],
    wordList: null,
    stage: 1,
    stageLabel: ['từ lõi bậc A1–A2', 'core A1–A2 words'],
    basics: {
      to: '/sounds',
      title: ['Âm khó cho người Việt', 'Tricky sounds for Vietnamese speakers'],
      note: [
        'Phần nghe của đề cần phân biệt được ship và sheep, nghe ra âm cuối: tập tai trước khi học từ.',
        'The listening paper needs you to tell ship from sheep and hear final sounds: train your ear before the words.',
      ],
    },
  },
  {
    id: 'b1prelim',
    lang: 'en',
    name: 'B1 Preliminary',
    facts: [
      [
        'Đọc: 45 phút, 6 phần, 32 câu (25% số điểm). Viết: 45 phút, 2 phần (25%).',
        'Reading: 45 minutes, 6 parts, 32 questions (25% of the marks). Writing: 45 minutes, 2 parts (25%).',
      ],
      [
        'Nghe: 30 phút (gồm 6 phút chép đáp án), 4 phần, 25 câu (25%).',
        "Listening: 30 minutes (including 6 minutes' transfer time), 4 parts, 25 questions (25%).",
      ],
      [
        'Nói: 10–12 phút mỗi cặp thí sinh, 4 phần (25%).',
        'Speaking: 10–12 minutes per pair of candidates, 4 parts (25%).',
      ],
      [
        'Thang điểm Cambridge English: 140–159 đạt B1 (hạng C từ 140, hạng B từ 153); 160–170 là hạng A, tương đương B2; 120–139 nhận chứng chỉ A2.',
        'Cambridge English Scale: 140–159 is B1 (grade C from 140, grade B from 153); 160–170 is grade A, at B2; 120–139 gets an A2 certificate.',
      ],
    ],
    caveat: [
      'Từ vựng ở đây là phần mở rộng bậc B1 của app (theo Oxford 3000), học sau 1.000 từ lõi; gần với danh sách từ chính thức của Cambridge nhưng không trùng khớp. App luyện từ vựng, nghe và đọc; phần Viết chưa có, phần Nói có thể tập ở "Luyện nói". Trước khi đăng ký, hãy xem lại trên trang của Cambridge.',
      "The vocabulary here is the app's B1 extension (based on the Oxford 3000), learned after the core 1,000: close to Cambridge's official word list, but not the same. The app trains vocabulary, listening and reading; there is no writing practice yet, and speaking can be practised in \"Speaking\". Check Cambridge's site before you register.",
    ],
    checked: ['28/10/2026', '28 Oct 2026'],
    sources: [
      {
        label: 'Cambridge English — B1 Preliminary exam format',
        url: 'https://www.cambridgeenglish.org/exams-and-tests/preliminary/exam-format/',
      },
      {
        label: 'Cambridge English — B1 Preliminary results',
        url: 'https://www.cambridgeenglish.org/exams-and-tests/preliminary/results/',
      },
    ],
    wordList: null,
    stage: 2,
    stageLabel: ['từ bậc B1', 'B1 words'],
    basics: {
      to: '/sounds',
      title: ['Âm khó cho người Việt', 'Tricky sounds for Vietnamese speakers'],
      note: [
        'Phần nghe của đề cần phân biệt được ship và sheep, nghe ra âm cuối: tập tai trước khi học từ.',
        'The listening paper needs you to tell ship from sheep and hear final sounds: train your ear before the words.',
      ],
    },
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
  if (!exam.wordList && exam.stage) return words.filter((w) => (w.stage ?? 1) === exam.stage)
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
