// "Nghe số" for Korean (docs/design/numbers.md): Korean counts with two sets of
// numbers, and which one a phrase takes is the whole difficulty. Sino-Korean
// (일, 이, 삼…) for money, dates and minutes; native Korean (하나, 둘, 셋…) for
// hours, things and age — in a shortened form before a counter (한 개, 스무 살).
// Everything is generated from the rules below.

export type Pair = [vi: string, en: string]

const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** 0–99,999 in Sino-Korean: 15 → 십오, 3500 → 삼천오백, 15000 → 만 오천. 1 is dropped before 십/백/천/만. */
export function sinoNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99999) throw new RangeError(String(n))
  if (n === 0) return SINO[0]
  const part = (x: number) =>
    (
      [
        [1000, '천'],
        [100, '백'],
        [10, '십'],
      ] as const
    ).reduce(
      (acc, [unit, name]) => {
        const d = Math.floor(acc.rest / unit)
        acc.rest %= unit
        if (d) acc.out += (d === 1 ? '' : SINO[d]) + name
        return acc
      },
      { rest: x, out: '' }
    )
  const man = Math.floor(n / 10000)
  const low = part(n % 10000)
  const tail = low.out + (low.rest ? SINO[low.rest] : '')
  if (!man) return tail
  // Korean writes a space after the 만 group: 만 오천.
  return (man === 1 ? '' : SINO[man]) + '만' + (tail ? ' ' + tail : '')
}

const NATIVE_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']
// Before a counter the first four, and twenty, shorten: 한 개, 두 시, 스무 살.
const ATTRIBUTIVE: Record<string, string> = { 하나: '한', 둘: '두', 셋: '세', 넷: '네' }

/** 1–99 in native Korean; `counted` gives the form used before a counter. */
export function nativeNumber(n: number, counted = false): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new RangeError(String(n))
  const tens = NATIVE_TENS[Math.floor(n / 10)]
  const ones = NATIVE_ONES[n % 10]
  if (!counted) return tens + ones
  if (n === 20) return '스무'
  return tens + (ATTRIBUTIVE[ones] ?? ones)
}

/** Months: 6 and 10 lose a sound — 유월, 시월. */
export function monthName(m: number): string {
  if (m === 6) return '유월'
  if (m === 10) return '시월'
  return sinoNumber(m) + '월'
}

export type KoNumberKind = 'price' | 'time' | 'date' | 'weekday' | 'count' | 'age'

export interface KoNumberItem {
  kind: KoNumberKind
  /** What the learner picks, in the UI language. */
  label: Pair
  /** What is read aloud, in Hangul. */
  han: string
}

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
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
const same = (x: string): Pair => [x, x]

export function itemFor(kind: KoNumberKind, a: number, b = 0): KoNumberItem {
  switch (kind) {
    case 'price':
      return {
        kind,
        label: [`${a.toLocaleString('vi-VN')} won`, `${a.toLocaleString('en-US')} won`],
        han: sinoNumber(a) + ' 원',
      }
    case 'time': {
      const min = b === 0 ? '' : b === 30 ? ' 반' : ` ${sinoNumber(b)} 분`
      return {
        kind,
        label: same(`${a}:${String(b).padStart(2, '0')}`),
        han: `${nativeNumber(a, true)} 시${min}`,
      }
    }
    case 'date':
      return {
        kind,
        label: [`${b}/${a}`, `${b} ${MONTH_EN[a - 1]}`],
        han: `${monthName(a)} ${sinoNumber(b)}일`,
      }
    case 'weekday':
      return { kind, label: [WEEKDAY_VI[a], WEEKDAY_EN[a]], han: WEEKDAYS[a] }
    case 'count':
      return { kind, label: [`${a} cái`, `${a} items`], han: `${nativeNumber(a, true)} 개` }
    case 'age':
      return { kind, label: [`${a} tuổi`, `${a} years old`], han: `${nativeNumber(a, true)} 살` }
  }
}

export interface KoNumberQuestion {
  item: KoNumberItem
  options: KoNumberItem[]
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

/** 14 ↔ 41, ±10, ±1 — the slips a listener makes. */
function nearNumbers(n: number, lo: number, hi: number): number[] {
  const tens = Math.floor(n / 10) % 10
  const ones = n % 10
  const base = n - (n % 100)
  return [base + ones * 10 + tens, n + 10, n - 10, n + 1, n - 1].filter(
    (x) => x >= lo && x <= hi && x !== n
  )
}

function makeQuestion(kind: KoNumberKind, random: () => number): KoNumberQuestion {
  let item: KoNumberItem
  let near: KoNumberItem[]
  if (kind === 'price') {
    // Shop prices: 500–49,500 won in steps of 500.
    const n = pick(random, 1, 99) * 500
    item = itemFor(kind, n)
    near = [n * 10, n + 500, n - 500, n + 1000, Math.round(n / 10 / 500) * 500]
      .filter((x) => x >= 500 && x <= 99999 && x !== n)
      .map((x) => itemFor(kind, x))
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
      // The irregular months sound like their neighbours to a beginner.
      itemFor(kind, mo === 6 ? 7 : mo === 10 ? 4 : (mo % 12) + 1, d),
      itemFor(kind, mo, (d % 28) + 1),
    ]
  } else if (kind === 'weekday') {
    const w = pick(random, 0, 6)
    item = itemFor(kind, w)
    near = [1, 2, 3, 4, 5, 6, 0].filter((x) => x !== w).map((x) => itemFor(kind, x))
  } else {
    const [lo, hi] = kind === 'count' ? [1, 20] : [10, 59]
    const n = pick(random, lo, hi)
    item = itemFor(kind, n)
    near = nearNumbers(n, lo, hi).map((x) => itemFor(kind, x))
  }
  // The first near miss is the trap the kind is known for; it always stays.
  const seen = new Set([item.label[0]])
  const wrong = [near[0], ...shuffle(near.slice(1), random)]
    .filter((o) => o && !seen.has(o.label[0]) && seen.add(o.label[0]))
    .slice(0, 3)
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

const ROUND_KINDS: KoNumberKind[] = [
  'price',
  'price',
  'time',
  'time',
  'date',
  'date',
  'weekday',
  'count',
  'count',
  'age',
]

/** A round of ten across both number sets, shuffled. */
export function koNumberQuiz(random: () => number = Math.random): KoNumberQuestion[] {
  return shuffle(
    ROUND_KINDS.map((k) => makeQuestion(k, random)),
    random
  )
}
