// "Pinyin & thanh điệu" for Vietnamese learners of Chinese (docs/design/chinese.md).
// Hints compare each sound with Vietnamese; the voice is the browser's zh-CN,
// reading single characters (妈 / 麻 / 马 / 骂).

export type Pair = [vi: string, en: string]

export interface Tone {
  /** 1–4, or 5 for the neutral tone. */
  n: 1 | 2 | 3 | 4 | 5
  /** The tone mark on "a": ā á ǎ à, and plain "a" for the neutral tone. */
  mark: string
  /** A character to play, its pinyin and meaning. */
  char: string
  read: string
  meaning: string
  how: Pair
}

export const TONES: Tone[] = [
  {
    n: 1,
    mark: 'ā',
    char: '妈',
    read: 'mā',
    meaning: 'mẹ',
    how: [
      'Cao và bằng, giữ giọng như hát một nốt cao — gần thanh ngang nhưng cao hơn.',
      'High and level, like holding a high note.',
    ],
  },
  {
    n: 2,
    mark: 'á',
    char: '麻',
    read: 'má',
    meaning: 'tê; cây gai',
    how: [
      'Đi lên từ giữa lên cao — gần thanh sắc.',
      'Rising from the middle to the top, like asking "huh?".',
    ],
  },
  {
    n: 3,
    mark: 'ǎ',
    char: '马',
    read: 'mǎ',
    meaning: 'con ngựa',
    how: [
      'Xuống thấp rồi vòng lên — gần thanh hỏi. Trong câu thường chỉ đọc nửa đầu (thấp).',
      'Dipping low and rising again; in a sentence often just the low part.',
    ],
  },
  {
    n: 4,
    mark: 'à',
    char: '骂',
    read: 'mà',
    meaning: 'mắng',
    how: [
      'Rơi mạnh từ cao xuống thấp, dứt khoát — như khi ra lệnh.',
      'Falling sharply from high to low, like a firm "No!".',
    ],
  },
  {
    n: 5,
    mark: 'a',
    char: '吗',
    read: 'ma',
    meaning: 'trợ từ hỏi',
    how: ['Thanh nhẹ: ngắn, nhẹ, không có dấu.', 'Neutral tone: short and light, no mark.'],
  },
]

export interface Sound {
  /** The pinyin letters. */
  ch: string
  hint: Pair
  /** A character with this sound, and its pinyin. */
  char: string
  read: string
  /** A word of the Chinese pack that uses it. */
  word?: string
}

/** The 21 initials (thanh mẫu), in the usual teaching order. */
export const INITIALS: Sound[] = [
  {
    ch: 'b',
    hint: ['Gần "p", không bật hơi.', 'An unaspirated "p".'],
    char: '爸',
    read: 'bà',
    word: '爸爸',
  },
  {
    ch: 'p',
    hint: ['"p" bật hơi mạnh.', '"p" with a strong puff of air.'],
    char: '朋',
    read: 'péng',
    word: '朋友',
  },
  { ch: 'm', hint: ['Như "m".', 'Like "m".'], char: '妈', read: 'mā', word: '妈妈' },
  { ch: 'f', hint: ['Như "ph".', 'Like "f".'], char: '饭', read: 'fàn', word: '饭店' },
  {
    ch: 'd',
    hint: ['Gần "t", không bật hơi.', 'An unaspirated "t".'],
    char: '大',
    read: 'dà',
    word: '大',
  },
  {
    ch: 't',
    hint: ['Như "th" (bật hơi).', '"t" with a puff of air.'],
    char: '他',
    read: 'tā',
    word: '他',
  },
  { ch: 'n', hint: ['Như "n".', 'Like "n".'], char: '你', read: 'nǐ', word: '你' },
  { ch: 'l', hint: ['Như "l".', 'Like "l".'], char: '来', read: 'lái', word: '来' },
  {
    ch: 'g',
    hint: ['Gần "c / k", không bật hơi.', 'An unaspirated "k".'],
    char: '个',
    read: 'gè',
    word: '个',
  },
  {
    ch: 'k',
    hint: ['Như "kh" bật hơi.', '"k" with a puff of air.'],
    char: '看',
    read: 'kàn',
    word: '看',
  },
  {
    ch: 'h',
    hint: ['Giữa "h" và "kh".', 'Between "h" and a throaty "kh".'],
    char: '好',
    read: 'hǎo',
    word: '好',
  },
  {
    ch: 'j',
    hint: ['Gần "ch", mặt lưỡi áp lên vòm miệng.', 'A soft "j", tongue flat against the palate.'],
    char: '家',
    read: 'jiā',
    word: '家',
  },
  {
    ch: 'q',
    hint: ['Như j nhưng bật hơi.', 'Like j with a puff of air.'],
    char: '去',
    read: 'qù',
    word: '去',
  },
  {
    ch: 'x',
    hint: ['Gần "x", môi dẹt.', 'A light "sh" with flat lips.'],
    char: '写',
    read: 'xiě',
    word: '写',
  },
  {
    ch: 'zh',
    hint: ['Gần "tr", uốn lưỡi.', '"j" with the tongue curled back.'],
    char: '中',
    read: 'zhōng',
    word: '中国',
  },
  {
    ch: 'ch',
    hint: ['Như zh nhưng bật hơi.', 'Like zh with a puff of air.'],
    char: '茶',
    read: 'chá',
    word: '茶',
  },
  {
    ch: 'sh',
    hint: ['Gần "s", uốn lưỡi.', '"sh" with the tongue curled back.'],
    char: '是',
    read: 'shì',
    word: '是',
  },
  {
    ch: 'r',
    hint: ['Gần "r", lưỡi uốn, không rung.', 'A curled-tongue "r", not rolled.'],
    char: '人',
    read: 'rén',
    word: '人',
  },
  {
    ch: 'z',
    hint: ['Gần "ch" đầu lưỡi, không bật hơi.', 'Like "ds" in "kids".'],
    char: '在',
    read: 'zài',
    word: '在',
  },
  {
    ch: 'c',
    hint: ['Như z nhưng bật hơi.', 'Like "ts" with a puff of air.'],
    char: '菜',
    read: 'cài',
    word: '菜',
  },
  { ch: 's', hint: ['Như "x".', 'Like "s".'], char: '三', read: 'sān', word: '三' },
]

/** Finals (vận mẫu) that trip Vietnamese speakers up. */
export const TRICKY_FINALS: Sound[] = [
  {
    ch: 'e',
    hint: ['Gần "ưa" / "ơ" — không phải "e" tiếng Việt.', 'Like "uh" — not the "e" in "bed".'],
    char: '喝',
    read: 'hē',
    word: '喝',
  },
  {
    ch: 'ü',
    hint: ['Nói "i" rồi chu tròn môi (gần "uy").', 'Say "ee" with rounded lips.'],
    char: '女',
    read: 'nǚ',
    word: '女儿',
  },
  { ch: 'ou', hint: ['Gần "âu".', 'Like "oh".'], char: '都', read: 'dōu', word: '都' },
  { ch: 'ei', hint: ['Gần "ây".', 'Like "ay" in "day".'], char: '谁', read: 'shéi', word: '谁' },
  { ch: 'ie', hint: ['Như "iê".', 'Like "yeh".'], char: '写', read: 'xiě', word: '写' },
  { ch: 'uo', hint: ['Như "ua" / "uô".', 'Like "waw".'], char: '说', read: 'shuō', word: '说' },
  {
    ch: 'an · ang',
    hint: [
      'an (三 sān) kết bằng "n"; ang (商 shāng) mở miệng, kết bằng "ng".',
      'an ends in "n"; ang opens wide and ends in "ng".',
    ],
    char: '商',
    read: 'shāng',
    word: '商店',
  },
  {
    ch: 'en · eng',
    hint: ['en (人 rén) gần "ân"; eng (朋 péng) gần "âng".', 'en like "un"; eng like "ung".'],
    char: '朋',
    read: 'péng',
    word: '朋友',
  },
  {
    ch: 'er',
    hint: ['"ơ" rồi uốn lưỡi lên.', '"uh" with the tongue curled up.'],
    char: '二',
    read: 'èr',
    word: '二',
  },
]

/** Tone changes in connected speech (biến điệu). */
export const SANDHI: { rule: Pair; example: string; read: string; said: string }[] = [
  {
    rule: [
      'Hai thanh 3 liền nhau: chữ đầu đọc thành thanh 2.',
      'Two third tones in a row: the first becomes a second tone.',
    ],
    example: '你好',
    read: 'nǐ hǎo',
    said: 'ní hǎo',
  },
  {
    rule: ['不 (bù) đứng trước thanh 4 đọc thành bú.', '不 (bù) before a fourth tone becomes bú.'],
    example: '不客气',
    read: 'bù kèqi',
    said: 'bú kèqi',
  },
  {
    rule: [
      '一 (yī) trước thanh 4 đọc yí, trước thanh khác đọc yì.',
      '一 (yī) becomes yí before a fourth tone, yì before the others.',
    ],
    example: '一个',
    read: 'yī gè',
    said: 'yí gè',
  },
]

const MARKS: Record<string, 1 | 2 | 3 | 4> = {
  ā: 1,
  ē: 1,
  ī: 1,
  ō: 1,
  ū: 1,
  ǖ: 1,
  á: 2,
  é: 2,
  í: 2,
  ó: 2,
  ú: 2,
  ǘ: 2,
  ǎ: 3,
  ě: 3,
  ǐ: 3,
  ǒ: 3,
  ǔ: 3,
  ǚ: 3,
  à: 4,
  è: 4,
  ì: 4,
  ò: 4,
  ù: 4,
  ǜ: 4,
}

/** The tone of one pinyin syllable: 1–4 from its mark, 5 when it has none. */
export function toneOf(syllable: string): 1 | 2 | 3 | 4 | 5 {
  for (const c of syllable.normalize('NFC').toLowerCase()) if (MARKS[c]) return MARKS[c]
  return 5
}

// ---------------------------------------------------------------------------
// Quick check: read the tone mark of a character, read a whole word.
// ---------------------------------------------------------------------------

export interface ZhWord {
  word: string
  viRead: string
  meaning: string
}

export type PinyinQuestion =
  | { kind: 'tone'; prompt: string; reading: string; answer: 1 | 2 | 3 | 4 | 5; note: string }
  | { kind: 'word'; prompt: string; options: string[]; answer: number; note: string }
  /**
   * Hear the word, pick its tones: the options differ only in tone marks.
   * `pair` names its tones ("3-5" for xǐhuan), to tell which pairs get mixed up.
   */
  | { kind: 'ear'; prompt: string; options: string[]; answer: number; note: string; pair: string }
  /** How a word is said once its tones change in speech (一, 不, 3 + 3). */
  | { kind: 'sandhi'; prompt: string; options: string[]; answer: number; note: string }

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const HAN_ONLY = /^\p{Script=Han}+$/u

/**
 * Half tone questions on one-character words (one character, one syllable, so
 * no splitting "xǐhuan"), half "which pinyin is this word?" with distractors
 * of the same length. Every pool is shuffled once, so it always finishes.
 */
export function pinyinQuiz(
  words: ZhWord[],
  count = 10,
  rand: () => number = Math.random
): PinyinQuestion[] {
  const usable = words.filter((w) => HAN_ONLY.test(w.word) && w.viRead.trim())
  const single = usable.filter((w) => [...w.word].length === 1 && !/\s/.test(w.viRead))
  const multi = usable.filter((w) => [...w.word].length > 1)
  const nTone = Math.min(Math.ceil(count / 2), single.length)
  const out: PinyinQuestion[] = shuffle(single, rand)
    .slice(0, nTone)
    .map((w) => ({
      kind: 'tone' as const,
      prompt: w.word,
      reading: w.viRead,
      answer: toneOf(w.viRead),
      note: w.meaning,
    }))
  for (const w of shuffle(multi, rand).slice(0, count - out.length)) {
    const same = multi.filter((o) => [...o.word].length === [...w.word].length)
    const pool = (same.length >= 4 ? same : multi).map((o) => o.viRead)
    const others = shuffle(
      [...new Set(pool)].filter((r) => r !== w.viRead),
      rand
    ).slice(0, 3)
    const options = shuffle([w.viRead, ...others], rand)
    out.push({
      kind: 'word',
      prompt: w.word,
      options,
      answer: options.indexOf(w.viRead),
      note: w.meaning,
    })
  }
  return shuffle(out, rand)
}

/** XP for a quick check: a little for trying, more for each right answer. */
export function pinyinXp(correct: number, total: number): number {
  return 5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
}

// "Nghe chọn thanh" (docs/design/chinese.md, bước 12): ear training on tone
// pairs. Each tone-marked vowel is swapped for the same vowel in another tone.

const MARKED: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}
const MARK_OF = new Map(
  Object.entries(MARKED).flatMap(([base, forms]) =>
    forms.map((f, t) => [f, { base, tone: t + 1 }] as const)
  )
)

/**
 * Up to `n` readings that differ from `reading` in tones only ("xǐhuan" →
 * "xīhuan", "xíhuan", "xìhuan"). Neutral syllables stay neutral.
 */
export function toneVariants(reading: string, n = 3, rand: () => number = Math.random): string[] {
  const chars = [...reading]
  const at = chars.flatMap((c, i) => (MARK_OF.has(c) ? [i] : []))
  if (!at.length) return []
  const combos: number[][] = [[]]
  for (let k = 0; k < at.length; k++) {
    const grown: number[][] = []
    for (const c of combos) for (let t = 1; t <= 4; t++) grown.push([...c, t])
    combos.splice(0, combos.length, ...grown)
  }
  const spell = (tones: number[]) => {
    const out = [...chars]
    at.forEach((i, k) => (out[i] = MARKED[MARK_OF.get(chars[i])!.base][tones[k] - 1]))
    return out.join('')
  }
  const all = [...new Set(combos.map(spell))].filter((r) => r !== reading)
  return shuffle(all, rand).slice(0, n)
}

/**
 * Two third tones in a row are said 2 + 3 (nǐ hǎo sounds ní hǎo), so the ear
 * cannot tell the written form from a "wrong" option: such words are left out.
 */
export function hasThirdToneRun(reading: string): boolean {
  const tones = [...reading].flatMap((c) => (MARK_OF.has(c) ? [MARK_OF.get(c)!.tone] : []))
  return tones.some((t, i) => t === 3 && tones[i + 1] === 3)
}

/**
 * The tones of a two-syllable reading, 5 for a neutral second syllable
 * ("lǎoshī" → [3, 1], "xǐhuan" → [3, 5]); null when it does not read as two.
 */
export function tonePair(reading: string): [number, number] | null {
  const tones = [...reading.normalize('NFC')].flatMap((c) =>
    MARK_OF.has(c) ? [MARK_OF.get(c)!.tone] : []
  )
  if (tones.length === 2) return [tones[0], tones[1]]
  if (tones.length === 1) return [tones[0], 5]
  return null
}

/** "3-5": the key of a tone pair. */
export const pairKey = (pair: readonly number[]) => pair.join('-')

/** The 20 pairs a two-syllable word can carry: tones 1–4, then 1–4 or neutral. */
export const TONE_PAIRS: [number, number][] = [1, 2, 3, 4].flatMap((a) =>
  [1, 2, 3, 4, 5].map((b): [number, number] => [a, b])
)

/**
 * Two characters read as two syllables, no proper name (a capital in the
 * reading): the words tone pairs are drilled on. 哪儿 nǎr is one syllable
 * (the 儿 only curls the tongue); 女儿 nǚ'ér is two, and pinyin then always
 * sets the ér apart with an apostrophe.
 */
function isPairWord(w: ZhWord): boolean {
  return (
    [...w.word].length === 2 &&
    HAN_ONLY.test(w.word) &&
    !/[A-ZĀÁǍÀĒÉĚÈŌÓǑÒ]/.test(w.viRead) &&
    !(w.word.endsWith('儿') && !/['’ ][eēéěè]r$/.test(w.viRead)) &&
    tonePair(w.viRead) !== null
  )
}

/** Up to `per` words of the pack for each of the 20 tone pairs, in pack order. */
export function tonePairTable(
  words: ZhWord[],
  per = 2
): { pair: [number, number]; words: ZhWord[] }[] {
  const byPair = new Map<string, ZhWord[]>()
  for (const w of words) {
    if (!isPairWord(w)) continue
    const key = pairKey(tonePair(w.viRead)!)
    const list = byPair.get(key) ?? []
    if (list.length < per) byPair.set(key, [...list, w])
  }
  return TONE_PAIRS.map((pair) => ({ pair, words: byPair.get(pairKey(pair)) ?? [] }))
}

/**
 * A listening round on two-character words: hear it, pick the tones. The words
 * are spread over as many tone pairs as the round has questions, so the end of
 * a round can say which pairs the learner mixes up.
 */
export function earQuiz(
  words: ZhWord[],
  count = 10,
  rand: () => number = Math.random
): PinyinQuestion[] {
  const pool = words.filter(
    (w) =>
      isPairWord(w) && !hasThirdToneRun(w.viRead) && toneVariants(w.viRead, 3, rand).length === 3
  )
  const groups = new Map<string, ZhWord[]>()
  for (const w of shuffle(pool, rand)) {
    const key = pairKey(tonePair(w.viRead)!)
    groups.set(key, [...(groups.get(key) ?? []), w])
  }
  const queues = shuffle([...groups.values()], rand)
  const picked: ZhWord[] = []
  while (picked.length < count && queues.some((q) => q.length)) {
    for (const q of queues) if (q.length && picked.length < count) picked.push(q.shift()!)
  }
  return shuffle(picked, rand).map((w) => {
    const options = shuffle([w.viRead, ...toneVariants(w.viRead, 3, rand)], rand)
    return {
      kind: 'ear' as const,
      prompt: w.word,
      options,
      answer: options.indexOf(w.viRead),
      note: w.meaning,
      pair: pairKey(tonePair(w.viRead)!),
    }
  })
}

/**
 * The tone pairs a round got wrong, worst first: [pair, wrong, asked].
 * Pairs answered right every time are left out.
 */
export function missedPairs(results: { pair: string; ok: boolean }[]): [string, number, number][] {
  const tally = new Map<string, [number, number]>()
  for (const r of results) {
    const [wrong, asked] = tally.get(r.pair) ?? [0, 0]
    tally.set(r.pair, [wrong + (r.ok ? 0 : 1), asked + 1])
  }
  return [...tally]
    .filter(([, [wrong]]) => wrong > 0)
    .map(([pair, [wrong, asked]]): [string, number, number] => [pair, wrong, asked])
    .sort((a, b) => b[1] / b[2] - a[1] / a[2] || b[1] - a[1])
}

// "Luyện biến điệu" (docs/design/chinese.md): how 一, 不 and two third tones
// change in speech. Each item gives the spoken reading first, then the
// readings a learner might say instead (the written tone among them).

type SandhiRule = 'yi' | 'bu' | 'three'

const SANDHI_NOTES: Record<SandhiRule, Pair> = {
  yi: [
    '一 trước thanh 4 đọc yí, trước thanh 1, 2, 3 đọc yì; đứng một mình, ở cuối hay chỉ số thứ tự thì giữ yī.',
    '一 is yí before a fourth tone and yì before the others; alone, at the end or as a number in order it stays yī.',
  ],
  bu: [
    '不 trước thanh 4 đọc bú; trước thanh 1, 2, 3 giữ bù.',
    '不 is bú before a fourth tone; before the others it stays bù.',
  ],
  three: [
    'Hai thanh 3 liền nhau: chữ đầu đọc thành thanh 2 (pinyin vẫn viết thanh 3).',
    'Two third tones in a row: the first is said as a second tone (pinyin still writes a third).',
  ],
}

/** Word, the rule it shows, its spoken reading, then wrong ones. */
export const SANDHI_DRILL: { zh: string; rule: SandhiRule; said: string; wrong: string[] }[] = [
  { zh: '一起', rule: 'yi', said: 'yìqǐ', wrong: ['yíqǐ', 'yīqǐ'] },
  { zh: '一个', rule: 'yi', said: 'yí gè', wrong: ['yì gè', 'yī gè'] },
  { zh: '一天', rule: 'yi', said: 'yì tiān', wrong: ['yí tiān', 'yī tiān'] },
  { zh: '一年', rule: 'yi', said: 'yì nián', wrong: ['yí nián', 'yī nián'] },
  { zh: '一样', rule: 'yi', said: 'yíyàng', wrong: ['yìyàng', 'yīyàng'] },
  { zh: '一下', rule: 'yi', said: 'yíxià', wrong: ['yìxià', 'yīxià'] },
  { zh: '一共', rule: 'yi', said: 'yígòng', wrong: ['yìgòng', 'yīgòng'] },
  { zh: '一般', rule: 'yi', said: 'yìbān', wrong: ['yíbān', 'yībān'] },
  { zh: '第一', rule: 'yi', said: 'dì yī', wrong: ['dì yí', 'dì yì'] },
  { zh: '十一', rule: 'yi', said: 'shíyī', wrong: ['shíyí', 'shíyì'] },
  { zh: '不是', rule: 'bu', said: 'bú shì', wrong: ['bù shì'] },
  { zh: '不去', rule: 'bu', said: 'bú qù', wrong: ['bù qù'] },
  { zh: '不对', rule: 'bu', said: 'bú duì', wrong: ['bù duì'] },
  { zh: '不要', rule: 'bu', said: 'bú yào', wrong: ['bù yào'] },
  { zh: '不好', rule: 'bu', said: 'bù hǎo', wrong: ['bú hǎo'] },
  { zh: '不来', rule: 'bu', said: 'bù lái', wrong: ['bú lái'] },
  { zh: '不吃', rule: 'bu', said: 'bù chī', wrong: ['bú chī'] },
  { zh: '你好', rule: 'three', said: 'ní hǎo', wrong: ['nǐ hǎo', 'nǐ háo'] },
  { zh: '很好', rule: 'three', said: 'hén hǎo', wrong: ['hěn hǎo', 'hěn háo'] },
  { zh: '可以', rule: 'three', said: 'kéyǐ', wrong: ['kěyǐ', 'kěyí'] },
  { zh: '水果', rule: 'three', said: 'shuíguǒ', wrong: ['shuǐguǒ', 'shuǐguó'] },
  { zh: '老板', rule: 'three', said: 'láobǎn', wrong: ['lǎobǎn', 'lǎobán'] },
]

/**
 * A round of `count` tone-change questions, spread over the three rules: the
 * word, its spoken reading among the readings a learner might say instead.
 */
export function sandhiQuiz(
  count = 10,
  t: (vi: string, en: string) => string = (vi) => vi,
  rand: () => number = Math.random
): PinyinQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  // Deal from each rule in turn so a round covers all three.
  const decks = (['yi', 'bu', 'three'] as const).map((r) =>
    shuffle(SANDHI_DRILL.filter((d) => d.rule === r))
  )
  const picked: typeof SANDHI_DRILL = []
  for (let i = 0; picked.length < count && decks.some((d) => d.length > i); i++)
    for (const d of decks) if (d[i] && picked.length < count) picked.push(d[i])
  return shuffle(picked).map((d) => {
    const options = shuffle([d.said, ...d.wrong])
    return {
      kind: 'sandhi',
      prompt: d.zh,
      options,
      answer: options.indexOf(d.said),
      note: `${d.said} · ${t(...SANDHI_NOTES[d.rule])}`,
    }
  })
}
