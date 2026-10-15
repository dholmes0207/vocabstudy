// The Hangul alphabet for Vietnamese learners (docs/design/hangul.md).
// Readings follow the same Vietnamese-style spelling as public/data/ko.json:
// ㅅ → "x", ㅈ → "ch", ㅓ → "ơ", a stop at the end of a block takes a sắc mark.

export type Pair = [vi: string, en: string]

export interface Jamo {
  ch: string
  /** How it sounds, written the Vietnamese way. Unique within its group. */
  vi: string
  /** The letter's Korean name (consonants only). */
  name?: string
  /** A syllable to play aloud: a lone letter is not something a voice can say. */
  sample: string
  /** A word from the Korean pack that contains the letter, when the pack has one. */
  word?: string
  tip?: Pair
}

export const VOWELS: Jamo[] = [
  { ch: 'ㅏ', vi: 'a', sample: '아', word: '아빠' },
  { ch: 'ㅑ', vi: 'ya', sample: '야', word: '하얀색' },
  { ch: 'ㅓ', vi: 'ơ', sample: '어', word: '어디' },
  { ch: 'ㅕ', vi: 'yơ', sample: '여', word: '여름' },
  { ch: 'ㅗ', vi: 'ô', sample: '오', word: '오늘' },
  { ch: 'ㅛ', vi: 'yô', sample: '요', word: '요리하다' },
  { ch: 'ㅜ', vi: 'u', sample: '우', word: '우유' },
  { ch: 'ㅠ', vi: 'yu', sample: '유', word: '우유' },
  { ch: 'ㅡ', vi: 'ư', sample: '으', word: '음악' },
  { ch: 'ㅣ', vi: 'i', sample: '이', word: '이름' },
]

export const CONSONANTS: Jamo[] = [
  {
    ch: 'ㄱ',
    vi: 'c / g',
    name: '기역',
    sample: '가',
    word: '가방',
    tip: [
      'Đầu từ đọc gần "c", giữa từ đọc "g".',
      'Like "k" at the start of a word, "g" inside it.',
    ],
  },
  { ch: 'ㄴ', vi: 'n', name: '니은', sample: '나', word: '나라' },
  {
    ch: 'ㄷ',
    vi: 't / đ',
    name: '디귿',
    sample: '다',
    word: '돈',
    tip: [
      'Đầu từ đọc gần "t", giữa từ đọc "đ".',
      'Like "t" at the start of a word, "d" inside it.',
    ],
  },
  {
    ch: 'ㄹ',
    vi: 'r / l',
    name: '리을',
    sample: '라',
    word: '라면',
    tip: [
      'Đứng trước nguyên âm đọc "r", ở cuối chữ đọc "l".',
      'An "r" before a vowel, an "l" at the end.',
    ],
  },
  { ch: 'ㅁ', vi: 'm', name: '미음', sample: '마', word: '물' },
  { ch: 'ㅂ', vi: 'b', name: '비읍', sample: '바', word: '바다' },
  { ch: 'ㅅ', vi: 'x', name: '시옷', sample: '사', word: '사람' },
  {
    ch: 'ㅇ',
    vi: 'câm / ng',
    name: '이응',
    sample: '아',
    word: '아이',
    tip: [
      'Đứng đầu thì câm (chỉ để giữ chỗ), đứng cuối đọc "ng".',
      'Silent at the start (a placeholder), "ng" at the end.',
    ],
  },
  { ch: 'ㅈ', vi: 'ch', name: '지읒', sample: '자', word: '지금' },
  {
    ch: 'ㅊ',
    vi: 'ch (bật hơi)',
    name: '치읓',
    sample: '차',
    word: '친구',
    tip: ['Như ㅈ nhưng bật mạnh hơi ra.', 'Like ㅈ with a strong puff of air.'],
  },
  { ch: 'ㅋ', vi: 'kh', name: '키읔', sample: '카', word: '커피' },
  { ch: 'ㅌ', vi: 'th', name: '티읕', sample: '타', word: '택시' },
  { ch: 'ㅍ', vi: 'ph', name: '피읖', sample: '파', word: '파란색' },
  { ch: 'ㅎ', vi: 'h', name: '히읗', sample: '하', word: '학교' },
]

/** Tense (doubled) consonants: said with a tight throat and no puff of air. */
export const TENSE: Jamo[] = [
  { ch: 'ㄲ', vi: 'c căng', name: '쌍기역', sample: '까', word: '잠깐만요' },
  { ch: 'ㄸ', vi: 't căng', name: '쌍디귿', sample: '따' },
  { ch: 'ㅃ', vi: 'p căng', name: '쌍비읍', sample: '빠', word: '아빠' },
  { ch: 'ㅆ', vi: 'x căng', name: '쌍시옷', sample: '싸', word: '싸다' },
  { ch: 'ㅉ', vi: 'ch căng', name: '쌍지읒', sample: '짜' },
]

export const COMPOUND_VOWELS: Jamo[] = [
  { ch: 'ㅐ', vi: 'e', sample: '애', word: '배' },
  { ch: 'ㅒ', vi: 'ye', sample: '얘' },
  {
    ch: 'ㅔ',
    vi: 'ê',
    sample: '에',
    word: '네',
    tip: ['Ngày nay ㅐ và ㅔ đọc gần như giống nhau.', 'Today ㅐ and ㅔ sound almost the same.'],
  },
  { ch: 'ㅖ', vi: 'yê', sample: '예', word: '예쁘다' },
  { ch: 'ㅘ', vi: 'oa', sample: '와', word: '과일' },
  { ch: 'ㅙ', vi: 'uê (ㅙ)', sample: '왜', word: '왜' },
  {
    ch: 'ㅚ',
    vi: 'uê (ㅚ)',
    sample: '외',
    word: '회사',
    tip: ['ㅙ, ㅚ, ㅞ đều đọc gần "uê".', 'ㅙ, ㅚ and ㅞ all sound close to "we".'],
  },
  { ch: 'ㅝ', vi: 'uơ', sample: '워', word: '병원' },
  { ch: 'ㅞ', vi: 'uê (ㅞ)', sample: '웨' },
  { ch: 'ㅟ', vi: 'uy', sample: '위', word: '쉬다' },
  { ch: 'ㅢ', vi: 'ưi', sample: '의', word: '의사' },
]

/** Final consonants (받침) collapse into seven sounds. */
export const FINAL_SOUNDS: { sound: string; letters: string; word: string; read: string }[] = [
  { sound: 'c', letters: 'ㄱ ㅋ ㄲ', word: '책', read: 'chéc' },
  { sound: 'n', letters: 'ㄴ', word: '돈', read: 'tôn' },
  { sound: 't', letters: 'ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ', word: '옷', read: 'ốt' },
  { sound: 'l', letters: 'ㄹ', word: '물', read: 'mul' },
  { sound: 'm', letters: 'ㅁ', word: '밤', read: 'bam' },
  { sound: 'p', letters: 'ㅂ ㅍ', word: '밥', read: 'báp' },
  { sound: 'ng', letters: 'ㅇ', word: '방', read: 'bang' },
]

// ---------------------------------------------------------------------------
// Building syllable blocks. Unicode lays every block out as
// 0xAC00 + (initial × 21 + vowel) × 28 + final.
// ---------------------------------------------------------------------------

export const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('')
export const MEDIALS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('')
/** Index 0 is "no final consonant"; only single letters are offered in the app. */
export const FINALS = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split('')]

const BASE = 0xac00
const LAST = 0xd7a3

export function compose(initial: string, medial: string, final = ''): string | null {
  const i = INITIALS.indexOf(initial)
  const m = MEDIALS.indexOf(medial)
  const f = FINALS.indexOf(final)
  if (i < 0 || m < 0 || f < 0) return null
  return String.fromCharCode(BASE + (i * 21 + m) * 28 + f)
}

export function decompose(
  syllable: string
): { initial: string; medial: string; final: string } | null {
  const code = syllable.charCodeAt(0)
  if (syllable.length !== 1 || code < BASE || code > LAST) return null
  const n = code - BASE
  return {
    initial: INITIALS[Math.floor(n / 588)],
    medial: MEDIALS[Math.floor((n % 588) / 28)],
    final: FINALS[n % 28],
  }
}

// ---------------------------------------------------------------------------
// Reading a single block, the way the pack spells it.
// ---------------------------------------------------------------------------

// prettier-ignore
const INITIAL_READ: Record<string, string> = {
  ㄱ: 'c', ㄲ: 'c', ㄴ: 'n', ㄷ: 't', ㄸ: 't', ㄹ: 'r', ㅁ: 'm', ㅂ: 'b', ㅃ: 'p', ㅅ: 'x',
  ㅆ: 'x', ㅇ: '', ㅈ: 'ch', ㅉ: 'ch', ㅊ: 'ch', ㅋ: 'kh', ㅌ: 'th', ㅍ: 'ph', ㅎ: 'h',
}

// prettier-ignore
const MEDIAL_READ: Record<string, string> = {
  ㅏ: 'a', ㅐ: 'e', ㅑ: 'ya', ㅒ: 'ye', ㅓ: 'ơ', ㅔ: 'ê', ㅕ: 'yơ', ㅖ: 'yê', ㅗ: 'ô', ㅘ: 'oa',
  ㅙ: 'uê', ㅚ: 'uê', ㅛ: 'yô', ㅜ: 'u', ㅝ: 'uơ', ㅞ: 'uê', ㅟ: 'uy', ㅠ: 'yu', ㅡ: 'ư', ㅢ: 'ưi',
  ㅣ: 'i',
}

/** The seven final sounds; `stop` finals take a sắc mark ("밥" → "báp"). */
// prettier-ignore
const FINAL_READ: Record<string, { s: string; stop: boolean }> = {
  ㄱ: { s: 'c', stop: true }, ㄲ: { s: 'c', stop: true }, ㅋ: { s: 'c', stop: true },
  ㄴ: { s: 'n', stop: false }, ㄹ: { s: 'l', stop: false }, ㅁ: { s: 'm', stop: false },
  ㅂ: { s: 'p', stop: true }, ㅍ: { s: 'p', stop: true }, ㅇ: { s: 'ng', stop: false },
  ㄷ: { s: 't', stop: true }, ㅅ: { s: 't', stop: true }, ㅆ: { s: 't', stop: true },
  ㅈ: { s: 't', stop: true }, ㅊ: { s: 't', stop: true }, ㅌ: { s: 't', stop: true },
  ㅎ: { s: 't', stop: true },
}

// prettier-ignore
const ACUTE: Record<string, string> = {
  a: 'á', e: 'é', ê: 'ế', i: 'í', o: 'ó', ô: 'ố', ơ: 'ớ', u: 'ú', ư: 'ứ', y: 'ý',
}

/**
 * A block read on its own, Vietnamese style: 가 → "ca", 기 → "ki", 한 → "han",
 * 밥 → "báp". Sound changes between blocks (liaison, tensing) are not applied.
 */
export function readSyllable(syllable: string): string | null {
  const parts = decompose(syllable)
  if (!parts) return null
  let head = INITIAL_READ[parts.initial]
  const vowel = MEDIAL_READ[parts.medial]
  // Vietnamese spelling writes k, not c, before i / e / ê / y.
  if (head === 'c' && /^[ieêy]/.test(vowel)) head = 'k'
  if (!parts.final) return head + vowel
  const fin = FINAL_READ[parts.final]
  if (!fin) return null
  let nucleus = vowel
  if (fin.stop) {
    const at = Math.max(...[...vowel].map((c, i) => (ACUTE[c] ? i : -1)))
    nucleus = vowel.slice(0, at) + ACUTE[vowel[at]] + vowel.slice(at + 1)
  }
  return head + nucleus + fin.s
}

// ---------------------------------------------------------------------------
// Quick check: see a letter or a block, pick how it sounds.
// ---------------------------------------------------------------------------

export interface HangulQuestion {
  prompt: string
  /** Text to play aloud with the prompt. */
  say: string
  options: string[]
  answer: number
  kind: 'letter' | 'syllable' | 'word'
  /** Shown once answered: what a word question's word means. */
  note?: string
}

/** A pack word to read: its Hangul and how the pack says it is pronounced. */
export interface ReadableWord {
  word: string
  viRead: string
  meaning: string
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function withDistractors(right: string, pool: string[], rand: () => number) {
  const others = shuffle(
    [...new Set(pool)].filter((x) => x !== right),
    rand
  ).slice(0, 3)
  const options = shuffle([right, ...others], rand)
  return { options, answer: options.indexOf(right) }
}

/** Simple blocks whose reading is unambiguous (ㅊ reads like ㅈ, tense like plain). */
const QUIZ_INITIALS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅋㅌㅍㅎ'.split('')
const QUIZ_MEDIALS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'.split('')

const ONE_WORD = /^[가-힣]{2,4}$/

/**
 * A quick check: letters, single blocks and — given the pack's words — whole
 * words. Word readings come from the pack (`viRead`), which already applies the
 * sound changes between blocks (한국어 → "han-cu-gơ") that `readSyllable` does not.
 */
export function hangulQuiz(
  count = 10,
  rand: () => number = Math.random,
  words: ReadableWord[] = []
): HangulQuestion[] {
  const readable = words.filter((w) => ONE_WORD.test(w.word) && w.viRead.trim())
  const nWords = readable.length >= 4 ? Math.floor(count * 0.3) : 0
  const nLetters = nWords ? Math.round(count * 0.4) : Math.ceil(count / 2)
  const nBlocks = count - nWords - nLetters

  const letters = shuffle([...CONSONANTS, ...VOWELS], rand).slice(0, nLetters)
  const out: HangulQuestion[] = letters.map((j) => {
    const group = CONSONANTS.includes(j) ? CONSONANTS : VOWELS
    return {
      prompt: j.ch,
      say: j.sample,
      kind: 'letter',
      ...withDistractors(
        j.vi,
        group.map((g) => g.vi),
        rand
      ),
    }
  })

  // Every simple block once, in random order: always terminates, never repeats.
  const blocks = shuffle(
    QUIZ_INITIALS.flatMap((i) => QUIZ_MEDIALS.map((m) => compose(i, m)!)),
    rand
  )
  for (const syl of blocks.slice(0, nBlocks)) {
    const right = readSyllable(syl)!
    // Distractors share the consonant or the vowel, so the learner has to read both.
    const { initial, medial } = decompose(syl)!
    const near = [
      ...QUIZ_MEDIALS.map((m) => compose(initial, m)!),
      ...QUIZ_INITIALS.map((i) => compose(i, medial)!),
    ].map((s) => readSyllable(s)!)
    out.push({ prompt: syl, say: syl, kind: 'syllable', ...withDistractors(right, near, rand) })
  }

  for (const w of shuffle(readable, rand).slice(0, nWords)) {
    // Readings of words just as long, so the count of blocks gives nothing away.
    const same = readable.filter((o) => o.word.length === w.word.length)
    const pool = (same.length >= 4 ? same : readable).map((o) => o.viRead)
    out.push({
      prompt: w.word,
      say: w.word,
      kind: 'word',
      note: w.meaning,
      ...withDistractors(w.viRead, pool, rand),
    })
  }
  return shuffle(out, rand)
}

/** XP for a quick check: a little for trying, more for each right answer. */
export function hangulXp(correct: number, total: number): number {
  return 5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
}
