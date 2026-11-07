import type { Word } from '@/types'
import { part1Round, type Part1Question } from './toeicPart1'
import { part2Round, type Part2Question } from './toeicPart2'
import { part5Round, type Part5Question } from './toeicPart5'
import { pickTalk, type TalkSet } from './toeicTalks'
import { pickSet, shuffleSet, type ReadingSet, type ShuffledQuestion } from './toeicReading'
import type { Section } from './toeicScore'
import type { ToeicBank } from './toeicBank'

// "Bài thi nhỏ" (docs/design/toeic.md, bước A7): the seven parts in the
// proportions of the real test, 13 listening and 13 reading questions.

export type MiniStep =
  | { part: 1; questions: Part1Question[] }
  | { part: 2; questions: Part2Question[] }
  | { part: 5; questions: Part5Question[] }
  // One member per part, so a check on `part` narrows to one kind of set.
  | { part: 3; set: TalkSet; questions: ShuffledQuestion[] }
  | { part: 4; set: TalkSet; questions: ShuffledQuestion[] }
  | { part: 6; set: ReadingSet; questions: ShuffledQuestion[] }
  | { part: 7; set: ReadingSet; questions: ShuffledQuestion[] }

export const sectionOf = (part: number): Section => (part <= 4 ? 'listening' : 'reading')

/** 13 listening and 13 reading questions, split across the parts like the real test. */
export function miniTestPlan(bank: ToeicBank, words: readonly Word[]): MiniStep[] {
  // A Part 7 set has three to four questions, as on the test; three keep the total at 26.
  const p7 = shuffleSet(pickSet(bank.reading, 7))
  return [
    { part: 1, questions: part1Round(bank.part1).slice(0, 2) },
    { part: 2, questions: part2Round(bank.part2).slice(0, 5) },
    { part: 3, ...shuffleSet(pickTalk(bank.talks, 3)) },
    { part: 4, ...shuffleSet(pickTalk(bank.talks, 4)) },
    { part: 5, questions: part5Round(bank.part5, words).slice(0, 6) },
    { part: 6, ...shuffleSet(pickSet(bank.reading, 6)) },
    { part: 7, set: p7.set, questions: p7.questions.slice(0, 3) },
  ]
}

/** Name of the test in the exam store, for the best score. */
export const MINI_TEST_ID = 'toeic-mini'
