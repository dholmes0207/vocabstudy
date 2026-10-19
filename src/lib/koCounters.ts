// Korean counters, "단위 명사" (docs/design/measure-words.md): a noun, a native
// number in its short form, then the counter — 책 두 권, "hai quyển sách". The
// same idea as Vietnamese classifiers and Chinese measure words, with the
// short-form numbers (한, 두, 세, 네) to practise on the way.

export type Pair = [vi: string, en: string]

export interface Counter {
  ch: string
  /** The Vietnamese classifier it is closest to. */
  vi: string
  use: Pair
}

export const COUNTERS: Counter[] = [
  { ch: '개', vi: 'cái, quả', use: ['đồ vật nói chung, quả', 'things in general, fruit'] },
  { ch: '명', vi: 'người', use: ['người', 'people'] },
  { ch: '마리', vi: 'con', use: ['con vật, cả cá', 'animals, fish too'] },
  { ch: '권', vi: 'quyển', use: ['sách, vở', 'books, notebooks'] },
  { ch: '잔', vi: 'cốc, ly', use: ['đồ uống rót ra cốc', 'a drink in a cup or glass'] },
  { ch: '병', vi: 'chai', use: ['đồ uống cả chai', 'a whole bottle'] },
  { ch: '장', vi: 'tờ, tấm', use: ['giấy, ảnh, vé', 'paper, photos, tickets'] },
  { ch: '대', vi: 'chiếc', use: ['xe, máy móc', 'vehicles, machines'] },
  { ch: '벌', vi: 'bộ', use: ['quần áo', 'clothes'] },
]

export interface CounterItem {
  /** A headword of the Korean pack. */
  noun: string
  counter: string
  /** Counters a native speaker would also accept — never offered as wrong. */
  also?: string[]
  /** Vietnamese noun phrase after the number: "quyển sách". */
  vi: string
  /** English singular and plural. */
  en: [one: string, many: string]
  tip?: Pair
}

export const COUNTER_ITEMS: CounterItem[] = [
  { noun: '사과', counter: '개', vi: 'quả táo', en: ['apple', 'apples'] },
  { noun: '가방', counter: '개', vi: 'cái túi', en: ['bag', 'bags'] },
  {
    noun: '사람',
    counter: '명',
    vi: 'người',
    en: ['person', 'people'],
    tip: ['Nói lịch sự hơn thì dùng 분: 세 분.', 'More politely, use 분: 세 분.'],
  },
  { noun: '학생', counter: '명', vi: 'học sinh', en: ['student', 'students'] },
  { noun: '친구', counter: '명', vi: 'người bạn', en: ['friend', 'friends'] },
  { noun: '책', counter: '권', vi: 'quyển sách', en: ['book', 'books'] },
  { noun: '커피', counter: '잔', vi: 'cốc cà phê', en: ['cup of coffee', 'cups of coffee'] },
  {
    noun: '우유',
    counter: '잔',
    also: ['병'],
    vi: 'cốc sữa',
    en: ['glass of milk', 'glasses of milk'],
  },
  {
    noun: '맥주',
    counter: '병',
    also: ['잔'],
    vi: 'chai bia',
    en: ['bottle of beer', 'bottles of beer'],
    tip: [
      'Bia rót ra cốc thì đếm bằng 잔, cả chai thì bằng 병: 맥주 한 잔 / 맥주 한 병.',
      'Beer in a glass takes 잔, a whole bottle 병: 맥주 한 잔 / 맥주 한 병.',
    ],
  },
  {
    noun: '물',
    counter: '병',
    also: ['잔'],
    vi: 'chai nước',
    en: ['bottle of water', 'bottles of water'],
  },
  { noun: '사진', counter: '장', vi: 'tấm ảnh', en: ['photo', 'photos'] },
  { noun: '컴퓨터', counter: '대', vi: 'chiếc máy tính', en: ['computer', 'computers'] },
  {
    noun: '휴대폰',
    counter: '대',
    also: ['개'],
    vi: 'chiếc điện thoại',
    en: ['phone', 'phones'],
  },
  { noun: '택시', counter: '대', vi: 'chiếc taxi', en: ['taxi', 'taxis'] },
  { noun: '버스', counter: '대', vi: 'chiếc xe buýt', en: ['bus', 'buses'] },
  {
    noun: '옷',
    counter: '벌',
    also: ['개'],
    vi: 'bộ quần áo',
    en: ['set of clothes', 'sets of clothes'],
  },
  {
    noun: '생선',
    counter: '마리',
    vi: 'con cá',
    en: ['fish', 'fish'],
    tip: ['Cá, gà và mọi con vật đều đếm bằng 마리.', 'Fish, chickens and every animal take 마리.'],
  },
]

/** 1–5 before a counter: the short native forms. */
const SHORT = ['', '한', '두', '세', '네', '다섯']
const VI_NUM = ['', 'một', 'hai', 'ba', 'bốn', 'năm']

export const counterOf = (ch: string): Counter => COUNTERS.find((c) => c.ch === ch)!

export interface CounterQuestion {
  item: CounterItem
  /** How many: 1–5, so the short forms 한 / 두 / 세 / 네 come up. */
  n: number
  options: string[]
  answer: number
}

/** "책 두 ___" for the question, "책 두 권" once answered. */
export function counterPhrase(q: Pick<CounterQuestion, 'item' | 'n'>, gap = false): string {
  return `${q.item.noun} ${SHORT[q.n]} ${gap ? '___' : q.item.counter}`
}

/** "hai quyển sách" / "2 books". */
export function counterMeaning(q: Pick<CounterQuestion, 'item' | 'n'>): Pair {
  return [`${VI_NUM[q.n]} ${q.item.vi}`, `${q.n} ${q.item.en[q.n === 1 ? 0 : 1]}`]
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A round of `size` different nouns, four counters each; accepted alternatives never count as wrong. */
export function koCounterQuiz(size = 10, random: () => number = Math.random): CounterQuestion[] {
  return shuffle(COUNTER_ITEMS, random)
    .slice(0, size)
    .map((item) => {
      const wrong = shuffle(
        COUNTERS.map((c) => c.ch).filter((c) => c !== item.counter && !item.also?.includes(c)),
        random
      ).slice(0, 3)
      const options = shuffle([item.counter, ...wrong], random)
      return {
        item,
        n: 1 + Math.floor(random() * 5),
        options,
        answer: options.indexOf(item.counter),
      }
    })
}
