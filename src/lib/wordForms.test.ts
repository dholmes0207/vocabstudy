import { describe, expect, it } from 'vitest'
import { findAllInSentence, findWordInSentence, surfaceForms } from './wordForms'

// Example sentences use words the way English does — "She washed her hands",
// "The baby cries" — so an exact-match search missed 63 of the 1000 examples:
// no highlight on the card and no fill-in-the-blank question for words as
// basic as hand, eye and cry.

const find = (head: string, sentence: string, pos?: Parameters<typeof findWordInSentence>[2]) =>
  findWordInSentence(head, sentence, pos)?.surface ?? null

describe('findWordInSentence', () => {
  it('finds the headword itself, case-insensitively', () => {
    expect(find('ability', 'Ability matters.')).toBe('Ability')
  })

  it('reports where the match sits so callers can cut it out', () => {
    expect(findWordInSentence('dog', 'The dog sleeps.')).toEqual({
      start: 4,
      end: 7,
      surface: 'dog',
    })
  })

  it('matches whole words only', () => {
    expect(find('an', 'Another day.', 'article')).toBeNull()
    expect(find('cat', 'A category.')).toBeNull()
  })

  it.each([
    ['hand', 'She washed her hands before dinner.', 'hands'],
    ['box', 'He carried two boxes.', 'boxes'],
    ['cry', 'The baby cries when she is hungry.', 'cries'],
    ['cry', 'The baby cried all night.', 'cried'],
    ['watch', 'We watched a film.', 'watched'],
    ['like', 'She liked the gift.', 'liked'],
    ['make', 'He is making dinner.', 'making'],
    ['stop', 'The bus stopped here.', 'stopped'],
    ['run', 'The kids are running outside.', 'running'],
    ['lie', 'The cat is lying on the bed.', 'lying'],
    ['knife', 'Put the knives in the drawer.', 'knives'],
    ['big', 'This box is bigger than that one.', 'bigger'],
    ['happy', 'She is the happiest girl here.', 'happiest'],
  ])('%s → %s', (head, sentence, surface) => {
    expect(find(head, sentence)).toBe(surface)
  })

  it.each([
    ['go', 'They went home early.', 'went'],
    ['be', 'They were happy yesterday.', 'were'],
    ['have', 'She has two cats.', 'has'],
    ['child', 'The children are playing.', 'children'],
    ['foot', 'My feet hurt.', 'feet'],
    ['good', 'This one is better.', 'better'],
    ['buy', 'I bought a new phone.', 'bought'],
  ])('irregular: %s → %s', (head, sentence, surface) => {
    expect(find(head, sentence)).toBe(surface)
  })

  it('does not inflect closed-class words (it ≠ its, a ≠ as)', () => {
    expect(find('it', 'The dog wagged its tail.', 'pronoun')).toBeNull()
    expect(find('a / an', 'As you know, it is late.', 'article')).toBeNull()
  })

  it('does not inflect very short words without an irregular entry', () => {
    // "a" + "s" would otherwise turn every "as" into the article.
    expect(find('a', 'Do as I say.')).toBeNull()
  })

  it('tries every form of a slashed headword', () => {
    expect(find('a / an', 'I ate an apple.', 'article')).toBe('an')
    expect(find('anybody / anyone', 'Is anyone home?', 'pronoun')).toBe('anyone')
  })

  it('inflects the first word of a multi-word verb', () => {
    expect(find('look after', 'She looked after her brother.', 'verb')).toBe('looked after')
  })

  it('keeps multi-word closed-class headwords exact', () => {
    expect(find('according to', 'According to the news, it will rain.', 'preposition')).toBe(
      'According to'
    )
  })

  it('returns the earliest occurrence', () => {
    expect(find('hand', 'Hands up! Raise your hand.')).toBe('Hands')
  })

  it('survives headwords with regex metacharacters', () => {
    expect(() => find('e.g.', 'Use e.g. sparingly.')).not.toThrow()
    expect(find('e.g.', 'Use e.g. sparingly.')).toBe('e.g.')
  })
})

describe('surfaceForms', () => {
  it('always lists the headword first', () => {
    expect(surfaceForms('walk')[0]).toBe('walk')
  })

  it('does not produce duplicates', () => {
    const forms = surfaceForms('see')
    expect(new Set(forms).size).toBe(forms.length)
  })
})

describe('findAllInSentence', () => {
  it('finds every occurrence, in order (for highlighting)', () => {
    const hits = findAllInSentence('hand', 'Hands up, raise your hand.')
    expect(hits.map((h) => h.surface)).toEqual(['Hands', 'hand'])
    expect(hits[1]).toEqual({ start: 21, end: 25, surface: 'hand' })
  })

  it('returns nothing for an empty headword', () => {
    expect(findAllInSentence('  ', 'Anything at all.')).toEqual([])
  })
})
