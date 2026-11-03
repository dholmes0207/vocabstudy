import type { Word } from '@/types'
import { findWordInSentence } from './wordForms'
import { TOEIC_THEMES } from './toeic'

// TOEIC Part 5, "Incomplete sentences" (docs/design/toeic.md): a sentence with a
// gap and four options. The grammar questions are hand-written, each with an
// explanation in Vietnamese; the vocabulary questions are cut from the example
// sentences of the TOEIC words, with other TOEIC words of the same part of
// speech as distractors.

type Pair = [vi: string, en: string]

/** What a question tests, as Part 5 questions usually split. */
export type Part5Kind = 'form' | 'prep' | 'verb' | 'link' | 'pronoun' | 'meaning'

export const PART5_KINDS: Record<Part5Kind, Pair> = {
  form: ['Từ loại', 'Word form'],
  prep: ['Giới từ', 'Prepositions'],
  verb: ['Thì & dạng động từ', 'Verb tense & form'],
  link: ['Liên từ', 'Conjunctions'],
  pronoun: ['Đại từ', 'Pronouns'],
  meaning: ['Nghĩa của từ', 'Word meaning'],
}

export interface Part5Question {
  /** The sentence, the gap written as "___". */
  sentence: string
  options: string[]
  answer: number
  kind: Part5Kind
  /** Why the answer is right, in Vietnamese. */
  why: string
  /** The pack word a vocabulary question was cut from. */
  wordId?: number
  /**
   * The sentence in Vietnamese, shown with a vocabulary question: a distractor
   * of the same part of speech can fit the English alone, never the meaning.
   */
  hint?: string
}

const q = (
  kind: Part5Kind,
  sentence: string,
  options: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  why: string
): Part5Question => ({ kind, sentence, options, answer, why })

/** Hand-written questions. The answer index is the right option before shuffling. */
export const PART5_BANK: readonly Part5Question[] = [
  // Word form: the position of the gap decides.
  q(
    'form',
    'The marketing team made a final ___ about the new logo.',
    ['decide', 'decision', 'decisive', 'decisively'],
    1,
    'Sau mạo từ a và tính từ final cần một danh từ: decision (quyết định).'
  ),
  q(
    'form',
    'Ms. Tanaka responded ___ to every customer complaint.',
    ['quick', 'quickly', 'quickness', 'quicker'],
    1,
    'Bổ nghĩa cho động từ responded cần trạng từ: quickly.'
  ),
  q(
    'form',
    'The new software is very ___ to use.',
    ['easy', 'ease', 'easily', 'easiness'],
    0,
    'Sau be + very cần một tính từ: easy.'
  ),
  q(
    'form',
    'All employees must wear ___ equipment in the factory.',
    ['protect', 'protective', 'protection', 'protectively'],
    1,
    'Đứng trước danh từ equipment để mô tả nó là tính từ: protective (bảo hộ).'
  ),
  q(
    'form',
    'We are pleased to announce the ___ of our new branch in Hanoi.',
    ['open', 'opened', 'opening', 'opens'],
    2,
    'Sau the và trước of cần danh từ: the opening of (việc khai trương).'
  ),
  q(
    'form',
    'The hotel was ___ renovated last year.',
    ['complete', 'completely', 'completion', 'completes'],
    1,
    'Đứng giữa was và renovated, bổ nghĩa cho động từ: trạng từ completely (hoàn toàn).'
  ),
  q(
    'form',
    'Mr. Lee is ___ for training new staff.',
    ['responsible', 'responsibility', 'responsibly', 'response'],
    0,
    'be + tính từ + for: be responsible for (chịu trách nhiệm về).'
  ),
  q(
    'form',
    "The company's profits increased ___ this quarter.",
    ['significant', 'significance', 'significantly', 'signify'],
    2,
    'Bổ nghĩa cho động từ increased: trạng từ significantly (đáng kể).'
  ),
  q(
    'form',
    'Please submit your ___ by Friday.',
    ['apply', 'application', 'applicant', 'applied'],
    1,
    'Sau your cần danh từ. Thứ được nộp (submit) là lá đơn: application; applicant là người nộp đơn.'
  ),
  q(
    'form',
    'All ___ in the workshop will receive a certificate.',
    ['participate', 'participation', 'participants', 'participatory'],
    2,
    'Sau All cần danh từ chỉ người, vì họ là người nhận chứng chỉ: participants.'
  ),
  q(
    'form',
    'Our prices are very ___ compared to other stores.',
    ['compete', 'competition', 'competitive', 'competitively'],
    2,
    'Sau be + very cần tính từ: competitive (có sức cạnh tranh).'
  ),
  q(
    'form',
    'Ms. Garcia gave an ___ presentation on the new product.',
    ['impress', 'impressive', 'impression', 'impressively'],
    1,
    'Giữa an và danh từ presentation là tính từ: impressive (ấn tượng).'
  ),
  q(
    'form',
    'The manager asked us to work more ___.',
    ['efficient', 'efficiency', 'efficiently', 'efficiencies'],
    2,
    'Bổ nghĩa cho động từ work (more + trạng từ): efficiently (hiệu quả).'
  ),
  q(
    'form',
    'Customer ___ is our top priority.',
    ['satisfy', 'satisfied', 'satisfaction', 'satisfying'],
    2,
    'Chủ ngữ là một danh từ ghép: customer satisfaction (sự hài lòng của khách hàng).'
  ),
  q(
    'form',
    'The package was ___ delivered to the wrong address.',
    ['accident', 'accidental', 'accidentally', 'accidents'],
    2,
    'Đứng giữa was và delivered, bổ nghĩa cho động từ: trạng từ accidentally (vô tình).'
  ),
  q(
    'form',
    'Our sales ___ will contact you to arrange a meeting.',
    ['represent', 'representative', 'representation', 'represented'],
    1,
    'Người sẽ liên hệ là một danh từ chỉ người: sales representative (nhân viên kinh doanh).'
  ),

  // Prepositions.
  q(
    'prep',
    'The meeting has been moved ___ Thursday afternoon.',
    ['at', 'on', 'in', 'by'],
    1,
    'Trước thứ trong tuần (kể cả Thursday afternoon) dùng on.'
  ),
  q(
    'prep',
    'Please return the signed contract ___ June 15.',
    ['by', 'until', 'since', 'during'],
    0,
    'by + mốc thời gian = chậm nhất là vào lúc đó. until dùng cho việc kéo dài đến mốc đó.'
  ),
  q(
    'prep',
    'The office will be closed ___ the holiday.',
    ['while', 'during', 'since', 'among'],
    1,
    'during + danh từ (trong suốt); while phải đi với một mệnh đề.'
  ),
  q(
    'prep',
    'Ms. Kim has worked here ___ 2019.',
    ['for', 'since', 'from', 'during'],
    1,
    'Hiện tại hoàn thành + since + mốc thời gian; for + khoảng thời gian (for six years).'
  ),
  q(
    'prep',
    'The printer is ___ the copy machine and the window.',
    ['between', 'among', 'through', 'along'],
    0,
    'between A and B: ở giữa hai vật. among dùng cho từ ba vật trở lên.'
  ),
  q(
    'prep',
    'We will reply ___ your request within two days.',
    ['to', 'for', 'at', 'with'],
    0,
    'reply to something: trả lời việc gì.'
  ),
  q(
    'prep',
    'The store is open ___ 9 a.m. to 6 p.m.',
    ['from', 'since', 'at', 'by'],
    0,
    'from … to …: từ … đến ….'
  ),

  // Verb tense and form.
  q(
    'verb',
    'Mr. Brown ___ the report yesterday.',
    ['submits', 'submitted', 'will submit', 'has submitted'],
    1,
    'yesterday là thời điểm đã qua: quá khứ đơn submitted.'
  ),
  q(
    'verb',
    'The new manager ___ her first day here next Monday.',
    ['will start', 'started', 'has started', 'was starting'],
    0,
    'next Monday là tương lai: will start. Ba phương án còn lại đều nói về quá khứ.'
  ),
  q(
    'verb',
    'Sales ___ by 20 percent since January.',
    ['rise', 'rose', 'have risen', 'will rise'],
    2,
    'since January (từ tháng Một đến nay): hiện tại hoàn thành have risen.'
  ),
  q(
    'verb',
    'All visitors must ___ at the front desk.',
    ['register', 'registers', 'registered', 'registering'],
    0,
    'Sau động từ khuyết thiếu must là động từ nguyên mẫu: register.'
  ),
  q(
    'verb',
    'The invoices ___ to the client last week.',
    ['sent', 'were sent', 'are sending', 'send'],
    1,
    'Hoá đơn không tự gửi nên phải dùng bị động; last week là quá khứ: were sent.'
  ),
  q(
    'verb',
    'We look forward to ___ you at the conference.',
    ['see', 'seeing', 'seen', 'saw'],
    1,
    'look forward to + V-ing: mong được làm gì. Ở đây to là giới từ, không phải to + động từ.'
  ),
  q(
    'verb',
    'If the shipment arrives late, we ___ you immediately.',
    ['contact', 'contacted', 'will contact', 'would have contacted'],
    2,
    'Câu điều kiện loại 1: If + hiện tại đơn, will + động từ.'
  ),

  // Conjunctions.
  q(
    'link',
    '___ it was raining, the outdoor event continued.',
    ['Although', 'Because', 'Despite', 'Unless'],
    0,
    'Hai vế trái ngược nhau và theo sau là một mệnh đề: Although. Despite phải đi với danh từ.'
  ),
  q(
    'link',
    'Please call the help desk ___ you have any problems.',
    ['if', 'but', 'so', 'although'],
    0,
    'Nêu điều kiện: if (nếu).'
  ),
  q(
    'link',
    'The flight was delayed ___ the heavy snow.',
    ['because', 'because of', 'although', 'so that'],
    1,
    'because of + danh từ (the heavy snow); because phải đi với một mệnh đề.'
  ),
  q(
    'link',
    'You can pay ___ by cash or by credit card.',
    ['either', 'neither', 'both', 'whether'],
    0,
    'either … or …: hoặc … hoặc ….'
  ),
  q(
    'link',
    'The new phone is ___ lighter and cheaper than the old one.',
    ['both', 'either', 'so', 'neither'],
    0,
    'both … and …: vừa … vừa ….'
  ),

  // Pronouns and relative words.
  q(
    'pronoun',
    'The employee ___ won the award has worked here for ten years.',
    ['who', 'which', 'whose', 'whom'],
    0,
    'Thay cho người và làm chủ ngữ của won: who.'
  ),
  q(
    'pronoun',
    'Mr. Park finished the project by ___.',
    ['him', 'his', 'himself', 'he'],
    2,
    'by + đại từ phản thân = tự mình làm: by himself.'
  ),
  q(
    'pronoun',
    'The company ___ products we sell is based in Japan.',
    ['who', 'whose', 'which', 'what'],
    1,
    'Sở hữu: công ty mà sản phẩm của nó chúng tôi bán → whose products.'
  ),
  q(
    'pronoun',
    'Please send ___ the updated schedule.',
    ['I', 'me', 'my', 'mine'],
    1,
    'Sau động từ send cần tân ngữ: me.'
  ),

  // Word meaning.
  q(
    'meaning',
    'Please ___ the attached file and send us your comments.',
    ['review', 'reserve', 'remove', 'return'],
    0,
    'review a file = xem lại tài liệu để góp ý. Các từ còn lại không hợp nghĩa.'
  ),
  q(
    'meaning',
    'The hotel offers ___ breakfast to all guests.',
    ['complimentary', 'complementary', 'compliment', 'complicated'],
    0,
    'complimentary = miễn phí. complementary là bổ sung cho nhau, hai từ chỉ khác một chữ.'
  ),
  q(
    'meaning',
    'Employees can be ___ for travel expenses.',
    ['reimbursed', 'rewarded', 'reminded', 'refused'],
    0,
    'be reimbursed for expenses: được hoàn trả chi phí.'
  ),
  q(
    'meaning',
    'The conference room is not ___ until 3 p.m.',
    ['available', 'possible', 'capable', 'responsible'],
    0,
    'available = còn trống, dùng được. possible dùng cho sự việc, không dùng cho phòng.'
  ),
]

/** Vocabulary questions cut from the examples of the TOEIC words. */
export function vocabQuestions(words: readonly Word[]): Part5Question[] {
  const themeOf = new Map(TOEIC_THEMES.flatMap((t) => t.words.split(' ').map((w) => [w, t.id])))
  const toeic = words.filter((w) => themeOf.has(w.word))
  return toeic.flatMap((w) => {
    const match = findWordInSentence(w.word, w.exampleEn, w.posCategory)
    // Only examples that use the headword as it is, so all four options read
    // alike, and not as the first word (a capitalised gap against lower-case options).
    if (!match || match.start === 0 || match.surface !== w.word) return []
    // Distractors of the same part of speech from other themes: a word of the
    // same theme (hotel / accommodation) too often fits the sentence as well.
    const others = toeic.filter(
      (o) =>
        o.posCategory === w.posCategory &&
        themeOf.get(o.word) !== themeOf.get(w.word) &&
        !w.exampleEn.toLowerCase().includes(o.word.toLowerCase())
    )
    if (others.length < 3) return []
    return [
      {
        kind: 'meaning' as const,
        sentence: w.exampleEn.slice(0, match.start) + '___' + w.exampleEn.slice(match.end),
        options: [w.word, ...others.map((o) => o.word)],
        answer: 0,
        why: `${w.word} = ${w.meaning}.`,
        hint: w.exampleVi,
        wordId: w.id,
      },
    ]
  })
}

/** Questions in one round: hand-written grammar first in the mix, a few vocabulary ones. */
export const PART5_ROUND = 10
const VOCAB_PER_ROUND = 3

/**
 * One round of Part 5: grammar questions from the bank and vocabulary ones from
 * the pack, shuffled, each with its options shuffled and three distractors.
 */
export function part5Round(
  words: readonly Word[],
  rand: () => number = Math.random
): Part5Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const vocab = shuffle(vocabQuestions(words)).slice(0, VOCAB_PER_ROUND)
  const grammar = shuffle(PART5_BANK).slice(0, PART5_ROUND - vocab.length)
  return shuffle([...grammar, ...vocab]).map((qn) => {
    const right = qn.options[qn.answer]
    const wrong = shuffle(qn.options.filter((_, i) => i !== qn.answer)).slice(0, 3)
    const options = shuffle([right, ...wrong])
    return { ...qn, options, answer: options.indexOf(right) }
  })
}

/** Right answers per kind in a finished round: [kind, right, asked], weakest first. */
export function part5Summary(
  results: { kind: Part5Kind; ok: boolean }[]
): [Part5Kind, number, number][] {
  const tally = new Map<Part5Kind, [number, number]>()
  for (const r of results) {
    const [right, asked] = tally.get(r.kind) ?? [0, 0]
    tally.set(r.kind, [right + (r.ok ? 1 : 0), asked + 1])
  }
  return [...tally]
    .map(([kind, [right, asked]]): [Part5Kind, number, number] => [kind, right, asked])
    .sort((a, b) => a[1] / a[2] - b[1] / b[2])
}
