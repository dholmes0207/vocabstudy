// "Tiếng lóng mạng" (docs/design/net-slang.md): Chinese internet words a
// learner meets on Douyin, Weibo and in dramas the moment they leave the
// textbook — 内卷, 躺平, 学霸… Many already travel to Vietnamese through their
// Sino-Vietnamese sounds ("nội quyển", "phật hệ", "học bá"). The practice
// asks what one means, or which one fits a meaning. Pure; data inline.

export type Pair = [vi: string, en: string]

export interface Slang {
  zh: string
  pinyin: string
  /** Sino-Vietnamese reading. */
  hv: string
  meaning: Pair
  example: { zh: string; pinyin: string; vi: string }
}

const w = (
  zh: string,
  pinyin: string,
  hv: string,
  meaning: Pair,
  example: [zh: string, pinyin: string, vi: string]
): Slang => ({
  zh,
  pinyin,
  hv,
  meaning,
  example: { zh: example[0], pinyin: example[1], vi: example[2] },
})

export const SLANG: Slang[] = [
  w(
    '内卷',
    'nèijuǎn',
    'nội quyển',
    ['đua nhau tới kiệt sức mà chẳng ai hơn ai', 'a pointless rat race'],
    [
      '我们班太内卷了，大家晚上都学到十二点。',
      'Wǒmen bān tài nèijuǎn le, dàjiā wǎnshang dōu xué dào shí’èr diǎn.',
      'Lớp mình đua nhau dữ quá, tối ai cũng học tới mười hai giờ.',
    ]
  ),
  w(
    '躺平',
    'tǎngpíng',
    'thảng bình',
    ['"nằm thẳng", buông xuôi không đua nữa', 'lie flat, opt out of the race'],
    [
      '工作太累了，我想躺平。',
      'Gōngzuò tài lèi le, wǒ xiǎng tǎngpíng.',
      'Đi làm mệt quá, tôi muốn nằm im mặc kệ.',
    ]
  ),
  w(
    '佛系',
    'fóxì',
    'phật hệ',
    ['sống tuỳ duyên, không tranh giành', 'easy-going, whatever happens happens'],
    [
      '他对考试很佛系，考得好不好都无所谓。',
      'Tā duì kǎoshì hěn fóxì, kǎo de hǎo bu hǎo dōu wúsuǒwèi.',
      'Cậu ấy rất "phật hệ" với thi cử, điểm cao hay thấp cũng chẳng sao.',
    ]
  ),
  w(
    '学霸',
    'xuébà',
    'học bá',
    ['người học siêu giỏi', 'a top student'],
    [
      '她是我们班的学霸，每次考试都第一。',
      'Tā shì wǒmen bān de xuébà, měi cì kǎoshì dōu dì yī.',
      'Cô ấy là "học bá" của lớp, lần thi nào cũng đứng nhất.',
    ]
  ),
  w(
    '社恐',
    'shèkǒng',
    'xã khủng',
    ['ngại, sợ giao tiếp với người lạ', 'socially anxious'],
    [
      '我有点儿社恐，不敢跟陌生人说话。',
      'Wǒ yǒudiǎnr shèkǒng, bù gǎn gēn mòshēngrén shuōhuà.',
      'Tôi hơi sợ giao tiếp, không dám nói chuyện với người lạ.',
    ]
  ),
  w(
    '社牛',
    'shèniú',
    'xã ngưu',
    ['siêu tự tin, nói chuyện với ai cũng được', 'a social butterfly'],
    [
      '他是个社牛，跟谁都能聊。',
      'Tā shì ge shèniú, gēn shéi dōu néng liáo.',
      'Anh ấy giao tiếp siêu đỉnh, nói chuyện với ai cũng được.',
    ]
  ),
  w(
    '吃瓜',
    'chīguā',
    'ngật qua',
    ['"ăn dưa", hóng chuyện người khác', 'watch the drama from the sidelines'],
    [
      '明星的新闻一出来，大家都在网上吃瓜。',
      'Míngxīng de xīnwén yì chūlai, dàjiā dōu zài wǎng shang chīguā.',
      'Tin về ngôi sao vừa ra, ai cũng lên mạng hóng chuyện.',
    ]
  ),
  w(
    '打卡',
    'dǎkǎ',
    'đả tạp',
    ['check-in ở chỗ nổi tiếng; làm đều mỗi ngày', 'check in at a hot spot; do something daily'],
    [
      '周末我们去那家咖啡店打卡吧！',
      'Zhōumò wǒmen qù nà jiā kāfēidiàn dǎkǎ ba!',
      'Cuối tuần mình đi check-in quán cà phê đó nhé!',
    ]
  ),
  w(
    '网红',
    'wǎnghóng',
    'võng hồng',
    ['người hoặc chỗ nổi tiếng trên mạng', 'internet-famous'],
    [
      '这家店是网红店，每天都排长队。',
      'Zhè jiā diàn shì wǎnghóng diàn, měi tiān dōu pái cháng duì.',
      'Quán này nổi tiếng trên mạng, ngày nào cũng xếp hàng dài.',
    ]
  ),
  w(
    '种草',
    'zhòngcǎo',
    'chủng thảo',
    ['"gieo cỏ": bị ai đó làm cho muốn mua', 'get someone wanting to buy'],
    [
      '看了她的视频，我被这本书种草了。',
      'Kànle tā de shìpín, wǒ bèi zhè běn shū zhòngcǎo le.',
      'Xem video của cô ấy xong, tôi bị "dụ" muốn mua cuốn sách này.',
    ]
  ),
  w(
    '安利',
    'ānlì',
    'an lợi',
    ['giới thiệu nhiệt tình thứ mình mê', 'recommend something you love'],
    [
      '我给你安利一部电影，超好看！',
      'Wǒ gěi nǐ ānlì yí bù diànyǐng, chāo hǎokàn!',
      'Mình giới thiệu cho bạn một bộ phim, hay cực!',
    ]
  ),
  w(
    '摸鱼',
    'mōyú',
    'mô ngư',
    ['"mò cá": lười việc trong giờ làm', 'slack off at work'],
    [
      '老板不在，他又在上班摸鱼。',
      'Lǎobǎn bú zài, tā yòu zài shàngbān mōyú.',
      'Sếp đi vắng, anh ta lại "mò cá" trong giờ làm.',
    ]
  ),
  w(
    '打工人',
    'dǎgōngrén',
    'đả công nhân',
    ['dân đi làm thuê (tự trào)', 'a wage worker, said with a wry smile'],
    [
      '早安，打工人！今天也要加油！',
      'Zǎo’ān, dǎgōngrén! Jīntiān yě yào jiāyóu!',
      'Chào buổi sáng, dân đi làm! Hôm nay cũng cố lên nhé!',
    ]
  ),
  w(
    '干饭',
    'gànfàn',
    'cán phạn',
    ['ăn cơm hăng say, "ăn thôi!"', 'chow down, time to eat'],
    ['下课了，干饭去！', 'Xià kè le, gànfàn qù!', 'Tan học rồi, đi ăn thôi!']
  ),
  w(
    '加油',
    'jiāyóu',
    'gia du',
    ['cố lên!', 'you can do it!'],
    ['明天考试，加油！', 'Míngtiān kǎoshì, jiāyóu!', 'Mai thi rồi, cố lên!']
  ),
  w(
    '真香',
    'zhēnxiāng',
    'chân hương',
    ['"thơm thật": chê trước rồi lại mê, tự vả', 'eat your words'],
    [
      '他说不喜欢奶茶，喝了一口就说：“真香！”',
      'Tā shuō bù xǐhuan nǎichá, hēle yì kǒu jiù shuō: “Zhēn xiāng!”',
      'Anh ấy bảo không thích trà sữa, uống một ngụm đã khen: "Ngon thật!"',
    ]
  ),
  w(
    '凡尔赛',
    'fán’ěrsài',
    'phàm nhĩ tái',
    ['khoe khéo, vờ than để khoe', 'humblebrag'],
    [
      '别凡尔赛了，你考了满分还说没准备！',
      'Bié fán’ěrsài le, nǐ kǎole mǎnfēn hái shuō méi zhǔnbèi!',
      'Đừng khoe khéo nữa, được điểm tối đa mà còn bảo chưa ôn!',
    ]
  ),
  w(
    '破防',
    'pòfáng',
    'phá phòng',
    ['bị chạm tới tim, "vỡ phòng tuyến"', 'emotionally hit, defences down'],
    [
      '看到妈妈写的信，我一下子破防了。',
      'Kàndào māma xiě de xìn, wǒ yíxiàzi pòfáng le.',
      'Đọc lá thư mẹ viết, tôi lập tức vỡ oà.',
    ]
  ),
  w(
    '绝绝子',
    'juéjuézi',
    'tuyệt tuyệt tử',
    ['đỉnh của chóp', 'absolutely amazing'],
    ['这家火锅绝绝子！', 'Zhè jiā huǒguō juéjuézi!', 'Quán lẩu này đỉnh của chóp!']
  ),
  w(
    '永远的神',
    'yǒngyuǎn de shén',
    'vĩnh viễn đích thần',
    [
      '"mãi là thần", đỉnh nhất mọi thời (viết tắt yyds)',
      'the greatest of all time (written yyds)',
    ],
    [
      '这首歌太好听了，永远的神！',
      'Zhè shǒu gē tài hǎotīng le, yǒngyuǎn de shén!',
      'Bài hát này hay quá, mãi đỉnh!',
    ]
  ),
]

export type SlangQuestion =
  | { kind: 'meaning'; item: Slang; options: Pair[]; answer: number }
  | { kind: 'word'; item: Slang; options: Slang[]; answer: number }

/**
 * A round of `size` questions on different words, alternating "what does it
 * mean?" and "which word means this?", wrong options from other words.
 */
export function slangRound(
  size = 10,
  rand: () => number = Math.random,
  pool: readonly Slang[] = SLANG
): SlangQuestion[] {
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
    .map((item, n): SlangQuestion => {
      const others = shuffle(pool.filter((o) => o.zh !== item.zh)).slice(0, 3)
      if (n % 2 === 0) {
        const options = shuffle([item.meaning, ...others.map((o) => o.meaning)])
        return { kind: 'meaning', item, options, answer: options.indexOf(item.meaning) }
      }
      const options = shuffle([item, ...others])
      return { kind: 'word', item, options, answer: options.indexOf(item) }
    })
}

/** XP for a round, as for the idioms. */
export const slangXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
