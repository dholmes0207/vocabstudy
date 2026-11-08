// "Thành ngữ" (docs/design/chengyu.md): four-character Chinese idioms (成语)
// read through their Sino-Vietnamese sounds. Many are already Vietnamese
// (bán tín bán nghi, nhất cử lưỡng đắc); the rest have a Vietnamese twin
// (守株待兔 = ôm cây đợi thỏ). The practice asks what one means, or which
// character is missing. Pure; data inline like lib/confusables.ts.

export type Pair = [vi: string, en: string]

export interface Chengyu {
  id: string
  /** Four characters. */
  zh: string
  /** One syllable per character, with the tone changes of 一 and 不. */
  pinyin: string
  /** Sino-Vietnamese reading, one syllable per character. */
  hv: string
  /** What it means, or the Vietnamese saying that matches it. */
  meaning: Pair
  example: { zh: string; pinyin: string; vi: string }
  /** The fable behind it, for the ones that have one. */
  story?: Pair
}

const c = (
  zh: string,
  pinyin: string,
  hv: string,
  meaning: Pair,
  example: [zh: string, pinyin: string, vi: string],
  story?: Pair
): Chengyu => ({
  id: zh,
  zh,
  pinyin,
  hv,
  meaning,
  example: { zh: example[0], pinyin: example[1], vi: example[2] },
  ...(story ? { story } : {}),
})

export const CHENGYU: Chengyu[] = [
  c(
    '一心一意',
    'yì xīn yí yì',
    'nhất tâm nhất ý',
    ['một lòng một dạ', 'heart and soul, wholeheartedly'],
    [
      '他一心一意地学习汉语。',
      'Tā yìxīn-yíyì de xuéxí Hànyǔ.',
      'Anh ấy một lòng một dạ học tiếng Trung.',
    ]
  ),
  c(
    '半信半疑',
    'bàn xìn bàn yí',
    'bán tín bán nghi',
    ['nửa tin nửa ngờ', 'half believing, half doubting'],
    [
      '听了他的话，我半信半疑。',
      'Tīngle tā de huà, wǒ bànxìn-bànyí.',
      'Nghe anh ấy nói, tôi nửa tin nửa ngờ.',
    ]
  ),
  c(
    '自由自在',
    'zì yóu zì zài',
    'tự do tự tại',
    ['thong dong, không bị gò bó', 'free and easy'],
    [
      '小鸟在天上自由自在地飞。',
      'Xiǎo niǎo zài tiān shang zìyóu-zìzài de fēi.',
      'Chú chim bay thong dong trên trời.',
    ]
  ),
  c(
    '一路平安',
    'yí lù píng ān',
    'nhất lộ bình an',
    ['thượng lộ bình an', 'have a safe journey'],
    ['祝你一路平安！', 'Zhù nǐ yílù píng’ān!', 'Chúc bạn thượng lộ bình an!']
  ),
  c(
    '一举两得',
    'yì jǔ liǎng dé',
    'nhất cử lưỡng đắc',
    ['một công đôi việc', 'kill two birds with one stone'],
    [
      '骑车上班又省钱又锻炼身体，真是一举两得。',
      'Qí chē shàngbān yòu shěng qián yòu duànliàn shēntǐ, zhēn shì yìjǔ-liǎngdé.',
      'Đạp xe đi làm vừa tiết kiệm vừa rèn luyện sức khoẻ, đúng là một công đôi việc.',
    ]
  ),
  c(
    '半途而废',
    'bàn tú ér fèi',
    'bán đồ nhi phế',
    ['bỏ dở giữa chừng', 'give up halfway'],
    [
      '学外语不能半途而废。',
      'Xué wàiyǔ bù néng bàntú’érfèi.',
      'Học ngoại ngữ không được bỏ dở giữa chừng.',
    ]
  ),
  c(
    '入乡随俗',
    'rù xiāng suí sú',
    'nhập hương tuỳ tục',
    ['nhập gia tuỳ tục', 'when in Rome, do as the Romans do'],
    [
      '到了中国，我们就入乡随俗吧。',
      'Dàole Zhōngguó, wǒmen jiù rùxiāng-suísú ba.',
      'Đến Trung Quốc rồi thì mình nhập gia tuỳ tục nhé.',
    ]
  ),
  c(
    '千方百计',
    'qiān fāng bǎi jì',
    'thiên phương bách kế',
    ['trăm phương nghìn kế', 'by every possible means'],
    [
      '他千方百计地帮助我。',
      'Tā qiānfāng-bǎijì de bāngzhù wǒ.',
      'Anh ấy tìm trăm phương nghìn kế để giúp tôi.',
    ]
  ),
  c(
    '同心协力',
    'tóng xīn xié lì',
    'đồng tâm hiệp lực',
    ['đồng lòng chung sức', 'pull together as one'],
    [
      '大家同心协力，很快就完成了工作。',
      'Dàjiā tóngxīn-xiélì, hěn kuài jiù wánchéngle gōngzuò.',
      'Mọi người đồng lòng chung sức, rất nhanh đã làm xong việc.',
    ]
  ),
  c(
    '一见钟情',
    'yí jiàn zhōng qíng',
    'nhất kiến chung tình',
    ['yêu từ cái nhìn đầu tiên', 'love at first sight'],
    ['他们是一见钟情。', 'Tāmen shì yíjiàn-zhōngqíng.', 'Họ yêu nhau từ cái nhìn đầu tiên.']
  ),
  c(
    '不知不觉',
    'bù zhī bù jué',
    'bất tri bất giác',
    ['lúc nào không hay', 'before you know it'],
    [
      '不知不觉，我已经学了一年汉语了。',
      'Bùzhī-bùjué, wǒ yǐjīng xuéle yì nián Hànyǔ le.',
      'Lúc nào không hay, tôi đã học tiếng Trung được một năm rồi.',
    ]
  ),
  c(
    '十全十美',
    'shí quán shí měi',
    'thập toàn thập mỹ',
    ['mười phân vẹn mười', 'perfect in every way'],
    [
      '世界上没有十全十美的人。',
      'Shìjiè shang méiyǒu shíquán-shíměi de rén.',
      'Trên đời không có ai mười phân vẹn mười.',
    ]
  ),
  c(
    '人山人海',
    'rén shān rén hǎi',
    'nhân sơn nhân hải',
    ['biển người, đông nghịt', 'a sea of people'],
    [
      '周末公园里人山人海。',
      'Zhōumò gōngyuán li rénshān-rénhǎi.',
      'Cuối tuần công viên đông nghịt người.',
    ]
  ),
  c(
    '五颜六色',
    'wǔ yán liù sè',
    'ngũ nhan lục sắc',
    ['đủ màu sặc sỡ', 'all the colours of the rainbow'],
    [
      '花园里开满了五颜六色的花。',
      'Huāyuán li kāimǎnle wǔyán-liùsè de huā.',
      'Trong vườn nở đầy hoa đủ màu sặc sỡ.',
    ]
  ),
  c(
    '七上八下',
    'qī shàng bā xià',
    'thất thượng bát hạ',
    ['thấp thỏm, bồn chồn', 'on tenterhooks'],
    [
      '考试以前，我心里七上八下的。',
      'Kǎoshì yǐqián, wǒ xīnli qīshàng-bāxià de.',
      'Trước giờ thi, lòng tôi cứ thấp thỏm.',
    ]
  ),
  c(
    '一模一样',
    'yì mú yí yàng',
    'nhất mô nhất dạng',
    ['giống hệt nhau', 'exactly alike'],
    [
      '这对双胞胎长得一模一样。',
      'Zhè duì shuāngbāotāi zhǎng de yìmú-yíyàng.',
      'Cặp sinh đôi này giống nhau như đúc.',
    ]
  ),
  c(
    '乱七八糟',
    'luàn qī bā zāo',
    'loạn thất bát tao',
    ['lộn xộn, bừa bãi', 'a total mess'],
    ['他的房间乱七八糟的。', 'Tā de fángjiān luànqībāzāo de.', 'Phòng anh ấy bừa bộn hết cả.']
  ),
  c(
    '马马虎虎',
    'mǎ mǎ hū hū',
    'mã mã hổ hổ',
    ['tàm tạm; làm qua loa', 'so-so; careless'],
    ['我的汉语马马虎虎。', 'Wǒ de Hànyǔ mǎmǎhūhū.', 'Tiếng Trung của tôi tàm tạm thôi.'],
    [
      'Chuyện kể có anh hoạ sĩ vẽ đầu hổ thân ngựa, ai hỏi cũng nói "ngựa ngựa hổ hổ". Từ đó 马马虎虎 là làm ẩu, không ra đâu vào đâu.',
      'A painter drew a tiger’s head on a horse’s body and told everyone it was "horse horse, tiger tiger". Since then it means sloppy, neither one thing nor the other.',
    ]
  ),
  c(
    '九牛一毛',
    'jiǔ niú yì máo',
    'cửu ngưu nhất mao',
    ['như muối bỏ biển, chẳng đáng là bao', 'a drop in the ocean'],
    [
      '这点钱对他来说是九牛一毛。',
      'Zhè diǎn qián duì tā lái shuō shì jiǔniú-yìmáo.',
      'Chút tiền này với anh ấy chẳng đáng là bao.',
    ]
  ),
  c(
    '守株待兔',
    'shǒu zhū dài tù',
    'thủ chu đãi thố',
    ['ôm cây đợi thỏ', 'wait for luck instead of working'],
    [
      '找工作不能守株待兔。',
      'Zhǎo gōngzuò bù néng shǒuzhū-dàitù.',
      'Tìm việc thì không thể ôm cây đợi thỏ.',
    ],
    [
      'Một bác nông dân thấy con thỏ đâm vào gốc cây chết, thế là bỏ ruộng, ngày nào cũng ngồi canh gốc cây chờ thỏ khác. Ruộng thì hoang, thỏ thì không đến nữa.',
      'A farmer saw a hare run into a tree stump and die, so he left his field and sat by the stump every day waiting for another. His field ran wild; no hare ever came.',
    ]
  ),
  c(
    '画蛇添足',
    'huà shé tiān zú',
    'hoạ xà thiêm túc',
    ['vẽ rắn thêm chân, làm thừa thành hỏng', 'overdo it and spoil it'],
    [
      '文章已经很好了，再加这句话就是画蛇添足。',
      'Wénzhāng yǐjīng hěn hǎo le, zài jiā zhè jù huà jiù shì huàshé-tiānzú.',
      'Bài đã hay rồi, thêm câu này nữa là vẽ rắn thêm chân.',
    ],
    [
      'Mấy người thi vẽ rắn, ai xong trước được bình rượu. Người nhanh nhất vẽ xong còn vẽ thêm chân cho rắn, thế là bị nói: rắn làm gì có chân! Bình rượu về tay người khác.',
      'Some men raced to draw a snake for a jug of wine. The fastest finished, then added feet. "Snakes have no feet!" said another, and took the wine.',
    ]
  ),
  c(
    '对牛弹琴',
    'duì niú tán qín',
    'đối ngưu đàn cầm',
    ['đàn gảy tai trâu', 'talk to a brick wall'],
    [
      '跟他讲道理简直是对牛弹琴。',
      'Gēn tā jiǎng dàolǐ jiǎnzhí shì duìniú-tánqín.',
      'Nói lý lẽ với anh ta đúng là đàn gảy tai trâu.',
    ],
    [
      'Một nhạc sĩ gảy khúc đàn tuyệt hay cho con trâu nghe, trâu vẫn cúi đầu gặm cỏ. Không phải nhạc dở, mà người nghe không hiểu.',
      'A musician played a beautiful tune to an ox, which went on eating grass. The music wasn’t bad; the listener just couldn’t understand it.',
    ]
  ),
  c(
    '井底之蛙',
    'jǐng dǐ zhī wā',
    'tỉnh để chi oa',
    ['ếch ngồi đáy giếng', 'a frog in a well, narrow-minded'],
    [
      '多出去看看，别做井底之蛙。',
      'Duō chūqu kànkan, bié zuò jǐngdǐ zhī wā.',
      'Hãy ra ngoài nhìn ngắm nhiều hơn, đừng làm ếch ngồi đáy giếng.',
    ],
    [
      'Con ếch sống dưới giếng tưởng bầu trời chỉ to bằng miệng giếng, cho tới khi con rùa biển kể cho nó nghe về đại dương.',
      'A frog in a well thought the sky was as big as the well’s mouth, until a sea turtle told it about the ocean.',
    ]
  ),
]

/** Gap marking the missing character. */
export const GAP = '＿'

export type ChengyuQuestion =
  | { kind: 'meaning'; item: Chengyu; options: Pair[]; answer: number }
  | {
      kind: 'missing'
      item: Chengyu
      /** Which character is hidden. */
      at: number
      options: { ch: string; hv: string }[]
      answer: number
    }

const syllables = (s: string) => s.split(' ')

/** Each character with its Sino-Vietnamese syllable. */
export const charsOf = (it: Chengyu): { ch: string; hv: string; pinyin: string }[] => {
  const hv = syllables(it.hv)
  const py = syllables(it.pinyin)
  return [...it.zh].map((ch, i) => ({ ch, hv: hv[i], pinyin: py[i] }))
}

/** The idiom with one character hidden. */
export const withGap = (it: Chengyu, at: number): string =>
  [...it.zh].map((ch, i) => (i === at ? GAP : ch)).join('')

/**
 * A round of `size` questions over different idioms, alternating "what does
 * it mean?" and "which character is missing?". Wrong options come from other
 * idioms; a missing-character option is never a character the idiom has.
 */
export function chengyuRound(
  size = 10,
  rand: () => number = Math.random,
  pool: readonly Chengyu[] = CHENGYU
): ChengyuQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const items = shuffle(pool).slice(0, size)
  return items.map((item, n): ChengyuQuestion => {
    const others = shuffle(pool.filter((o) => o.id !== item.id))
    if (n % 2 === 0) {
      const options = shuffle([item.meaning, ...others.slice(0, 3).map((o) => o.meaning)])
      return { kind: 'meaning', item, options, answer: options.indexOf(item.meaning) }
    }
    const own = charsOf(item)
    const at = Math.floor(rand() * own.length)
    const taken = new Set([...item.zh])
    const wrong: { ch: string; hv: string }[] = []
    // One character from each of three other idioms, none the idiom already has.
    for (const o of others) {
      const x = shuffle(charsOf(o)).find((x) => !taken.has(x.ch))
      if (!x || wrong.length >= 3) continue
      taken.add(x.ch)
      wrong.push({ ch: x.ch, hv: x.hv })
    }
    const right = { ch: own[at].ch, hv: own[at].hv }
    const options = shuffle([right, ...wrong])
    return { kind: 'missing', item, at, options, answer: options.indexOf(right) }
  })
}

/** XP for a round, as for look-alike characters. */
export const chengyuXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
