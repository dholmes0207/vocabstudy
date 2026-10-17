// Scoring a spoken sentence (docs/design/grammar.md, "Nói thành tiếng").
//
// lib/pronunciation.ts grades one headword; a sentence needs a different unit
// per script. English is compared word by word; Korean syllable by syllable,
// because recognizers space Korean differently from the textbook; Chinese
// character by character. The score is how much of the target sentence the
// recognizer heard, in order (longest common subsequence), with a little
// weight on not adding words that were not there.

export type SpeechUnit = 'words' | 'syllables' | 'chars'

export function unitFor(ttsLang: string): SpeechUnit {
  const base = ttsLang.toLowerCase().split('-')[0]
  if (base === 'ko') return 'syllables'
  if (base === 'zh' || base === 'ja') return 'chars'
  return 'words'
}

export type SentenceVerdict = 'great' | 'good' | 'retry'

export interface SentenceScore {
  /** 0..100. */
  score: number
  verdict: SentenceVerdict
  /** The alternative that scored best, as the recognizer wrote it. */
  heard: string
  /** The target split for display, each piece marked when it was not heard. */
  pieces: { text: string; missed: boolean }[]
}

const GREAT = 85
const GOOD = 60

// ---------------------------------------------------------------------------
// Normalising
// ---------------------------------------------------------------------------

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "what's": 'what is',
  "where's": 'where is',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'll": 'i will',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "it'll": 'it will',
  "we'll": 'we will',
  "they'll": 'they will',
  "i'd": 'i would',
  "you'd": 'you would',
  "let's": 'let us',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "can't": 'can not',
  cannot: 'can not',
  "couldn't": 'could not',
  "shouldn't": 'should not',
}

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** English words for 0–99 become digits, so "20" and "twenty" compare equal. */
function englishNumbers(words: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const one = ONES.indexOf(w)
    const ten = TENS.indexOf(w)
    if (ten >= 2) {
      const next = ONES.indexOf(words[i + 1] ?? '')
      if (next >= 1 && next <= 9) {
        out.push(String(ten * 10 + next))
        i++
      } else out.push(String(ten * 10))
    } else if (one >= 0) out.push(String(one))
    else out.push(w)
  }
  return out
}

const HAN_DIGITS = '零一二三四五六七八九'

/** Chinese recognizers often write numbers as digits: 3 → 三, 25 → 二十五. */
function hanNumber(n: number): string {
  if (n < 10) return HAN_DIGITS[n]
  if (n < 100) {
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return (tens > 1 ? HAN_DIGITS[tens] : '') + '十' + (ones ? HAN_DIGITS[ones] : '')
  }
  return [...String(n)].map((d) => HAN_DIGITS[+d]).join('')
}

/** Letters and digits only (apostrophes kept for English), lower case. */
function clean(s: string, unit: SpeechUnit): string {
  let out = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u200b’]/g, (c) => (c === '’' ? "'" : ''))
  if (unit === 'chars') out = out.replace(/\d+/g, (d) => hanNumber(+d))
  return out.replace(unit === 'words' ? /[^\p{L}\p{N}'\s]/gu : /[^\p{L}\p{N}\s]/gu, ' ')
}

/** One display piece → the comparable units it contributes (possibly none). */
function unitsOf(piece: string, unit: SpeechUnit): string[] {
  const c = clean(piece, unit).trim()
  if (!c) return []
  if (unit !== 'words') return [...c.replace(/\s+/g, '')]
  const expanded = c
    .split(/\s+/)
    .flatMap((w) => (CONTRACTIONS[w] ?? w).split(' '))
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter(Boolean)
  return expanded
}

/** The units of a whole transcript. */
export function speechUnits(text: string, unit: SpeechUnit): string[] {
  // Whole-text cleaning first, so a number like "25" becomes 二十五, not 二五.
  if (unit !== 'words') return [...clean(text, unit).replace(/\s+/g, '')]
  return englishNumbers(text.split(/\s+/).flatMap((p) => unitsOf(p, unit)))
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Which target units are part of a longest common subsequence with `heard`. */
function matched(target: string[], heard: string[]): boolean[] {
  const m = target.length
  const n = heard.length
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] =
        target[i] === heard[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const hit = new Array<boolean>(m).fill(false)
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (target[i] === heard[j]) {
      hit[i] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return hit
}

/**
 * Score a spoken attempt at `target`. `alternatives` is the recognizer's n-best
 * list; the most charitable one counts.
 */
export function scoreSentence(
  target: string,
  alternatives: string[],
  ttsLang: string
): SentenceScore {
  const unit = unitFor(ttsLang)
  // Display pieces keep the target's own spelling and spacing; each knows which
  // of the comparable units are its own.
  const rawPieces = unit === 'words' ? target.split(/(\s+)/) : [...target]
  const pieceUnits = rawPieces.map((p) => (/^\s+$/.test(p) ? [] : unitsOf(p, unit)))
  const flat = pieceUnits.flat()
  const targetUnits = unit === 'words' ? englishNumbers(flat) : flat
  // englishNumbers can merge two words ("twenty five"); keep the mapping simple
  // by scoring on the merged list and marking pieces by position only when the
  // lengths still line up.
  const aligned = targetUnits.length === flat.length

  let best = { score: -1, heard: '', hit: new Array<boolean>(targetUnits.length).fill(false) }
  for (const alt of alternatives) {
    const heard = speechUnits(alt, unit)
    if (!heard.length || !targetUnits.length) continue
    const hit = matched(targetUnits, heard)
    const common = hit.filter(Boolean).length
    const recall = common / targetUnits.length
    const precision = common / heard.length
    const score = Math.round(100 * (0.8 * recall + 0.2 * precision))
    if (score > best.score) best = { score, heard: alt.trim(), hit }
  }

  let k = 0
  const pieces = rawPieces.map((text, i) => {
    const units = pieceUnits[i]
    const missed =
      aligned && units.length > 0 && units.some((_, u) => !best.hit[k + u]) && best.score >= 0
    k += units.length
    return { text, missed }
  })

  const score = Math.max(0, best.score)
  return {
    score,
    verdict: score >= GREAT ? 'great' : score >= GOOD ? 'good' : 'retry',
    heard: best.heard,
    pieces,
  }
}
