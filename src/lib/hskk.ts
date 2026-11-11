// "Luyện nói HSKK" (docs/design/hskk.md): the three parts of the HSKK
// speaking test at Elementary (初级) and Intermediate (中级) level. Part 1 hears a short sentence and
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
  /** Intermediate Part 2: the picture, as an emoji scene and what it shows. */
  scene?: string
  shows?: string
}

/** HSKK Elementary (初级, about HSK 1–2) or Intermediate (中级, about HSK 3–4). */
export type HskkLevel = 'elementary' | 'intermediate'

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

// --- HSKK Intermediate (中级) ---------------------------------------------

/** Intermediate Part 1 (听后重复): longer sentences to say back. */
export const HSKK_MID_REPEAT: HskkItem[] = [
  l(
    '我昨天晚上看了一部很有意思的电影。',
    'Wǒ zuótiān wǎnshang kànle yí bù hěn yǒu yìsi de diànyǐng.',
    'Tối qua tôi xem một bộ phim rất hay.'
  ),
  l(
    '如果明天不下雨，我们就去公园散步。',
    'Rúguǒ míngtiān bú xià yǔ, wǒmen jiù qù gōngyuán sànbù.',
    'Nếu mai không mưa, chúng ta sẽ đi dạo công viên.'
  ),
  l(
    '这家饭馆的菜又便宜又好吃。',
    'Zhè jiā fànguǎn de cài yòu piányi yòu hǎochī.',
    'Món ăn ở quán này vừa rẻ vừa ngon.'
  ),
  l(
    '虽然汉语很难，但是我觉得很有意思。',
    'Suīrán Hànyǔ hěn nán, dànshì wǒ juéde hěn yǒu yìsi.',
    'Tuy tiếng Trung khó, nhưng tôi thấy rất thú vị.'
  ),
  l(
    '他每天坐地铁去公司上班。',
    'Tā měi tiān zuò dìtiě qù gōngsī shàngbān.',
    'Ngày nào anh ấy cũng đi tàu điện ngầm đến công ty.'
  ),
  l(
    '请你把桌子上的书给我拿过来。',
    'Qǐng nǐ bǎ zhuōzi shang de shū gěi wǒ ná guòlai.',
    'Bạn lấy giúp tôi quyển sách trên bàn nhé.'
  ),
  l(
    '我已经在这个城市住了三年了。',
    'Wǒ yǐjīng zài zhège chéngshì zhùle sān nián le.',
    'Tôi đã sống ở thành phố này ba năm rồi.'
  ),
  l(
    '周末我一般在家休息，有时候也去打球。',
    'Zhōumò wǒ yìbān zài jiā xiūxi, yǒu shíhou yě qù dǎ qiú.',
    'Cuối tuần tôi thường nghỉ ở nhà, đôi khi cũng đi chơi bóng.'
  ),
  l(
    '你能不能告诉我去火车站怎么走？',
    'Nǐ néng bu néng gàosu wǒ qù huǒchēzhàn zěnme zǒu?',
    'Bạn có thể chỉ tôi đường ra ga tàu không?'
  ),
  l(
    '我的手机找不到了，你帮我打一下电话吧。',
    'Wǒ de shǒujī zhǎo bu dào le, nǐ bāng wǒ dǎ yíxià diànhuà ba.',
    'Tôi không tìm thấy điện thoại, bạn gọi thử giúp tôi nhé.'
  ),
]

const pic = (scene: string, shows: string, line: HskkLine, sample: HskkLine): HskkItem => ({
  ...line,
  scene,
  shows,
  sample,
})

/** Intermediate Part 2 (看图说话): talk about a picture for two minutes. */
export const HSKK_MID_PICTURES: HskkItem[] = [
  pic(
    '🎂👨‍👩‍👧',
    'Một gia đình tổ chức sinh nhật cho con gái, trên bàn có bánh kem cắm nến.',
    l(
      '图上的一家人在做什么？',
      'Tú shang de yì jiā rén zài zuò shénme?',
      'Gia đình trong tranh đang làm gì?'
    ),
    l(
      '图上是一家人在给女儿过生日。桌子上有一个很大的蛋糕，蛋糕上有八支蜡烛。爸爸妈妈坐在女儿旁边，大家都很高兴。女儿正在许愿，她可能希望自己快快长大。我觉得这是一个很幸福的家庭。',
      'Tú shang shì yì jiā rén zài gěi nǚ’ér guò shēngrì. Zhuōzi shang yǒu yí ge hěn dà de dàngāo, dàngāo shang yǒu bā zhī làzhú. Bàba māma zuò zài nǚ’ér pángbiān, dàjiā dōu hěn gāoxìng. Nǚ’ér zhèngzài xǔyuàn, tā kěnéng xīwàng zìjǐ kuàikuài zhǎngdà. Wǒ juéde zhè shì yí ge hěn xìngfú de jiātíng.',
      'Trong tranh, một gia đình đang tổ chức sinh nhật cho con gái. Trên bàn có một chiếc bánh kem rất to, cắm tám ngọn nến. Bố mẹ ngồi bên cạnh con gái, ai cũng vui. Cô bé đang ước, có lẽ mong mình mau lớn. Tôi thấy đây là một gia đình rất hạnh phúc.'
    )
  ),
  pic(
    '🏃‍♂️🌳☀️',
    'Một chàng trai chạy bộ trong công viên vào buổi sáng.',
    l(
      '图上的年轻人在做什么？',
      'Tú shang de niánqīngrén zài zuò shénme?',
      'Chàng trai trong tranh đang làm gì?'
    ),
    l(
      '图上是一个年轻人在公园里跑步。现在应该是早上，天气很好，太阳刚出来。公园里有很多树，空气很新鲜。他穿着运动服，看起来很健康。我觉得每天早上跑步对身体很好，我也想像他一样多运动。',
      'Tú shang shì yí ge niánqīngrén zài gōngyuán li pǎobù. Xiànzài yīnggāi shì zǎoshang, tiānqì hěn hǎo, tàiyáng gāng chūlai. Gōngyuán li yǒu hěn duō shù, kōngqì hěn xīnxiān. Tā chuānzhe yùndòngfú, kàn qilai hěn jiànkāng. Wǒ juéde měi tiān zǎoshang pǎobù duì shēntǐ hěn hǎo, wǒ yě xiǎng xiàng tā yíyàng duō yùndòng.',
      'Trong tranh, một chàng trai đang chạy bộ trong công viên. Có lẽ lúc này là buổi sáng, trời đẹp, mặt trời vừa lên. Công viên có nhiều cây, không khí trong lành. Anh ấy mặc đồ thể thao, trông rất khoẻ. Tôi nghĩ sáng nào cũng chạy bộ rất tốt cho sức khoẻ, tôi cũng muốn tập nhiều như anh ấy.'
    )
  ),
  pic(
    '👩‍👧👗🛍️',
    'Hai mẹ con đang chọn quần áo trong một cửa hàng.',
    l(
      '图上的妈妈和女儿在做什么？',
      'Tú shang de māma hé nǚ’ér zài zuò shénme?',
      'Hai mẹ con trong tranh đang làm gì?'
    ),
    l(
      '图上是一位妈妈和她的女儿在商店里买衣服。女儿手里拿着一件红色的裙子，看起来很喜欢。妈妈正在看价格，可能觉得有点儿贵。旁边的服务员在给她们介绍。我想妈妈最后还是会给女儿买这件裙子的。',
      'Tú shang shì yí wèi māma hé tā de nǚ’ér zài shāngdiàn li mǎi yīfu. Nǚ’ér shǒu li názhe yí jiàn hóngsè de qúnzi, kàn qilai hěn xǐhuan. Māma zhèngzài kàn jiàgé, kěnéng juéde yǒudiǎnr guì. Pángbiān de fúwùyuán zài gěi tāmen jièshào. Wǒ xiǎng māma zuìhòu háishi huì gěi nǚ’ér mǎi zhè jiàn qúnzi de.',
      'Trong tranh, hai mẹ con đang mua quần áo trong cửa hàng. Cô con gái cầm một chiếc váy đỏ, trông rất thích. Người mẹ đang xem giá, có lẽ thấy hơi đắt. Nhân viên bên cạnh đang giới thiệu cho họ. Tôi nghĩ cuối cùng mẹ vẫn sẽ mua chiếc váy này cho con.'
    )
  ),
]

/** Intermediate Part 3 (回答问题): two minutes on a question. */
export const HSKK_MID_TOPICS: HskkItem[] = [
  q(
    l(
      '你觉得学习外语最好的方法是什么？',
      'Nǐ juéde xuéxí wàiyǔ zuì hǎo de fāngfǎ shì shénme?',
      'Theo bạn, cách học ngoại ngữ tốt nhất là gì?'
    ),
    l(
      '我觉得学习外语最好的方法是多听多说。首先，每天应该听一点儿外语，比如看电影、听歌。其次，要找机会和别人说话，不要怕说错。另外，记生词也很重要，我每天记十个生词。最后，要坚持，不能三天打鱼两天晒网。只要每天努力，就一定能学好外语。',
      'Wǒ juéde xuéxí wàiyǔ zuì hǎo de fāngfǎ shì duō tīng duō shuō. Shǒuxiān, měi tiān yīnggāi tīng yìdiǎnr wàiyǔ, bǐrú kàn diànyǐng, tīng gē. Qícì, yào zhǎo jīhuì hé biérén shuōhuà, bú yào pà shuō cuò. Lìngwài, jì shēngcí yě hěn zhòngyào, wǒ měi tiān jì shí ge shēngcí. Zuìhòu, yào jiānchí, bù néng sān tiān dǎ yú liǎng tiān shài wǎng. Zhǐyào měi tiān nǔlì, jiù yídìng néng xuéhǎo wàiyǔ.',
      'Tôi nghĩ cách tốt nhất là nghe nhiều, nói nhiều. Trước hết, mỗi ngày nên nghe một chút ngoại ngữ, như xem phim, nghe nhạc. Thứ hai, tìm cơ hội nói chuyện với người khác, đừng sợ nói sai. Ngoài ra học từ mới cũng quan trọng, mỗi ngày tôi học mười từ. Cuối cùng phải kiên trì, không được "bữa đực bữa cái". Chỉ cần ngày nào cũng cố gắng thì nhất định sẽ học giỏi ngoại ngữ.'
    )
  ),
  q(
    l(
      '你喜欢住在城市还是农村？为什么？',
      'Nǐ xǐhuan zhù zài chéngshì háishi nóngcūn? Wèishénme?',
      'Bạn thích sống ở thành phố hay nông thôn? Vì sao?'
    ),
    l(
      '我更喜欢住在城市。第一，城市的交通很方便，坐地铁、公共汽车都很快。第二，城市里有很多好的学校和医院。第三，找工作的机会也比较多。当然，城市也有一些问题，比如空气不太好，房子很贵。但是总的来说，我还是觉得住在城市更适合我。',
      'Wǒ gèng xǐhuan zhù zài chéngshì. Dì yī, chéngshì de jiāotōng hěn fāngbiàn, zuò dìtiě, gōnggòng qìchē dōu hěn kuài. Dì èr, chéngshì li yǒu hěn duō hǎo de xuéxiào hé yīyuàn. Dì sān, zhǎo gōngzuò de jīhuì yě bǐjiào duō. Dāngrán, chéngshì yě yǒu yìxiē wèntí, bǐrú kōngqì bú tài hǎo, fángzi hěn guì. Dànshì zǒng de lái shuō, wǒ háishi juéde zhù zài chéngshì gèng shìhé wǒ.',
      'Tôi thích sống ở thành phố hơn. Thứ nhất, giao thông thành phố rất tiện, đi tàu điện ngầm hay xe buýt đều nhanh. Thứ hai, thành phố có nhiều trường học và bệnh viện tốt. Thứ ba, cơ hội tìm việc cũng nhiều hơn. Tất nhiên thành phố cũng có vấn đề, như không khí không tốt lắm, nhà rất đắt. Nhưng nhìn chung tôi vẫn thấy sống ở thành phố hợp với mình hơn.'
    )
  ),
  q(
    l(
      '请谈谈你最难忘的一次旅行。',
      'Qǐng tántan nǐ zuì nánwàng de yí cì lǚxíng.',
      'Hãy kể về chuyến đi đáng nhớ nhất của bạn.'
    ),
    l(
      '我最难忘的一次旅行是去年夏天去北京。我和两个好朋友一起去的，一共玩了五天。我们去了长城、故宫，还吃了北京烤鸭。爬长城的时候虽然很累，但是风景特别漂亮。在北京我还用汉语跟当地人聊天，他们都很热情。这次旅行让我更喜欢中国文化了，我希望以后还有机会再去。',
      'Wǒ zuì nánwàng de yí cì lǚxíng shì qùnián xiàtiān qù Běijīng. Wǒ hé liǎng ge hǎo péngyou yìqǐ qù de, yígòng wánle wǔ tiān. Wǒmen qùle Chángchéng, Gùgōng, hái chīle Běijīng kǎoyā. Pá Chángchéng de shíhou suīrán hěn lèi, dànshì fēngjǐng tèbié piàoliang. Zài Běijīng wǒ hái yòng Hànyǔ gēn dāngdìrén liáotiān, tāmen dōu hěn rèqíng. Zhè cì lǚxíng ràng wǒ gèng xǐhuan Zhōngguó wénhuà le, wǒ xīwàng yǐhòu hái yǒu jīhuì zài qù.',
      'Chuyến đi đáng nhớ nhất của tôi là đi Bắc Kinh mùa hè năm ngoái, cùng hai người bạn thân, tổng cộng năm ngày. Chúng tôi đến Vạn Lý Trường Thành, Cố Cung, còn ăn vịt quay Bắc Kinh. Leo Trường Thành tuy mệt nhưng phong cảnh đẹp lắm. Ở Bắc Kinh tôi còn nói chuyện bằng tiếng Trung với người địa phương, họ rất nhiệt tình. Chuyến đi khiến tôi càng thích văn hoá Trung Quốc, mong sau này có dịp quay lại.'
    )
  ),
]

/** Part 2 is a heard question at Elementary, a picture at Intermediate. */
export const HSKK_TITLES: Record<HskkLevel, Record<HskkPart, [string, string]>> = {
  elementary: {
    1: ['Phần 1 · Nghe rồi nhắc lại', 'Part 1 · Listen and repeat'],
    2: ['Phần 2 · Nghe rồi trả lời', 'Part 2 · Listen and answer'],
    3: ['Phần 3 · Trả lời câu hỏi', 'Part 3 · Answer the question'],
  },
  intermediate: {
    1: ['Phần 1 · Nghe rồi nhắc lại', 'Part 1 · Listen and repeat'],
    2: ['Phần 2 · Nhìn tranh nói', 'Part 2 · Talk about a picture'],
    3: ['Phần 3 · Trả lời câu hỏi', 'Part 3 · Answer the question'],
  },
}

export interface HskkLevelInfo {
  parts: Record<HskkPart, readonly HskkItem[]>
  /** How many items one practice round of each part takes. */
  round: Record<HskkPart, number>
  /** Seconds to answer, where the test sets a limit. */
  seconds: Partial<Record<HskkPart, number>>
}

export const HSKK_LEVELS: Record<HskkLevel, HskkLevelInfo> = {
  elementary: {
    parts: { 1: HSKK_REPEAT, 2: HSKK_ANSWER, 3: HSKK_TOPICS },
    round: { 1: 5, 2: 5, 3: 1 },
    seconds: { 3: 90 },
  },
  intermediate: {
    parts: { 1: HSKK_MID_REPEAT, 2: HSKK_MID_PICTURES, 3: HSKK_MID_TOPICS },
    round: { 1: 5, 2: 1, 3: 1 },
    seconds: { 2: 120, 3: 120 },
  },
}

/** The Elementary parts, as before levels. */
export const HSKK_PARTS = HSKK_LEVELS.elementary.parts
export const HSKK_ROUND = HSKK_LEVELS.elementary.round

/** A round of one part of a level: items in random order, no repeats. */
export function hskkRound(
  part: HskkPart,
  rand: () => number = Math.random,
  level: HskkLevel = 'elementary'
): HskkItem[] {
  const info = HSKK_LEVELS[level]
  const a = [...info.parts[part]]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, info.round[part])
}

/** XP for a finished part, whatever was said: the point is to speak. */
export const HSKK_XP = 10
