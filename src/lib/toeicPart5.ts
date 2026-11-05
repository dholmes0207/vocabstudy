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

  // More of each kind (04/11/2026), so a round rarely repeats.
  q(
    'prep',
    'The training session will take place ___ the second floor.',
    ['on', 'in', 'at', 'to'],
    0,
    'on + tầng (on the second floor).'
  ),
  q(
    'prep',
    'Ms. Ito has been responsible ___ the budget since March.',
    ['for', 'of', 'with', 'to'],
    0,
    'be responsible for: chịu trách nhiệm về.'
  ),
  q(
    'prep',
    'All employees are required to arrive ___ 9 a.m.',
    ['by', 'until', 'during', 'since'],
    0,
    'by + giờ = chậm nhất là lúc đó. until đi với việc kéo dài đến mốc đó.'
  ),
  q(
    'prep',
    'The package was delivered ___ mistake to our old office.',
    ['by', 'for', 'with', 'on'],
    0,
    'by mistake: do nhầm lẫn.'
  ),
  q(
    'link',
    'Please contact Mr. Lee ___ you have any questions about the event.',
    ['if', 'unless', 'despite', 'during'],
    0,
    'if: nếu. unless = trừ khi, làm câu mang nghĩa ngược lại; despite và during cần danh từ.'
  ),
  q(
    'verb',
    'The new office ___ next month, if everything goes as planned.',
    ['will open', 'opened', 'has opened', 'was opening'],
    0,
    'next month là tương lai: will open.'
  ),
  q(
    'verb',
    'By the time the manager arrived, the meeting ___ already.',
    ['had started', 'starts', 'will start', 'is starting'],
    0,
    'Việc xảy ra trước một mốc trong quá khứ: quá khứ hoàn thành had started.'
  ),
  q(
    'verb',
    'The report must ___ by the end of the day.',
    ['be finished', 'finish', 'finishing', 'finished'],
    0,
    'Bản báo cáo không tự hoàn thành: bị động sau must là must be + V3.'
  ),
  q(
    'verb',
    'Ms. Chen suggested ___ the meeting to Friday.',
    ['moving', 'move', 'to move', 'moved'],
    0,
    'suggest + V-ing: gợi ý làm gì.'
  ),
  q(
    'verb',
    'We are pleased ___ you that your application has been accepted.',
    ['to inform', 'informing', 'inform', 'informed'],
    0,
    'be pleased + to V: vui mừng (được) làm gì.'
  ),
  q(
    'verb',
    'The company ___ in this building for more than twenty years.',
    ['has been', 'is', 'will be', 'be'],
    0,
    'for more than twenty years tính đến nay: hiện tại hoàn thành has been.'
  ),
  q(
    'link',
    'The price is reasonable, ___ the quality is excellent.',
    ['and', 'but', 'or', 'so'],
    0,
    'Hai ý cùng chiều (giá hợp lý, chất lượng tốt): and. but dùng cho hai ý trái ngược.'
  ),
  q(
    'link',
    'The store was closed, ___ we went to another one.',
    ['so', 'because', 'although', 'unless'],
    0,
    'Vế sau là kết quả của vế trước: so (vì vậy).'
  ),
  q(
    'link',
    '___ the bad weather, the flight left on time.',
    ['Despite', 'Although', 'Because', 'Even if'],
    0,
    'Theo sau là danh từ (the bad weather), nên dùng Despite. Although cần một mệnh đề.'
  ),
  q(
    'link',
    'Please send the documents ___ we can review them before the meeting.',
    ['so that', 'even though', 'unless', 'whether'],
    0,
    'so that: để (chỉ mục đích).'
  ),
  q(
    'link',
    'Neither the manager ___ his assistant was at the meeting.',
    ['nor', 'or', 'and', 'but'],
    0,
    'neither … nor …: không … cũng không ….'
  ),
  q(
    'pronoun',
    'The staff thanked the manager for ___ support during the project.',
    ['her', 'she', 'hers', 'herself'],
    0,
    'Trước danh từ support cần tính từ sở hữu: her support.'
  ),
  q(
    'pronoun',
    'The documents ___ you requested are on your desk.',
    ['that', 'who', 'whom', 'whose'],
    0,
    'Thay cho vật (the documents): that hoặc which. who và whom dùng cho người.'
  ),
  q(
    'verb',
    'Each of the employees ___ a parking space.',
    ['has', 'have', 'having', 'to have'],
    0,
    'Each of + danh từ số nhiều vẫn đi với động từ số ít: has.'
  ),
  q(
    'pronoun',
    'If you need help, please ask ___ of our staff at the front desk.',
    ['one', 'ones', 'anyone', 'it'],
    0,
    'one of our staff: một trong số nhân viên của chúng tôi.'
  ),
  q(
    'meaning',
    'Please ___ the form and return it to the front desk.',
    ['complete', 'compete', 'compare', 'compose'],
    0,
    'complete a form = điền đầy đủ một mẫu đơn. Bốn từ chỉ khác vài chữ, đó chính là cái bẫy.'
  ),
  q(
    'meaning',
    'The hotel is located within walking ___ of the station.',
    ['distance', 'length', 'range', 'space'],
    0,
    'within walking distance of: có thể đi bộ tới. Đây là cụm cố định.'
  ),
  q(
    'meaning',
    'Our customer service team is ___ 24 hours a day.',
    ['available', 'possible', 'convenient', 'necessary'],
    0,
    'available = có mặt, sẵn sàng phục vụ.'
  ),
  q(
    'meaning',
    'The company will ___ a new product line next spring.',
    ['launch', 'lunch', 'lift', 'lead'],
    0,
    'launch a product = tung ra sản phẩm.'
  ),
  q(
    'meaning',
    'Ms. Kim was ___ to manager after five years with the company.',
    ['promoted', 'produced', 'proposed', 'provided'],
    0,
    'be promoted to manager = được thăng chức lên quản lý.'
  ),
  q(
    'meaning',
    'Please keep your ___ as proof of purchase.',
    ['receipt', 'recipe', 'reception', 'recipient'],
    0,
    'receipt = biên lai, hoá đơn. recipe là công thức nấu ăn, recipient là người nhận.'
  ),
  q(
    'meaning',
    'The meeting was ___ because the manager was sick.',
    ['postponed', 'promoted', 'prevented', 'presented'],
    0,
    'postpone = hoãn lại. Cuộc họp bị hoãn vì quản lý bị ốm.'
  ),
  q(
    'pronoun',
    'Mr. Davis and ___ will attend the conference in Seoul.',
    ['I', 'me', 'my', 'mine'],
    0,
    'Đứng cùng Mr. Davis làm chủ ngữ của will attend: đại từ chủ ngữ I.'
  ),
  // More pronouns and prepositions (05/11/2026).
  q(
    'pronoun',
    'Mr. Lee asked his assistant to send the report to ___ before noon.',
    ['him', 'he', 'his', 'himself'],
    0,
    'Sau giới từ to cần đại từ tân ngữ: him. himself chỉ dùng khi chủ ngữ và tân ngữ là một người.'
  ),
  q(
    'pronoun',
    'The designers presented ___ own ideas for the new store.',
    ['their', 'they', 'them', 'theirs'],
    0,
    'Trước own + danh từ cần tính từ sở hữu: their own ideas.'
  ),
  q(
    'pronoun',
    'Ms. Park prepared the slides ___ because her assistant was sick.',
    ['herself', 'her', 'she', 'hers'],
    0,
    'Đại từ phản thân herself nhấn mạnh cô ấy tự làm, không ai giúp.'
  ),
  q(
    'pronoun',
    'Applicants ___ résumés arrive after Friday will not be considered.',
    ['whose', 'who', 'which', 'whom'],
    0,
    'Cần đại từ quan hệ chỉ sở hữu trước danh từ résumés: whose (hồ sơ của những người đó).'
  ),
  q(
    'pronoun',
    'Of the two printers, the new one is faster, but ___ uses more ink.',
    ['it', 'they', 'its', 'them'],
    0,
    'Chủ ngữ số ít thay cho the new one: it. its là tính từ sở hữu, không làm chủ ngữ.'
  ),
  q(
    'prep',
    'The museum is open every day ___ Monday.',
    ['except', 'besides', 'beside', 'despite'],
    0,
    'except: trừ, ngoại trừ. Mở cửa mọi ngày trừ thứ Hai. besides là "ngoài ra còn", beside là "bên cạnh".'
  ),
  q(
    'prep',
    'Please submit the form ___ the end of the month.',
    ['by', 'until', 'since', 'for'],
    0,
    'by + thời điểm: hạn chót, chậm nhất là cuối tháng. until dùng cho việc kéo dài đến lúc đó.'
  ),
  q(
    'prep',
    'Our office is located ___ the bank and the post office.',
    ['between', 'among', 'through', 'along'],
    0,
    'between A and B: ở giữa hai nơi. among dùng cho từ ba thứ trở lên, không đi với and.'
  ),
  q(
    'prep',
    'The new policy will take effect ___ January 1.',
    ['on', 'in', 'at', 'for'],
    0,
    'on + ngày cụ thể: on January 1. in dùng cho tháng hoặc năm.'
  ),
  q(
    'prep',
    '___ the heavy rain, the outdoor concert went ahead as planned.',
    ['Despite', 'Although', 'Because', 'Unless'],
    0,
    'Sau chỗ trống là cụm danh từ (the heavy rain), nên cần giới từ Despite. Although cần cả một mệnh đề.'
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

/**
 * A round of the bank's questions the learner missed before (keyed by their
 * sentence), up to a full round, options shuffled as in part5Round.
 */
export function retryRound(
  missed: readonly string[],
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
  const keep = new Set(missed)
  return shuffle(PART5_BANK.filter((qn) => keep.has(qn.sentence)))
    .slice(0, PART5_ROUND)
    .map((qn) => {
      const right = qn.options[qn.answer]
      const options = shuffle(qn.options)
      return { ...qn, options, answer: options.indexOf(right) }
    })
}

/**
 * The kind of question answered worst, among those asked at least `min` times,
 * once enough answers are in: null before `total` answers, or when every kind
 * is perfect.
 */
export function weakestKind<K extends string = Part5Kind>(
  kinds: Partial<Record<K, [number, number]>>,
  min = 5,
  total = 10
): [K, number, number] | null {
  const rows = Object.entries(kinds) as [K, [number, number]][]
  if (rows.reduce((n, [, [, asked]]) => n + asked, 0) < total) return null
  const worst = rows
    .filter(([, [right, asked]]) => asked >= min && right < asked)
    .sort(([, [ra, aa]], [, [rb, ab]]) => ra / aa - rb / ab)[0]
  return worst ? [worst[0], worst[1][0], worst[1][1]] : null
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
