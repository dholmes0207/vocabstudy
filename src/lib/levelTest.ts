import type { Word } from '@/types'
import type { GrammarUnit } from './grammar'
import type { PathLevel } from './learningPath'
import { makeQuestion } from './quiz'

// "Thi vượt cấp" (docs/design/learning-path.md): a short battle on one level of
// the path, words and grammar of that level mixed, three hearts. Win it and the
// next level opens, so a learner who already knows the basics climbs in a few
// minutes instead of redoing them. Pure; the screen is features/path/LevelTest.

export const TEST_SIZE = 12
/** Hearts: the third wrong answer ends the test. */
export const LIVES = 3
/** Grammar questions in a test, when the level has grammar. */
const GRAMMAR_QUESTIONS = 5
/** XP for winning, on top of nothing for losing: trying is free. */
export const TEST_XP = 20

export interface LevelQuestion {
  kind: 'word' | 'grammar'
  prompt: string
  /** A second line: part of speech, the Vietnamese of a sentence… */
  hint?: string
  options: string[]
  answer: number
  /** Why, shown after a grammar answer. */
  explain?: string
  wordId?: number
  /** The prompt is the word itself: it can be heard. */
  sayable?: boolean
}

/** What a level's test asks about: its words and its grammar units. */
export function testScope(
  level: PathLevel,
  words: readonly Word[]
): { words: Word[]; units: string[] } {
  const units = level.steps.flatMap((s) => s.units ?? [])
  if (level.testWords) {
    const wanted = new Set(level.testWords)
    return { words: words.filter((w) => wanted.has(w.word)), units }
  }
  const ranges = level.steps.flatMap((s) => (s.range ? [s.range] : []))
  return { words: ranges.flatMap(([from, to]) => words.slice(from, to)), units }
}

function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The questions of one test: up to five grammar questions from the level's
 * units, the rest words of the level asked three ways (meaning, word, gap).
 */
export function buildLevelTest(
  level: PathLevel,
  words: readonly Word[],
  grammar: readonly GrammarUnit[],
  rand: () => number = Math.random
): LevelQuestion[] {
  const scope = testScope(level, words)
  const units = grammar.filter((u) => scope.units.includes(u.id))
  const grammarQs: LevelQuestion[] = shuffle(
    units.flatMap((u) => u.exercises.flatMap((e) => (e.type === 'choice' ? [{ e, unit: u }] : []))),
    rand
  )
    .slice(0, GRAMMAR_QUESTIONS)
    .map(({ e }) => {
      const order = shuffle(
        e.options.map((_, i) => i),
        rand
      )
      return {
        kind: 'grammar',
        prompt: e.prompt,
        options: order.map((i) => e.options[i]),
        answer: order.indexOf(e.answer),
        explain: e.explain,
      }
    })

  const modes = ['en-to-vi', 'vi-to-en', 'context'] as const
  const wordQs: LevelQuestion[] = shuffle(scope.words, rand)
    .slice(0, TEST_SIZE - grammarQs.length)
    .map((w, i) => {
      const q = makeQuestion(w, scope.words, modes[i % modes.length])
      return {
        kind: 'word',
        prompt: q.prompt,
        hint: q.hint,
        options: q.options.map((o) => o.text),
        answer: q.options.findIndex((o) => o.correct),
        wordId: w.id,
        sayable: q.mode === 'en-to-vi',
      }
    })
  return shuffle([...grammarQs, ...wordQs], rand)
}

/** Won: every question answered with a heart left. */
export function testWon(mistakes: number, answered: number, total: number): boolean {
  return mistakes < LIVES && answered === total
}
