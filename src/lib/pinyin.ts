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
