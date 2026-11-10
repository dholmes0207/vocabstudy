// "Cụm động từ" (docs/design/phrasal-verbs.md): English phrasal verbs grouped
// by their particle, because the particle carries a meaning of its own (up =
// to the end, off = away or stopped, back = return). The practice hides the
// particle in a sentence and offers four of them: the answer and three that
// cannot fit there. Pure; data inline like lib/confusables.ts.

export type Pair = [vi: string, en: string]

export interface PhrasalVerb {
  /** "give up". */
  verb: string
  /** Its meaning in Vietnamese, then in plain English. */
  meaning: Pair
  /** A sentence with ＿ where the particle goes. */
  sentence: string
  vi: string
  /** Other particles that also make a good sentence here: never offered as wrong. */
  alsoFits?: string[]
}

export interface Particle {
  id: string
  emoji: string
  /** What the particle tends to add. */
  sense: Pair
  verbs: PhrasalVerb[]
}

export const GAP = '＿'

const v = (
  verb: string,
  meaning: Pair,
  sentence: string,
  vi: string,
  alsoFits?: string[]
): PhrasalVerb => ({ verb, meaning, sentence, vi, ...(alsoFits ? { alsoFits } : {}) })

export const PARTICLES: Particle[] = [
  {
    id: 'up',
    emoji: '⬆️',
    sense: [
      'Lên cao, tăng lên; hoặc làm cho tới cùng, xong hẳn.',
      'Rising or increasing; or all the way, to the end.',
    ],
    verbs: [
      v(
        'give up',
        ['từ bỏ', 'stop trying'],
        'Don’t give ＿ now — you’re almost at the finish line!',
        'Đừng bỏ cuộc lúc này, bạn sắp tới đích rồi!'
      ),
      v(
        'pick up',
        ['đón (ai đó)', 'collect someone'],
        'I’ll pick you ＿ at the station at six.',
        'Tôi sẽ đón bạn ở ga lúc sáu giờ.'
      ),
      v(
        'wake up',
        ['thức dậy', 'stop sleeping'],
        'I usually wake ＿ at six, even at weekends.',
        'Tôi thường dậy lúc sáu giờ, kể cả cuối tuần.'
      ),
      v(
        'look up',
        ['tra (từ điển)', 'find information'],
        'If you don’t know a word, look it ＿ in the dictionary.',
        'Nếu không biết một từ, hãy tra nó trong từ điển.'
      ),
      v(
        'set up',
        ['thành lập, dựng nên', 'start a company or system'],
        'She set ＿ her own company in 2020.',
        'Cô ấy thành lập công ty riêng năm 2020.'
      ),
    ],
  },
  {
    id: 'out',
    emoji: '🚪',
    sense: [
      'Ra ngoài; hoặc tìm ra, dùng tới hết.',
      'Outside; or discovering something, using it all.',
    ],
    verbs: [
      v(
        'find out',
        ['tìm ra, biết được', 'discover'],
        'I need to find ＿ what time the train leaves.',
        'Tôi cần biết mấy giờ tàu chạy.'
      ),
      v(
        'run out (of)',
        ['hết, cạn', 'have none left'],
        'We’ve run ＿ of milk, so I’ll buy some on the way home.',
        'Nhà hết sữa rồi, nên tôi sẽ mua trên đường về.'
      ),
      v(
        'work out',
        ['tập thể dục', 'exercise'],
        'He works ＿ at the gym three times a week.',
        'Anh ấy tập ở phòng gym ba lần một tuần.'
      ),
      v(
        'fill out',
        ['điền (đơn, phiếu)', 'complete a form'],
        'Please fill ＿ this form and sign at the bottom.',
        'Vui lòng điền phiếu này và ký ở cuối trang.'
      ),
      v(
        'eat out',
        ['ăn ở ngoài', 'eat at a restaurant'],
        'Nobody feels like cooking, so let’s eat ＿ tonight.',
        'Chẳng ai muốn nấu, nên tối nay mình đi ăn ngoài nhé.'
      ),
    ],
  },
  {
    id: 'off',
    emoji: '✈️',
    sense: [
      'Rời đi, tách khỏi; hoặc tắt, dừng, huỷ.',
      'Leaving or coming away; or switched off, stopped, cancelled.',
    ],
    verbs: [
      v(
        'take off',
        ['cất cánh', 'leave the ground'],
        'Fasten your seat belt — the plane will take ＿ in ten minutes.',
        'Thắt dây an toàn vào, mười phút nữa máy bay cất cánh.'
      ),
      v(
        'turn off',
        ['tắt', 'switch off'],
        'Please turn ＿ your phones before the exam starts.',
        'Vui lòng tắt điện thoại trước khi bắt đầu thi.',
        ['over']
      ),
      v(
        'call off',
        ['huỷ bỏ', 'cancel'],
        'The match was called ＿ because of the heavy rain.',
        'Trận đấu bị huỷ vì mưa to.'
      ),
      v(
        'show off',
        ['khoe khoang', 'try to impress'],
        'He loves showing ＿ his new car to everyone.',
        'Anh ta thích khoe chiếc xe mới với mọi người.'
      ),
      v(
        'drop off',
        ['thả (ai) xuống, đưa tới', 'take someone somewhere and leave'],
        'Could you drop me ＿ at the corner, please?',
        'Bạn thả tôi xuống ở góc đường được không?'
      ),
    ],
  },
  {
    id: 'on',
    emoji: '💡',
    sense: [
      'Bật lên, mặc lên người; hoặc tiếp tục.',
      'Switched on, put on the body; or continuing.',
    ],
    verbs: [
      v(
        'turn on',
        ['bật', 'switch on'],
        'It’s so dark in here — can you turn ＿ the light?',
        'Trong này tối quá, bạn bật đèn lên được không?'
      ),
      v(
        'put on',
        ['mặc vào, đội vào', 'dress in'],
        'It’s cold outside, so put ＿ your coat.',
        'Ngoài trời lạnh đấy, mặc áo khoác vào.',
        ['away']
      ),
      v(
        'go on',
        ['tiếp tục', 'continue'],
        'Sorry for interrupting — please go ＿.',
        'Xin lỗi vì ngắt lời, bạn nói tiếp đi.',
        ['away']
      ),
      v(
        'try on',
        ['mặc thử', 'wear to check the fit'],
        'Can I try ＿ these shoes in a bigger size?',
        'Tôi mang thử đôi giày này cỡ lớn hơn được không?'
      ),
      v(
        'get on',
        ['lên (xe buýt, tàu)', 'board a bus or train'],
        'The bus is here — quick, let’s get ＿!',
        'Xe buýt tới rồi, nhanh lên xe nào!',
        ['away']
      ),
    ],
  },
  {
    id: 'down',
    emoji: '⬇️',
    sense: [
      'Xuống, giảm đi; hoặc ghi lại, dừng hẳn.',
      'Down or decreasing; or written down, stopped.',
    ],
    verbs: [
      v(
        'sit down',
        ['ngồi xuống', 'take a seat'],
        'Please come in and sit ＿.',
        'Mời vào và ngồi xuống.'
      ),
      v(
        'write down',
        ['ghi lại', 'note on paper'],
        'Write ＿ the address so you don’t forget it.',
        'Ghi địa chỉ lại kẻo quên.'
      ),
      v(
        'slow down',
        ['chậm lại', 'go less fast'],
        'Slow ＿! You’re driving too fast.',
        'Chậm lại! Bạn lái nhanh quá.'
      ),
      v(
        'turn down',
        ['từ chối', 'refuse'],
        'She turned ＿ the job offer because the pay was too low.',
        'Cô ấy từ chối lời mời làm việc vì lương quá thấp.'
      ),
      v(
        'break down',
        ['hỏng (xe, máy)', 'stop working'],
        'Our car broke ＿ on the way to the airport.',
        'Xe chúng tôi bị hỏng trên đường ra sân bay.'
      ),
    ],
  },
  {
    id: 'back',
    emoji: '↩️',
    sense: ['Trở lại, trả lại.', 'Returning, or giving something in return.'],
    verbs: [
      v(
        'come back',
        ['quay lại', 'return'],
        'I’m just popping to the shop — I’ll come ＿ in five minutes.',
        'Tôi chạy ra cửa hàng chút, năm phút nữa quay lại.',
        ['over']
      ),
      v(
        'get back',
        ['về tới, trở về', 'arrive home again'],
        'What time did you get ＿ from your holiday?',
        'Bạn đi nghỉ về lúc mấy giờ?'
      ),
      v(
        'give back',
        ['trả lại', 'return something'],
        'Please give me ＿ my book when you’ve finished it.',
        'Đọc xong thì trả lại sách cho tôi nhé.'
      ),
      v(
        'pay back',
        ['trả (tiền nợ)', 'return money'],
        'Thanks for lending me the money — I’ll pay you ＿ next week.',
        'Cảm ơn đã cho mượn tiền, tuần sau tôi trả.'
      ),
      v(
        'look back (on)',
        ['nhìn lại (quá khứ)', 'think about the past'],
        'When I look ＿ on my school days, I feel happy.',
        'Khi nhìn lại thời đi học, tôi thấy vui.'
      ),
    ],
  },
  {
    id: 'over',
    emoji: '🔄',
    sense: [
      'Qua, từ đầu tới cuối; hoặc chuyển sang người khác.',
      'Across, from start to finish; or passing to someone else.',
    ],
    verbs: [
      v(
        'take over',
        ['tiếp quản', 'take control or responsibility'],
        'Mai will take ＿ as manager when Tom retires.',
        'Mai sẽ tiếp quản vị trí quản lý khi Tom nghỉ hưu.'
      ),
      v(
        'look over',
        ['xem qua, soát lại', 'check quickly'],
        'Could you look ＿ my report before I send it?',
        'Bạn xem qua giúp tôi bản báo cáo trước khi tôi gửi được không?'
      ),
      v(
        'get over',
        ['khỏi (bệnh), vượt qua', 'recover from'],
        'It took her two weeks to get ＿ the flu.',
        'Cô ấy mất hai tuần mới khỏi cúm.'
      ),
      v(
        'think over',
        ['cân nhắc kỹ', 'consider carefully'],
        'Take a few days to think it ＿ before you decide.',
        'Hãy dành vài ngày cân nhắc kỹ trước khi quyết định.'
      ),
      v(
        'go over',
        ['ôn lại, xem lại', 'review'],
        'Let’s go ＿ the main points again before the test.',
        'Mình ôn lại các ý chính một lần nữa trước khi kiểm tra nhé.'
      ),
    ],
  },
  {
    id: 'away',
    emoji: '👋',
    sense: [
      'Rời xa, đi khỏi; hoặc cho đi, bỏ đi.',
      'Away from here; or giving or getting rid of something.',
    ],
    verbs: [
      v(
        'give away',
        ['cho đi, tặng', 'give for free'],
        'She gave ＿ all her old clothes to charity.',
        'Cô ấy đem hết quần áo cũ cho từ thiện.'
      ),
      v(
        'throw away',
        ['vứt đi', 'put in the bin'],
        'Don’t throw ＿ those boxes — we can use them again.',
        'Đừng vứt mấy cái hộp đó, mình dùng lại được.',
        ['out']
      ),
      v(
        'run away',
        ['bỏ chạy', 'escape'],
        'The dog ran ＿ when it heard the fireworks.',
        'Con chó bỏ chạy khi nghe tiếng pháo hoa.',
        ['off']
      ),
      v(
        'pass away',
        ['qua đời', 'die (polite)'],
        'His grandfather passed ＿ peacefully last year.',
        'Ông của anh ấy qua đời thanh thản năm ngoái.',
        ['on']
      ),
      v(
        'put away',
        ['cất đi', 'put in its place'],
        'Please put ＿ your toys before dinner.',
        'Con cất đồ chơi đi trước khi ăn tối nhé.',
        ['back']
      ),
    ],
  },
]

export interface PhrasalQuestion {
  particle: Particle
  item: PhrasalVerb
  /** The answer and three particles that cannot fill this gap, shuffled. */
  options: string[]
}

/** How many particles a question offers. */
export const OPTIONS = 4

/** The particle that fills the gap. */
export const answerOf = (q: PhrasalQuestion): string => q.particle.id

/** The sentence with its particle back in place. */
export const filled = (q: Pick<PhrasalQuestion, 'particle' | 'item'>): string =>
  q.item.sentence.replace(GAP, q.particle.id)

/**
 * A round: `size` sentences, from one particle or from all (spread over the
 * particles first, then shuffled).
 */
export function phrasalRound(
  size = 10,
  only?: string,
  rand: () => number = Math.random
): PhrasalQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const groups = PARTICLES.filter((p) => !only || p.id === only)
  const options = (particle: Particle, item: PhrasalVerb): string[] => {
    const wrong = shuffle(
      PARTICLES.map((p) => p.id).filter((id) => id !== particle.id && !item.alsoFits?.includes(id))
    ).slice(0, OPTIONS - 1)
    return shuffle([particle.id, ...wrong])
  }
  const decks = groups.map((particle) =>
    shuffle(particle.verbs).map((item) => ({ particle, item, options: options(particle, item) }))
  )
  const out: PhrasalQuestion[] = []
  for (let layer = 0; out.length < size && decks.some((d) => d.length > layer); layer++)
    for (const d of shuffle(decks)) if (d[layer] && out.length < size) out.push(d[layer])
  return shuffle(out)
}

/** XP for a round, as for look-alike characters. */
export const phrasalXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
