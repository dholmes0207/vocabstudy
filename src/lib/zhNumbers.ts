// "Nghe số" (docs/design/numbers.md): numbers, prices, clock times and dates
// read aloud in Chinese — the HSK listening parts ask for them all the time,
// and 十四 / 四十 are the classic trap. Everything is generated, so the reading
// rules below are the whole content.

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const PINYIN: Record<string, string> = {
  零: 'líng',
  一: 'yī',
  二: 'èr',
  三: 'sān',
  四: 'sì',
  五: 'wǔ',
  六: 'liù',
  七: 'qī',
  八: 'bā',
  九: 'jiǔ',
  十: 'shí',
  百: 'bǎi',
  两: 'liǎng',
  点: 'diǎn',
  分: 'fēn',
  块: 'kuài',
  月: 'yuè',
  号: 'hào',
  星: 'xīng',
  期: 'qī',
  天: 'tiān',
  半: 'bàn',
}

/** 0–999 in characters: 14 → 十四, 40 → 四十, 105 → 一百零五, 110 → 一百一十. */
export function hanNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new RangeError(String(n))
  if (n < 10) return DIGITS[n]
  if (n < 20) return '十' + (n % 10 ? DIGITS[n % 10] : '')
  if (n < 100) return DIGITS[Math.floor(n / 10)] + '十' + (n % 10 ? DIGITS[n % 10] : '')
  const h = DIGITS[Math.floor(n / 100)] + '百'
  const rest = n % 100
  if (rest === 0) return h
  if (rest < 10) return h + '零' + DIGITS[rest]
  // After 百 the tens keep their 一: 110 is 一百一十, not 一百十.
  return h + (rest < 20 ? '一' : '') + hanNumber(rest)
}

/** Pinyin of a generated phrase, one syllable per character, 一 changing tone before 百. */
export function numberPinyin(han: string): string {
  const chars = [...han]
  return chars.map((c, i) => (c === '一' && chars[i + 1] === '百' ? 'yì' : PINYIN[c])).join(' ')
}

export type NumberKind = 'number' | 'price' | 'time' | 'date' | 'weekday'

export interface NumberItem {
  kind: NumberKind
  /** What the learner picks, in the UI language: "14", "25 tệ", "7:30", "12/3", "Thứ Tư". */
  label: [vi: string, en: string]
  han: string
}

const WEEKDAY_VI = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const same = (x: string): [string, string] => [x, x]

/** 2 is 两 before a measure word or 点: 两块, 两点 (but 十二点, 二十块). */
const counted = (n: number) => (n === 2 ? '两' : hanNumber(n))

export function itemFor(kind: NumberKind, a: number, b = 0): NumberItem {
  switch (kind) {
    case 'number':
      return { kind, label: same(String(a)), han: hanNumber(a) }
    case 'price':
      return { kind, label: [`${a} tệ`, `${a} yuan`], han: counted(a) + '块' }
    case 'time': {
      const min = b === 0 ? '' : b === 30 ? '半' : (b < 10 ? '零' : '') + hanNumber(b) + '分'
      return {
        kind,
        label: same(`${a}:${String(b).padStart(2, '0')}`),
        han: counted(a) + '点' + min,
      }
    }
    case 'date':
      return {
        kind,
        label: [`${b}/${a}`, `${b} ${MONTH_EN[a - 1]}`],
        han: hanNumber(a) + '月' + hanNumber(b) + '号',
      }
    case 'weekday':
      return {
        kind,
        label: [WEEKDAY_VI[a], WEEKDAY_EN[a]],
        han: '星期' + (a === 0 ? '天' : hanNumber(a)),
      }
  }
}

export interface NumberQuestion {
  item: NumberItem
  options: NumberItem[]
  answer: number
}

const pick = (random: () => number, lo: number, hi: number) =>
  lo + Math.floor(random() * (hi - lo + 1))

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Numbers that sound or look like `n`: the digits swapped (14 / 41 / 40), ±10, ±1. */
function nearNumbers(n: number, hi: number): number[] {
  const tens = Math.floor(n / 10) % 10
  const ones = n % 10
  const base = n - (n % 100)
  return [
    base + ones * 10 + tens,
    base + ones * 10,
    base + tens,
    n + 10,
    n - 10,
    n + 1,
    n - 1,
  ].filter((x) => x >= 0 && x <= hi && x !== n)
}

function makeQuestion(kind: NumberKind, random: () => number): NumberQuestion {
  let item: NumberItem
  let near: NumberItem[]
  if (kind === 'number' || kind === 'price') {
    const hi = kind === 'number' ? 199 : 99
    const n = pick(random, 2, hi)
    item = itemFor(kind, n)
    near = nearNumbers(n, hi).map((x) => itemFor(kind, x))
  } else if (kind === 'time') {
    const h = pick(random, 1, 12)
    const m = [0, 5, 10, 15, 20, 30, 40, 45, 50][pick(random, 0, 8)]
    item = itemFor(kind, h, m)
    near = [
      itemFor(kind, h, m === 30 ? 0 : 30),
      itemFor(kind, (h % 12) + 1, m),
      itemFor(kind, h === 1 ? 12 : h - 1, m),
      itemFor(kind, h, m === 15 ? 50 : 15),
    ]
  } else if (kind === 'date') {
    const mo = pick(random, 1, 12)
    const d = pick(random, 1, 28)
    item = itemFor(kind, mo, d)
    near = [
      itemFor(kind, d <= 12 ? d : (mo % 12) + 1, d <= 12 ? mo : d),
      itemFor(kind, mo, (d % 28) + 1),
      itemFor(kind, (mo % 12) + 1, d),
    ]
  } else {
    const w = pick(random, 0, 6)
    item = itemFor(kind, w)
    near = [1, 2, 3, 4, 5, 6, 0].filter((x) => x !== w).map((x) => itemFor(kind, x))
  }
  // The first near miss is the trap the kind is known for (14 / 41, 7:30 / 7:00,
  // 3/12 / 12/3); it always stays, the rest are drawn at random.
  const seen = new Set([item.label[0]])
  const wrong = [near[0], ...shuffle(near.slice(1), random)]
    .filter((o) => o && !seen.has(o.label[0]) && seen.add(o.label[0]))
    .slice(0, 3)
  // A near miss can coincide with the answer (12/12 swapped); top up with any other.
  for (let tries = 0; wrong.length < 3 && tries < 50; tries++) {
    const extra = makeQuestion(kind, random).item
    if (!seen.has(extra.label[0])) {
      seen.add(extra.label[0])
      wrong.push(extra)
    }
  }
  const options = shuffle([item, ...wrong], random)
  return { item, options, answer: options.indexOf(item) }
}

const ROUND_KINDS: NumberKind[] = [
  'number',
  'number',
  'number',
  'price',
  'price',
  'time',
  'time',
  'date',
  'date',
  'weekday',
]

/** A round of ten: three plain numbers, then prices, times, dates and a weekday, shuffled. */
export function numberQuiz(random: () => number = Math.random): NumberQuestion[] {
  return shuffle(
    ROUND_KINDS.map((k) => makeQuestion(k, random)),
    random
  )
}

export function numbersXp(correct: number, total: number): number {
  return 5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
}
