import { describe, expect, it } from 'vitest'
import type { PosCategory, Word } from '@/types'
import { buildSkeleton, checkFillAnswer, gapExample, generateQuiz, makeQuestion } from './quiz'

function word(over: Partial<Word> & Pick<Word, 'id' | 'word'>): Word {
  return {
    ipa: '',
    viRead: '',
    pos: 'n.',
    posCategory: 'noun' as PosCategory,
    meaning: `nghĩa ${over.id}`,
    exampleEn: '',
    exampleVi: '',
    ...over,
  }
}

const pool: Word[] = Array.from({ length: 20 }, (_, i) =>
  word({ id: i + 1, word: `word${i + 1}`, meaning: `nghĩa ${i + 1}` })
)

describe('gapExample', () => {
  it('blanks the headword out of its example sentence', () => {
    const w = word({ id: 1, word: 'ability', exampleEn: 'She has the ability to lead.' })
    expect(gapExample(w)).toBe('She has the _____ to lead.')
  })

  it('matches case-insensitively', () => {
    const w = word({ id: 1, word: 'ability', exampleEn: 'Ability matters.' })
    expect(gapExample(w)).toBe('_____ matters.')
  })

  it('matches whole words only, so "an" does not gut "another"', () => {
    const w = word({ id: 1, word: 'an', exampleEn: 'Another day, an apple.' })
    expect(gapExample(w)).toBe('Another day, _____ apple.')
  })

  it('tries each form of a slashed headword', () => {
    const w = word({ id: 1, word: 'a / an', exampleEn: 'I ate an apple.' })
    expect(gapExample(w)).toBe('I ate _____ apple.')
  })

  it('returns null when there is no example or the word is absent from it', () => {
    expect(gapExample(word({ id: 1, word: 'ability' }))).toBeNull()
    expect(gapExample(word({ id: 1, word: 'ability', exampleEn: 'Nothing here.' }))).toBeNull()
  })

  it('blanks an inflected form too — "hands" is the word "hand" in use', () => {
    const w = word({ id: 1, word: 'hand', exampleEn: 'She washed her hands before dinner.' })
    expect(gapExample(w)).toBe('She washed her _____ before dinner.')
  })

  it('blanks an irregular form', () => {
    const w = word({
      id: 1,
      word: 'go',
      pos: 'v.',
      posCategory: 'verb',
      exampleEn: 'They went home.',
    })
    expect(gapExample(w)).toBe('They _____ home.')
  })

  it('does not blow up on a headword containing regex metacharacters', () => {
    const w = word({ id: 1, word: 'e.g.', exampleEn: 'Use e.g. sparingly.' })
    expect(() => gapExample(w)).not.toThrow()
  })
})

describe('buildSkeleton', () => {
  it('is deterministic — the same word always yields the same skeleton', () => {
    expect(buildSkeleton('ability')).toEqual(buildSkeleton('ability'))
  })

  it('keeps the first and last letter and hides alternating middle letters', () => {
    const cells = buildSkeleton('ability')
    // a b i l i t y -> middle letters are b,i,l,i,t; the 2nd and 4th go away.
    const rendered = cells.map((c) => (c.revealed ? c.ch : '_')).join('')
    expect(rendered).toBe('ab_l_ty')
    expect(cells).toHaveLength('ability'.length)
    expect(cells[0].revealed).toBe(true)
    expect(cells[cells.length - 1].revealed).toBe(true)
  })

  it('always leaves something to recall for words of 3+ letters', () => {
    for (const w of ['cat', 'door', 'ability', 'understand']) {
      expect(buildSkeleton(w).some((c) => !c.revealed)).toBe(true)
    }
  })

  it('never hides a non-letter character', () => {
    for (const c of buildSkeleton('ice cream')) {
      if (!c.isLetter) expect(c.revealed).toBe(true)
    }
  })

  it('uses the first form of a slashed headword', () => {
    expect(
      buildSkeleton('a / an')
        .map((c) => c.ch)
        .join('')
    ).toBe('a')
  })
})

describe('checkFillAnswer', () => {
  const w = word({ id: 1, word: 'a / an' })

  it('accepts any form of a slashed headword', () => {
    expect(checkFillAnswer(w, 'a')).toBe(true)
    expect(checkFillAnswer(w, 'an')).toBe(true)
  })

  it('ignores case, surrounding space and repeated inner spaces', () => {
    const ice = word({ id: 2, word: 'ice cream' })
    expect(checkFillAnswer(ice, '  ICE   cream ')).toBe(true)
  })

  it('accepts the form used in the sentence as well as the headword', () => {
    const hand = word({ id: 3, word: 'hand' })
    expect(checkFillAnswer(hand, 'hands', 'hands')).toBe(true)
    expect(checkFillAnswer(hand, 'hand', 'hands')).toBe(true)
    expect(checkFillAnswer(hand, 'hans', 'hands')).toBe(false)
  })

  it('rejects empty, whitespace-only and wrong answers', () => {
    expect(checkFillAnswer(w, '')).toBe(false)
    expect(checkFillAnswer(w, '   ')).toBe(false)
    expect(checkFillAnswer(w, 'the')).toBe(false)
  })
})

describe('makeQuestion', () => {
  it('offers 4 options with exactly one correct answer', () => {
    for (const mode of ['en-to-vi', 'vi-to-en', 'listen'] as const) {
      const q = makeQuestion(pool[0], pool, mode)
      expect(q.options).toHaveLength(4)
      expect(q.options.filter((o) => o.correct)).toHaveLength(1)
    }
  })

  it('never repeats an option label — duplicates would make two answers right', () => {
    // Many Vietnamese meanings collide in the real dataset; distractors must be
    // deduplicated on the text actually shown, not on word id.
    const colliding = [
      word({ id: 1, word: 'big', meaning: 'to lớn' }),
      word({ id: 2, word: 'large', meaning: 'to lớn' }),
      word({ id: 3, word: 'huge', meaning: 'to lớn' }),
      word({ id: 4, word: 'small', meaning: 'nhỏ' }),
      word({ id: 5, word: 'tiny', meaning: 'bé xíu' }),
      word({ id: 6, word: 'fast', meaning: 'nhanh' }),
    ]
    for (let i = 0; i < 50; i++) {
      const q = makeQuestion(colliding[0], colliding, 'en-to-vi')
      const labels = q.options.map((o) => o.text)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it('never offers the target word itself as a distractor', () => {
    for (let i = 0; i < 50; i++) {
      const q = makeQuestion(pool[0], pool, 'vi-to-en')
      const wrong = q.options.filter((o) => !o.correct)
      expect(wrong.every((o) => o.wordId !== pool[0].id)).toBe(true)
    }
  })

  it('asks for the meaning in en-to-vi and for the word in vi-to-en', () => {
    const target = word({ id: 1, word: 'ability', meaning: 'khả năng' })
    const p = [target, ...pool]
    expect(makeQuestion(target, p, 'en-to-vi')).toMatchObject({
      prompt: 'ability',
      answer: 'khả năng',
    })
    expect(makeQuestion(target, p, 'vi-to-en')).toMatchObject({
      prompt: 'khả năng',
      answer: 'ability',
    })
  })

  it('produces no options for typing modes', () => {
    for (const mode of ['fill', 'spell'] as const) {
      expect(makeQuestion(pool[0], pool, mode).options).toEqual([])
    }
  })

  it('records the hidden form so the checker and the feedback can use it', () => {
    const hand = word({ id: 50, word: 'hand', exampleEn: 'Wash your hands.' })
    expect(makeQuestion(hand, [hand, ...pool], 'fill')).toMatchObject({
      prompt: 'Wash your _____.',
      surface: 'hands',
    })
  })

  describe('context mode (pick the word that fits the sentence)', () => {
    const hand = word({
      id: 50,
      word: 'hand',
      meaning: 'bàn tay',
      exampleEn: 'Wash your hands.',
      exampleVi: 'Rửa tay đi.',
    })
    const p = [hand, ...pool]

    it('shows the gapped sentence and offers four English words', () => {
      const q = makeQuestion(hand, p, 'context')
      expect(q.prompt).toBe('Wash your _____.')
      expect(q.answer).toBe('hand')
      expect(q.surface).toBe('hands')
      expect(q.options).toHaveLength(4)
      expect(q.options.find((o) => o.correct)?.text).toBe('hand')
    })

    it('gives the Vietnamese sentence as the hint, so the learner reasons from meaning', () => {
      expect(makeQuestion(hand, p, 'context').hint).toBe('Rửa tay đi.')
    })

    it('falls back to picking the English word when the example cannot be gapped', () => {
      const bare = word({ id: 51, word: 'ability', meaning: 'khả năng' })
      const q = makeQuestion(bare, [bare, ...pool], 'context')
      expect(q.mode).toBe('vi-to-en')
      expect(q.prompt).toBe('khả năng')
    })
  })

  it('falls back to the meaning when fill mode cannot gap the example', () => {
    const noExample = word({ id: 99, word: 'ability', meaning: 'khả năng' })
    expect(makeQuestion(noExample, pool, 'fill').prompt).toBe('khả năng')
  })
})

describe('generateQuiz', () => {
  it('asks one question per word, capped by limit', () => {
    expect(generateQuiz({ words: pool, pool })).toHaveLength(pool.length)
    expect(generateQuiz({ words: pool, pool, limit: 5 })).toHaveLength(5)
  })

  it('does not ask about the same word twice', () => {
    const ids = generateQuiz({ words: pool, pool }).map((q) => q.wordId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses the requested modes', () => {
    const qs = generateQuiz({ words: pool, pool, modes: ['spell'] })
    expect(qs.every((q) => q.mode === 'spell')).toBe(true)
  })

  it('falls back to the multiple-choice modes when given an empty list', () => {
    const qs = generateQuiz({ words: pool, pool, modes: [] })
    expect(qs.every((q) => ['en-to-vi', 'vi-to-en', 'listen'].includes(q.mode))).toBe(true)
  })

  it('handles an empty word list', () => {
    expect(generateQuiz({ words: [], pool })).toEqual([])
  })
})
