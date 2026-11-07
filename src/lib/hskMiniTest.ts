import type { Word } from '@/types'
import {
  HSK_SCALE,
  charQuestions,
  fillQuestions,
  judgeQuestions,
  levelWords,
  listenQuestions,
  lookQuestions,
  orderQuestions,
  pictureQuestions,
  seeQuestions,
  type HskChoice,
  type HskLevel,
  type HskOrder,
} from './hskPractice'
import { dialogueRound, pictureDialogueRound, type ShuffledDialogue } from './hskDialogues'
import { answerRound, type AnswerQuestion } from './hskAnswers'
import { readingRound, type ShuffledReading } from './hskReadings'
import type { HskBank } from './hskBank'

// "Bài thi nhỏ HSK" (docs/design/toeic.md, giai đoạn B): the parts of the test
// in its order and proportions, 10 questions per section — listening and
// reading, plus writing for HSK 3.

export type HskSection = 'listen' | 'read' | 'write'

/** A part of the mini test; HSK 3 writing has two (完成句子, then 写汉字). */
export type HskMiniStep =
  | { section: HskSection; kind: 'choice'; questions: HskChoice[] }
  | { section: 'write'; kind: 'order'; questions: HskOrder[] }
  | { section: 'listen'; kind: 'talk'; dialogues: ShuffledDialogue[] }
  | { section: 'read'; kind: 'answer'; questions: AnswerQuestion[] }
  | { section: 'read'; kind: 'read'; questions: ShuffledReading[] }

/** The steps of one mini test for `level`, from the pack's words and the bank. */
export function hskMiniPlan(level: HskLevel, words: readonly Word[], bank: HskBank): HskMiniStep[] {
  /** HSK 1–2 words: the pictures of the HSK 2 picture dialogues. */
  const lowWords = [...levelWords('hsk1', words), ...levelWords('hsk2', words)]
  // HSK 1–2 listening opens with right-or-wrong pictures; HSK 3 has none.
  const listen: HskMiniStep[] =
    HSK_SCALE[level].sections === 3
      ? [
          {
            section: 'listen',
            kind: 'talk',
            dialogues: dialogueRound(bank.dialogues, 'hsk3', 5),
          },
          { section: 'listen', kind: 'choice', questions: listenQuestions(level, words, 5) },
        ]
      : level === 'hsk1'
        ? [
            {
              section: 'listen',
              kind: 'choice',
              questions: judgeQuestions(level, words, 4),
            },
            {
              section: 'listen',
              kind: 'choice',
              questions: pictureQuestions(level, words, 3),
            },
            {
              section: 'listen',
              kind: 'choice',
              questions: listenQuestions(level, words, 3),
            },
          ]
        : [
            {
              section: 'listen',
              kind: 'choice',
              questions: judgeQuestions(level, words, 3),
            },
            {
              section: 'listen',
              kind: 'talk',
              dialogues: pictureDialogueRound(bank.pictureDialogues, lowWords, 2),
            },
            {
              section: 'listen',
              kind: 'talk',
              dialogues: dialogueRound(bank.dialogues, 'hsk2', 3),
            },
            {
              section: 'listen',
              kind: 'choice',
              questions: listenQuestions(level, words, 2),
            },
          ]
  // Reading too: HSK 1–2 open with pictures, HSK 3 has none.
  const read: HskMiniStep[] =
    HSK_SCALE[level].sections === 3
      ? [
          { section: 'read', kind: 'answer', questions: answerRound(bank.pairs, 'hsk3', 3) },
          { section: 'read', kind: 'choice', questions: fillQuestions(level, words, 3) },
          { section: 'read', kind: 'read', questions: readingRound(bank.readings, 4) },
        ]
      : level === 'hsk1'
        ? [
            { section: 'read', kind: 'choice', questions: lookQuestions(level, words, 4) },
            { section: 'read', kind: 'choice', questions: seeQuestions(level, words, 2) },
            { section: 'read', kind: 'answer', questions: answerRound(bank.pairs, 'hsk1', 2) },
            { section: 'read', kind: 'choice', questions: fillQuestions(level, words, 2) },
          ]
        : [
            { section: 'read', kind: 'choice', questions: lookQuestions(level, words, 4) },
            { section: 'read', kind: 'answer', questions: answerRound(bank.pairs, 'hsk2', 3) },
            { section: 'read', kind: 'choice', questions: fillQuestions(level, words, 3) },
          ]
  const steps: HskMiniStep[] = [...listen, ...read]
  // HSK 3 writing: five sentences to build, five characters to write.
  if (HSK_SCALE[level].sections === 3)
    steps.push(
      { section: 'write', kind: 'order', questions: orderQuestions(level, words, 5) },
      { section: 'write', kind: 'choice', questions: charQuestions(level, words, 5) }
    )
  return steps
}
