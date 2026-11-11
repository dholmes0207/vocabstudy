import { PICTURE_WORDS } from './hskPractice'

// HSK 2 and 3 listening, the dialogue parts (docs/design/toeic.md): a woman
// and a man say a line each, a third voice asks about it (问：…), and the
// answer is one of three printed options. Hand-written with the words of the
// level and below only (lib/hskDialogues.test.ts checks every character), each
// line with its Vietnamese, each answer explained. The dialogues are in
// public/data/hsk/zh.json (lib/hskBank.ts).

export type DialogueSpeaker = 'W' | 'M'

export interface HskDialogue {
  id: string
  level: 'hsk2' | 'hsk3'
  lines: { speaker: DialogueSpeaker; zh: string; vi: string }[]
  /** The question as read after the dialogue, without "问：". */
  q: string
  qVi: string
  /** The right option first; rounds shuffle them. */
  options: [string, string, string]
  why: string
}

export interface ShuffledDialogue extends Omit<HskDialogue, 'options'> {
  options: string[]
  /** Index of the right option after shuffling. */
  answer: number
  /** The options are pictures (emoji), and no question is read. */
  pictures?: boolean
}

/**
 * HSK 2 listening, part two: a short dialogue, then pick the picture that goes
 * with it. Each dialogue names exactly one word with a picture (PICTURE_WORDS),
 * so only one picture fits (lib/hskDialogues.test.ts).
 */
export interface PictureDialogue {
  id: string
  /** The word whose picture is the answer. */
  picture: string
  lines: HskDialogue['lines']
}

/**
 * A round of picture dialogues: each answer's picture among five, the others
 * pictures of words the dialogue does not say, from the pack's HSK 1–2 words.
 */
export function pictureDialogueRound(
  dialogues: readonly PictureDialogue[],
  words: readonly { word: string; emoji?: string }[],
  count = 5,
  rand: () => number = Math.random
): ShuffledDialogue[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const emoji = new Map(words.filter((w) => w.emoji).map((w) => [w.word, w.emoji!]))
  const pictured = PICTURE_WORDS.filter((p) => emoji.has(p))
  return shuffle(dialogues)
    .filter((d) => emoji.has(d.picture))
    .slice(0, count)
    .map((d) => {
      const said = d.lines.map((l) => l.zh).join('')
      const others = shuffle(pictured.filter((p) => p !== d.picture && !said.includes(p)))
        .slice(0, 4)
        .map((p) => emoji.get(p)!)
      const options = shuffle([emoji.get(d.picture)!, ...others])
      return {
        id: d.id,
        level: 'hsk2' as const,
        lines: d.lines,
        q: '',
        qVi: '',
        why: '',
        options,
        answer: options.indexOf(emoji.get(d.picture)!),
        pictures: true,
      }
    })
}

/** A round of dialogues in random order, the options of each shuffled. */
export function dialogueRound(
  dialogues: readonly HskDialogue[],
  level: HskDialogue['level'],
  count = 5,
  rand: () => number = Math.random
): ShuffledDialogue[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(dialogues.filter((d) => d.level === level))
    .slice(0, count)
    .map((d) => {
      const options = shuffle(d.options) as [string, string, string]
      return { ...d, options, answer: options.indexOf(d.options[0]) }
    })
}
