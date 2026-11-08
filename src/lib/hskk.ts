// "Luyện nói HSKK sơ cấp" (docs/design/hskk.md): the three parts of the HSKK
// Elementary speaking test (HSKK 初级). Part 1 hears a short sentence and
// repeats it; Part 2 hears a question and answers in a sentence; Part 3
// answers a question on a familiar topic for about a minute and a half. Each
// line has pinyin and its meaning; Parts 2 and 3 have a sample answer. Pure;
// data inline like lib/chengyu.ts.

export interface HskkLine {
  zh: string
  pinyin: string
  vi: string
}

export interface HskkItem extends HskkLine {
  /** A model answer (Parts 2 and 3). */
  sample?: HskkLine
}

export type HskkPart = 1 | 2 | 3

const l = (zh: string, pinyin: string, vi: string): HskkLine => ({ zh, pinyin, vi })
const q = (line: HskkLine, sample: HskkLine): HskkItem => ({ ...line, sample })

/** Part 1 (听后重复): hear it, say it back. */
export const HSKK_REPEAT: HskkItem[] = [
  l(
    '我每天早上七点起床。',
    'Wǒ měi tiān zǎoshang qī diǎn qǐchuáng.',
    'Mỗi sáng tôi dậy lúc bảy giờ.'
  ),
  l('今天天气很好。', 'Jīntiān tiānqì hěn hǎo.', 'Hôm nay trời rất đẹp.'),
  l('我想喝一杯咖啡。', 'Wǒ xiǎng hē yì bēi kāfēi.', 'Tôi muốn uống một cốc cà phê.'),
  l('他是我的好朋友。', 'Tā shì wǒ de hǎo péngyou.', 'Anh ấy là bạn thân của tôi.'),
  l('这件衣服太贵了。', 'Zhè jiàn yīfu tài guì le.', 'Bộ quần áo này đắt quá.'),
  l(
    '我们明天去看电影吧。',
    'Wǒmen míngtiān qù kàn diànyǐng ba.',
    'Mai chúng mình đi xem phim nhé.'
  ),
  l('我的家离学校不远。', 'Wǒ de jiā lí xuéxiào bù yuǎn.', 'Nhà tôi cách trường không xa.'),
  l('请问，火车站怎么走？', 'Qǐngwèn, huǒchēzhàn zěnme zǒu?', 'Xin hỏi, ga tàu đi đường nào?'),
  l(
    '我学汉语学了一年了。',
    'Wǒ xué Hànyǔ xuéle yì nián le.',
    'Tôi học tiếng Trung được một năm rồi.'
  ),
  l(
    '周末我常常在家看书。',
    'Zhōumò wǒ chángcháng zài jiā kàn shū.',
    'Cuối tuần tôi thường ở nhà đọc sách.'
  ),
  l('他坐飞机去北京了。', 'Tā zuò fēijī qù Běijīng le.', 'Anh ấy đi máy bay tới Bắc Kinh rồi.'),
  l('这个菜有点儿辣。', 'Zhège cài yǒudiǎnr là.', 'Món này hơi cay.'),
]

/** Part 2 (听后回答): hear a question, answer it in a sentence. */
export const HSKK_ANSWER: HskkItem[] = [
  q(
    l('你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'Bạn tên là gì?'),
    l('我叫小明。', 'Wǒ jiào Xiǎo Míng.', 'Tôi tên là Tiểu Minh.')
  ),
  q(
    l('你是哪国人？', 'Nǐ shì nǎ guó rén?', 'Bạn là người nước nào?'),
    l('我是越南人。', 'Wǒ shì Yuènán rén.', 'Tôi là người Việt Nam.')
  ),
  q(
    l('你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Nhà bạn có mấy người?'),
    l(
      '我家有四口人：爸爸、妈妈、哥哥和我。',
      'Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.',
      'Nhà tôi có bốn người: bố, mẹ, anh trai và tôi.'
    )
  ),
  q(
    l('你今天几点起床？', 'Nǐ jīntiān jǐ diǎn qǐchuáng?', 'Hôm nay bạn dậy lúc mấy giờ?'),
    l('我今天六点半起床。', 'Wǒ jīntiān liù diǎn bàn qǐchuáng.', 'Hôm nay tôi dậy lúc sáu rưỡi.')
  ),
  q(
    l('你喜欢吃什么水果？', 'Nǐ xǐhuan chī shénme shuǐguǒ?', 'Bạn thích ăn hoa quả gì?'),
    l('我喜欢吃苹果和西瓜。', 'Wǒ xǐhuan chī píngguǒ hé xīguā.', 'Tôi thích ăn táo và dưa hấu.')
  ),
  q(
    l('你怎么去学校？', 'Nǐ zěnme qù xuéxiào?', 'Bạn đi học bằng gì?'),
    l('我骑自行车去学校。', 'Wǒ qí zìxíngchē qù xuéxiào.', 'Tôi đạp xe đi học.')
  ),
  q(
    l('你周末喜欢做什么？', 'Nǐ zhōumò xǐhuan zuò shénme?', 'Cuối tuần bạn thích làm gì?'),
    l(
      '我周末喜欢和朋友去公园。',
      'Wǒ zhōumò xǐhuan hé péngyou qù gōngyuán.',
      'Cuối tuần tôi thích cùng bạn bè đi công viên.'
    )
  ),
  q(
    l('现在几点？', 'Xiànzài jǐ diǎn?', 'Bây giờ là mấy giờ?'),
    l('现在下午三点。', 'Xiànzài xiàwǔ sān diǎn.', 'Bây giờ là ba giờ chiều.')
  ),
  q(
    l('你会说汉语吗？', 'Nǐ huì shuō Hànyǔ ma?', 'Bạn có biết nói tiếng Trung không?'),
    l('我会说一点儿汉语。', 'Wǒ huì shuō yìdiǎnr Hànyǔ.', 'Tôi biết nói một chút tiếng Trung.')
  ),
  q(
    l(
      '你的生日是几月几号？',
      'Nǐ de shēngrì shì jǐ yuè jǐ hào?',
      'Sinh nhật bạn là ngày mấy tháng mấy?'
    ),
    l(
      '我的生日是五月十号。',
      'Wǒ de shēngrì shì wǔ yuè shí hào.',
      'Sinh nhật tôi là ngày mười tháng Năm.'
    )
  ),
]

/** Part 3 (回答问题): about a minute and a half on a familiar topic. */
export const HSKK_TOPICS: HskkItem[] = [
  q(
    l('请介绍一下你的家。', 'Qǐng jièshào yíxià nǐ de jiā.', 'Hãy giới thiệu về gia đình bạn.'),
    l(
      '我家有四口人：爸爸、妈妈、哥哥和我。我爸爸是医生，他工作很忙。我妈妈是老师，她很喜欢做饭。我哥哥在大学学习。我很爱我的家。',
      'Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ. Wǒ bàba shì yīshēng, tā gōngzuò hěn máng. Wǒ māma shì lǎoshī, tā hěn xǐhuan zuò fàn. Wǒ gēge zài dàxué xuéxí. Wǒ hěn ài wǒ de jiā.',
      'Nhà tôi có bốn người: bố, mẹ, anh trai và tôi. Bố tôi là bác sĩ, công việc rất bận. Mẹ tôi là giáo viên, rất thích nấu ăn. Anh tôi đang học đại học. Tôi rất yêu gia đình mình.'
    )
  ),
  q(
    l('你周末一般做什么？', 'Nǐ zhōumò yìbān zuò shénme?', 'Cuối tuần bạn thường làm gì?'),
    l(
      '周末我一般早上九点起床。上午我在家打扫房间，看看书。下午我常常和朋友去打篮球或者看电影。晚上我们一起吃饭。我觉得周末很快乐。',
      'Zhōumò wǒ yìbān zǎoshang jiǔ diǎn qǐchuáng. Shàngwǔ wǒ zài jiā dǎsǎo fángjiān, kànkan shū. Xiàwǔ wǒ chángcháng hé péngyou qù dǎ lánqiú huòzhě kàn diànyǐng. Wǎnshang wǒmen yìqǐ chī fàn. Wǒ juéde zhōumò hěn kuàilè.',
      'Cuối tuần tôi thường dậy lúc chín giờ. Buổi sáng tôi ở nhà dọn phòng, đọc sách. Buổi chiều tôi hay cùng bạn đi chơi bóng rổ hoặc xem phim. Buổi tối chúng tôi ăn cơm cùng nhau. Tôi thấy cuối tuần rất vui.'
    )
  ),
  q(
    l(
      '你最喜欢的季节是什么？为什么？',
      'Nǐ zuì xǐhuan de jìjié shì shénme? Wèishénme?',
      'Mùa bạn thích nhất là mùa nào? Vì sao?'
    ),
    l(
      '我最喜欢秋天。秋天不冷也不热，天气很舒服。秋天的水果很多，也很好吃。周末我常常和家人去爬山。所以我觉得秋天是最好的季节。',
      'Wǒ zuì xǐhuan qiūtiān. Qiūtiān bù lěng yě bú rè, tiānqì hěn shūfu. Qiūtiān de shuǐguǒ hěn duō, yě hěn hǎochī. Zhōumò wǒ chángcháng hé jiārén qù pá shān. Suǒyǐ wǒ juéde qiūtiān shì zuì hǎo de jìjié.',
      'Tôi thích nhất mùa thu. Mùa thu không lạnh cũng không nóng, thời tiết rất dễ chịu. Mùa thu có nhiều hoa quả, lại ngon. Cuối tuần tôi hay cùng gia đình đi leo núi. Vì vậy tôi thấy mùa thu là mùa đẹp nhất.'
    )
  ),
]

export const HSKK_PARTS: Record<HskkPart, readonly HskkItem[]> = {
  1: HSKK_REPEAT,
  2: HSKK_ANSWER,
  3: HSKK_TOPICS,
}

/** How many items one practice round of each part takes. */
export const HSKK_ROUND: Record<HskkPart, number> = { 1: 5, 2: 5, 3: 1 }

/** Seconds to answer a Part 3 question, as in the test. */
export const HSKK_TOPIC_SECONDS = 90

/** A round of one part: `size` items in random order, no repeats. */
export function hskkRound(part: HskkPart, rand: () => number = Math.random): HskkItem[] {
  const a = [...HSKK_PARTS[part]]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, HSKK_ROUND[part])
}

/** XP for a finished part, whatever was said: the point is to speak. */
export const HSKK_XP = 10
