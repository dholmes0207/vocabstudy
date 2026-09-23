import type { PosCategory } from '@/types'

// ============================================================================
// Finding a headword inside a sentence the way English actually uses it.
//
// Example sentences say "She washed her hands", "The baby cries", "They went
// home" — an exact match on the headword misses all of those, which cost the
// card its highlight and the word its fill-in-the-blank question. This module
// generates the common surface forms of a headword (plural / 3rd person, past,
// -ing, comparative, plus a table of irregulars) and finds them as whole words.
//
// It over-generates on purpose ("visitted" is harmless — it never occurs in a
// sentence) but stays conservative where a wrong hit would be a real word:
// closed-class words (it ≠ its, a ≠ as) and 1–2 letter words only ever match
// exactly or through the irregular table.
// ============================================================================

/** Irregular forms for the common words in the pack (base → other forms). */
const IRREGULAR: Record<string, string[]> = {
  be: ['am', 'is', 'are', 'was', 'were', 'been', 'being'],
  have: ['has', 'had', 'having'],
  do: ['does', 'did', 'done', 'doing'],
  go: ['goes', 'went', 'gone', 'going'],
  arise: ['arose', 'arisen'],
  bear: ['bore', 'born', 'borne'],
  beat: ['beaten'],
  become: ['became'],
  begin: ['began', 'begun', 'beginning'],
  bend: ['bent'],
  bite: ['bit', 'bitten'],
  blow: ['blew', 'blown'],
  break: ['broke', 'broken'],
  bring: ['brought'],
  build: ['built'],
  buy: ['bought'],
  catch: ['caught'],
  choose: ['chose', 'chosen'],
  come: ['came'],
  cost: ['costs'],
  cut: ['cutting'],
  deal: ['dealt'],
  dig: ['dug'],
  draw: ['drew', 'drawn'],
  dream: ['dreamt'],
  drink: ['drank', 'drunk'],
  drive: ['drove', 'driven'],
  eat: ['ate', 'eaten'],
  fall: ['fell', 'fallen'],
  feed: ['fed'],
  feel: ['felt'],
  fight: ['fought'],
  find: ['found'],
  fly: ['flew', 'flown', 'flies'],
  forget: ['forgot', 'forgotten'],
  get: ['got', 'gotten', 'getting'],
  give: ['gave', 'given'],
  grow: ['grew', 'grown'],
  hang: ['hung'],
  hear: ['heard'],
  hide: ['hid', 'hidden'],
  hit: ['hitting'],
  hold: ['held'],
  hurt: ['hurting'],
  keep: ['kept'],
  know: ['knew', 'known'],
  lay: ['laid'],
  lead: ['led'],
  learn: ['learnt'],
  leave: ['left'],
  lend: ['lent'],
  let: ['letting'],
  lie: ['lay', 'lain', 'lying'],
  light: ['lit'],
  lose: ['lost'],
  make: ['made'],
  mean: ['meant'],
  meet: ['met'],
  pay: ['paid'],
  put: ['putting'],
  read: ['reading'],
  ride: ['rode', 'ridden'],
  ring: ['rang', 'rung'],
  rise: ['rose', 'risen'],
  run: ['ran'],
  say: ['said', 'says'],
  see: ['saw', 'seen'],
  sell: ['sold'],
  send: ['sent'],
  set: ['setting'],
  shake: ['shook', 'shaken'],
  shine: ['shone'],
  shoot: ['shot'],
  show: ['shown'],
  shut: ['shutting'],
  sing: ['sang', 'sung'],
  sink: ['sank', 'sunk'],
  sit: ['sat'],
  sleep: ['slept'],
  speak: ['spoke', 'spoken'],
  spend: ['spent'],
  stand: ['stood'],
  steal: ['stole', 'stolen'],
  swim: ['swam', 'swum'],
  take: ['took', 'taken'],
  teach: ['taught'],
  tear: ['tore', 'torn'],
  tell: ['told'],
  think: ['thought'],
  throw: ['threw', 'thrown'],
  understand: ['understood'],
  wake: ['woke', 'woken'],
  wear: ['wore', 'worn'],
  win: ['won'],
  write: ['wrote', 'written'],
  // nouns
  child: ['children'],
  man: ['men'],
  woman: ['women'],
  person: ['people'],
  foot: ['feet'],
  tooth: ['teeth'],
  mouse: ['mice'],
  // adjectives / adverbs
  good: ['better', 'best'],
  well: ['better', 'best'],
  bad: ['worse', 'worst'],
  far: ['further', 'farther', 'furthest', 'farthest'],
  little: ['less', 'least'],
  many: ['more', 'most'],
  much: ['more', 'most'],
}

/** Word classes whose members do not inflect (and whose "inflections" are other words). */
const CLOSED: ReadonlySet<PosCategory> = new Set([
  'preposition',
  'conjunction',
  'pronoun',
  'determiner',
  'article',
])

const VOWEL = /[aeiou]/
/** consonant-vowel-consonant ending → the final consonant doubles (stop → stopped). */
const CVC = /[^aeiou][aeiou][^aeiouwxy]$/

function regularForms(t: string, comparatives: boolean): string[] {
  const out: string[] = []
  const last = t[t.length - 1]
  const stem = t.slice(0, -1)
  const consonantY = last === 'y' && t.length > 1 && !VOWEL.test(t[t.length - 2])

  // plural / 3rd person
  out.push(t + 's')
  if (/(s|x|z|ch|sh|o)$/.test(t)) out.push(t + 'es')
  if (consonantY) out.push(stem + 'ies')
  if (t.endsWith('fe')) out.push(t.slice(0, -2) + 'ves')
  else if (last === 'f') out.push(stem + 'ves')

  // past
  if (last === 'e') out.push(t + 'd')
  else if (consonantY) out.push(stem + 'ied')
  else out.push(t + 'ed')
  if (CVC.test(t)) out.push(t + last + 'ed')

  // -ing
  if (t.endsWith('ie')) out.push(t.slice(0, -2) + 'ying')
  else if (last === 'e' && !/(ee|ye|oe)$/.test(t)) out.push(stem + 'ing')
  else out.push(t + 'ing')
  if (CVC.test(t)) out.push(t + last + 'ing')

  if (comparatives) {
    if (last === 'e') out.push(t + 'r', t + 'st')
    else if (consonantY) out.push(stem + 'ier', stem + 'iest')
    else out.push(t + 'er', t + 'est')
    if (CVC.test(t)) out.push(t + last + 'er', t + last + 'est')
  }
  return out
}

/** Every surface form of one inflecting token (the token itself first). */
function tokenForms(token: string, pos?: PosCategory): string[] {
  const t = token.toLowerCase()
  const forms = [t, ...(IRREGULAR[t] ?? [])]
  if (t.length >= 3 && /^[a-z]+$/.test(t)) {
    const comparatives = pos === undefined || pos === 'adjective' || pos === 'adverb'
    forms.push(...regularForms(t, comparatives))
  }
  return forms
}

function splitHeadword(headword: string): string[] {
  return headword
    .split('/')
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
}

/**
 * The surface forms a headword can take in a sentence, the headword itself
 * first. Slashed headwords ("a / an") contribute every form.
 */
export function surfaceForms(headword: string, pos?: PosCategory): string[] {
  const out: string[] = []
  for (const form of splitHeadword(headword)) {
    const lower = form.toLowerCase()
    if (pos && CLOSED.has(pos)) {
      out.push(lower)
      continue
    }
    const [first, ...rest] = lower.split(' ')
    const tail = rest.length ? ' ' + rest.join(' ') : ''
    // Only a multi-word VERB inflects ("looked after"); anything else stays exact.
    if (rest.length && pos !== undefined && pos !== 'verb') {
      out.push(lower)
      continue
    }
    for (const f of tokenForms(first, pos)) out.push(f + tail)
  }
  return [...new Set(out)]
}

export interface WordMatch {
  /** Index of the first character of the match. */
  start: number
  /** Index just past the last character. */
  end: number
  /** The text as it appears in the sentence ("Hands", "went"). */
  surface: string
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A regex finding any surface form as a whole word. Written without lookbehind
 * (unsupported before iOS Safari 16.4): group 1 is the preceding character or
 * start of string, group 2 the word itself.
 */
function patternFor(headword: string, pos?: PosCategory): RegExp | null {
  const forms = surfaceForms(headword, pos)
  if (!forms.length) return null
  const alts = forms
    .sort((a, b) => b.length - a.length)
    .map((f) => escape(f).replace(/ /g, '\\s+'))
    .join('|')
  return new RegExp(`(^|[^A-Za-z])(${alts})(?![A-Za-z])`, 'gi')
}

/** Every occurrence of the headword (in any surface form), in sentence order. */
export function findAllInSentence(
  headword: string,
  sentence: string,
  pos?: PosCategory
): WordMatch[] {
  const re = patternFor(headword, pos)
  if (!re || !sentence) return []
  const hits: WordMatch[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(sentence)) !== null) {
    const start = m.index + m[1].length
    hits.push({ start, end: start + m[2].length, surface: m[2] })
    // The prefix group consumed a character; step back so adjacent hits
    // ("hand, hand") are not skipped.
    re.lastIndex = start + m[2].length
  }
  return hits
}

/** The first occurrence of the headword in the sentence, or null. */
export function findWordInSentence(
  headword: string,
  sentence: string,
  pos?: PosCategory
): WordMatch | null {
  return findAllInSentence(headword, sentence, pos)[0] ?? null
}
