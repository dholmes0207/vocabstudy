// "Bẫy Hán Việt" (docs/design/han-viet-traps.md): Chinese words whose
// Sino-Vietnamese reading points a Vietnamese learner the wrong way. 大家 reads
// "đại gia" but means "everyone"; 便宜 reads "tiện nghi" but means "cheap".
// Each word has the meaning its Hán Việt sound suggests (the trap) and the one
// it really has. The practice puts the trap among the options. Pure; data
// inline like lib/netSlang.ts.

export type Pair = [vi: string, en: string]

export interface HanVietTrap {
  zh: string
  pinyin: string
  /** Sino-Vietnamese reading, one syllable per character. */
  hv: string
  /** What the Hán Việt reading makes a Vietnamese speaker think. */
  trap: Pair
  /** What the word means in Chinese today. */
  meaning: Pair
  example: { zh: string; pinyin: string; vi: string }
}

const w = (
  zh: string,
  pinyin: string,
  hv: string,
  trap: Pair,
  meaning: Pair,
  example: [zh: string, pinyin: string, vi: string]
): HanVietTrap => ({
  zh,
  pinyin,
  hv,
  trap,
  meaning,
  example: { zh: example[0], pinyin: example[1], vi: example[2] },
})

export const HAN_VIET_TRAPS: HanVietTrap[] = [
  w(
    '大家',
    'dàjiā',
    'đại gia',
    ['người giàu có', 'a rich tycoon'],
    ['mọi người', 'everyone'],
    ['大家好！', 'Dàjiā hǎo!', 'Chào mọi người!']
  ),
  w(
    '便宜',
    'piányi',
    'tiện nghi',
    ['đầy đủ tiện nghi, thoải mái', 'comfortable, well-equipped'],
    ['rẻ', 'cheap'],
    ['这件衣服很便宜。', 'Zhè jiàn yīfu hěn piányi.', 'Bộ quần áo này rất rẻ.']
  ),
  w(
    '告诉',
    'gàosu',
    'cáo tố',
    ['tố cáo', 'to denounce'],
    ['nói cho biết', 'to tell'],
    [
      '请告诉我你的电话号码。',
      'Qǐng gàosu wǒ nǐ de diànhuà hàomǎ.',
      'Hãy cho tôi biết số điện thoại của bạn.',
    ]
  ),
  w(
    '爱人',
    'àirén',
    'ái nhân',
    ['người yêu', 'a boyfriend or girlfriend'],
    ['vợ hoặc chồng', 'husband or wife'],
    [
      '这是我爱人，她是医生。',
      'Zhè shì wǒ àirén, tā shì yīshēng.',
      'Đây là vợ tôi, cô ấy là bác sĩ.',
    ]
  ),
  w(
    '先生',
    'xiānsheng',
    'tiên sinh',
    ['thầy đồ, người có học', 'a learned scholar'],
    ['ông, anh (cách gọi lịch sự); chồng', 'Mr, sir; husband'],
    ['王先生，您好！', 'Wáng xiānsheng, nín hǎo!', 'Chào ông Vương!']
  ),
  w(
    '东西',
    'dōngxi',
    'đông tây',
    ['phía đông và phía tây', 'east and west'],
    ['đồ vật, đồ đạc', 'things, stuff'],
    ['我去超市买东西。', 'Wǒ qù chāoshì mǎi dōngxi.', 'Tôi đi siêu thị mua đồ.']
  ),
  w(
    '走',
    'zǒu',
    'tẩu',
    ['chạy trốn (tẩu thoát)', 'to flee'],
    ['đi, đi bộ; rời đi', 'to walk, to go, to leave'],
    ['我们走吧！', 'Wǒmen zǒu ba!', 'Chúng mình đi thôi!']
  ),
  w(
    '老婆',
    'lǎopo',
    'lão bà',
    ['bà già', 'an old woman'],
    ['vợ (cách gọi thân mật)', 'wife (casual)'],
    ['我老婆做饭很好吃。', 'Wǒ lǎopo zuò fàn hěn hǎochī.', 'Vợ tôi nấu ăn rất ngon.']
  ),
  w(
    '方便',
    'fāngbiàn',
    'phương tiện',
    ['phương tiện (xe cộ, công cụ)', 'a means, a vehicle'],
    ['thuận tiện', 'convenient'],
    ['这里坐地铁很方便。', 'Zhèlǐ zuò dìtiě hěn fāngbiàn.', 'Ở đây đi tàu điện ngầm rất tiện.']
  ),
  w(
    '工作',
    'gōngzuò',
    'công tác',
    ['đi công tác', 'a business trip'],
    ['công việc; làm việc', 'a job; to work'],
    ['你在哪儿工作？', 'Nǐ zài nǎr gōngzuò?', 'Bạn làm việc ở đâu?']
  ),
  w(
    '小心',
    'xiǎoxīn',
    'tiểu tâm',
    ['hẹp hòi, nhỏ nhen', 'narrow-minded'],
    ['cẩn thận', 'careful; look out'],
    ['小心！车来了。', 'Xiǎoxīn! Chē lái le.', 'Cẩn thận! Xe tới kìa.']
  ),
  w(
    '新闻',
    'xīnwén',
    'tân văn',
    ['bài văn mới', 'a new essay'],
    ['tin tức', 'the news'],
    ['我每天早上看新闻。', 'Wǒ měi tiān zǎoshang kàn xīnwén.', 'Sáng nào tôi cũng xem tin tức.']
  ),
  w(
    '意思',
    'yìsi',
    'ý tứ',
    ['ý tứ, tế nhị', 'tact, discretion'],
    ['nghĩa (của từ); ý', 'meaning'],
    ['这个字是什么意思？', 'Zhège zì shì shénme yìsi?', 'Chữ này nghĩa là gì?']
  ),
  w(
    '经理',
    'jīnglǐ',
    'kinh lý',
    ['đi kinh lý, thị sát', 'an inspection tour'],
    ['giám đốc, quản lý', 'a manager'],
    [
      '他是我们公司的经理。',
      'Tā shì wǒmen gōngsī de jīnglǐ.',
      'Anh ấy là giám đốc công ty chúng tôi.',
    ]
  ),
  w(
    '认真',
    'rènzhēn',
    'nhận chân',
    ['nhận ra sự thật', 'to see the truth'],
    ['nghiêm túc, chăm chỉ', 'serious, conscientious'],
    ['她学习很认真。', 'Tā xuéxí hěn rènzhēn.', 'Cô ấy học hành rất chăm chỉ.']
  ),
  w(
    '安排',
    'ānpái',
    'an bài',
    ['số phận an bài, định mệnh', 'fate, destiny'],
    ['sắp xếp', 'to arrange'],
    ['我来安排会议时间。', 'Wǒ lái ānpái huìyì shíjiān.', 'Để tôi sắp xếp giờ họp.']
  ),
  w(
    '生气',
    'shēngqì',
    'sinh khí',
    ['sức sống, sinh khí', 'vitality'],
    ['tức giận', 'to be angry'],
    ['妈妈生气了。', 'Māma shēngqì le.', 'Mẹ giận rồi.']
  ),
  w(
    '用心',
    'yòngxīn',
    'dụng tâm',
    ['có ý đồ (dụng tâm xấu)', 'to have hidden motives'],
    ['chăm chú, tận tâm', 'attentive, with care'],
    ['他做事很用心。', 'Tā zuò shì hěn yòngxīn.', 'Anh ấy làm việc rất tận tâm.']
  ),
  w(
    '打算',
    'dǎsuan',
    'đả toán',
    ['đánh, làm toán', 'to hit; to do sums'],
    ['dự định', 'to plan, to intend'],
    ['你打算去哪儿旅行？', 'Nǐ dǎsuan qù nǎr lǚxíng?', 'Bạn định đi du lịch ở đâu?']
  ),
  w(
    '讲究',
    'jiǎngjiu',
    'giảng cứu',
    ['giảng giải, nghiên cứu', 'to lecture and research'],
    ['cầu kỳ, kỹ tính', 'particular, fussy'],
    ['他吃饭很讲究。', 'Tā chī fàn hěn jiǎngjiu.', 'Anh ấy ăn uống rất cầu kỳ.']
  ),
]

export interface TrapQuestion {
  item: HanVietTrap
  /** The real meaning, the trap, and two other words' meanings, shuffled. */
  options: Pair[]
  answer: number
  /** Where the trap sits among the options. */
  trapAt: number
}

/** A round of `size` questions on different words; the trap is always an option. */
export function trapRound(
  size = 10,
  rand: () => number = Math.random,
  pool: readonly HanVietTrap[] = HAN_VIET_TRAPS
): TrapQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(pool)
    .slice(0, size)
    .map((item) => {
      const others = shuffle(pool.filter((o) => o.zh !== item.zh)).slice(0, 2)
      const options = shuffle([item.meaning, item.trap, ...others.map((o) => o.meaning)])
      return {
        item,
        options,
        answer: options.indexOf(item.meaning),
        trapAt: options.indexOf(item.trap),
      }
    })
}

/** XP for a round, as for the idioms. */
export const trapXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
