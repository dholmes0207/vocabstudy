// "Kết hợp từ" (docs/design/collocations.md): English word partners that
// Vietnamese learners get wrong by translating word for word — "mở đèn" is
// not "open the light", "uống thuốc" is not "drink medicine". Each item has
// the Vietnamese phrase, the natural English, the word-for-word slip, and a
// sentence to fill. The practice offers the right partner beside the slip
// and one more wrong word. Pure; data inline like lib/idiomsEn.ts.

export type Pair = [vi: string, en: string]

export type CollocationTheme = 'daily' | 'study' | 'work' | 'ielts'

export const THEMES: { id: CollocationTheme; emoji: string; title: Pair }[] = [
  { id: 'daily', emoji: '🏠', title: ['Đời sống hằng ngày', 'Everyday life'] },
  { id: 'study', emoji: '📚', title: ['Học hành, thi cử', 'Study and exams'] },
  { id: 'work', emoji: '💼', title: ['Công việc, tiền bạc', 'Work and money'] },
  {
    id: 'ielts',
    emoji: '🌍',
    title: ['Xã hội, môi trường (IELTS)', 'Society and environment (IELTS)'],
  },
]

/** The gap in a practice sentence. */
export const GAP = '___'

export interface Collocation {
  theme: CollocationTheme
  /** The Vietnamese phrase learners start from. */
  vi: string
  /** Natural English. */
  right: string
  /** What word-for-word translation gives. */
  slip: string
  /** A sentence with one gap, filled by `answer`. */
  sentence: string
  answer: string
  /** Two wrong partners; the first is the word-for-word one used in `slip`. */
  traps: [string, string]
  /** Why, in Vietnamese. */
  why: string
}

const c = (
  theme: CollocationTheme,
  vi: string,
  right: string,
  slip: string,
  sentence: string,
  answer: string,
  traps: [string, string],
  why: string
): Collocation => ({ theme, vi, right, slip, sentence, answer, traps, why })

export const COLLOCATIONS: Collocation[] = [
  // Everyday life
  c(
    'daily',
    'mưa to',
    'heavy rain',
    'big rain',
    'We got wet in the ___ rain on the way home.',
    'heavy',
    ['big', 'tall'],
    'Mưa to, kẹt xe nặng đều dùng heavy: heavy rain, heavy traffic. "big rain" là dịch từng chữ.'
  ),
  c(
    'daily',
    'đường đông xe, kẹt xe',
    'heavy traffic',
    'crowded traffic',
    'There is always ___ traffic in the city centre at six o’clock.',
    'heavy',
    ['crowded', 'fat'],
    'Xe cộ đông là heavy traffic. crowded dùng cho nơi chốn: a crowded street, a crowded bus.'
  ),
  c(
    'daily',
    'bật đèn',
    'turn on the light',
    'open the light',
    'It’s dark in here. Can you ___ the light?',
    'turn on',
    ['open', 'start'],
    'Bật / tắt đồ điện là turn on / turn off (switch on / off). open chỉ dùng cho cửa, hộp, sách.'
  ),
  c(
    'daily',
    'uống thuốc',
    'take medicine',
    'drink medicine',
    'Don’t forget to ___ your medicine after lunch.',
    'take',
    ['drink', 'eat'],
    'Thuốc (viên hay nước) đều dùng take: take medicine, take a pill. drink chỉ dùng cho đồ uống.'
  ),
  c(
    'daily',
    'chụp ảnh',
    'take a photo',
    'catch a photo',
    'Excuse me, could you ___ a photo of us?',
    'take',
    ['catch', 'make'],
    'Chụp ảnh là take a photo / take a picture. "chụp" không dịch thành catch.'
  ),
  c(
    'daily',
    'cà phê đặc',
    'strong coffee',
    'thick coffee',
    'I need a cup of ___ coffee to wake up.',
    'strong',
    ['thick', 'hard'],
    'Cà phê, trà đậm là strong; nhạt là weak. thick dùng cho súp, sốt sệt, không dùng cho cà phê.'
  ),
  // Study and exams
  c(
    'study',
    'tiếp thu kiến thức',
    'gain knowledge',
    'learn knowledge',
    'Reading widely is a good way to ___ knowledge.',
    'gain',
    ['learn', 'catch'],
    'learn đã có nghĩa là "học để biết", nên không đi với knowledge. Dùng gain / acquire knowledge, hoặc chỉ learn a lot.'
  ),
  c(
    'study',
    'đi thi, dự thi',
    'take a test',
    'join a test',
    'She will ___ the IELTS test next month.',
    'take',
    ['join', 'go'],
    'Dự thi là take (hoặc sit) an exam / a test. join dùng cho câu lạc bộ, nhóm: join a club.'
  ),
  c(
    'study',
    'tiến bộ',
    'make progress',
    'do progress',
    'You have ___ great progress this term.',
    'made',
    ['done', 'had'],
    'Tiến bộ là make progress. Không nói do progress hay have progress.'
  ),
  c(
    'study',
    'chú ý',
    'pay attention',
    'put attention',
    'Please ___ attention to the instructions.',
    'pay',
    ['put', 'take'],
    'Chú ý là pay attention (to). "put attention" là dịch từ "đặt sự chú ý".'
  ),
  c(
    'study',
    'mắc lỗi',
    'make a mistake',
    'fall a mistake',
    'Everyone ___ mistakes when they learn a new language.',
    'makes',
    ['falls', 'does'],
    'Mắc lỗi là make a mistake. "mắc" không dịch thành fall; do cũng không đi với mistake.'
  ),
  c(
    'study',
    'học thuộc lòng',
    'learn by heart',
    'study by heart',
    'We had to ___ the poem by heart.',
    'learn',
    ['study', 'read'],
    'Học thuộc lòng là learn something by heart (hoặc memorise). Không nói study by heart.'
  ),
  // Work and money
  c(
    'work',
    'kiếm tiền',
    'earn money',
    'find money',
    'Many students work part-time to ___ money.',
    'earn',
    ['find', 'search'],
    'Kiếm tiền là earn money (hoặc make money). find money là "nhặt được tiền".'
  ),
  c(
    'work',
    'giá đắt',
    'a high price',
    'an expensive price',
    'Flats in the city centre sell at a very ___ price.',
    'high',
    ['expensive', 'tall'],
    'Món đồ thì expensive, còn giá thì high / low: a high price. "expensive price" là lặp nghĩa.'
  ),
  c(
    'work',
    'đưa ra quyết định',
    'make a decision',
    'do a decision',
    'It took us a week to ___ a decision.',
    'make',
    ['do', 'bring'],
    'Quyết định là make a decision. "đưa ra" không dịch thành bring.'
  ),
  c(
    'work',
    'tổ chức cuộc họp',
    'hold a meeting',
    'do a meeting',
    'We ___ a short meeting every Monday morning.',
    'hold',
    ['do', 'build'],
    'Họp là hold / have a meeting. do không đi với meeting.'
  ),
  c(
    'work',
    'kịp hạn chót',
    'meet a deadline',
    'catch a deadline',
    'I worked all night to ___ the deadline.',
    'meet',
    ['catch', 'arrive'],
    'Kịp hạn là meet a deadline, trễ hạn là miss a deadline. catch dùng cho xe buýt, tàu: catch a bus.'
  ),
  c(
    'work',
    'nộp đơn xin việc',
    'apply for a job',
    'submit for a job',
    'She ___ for a job at a bank last week.',
    'applied',
    ['submitted', 'requested'],
    'Xin việc là apply for a job. submit đi với giấy tờ: submit an application, submit a form.'
  ),
  // Society and environment (IELTS)
  c(
    'ielts',
    'nâng cao nhận thức',
    'raise awareness',
    'lift awareness',
    'Schools should ___ awareness of climate change.',
    'raise',
    ['lift', 'upgrade'],
    'Nâng cao nhận thức là raise awareness (of). Cụm rất hay dùng trong IELTS Writing Task 2.'
  ),
  c(
    'ielts',
    'gây ra mối đe doạ',
    'pose a threat',
    'bring a threat',
    'Plastic waste ___ a serious threat to sea life.',
    'poses',
    ['brings', 'makes'],
    'Gây ra mối đe doạ là pose a threat (to). bring a threat là dịch từng chữ.'
  ),
  c(
    'ielts',
    'khoảng cách giàu nghèo',
    'the gap between rich and poor',
    'the distance between rich and poor',
    'The ___ between rich and poor is getting wider.',
    'gap',
    ['distance', 'space'],
    'Chênh lệch giữa hai nhóm là gap. distance là khoảng cách về đường đi.'
  ),
  c(
    'ielts',
    'giải quyết vấn đề',
    'tackle a problem',
    'answer a problem',
    'The government must ___ the problem of air pollution.',
    'tackle',
    ['answer', 'release'],
    'Giải quyết vấn đề là tackle / solve / deal with a problem. answer đi với câu hỏi: answer a question.'
  ),
  c(
    'ielts',
    'đóng vai trò quan trọng',
    'play an important role',
    'act an important role',
    'Technology ___ an important role in modern education.',
    'plays',
    ['acts', 'does'],
    'Đóng vai trò là play a role / play a part. act đi với kịch: act in a play.'
  ),
  c(
    'ielts',
    'bảo vệ môi trường',
    'protect the environment',
    'guard the environment',
    'We all have a duty to ___ the environment.',
    'protect',
    ['guard', 'keep'],
    'Bảo vệ môi trường là protect the environment. guard là canh gác (người, cửa).'
  ),
]

/** The sentence with its gap filled. */
export const filled = (it: Collocation, word = it.answer): string => it.sentence.replace(GAP, word)

export interface CollocationQuestion {
  item: Collocation
  options: string[]
  answer: number
}

/** A round: items from every theme (or one), each with its partner and two traps. */
export function collocationRound(
  size = 10,
  theme?: CollocationTheme,
  rand: () => number = Math.random,
  pool: readonly Collocation[] = COLLOCATIONS
): CollocationQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1))
      ;[a[j], a[k]] = [a[k], a[j]]
    }
    return a
  }
  return shuffle(pool.filter((x) => !theme || x.theme === theme))
    .slice(0, size)
    .map((item) => {
      const options = shuffle([item.answer, ...item.traps])
      return { item, options, answer: options.indexOf(item.answer) }
    })
}

/** XP for a round, as for the idioms. */
export const collocationXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
