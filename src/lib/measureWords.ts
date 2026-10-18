// "Lượng từ" (docs/design/measure-words.md): Chinese puts a measure word between
// a number and a noun — 一本书, like Vietnamese "một quyển sách". The idea is
// familiar; which word goes with which noun is what has to be learned.

export type Pair = [vi: string, en: string]

export interface Measure {
  ch: string
  pinyin: string
  /** The Vietnamese classifier it is closest to. */
  vi: string
  /** What it counts. */
  use: Pair
}

export const MEASURES: Measure[] = [
  {
    ch: '个',
    pinyin: 'gè',
    vi: 'cái, người',
    use: ['dùng chung: người, đồ vật, quả…', 'general: people, things, fruit…'],
  },
  { ch: '本', pinyin: 'běn', vi: 'quyển', use: ['sách, vở', 'books, notebooks'] },
  { ch: '杯', pinyin: 'bēi', vi: 'cốc, ly', use: ['đồ uống: một cốc trà', 'drinks: a cup of tea'] },
  {
    ch: '件',
    pinyin: 'jiàn',
    vi: 'chiếc, bộ',
    use: ['quần áo (áo), một việc', 'clothes (tops), a matter'],
  },
  {
    ch: '只',
    pinyin: 'zhī',
    vi: 'con',
    use: ['con vật nhỏ: mèo, chó, chim', 'small animals: cats, dogs, birds'],
  },
  {
    ch: '条',
    pinyin: 'tiáo',
    vi: 'con, cái (vật dài)',
    use: ['vật dài: cá, đường, quần', 'long things: fish, roads, trousers'],
  },
  {
    ch: '张',
    pinyin: 'zhāng',
    vi: 'tờ, tấm, cái',
    use: ['vật phẳng: giấy, vé, bàn, giường', 'flat things: paper, tickets, tables, beds'],
  },
  {
    ch: '块',
    pinyin: 'kuài',
    vi: 'miếng; đồng',
    use: ['miếng, cục; đồng tiền; đồng hồ đeo tay', 'pieces; yuan; wristwatches'],
  },
  {
    ch: '口',
    pinyin: 'kǒu',
    vi: '(người trong nhà)',
    use: ['số người trong gia đình: 三口人', 'members of a family: 三口人'],
  },
]

export interface MeasureItem {
  /** The noun, a headword of the Chinese pack. */
  noun: string
  measure: string
  /** Other measure words a native speaker would also accept — never offered as wrong. */
  also?: string[]
  /** Frame when the noun is not counted with 一 ("我家有三{}人"). */
  frame?: { zh: string; pinyin: string; vi: string }
  vi: string
  tip?: Pair
}

export const MEASURE_ITEMS: MeasureItem[] = [
  { noun: '书', measure: '本', vi: 'một quyển sách' },
  { noun: '老师', measure: '个', vi: 'một thầy giáo' },
  { noun: '朋友', measure: '个', vi: 'một người bạn' },
  { noun: '苹果', measure: '个', vi: 'một quả táo' },
  { noun: '问题', measure: '个', vi: 'một câu hỏi' },
  { noun: '鸡蛋', measure: '个', vi: 'một quả trứng' },
  { noun: '西瓜', measure: '个', vi: 'một quả dưa hấu' },
  {
    noun: '杯子',
    measure: '个',
    vi: 'một cái cốc',
    tip: [
      'Cái cốc (杯子) đếm bằng 个; 杯 là lượng từ cho thứ đựng trong cốc: 一杯茶.',
      'The cup itself (杯子) takes 个; 杯 counts what is in it: 一杯茶.',
    ],
  },
  { noun: '茶', measure: '杯', vi: 'một cốc trà' },
  { noun: '咖啡', measure: '杯', vi: 'một cốc cà phê' },
  { noun: '水', measure: '杯', vi: 'một cốc nước' },
  { noun: '牛奶', measure: '杯', vi: 'một cốc sữa' },
  { noun: '衣服', measure: '件', vi: 'một bộ quần áo' },
  { noun: '猫', measure: '只', vi: 'một con mèo' },
  { noun: '狗', measure: '只', also: ['条'], vi: 'một con chó' },
  { noun: '鱼', measure: '条', also: ['只'], vi: 'một con cá' },
  { noun: '路', measure: '条', vi: 'một con đường' },
  { noun: '桌子', measure: '张', vi: 'một cái bàn' },
  { noun: '票', measure: '张', vi: 'một tấm vé' },
  { noun: '报纸', measure: '张', vi: 'một tờ báo' },
  {
    noun: '事情',
    measure: '件',
    vi: 'một việc',
    tip: ['件 đếm cả việc, chuyện: 一件事情.', '件 also counts matters: 一件事情.'],
  },
  { noun: '孩子', measure: '个', vi: 'một đứa trẻ' },
  { noun: '房间', measure: '个', vi: 'một căn phòng' },
  { noun: '船', measure: '条', also: ['只'], vi: 'một chiếc thuyền' },
  { noun: '手表', measure: '块', also: ['只'], vi: 'một chiếc đồng hồ đeo tay' },
  {
    noun: '钱',
    measure: '块',
    vi: 'một đồng (tệ)',
    tip: ['Nói giá tiền: 三块钱 = ba đồng.', 'Prices: 三块钱 = three yuan.'],
  },
  {
    noun: '人',
    measure: '口',
    also: ['个'],
    frame: { zh: '我家有三{}人。', pinyin: 'Wǒ jiā yǒu sān {} rén.', vi: 'Nhà tôi có ba người.' },
    vi: 'ba người (trong nhà)',
    tip: [
      'Đếm người trong gia đình dùng 口: 我家有三口人.',
      'Family members are counted with 口: 我家有三口人.',
    ],
  },
]

export const measureOf = (ch: string): Measure => MEASURES.find((m) => m.ch === ch)!

/** 一 reads yí before a fourth tone and yì before the others (一个 yí gè, 一本 yì běn). */
export function yiBefore(pinyin: string): string {
  return /[àèìòùǜ]/.test(pinyin) ? 'yí' : 'yì'
}

/** The phrase in characters and pinyin: 一本书 / yì běn shū, or the item's own frame. */
export function phrase(item: MeasureItem, nounPinyin: string): { zh: string; pinyin: string } {
  const m = measureOf(item.measure)
  if (item.frame)
    return {
      zh: item.frame.zh.replace('{}', m.ch),
      pinyin: item.frame.pinyin.replace('{}', m.pinyin),
    }
  return { zh: `一${m.ch}${item.noun}`, pinyin: `${yiBefore(m.pinyin)} ${m.pinyin} ${nounPinyin}` }
}

export interface MeasureQuestion {
  item: MeasureItem
  options: string[]
  answer: number
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * A round: `size` different nouns, each with four measure words to pick from.
 * Wrong options are never ones a speaker would also accept for that noun.
 */
export function measureQuiz(size = 10, random: () => number = Math.random): MeasureQuestion[] {
  return shuffle(MEASURE_ITEMS, random)
    .slice(0, size)
    .map((item) => {
      const wrong = shuffle(
        MEASURES.map((m) => m.ch).filter((c) => c !== item.measure && !item.also?.includes(c)),
        random
      ).slice(0, 3)
      const options = shuffle([item.measure, ...wrong], random)
      return { item, options, answer: options.indexOf(item.measure) }
    })
}

/** XP on the same scale as the pinyin and Hangul quizzes. */
export function measureXp(correct: number, total: number): number {
  return 5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
}
