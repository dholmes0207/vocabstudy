// Phonetic keys + string distance, used to grade spoken pronunciation.
//
// Why this exists: a speech recognizer hands back *spelling*, not sound. A
// learner who pronounces "four" perfectly may be transcribed as "for", and
// "know" as "no". Comparing the raw strings would mark a correct speaker wrong.
// Metaphone collapses English homophones onto the same key, so we grade on how
// the word *sounds* and keep exact spelling only as a bonus signal.
//
// Implementation follows Lawrence Philips' original Metaphone (1990). It is not
// perfect English phonology — "one"/"won" still differ — but it captures the
// common cases in a 1000-word beginner list, and near-misses still earn partial
// credit through `similarity()`.

const VOWELS = 'AEIOU'

const isVowel = (c: string | undefined): boolean => !!c && VOWELS.includes(c)

/** Strip to uppercase A-Z, dropping digits, punctuation and accents. */
function lettersOnly(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

/** Collapse doubled letters (except CC, which changes the sound: "accept"). */
function dedupe(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== s[i - 1] || s[i] === 'C') out += s[i]
  }
  return out
}

/**
 * Metaphone key for a single word. Returns '' for input with no letters.
 * 'X' encodes the "sh" sound and '0' encodes "th", per the original algorithm.
 */
export function metaphone(word: string): string {
  let s = dedupe(lettersOnly(word))
  if (!s) return ''

  // Silent leading letters.
  if (/^(AE|GN|KN|PN|WR)/.test(s)) s = s.slice(1)
  else if (s.startsWith('X')) s = 'S' + s.slice(1)
  else if (s.startsWith('WH')) s = 'W' + s.slice(2)

  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const prev = s[i - 1]
    const next = s[i + 1]
    const after = s[i + 2]

    // Vowels survive only in first position.
    if (isVowel(c)) {
      if (i === 0) out += c
      continue
    }

    switch (c) {
      case 'B':
        // Silent in a final "-MB": "thumb", "climb".
        if (!(i === s.length - 1 && prev === 'M')) out += 'B'
        break
      case 'C':
        if (next === 'I' && after === 'A')
          out += 'X' // "-CIA-"
        else if (next === 'H') {
          out += prev === 'S' ? 'K' : 'X' // "school" vs "chair"
          i++ // CH is one sound — don't let the H be encoded again
        } else if (next === 'I' || next === 'E' || next === 'Y')
          out += 'S' // "city"
        else out += 'K'
        break
      case 'D':
        // "-DGE-", "-DGY-", "-DGI-" sound like J: "judge".
        if (next === 'G' && (after === 'E' || after === 'Y' || after === 'I')) {
          out += 'J'
          i++
        } else out += 'T'
        break
      case 'G':
        if (next === 'H') {
          // Silent unless the H starts a new voiced syllable: "ghost" vs "night".
          if (isVowel(after)) out += 'K'
          i++
        } else if (next === 'N') {
          // Silent in "-GN" and "-GNED" at the end: "sign", "signed".
          const rest = s.slice(i + 1)
          if (!(rest === 'N' || rest === 'NED')) out += 'K'
        } else if (next === 'I' || next === 'E' || next === 'Y') out += 'J'
        else out += 'K'
        break
      case 'H':
        // Pronounced only when it opens a syllable: "behave", not "ah".
        if (isVowel(next) && !isVowel(prev)) out += 'H'
        break
      case 'K':
        if (prev !== 'C') out += 'K'
        break
      case 'P':
        if (next === 'H') {
          out += 'F'
          i++
        } else out += 'P'
        break
      case 'Q':
        out += 'K'
        break
      case 'S':
        if (next === 'H') {
          out += 'X'
          i++
        } else if (next === 'I' && (after === 'O' || after === 'A'))
          out += 'X' // "-SIO-"
        else out += 'S'
        break
      case 'T':
        if (next === 'H') {
          out += '0'
          i++
        } else if (next === 'I' && (after === 'O' || after === 'A'))
          out += 'X' // "nation"
        else if (!(next === 'C' && after === 'H')) out += 'T' // silent in "match"
        break
      case 'V':
        out += 'F'
        break
      case 'W':
      case 'Y':
        // Consonantal only before a vowel: "yes" keeps Y, "day" drops it.
        if (isVowel(next)) out += c
        break
      case 'X':
        out += 'KS'
        break
      case 'Z':
        out += 'S'
        break
      case 'F':
      case 'J':
      case 'L':
      case 'M':
      case 'N':
      case 'R':
        out += c
        break
      default:
        break
    }
  }
  return out
}

/** Metaphone key for a phrase: each word encoded, joined by a space. */
export function phoneticKey(text: string): string {
  return text.trim().split(/\s+/).map(metaphone).filter(Boolean).join(' ')
}

/** Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  // Single rolling row instead of a full matrix — these strings are short, but
  // the trainer scores every recognition alternative on each attempt.
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    prev = row
  }
  return prev[b.length]
}

/** Edit-distance similarity in 0..1 (1 = identical, 0 = nothing in common). */
export function similarity(a: string, b: string): number {
  if (!a && !b) return 1
  const longest = Math.max(a.length, b.length)
  if (!longest) return 1
  return 1 - levenshtein(a, b) / longest
}
