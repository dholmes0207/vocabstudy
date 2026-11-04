// HSK 2 and 3 listening, the dialogue parts (docs/design/toeic.md): a woman
// and a man say a line each, a third voice asks about it (问：…), and the
// answer is one of three printed options. Hand-written with the words of the
// level and below only (lib/hskDialogues.test.ts checks every character), each
// line with its Vietnamese, each answer explained.

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

const w = (zh: string, vi: string) => ({ speaker: 'W' as const, zh, vi })
const m = (zh: string, vi: string) => ({ speaker: 'M' as const, zh, vi })

export const HSK_DIALOGUES: readonly HskDialogue[] = [
  {
    id: 'homework',
    level: 'hsk3',
    lines: [
      w('你怎么还没走？已经七点了。', 'Sao anh còn chưa về? Bảy giờ rồi.'),
      m(
        '我的作业还没做完，你再等我半个小时吧。',
        'Bài tập của tôi chưa làm xong, chị đợi tôi thêm nửa tiếng nhé.'
      ),
    ],
    q: '男的为什么还没走？',
    qVi: 'Vì sao người nam chưa về?',
    options: ['作业没做完', '在等朋友', '外面下雨了'],
    why: '"我的作业还没做完": bài tập chưa làm xong. Câu hỏi 为什么 thường trả lời bằng lời của người được hỏi.',
  },
  {
    id: 'shirt',
    level: 'hsk3',
    lines: [
      m('这件衬衫怎么样？', 'Chiếc áo sơ mi này thế nào?'),
      w(
        '颜色很好看，但是有点儿大，你试试小一点儿的吧。',
        'Màu rất đẹp, nhưng hơi to, anh thử cái nhỏ hơn một chút đi.'
      ),
    ],
    q: '女的觉得衬衫怎么样？',
    qVi: 'Người nữ thấy chiếc áo thế nào?',
    options: ['有点儿大', '颜色不好看', '太贵了'],
    why: '"但是有点儿大": sau 但是 là ý chính. Người nữ khen màu đẹp nên 颜色不好看 là sai.',
  },
  {
    id: 'meeting',
    level: 'hsk3',
    lines: [
      w('明天的会议几点开始？', 'Cuộc họp ngày mai mấy giờ bắt đầu?'),
      m('本来是九点，现在变成十点半了。', 'Lúc đầu là chín giờ, giờ đổi sang mười giờ rưỡi rồi.'),
    ],
    q: '会议几点开始？',
    qVi: 'Cuộc họp mấy giờ bắt đầu?',
    options: ['十点半', '九点', '十点'],
    why: '本来 (lúc đầu) là chín giờ, 现在变成 (giờ thành) mười giờ rưỡi. Bẫy: nghe thấy 九点 trước.',
  },
  {
    id: 'weekend',
    level: 'hsk3',
    lines: [
      m('你周末去哪儿了？', 'Cuối tuần chị đi đâu?'),
      w(
        '我和妈妈去爬山了，虽然有点儿累，但是很高兴。',
        'Tôi đi leo núi với mẹ, tuy hơi mệt nhưng rất vui.'
      ),
    ],
    q: '女的周末做什么了？',
    qVi: 'Cuối tuần người nữ đã làm gì?',
    options: ['去爬山了', '去超市了', '看电影了'],
    why: '"我和妈妈去爬山了": đi leo núi. 虽然…但是… là "tuy… nhưng…".',
  },
  {
    id: 'sleep',
    level: 'hsk3',
    lines: [
      w('你的眼睛怎么这么红？', 'Mắt anh sao đỏ thế?'),
      m('昨天晚上玩游戏玩到两点，没睡好。', 'Tối qua chơi game đến hai giờ, ngủ không ngon.'),
    ],
    q: '男的为什么没睡好？',
    qVi: 'Vì sao người nam ngủ không ngon?',
    options: ['玩游戏玩得太晚', '工作太多', '身体不舒服'],
    why: '"玩游戏玩到两点": chơi game đến hai giờ sáng, tức là thức quá khuya.',
  },
  {
    id: 'late',
    level: 'hsk3',
    lines: [
      m('喂，你到哪儿了？大家都在等你。', 'Alô, chị đến đâu rồi? Mọi người đang đợi chị.'),
      w(
        '路上车太多了，我可能要晚到二十分钟。',
        'Đường đông xe quá, chắc tôi đến muộn hai mươi phút.'
      ),
    ],
    q: '女的为什么会晚到？',
    qVi: 'Vì sao người nữ sẽ đến muộn?',
    options: ['路上车太多', '起床起晚了', '走错路了'],
    why: '"路上车太多了": đường đông xe. 晚到二十分钟 là đến muộn hai mươi phút.',
  },
  {
    id: 'moving',
    level: 'hsk3',
    lines: [
      w(
        '这个周末你有时间吗？我想请你帮我搬家。',
        'Cuối tuần này anh có thời gian không? Tôi muốn nhờ anh giúp chuyển nhà.'
      ),
      m(
        '星期六不行，我要去机场接朋友，星期天可以。',
        'Thứ Bảy không được, tôi phải ra sân bay đón bạn, Chủ nhật thì được.'
      ),
    ],
    q: '男的星期天要做什么？',
    qVi: 'Chủ nhật người nam sẽ làm gì?',
    options: ['帮女的搬家', '去机场接朋友', '在家休息'],
    why: 'Thứ Bảy ra sân bay đón bạn, Chủ nhật thì "可以": giúp người nữ chuyển nhà. Bẫy: 去机场 là việc của thứ Bảy.',
  },
  {
    id: 'songs',
    level: 'hsk3',
    lines: [
      m('你的汉语说得越来越好了。', 'Chị nói tiếng Trung ngày càng giỏi.'),
      w(
        '谢谢，我每天都听半个小时中文歌。',
        'Cảm ơn, ngày nào tôi cũng nghe nhạc tiếng Trung nửa tiếng.'
      ),
    ],
    q: '女的怎么练习汉语？',
    qVi: 'Người nữ luyện tiếng Trung bằng cách nào?',
    options: ['听中文歌', '看中文电视', '跟老师学习'],
    why: '"我每天都听半个小时中文歌": nghe nhạc tiếng Trung mỗi ngày. 越来越好 là "ngày càng tốt".',
  },
  {
    id: 'restaurant',
    level: 'hsk3',
    lines: [
      w(
        '服务员，这个菜太甜了，能换一个吗？',
        'Phục vụ ơi, món này ngọt quá, đổi món khác được không?'
      ),
      m('好的，我给您换一个别的菜。', 'Vâng, tôi đổi cho chị món khác.'),
    ],
    q: '他们最可能在哪儿？',
    qVi: 'Họ có khả năng ở đâu nhất?',
    options: ['饭馆', '商店', '医院'],
    why: '服务员 (phục vụ), 菜 (món ăn), 换一个别的菜 (đổi món khác): đang ở nhà hàng. Câu hỏi 在哪儿 phải đoán từ các từ gợi ý.',
  },
  {
    id: 'book',
    level: 'hsk3',
    lines: [
      m('你借我的那本书看完了吗？', 'Quyển sách chị mượn tôi đọc xong chưa?'),
      w('还没有，下个星期一定还给你。', 'Chưa, tuần sau nhất định trả anh.'),
    ],
    q: '女的下个星期会做什么？',
    qVi: 'Tuần sau người nữ sẽ làm gì?',
    options: ['还书', '买书', '借书'],
    why: '"下个星期一定还给你": tuần sau trả sách. 还 ở đây đọc huán, nghĩa là trả lại.',
  },
  // ---------------------------------------------------------------- HSK 2
  {
    id: 'taxi',
    level: 'hsk2',
    lines: [
      w('你今天怎么来得这么早？', 'Sao hôm nay anh đến sớm thế?'),
      m('我坐出租车来的，路上车不多。', 'Tôi đi taxi đến, trên đường không đông xe.'),
    ],
    q: '男的是怎么来的？',
    qVi: 'Người nam đến bằng gì?',
    options: ['坐出租车', '坐公共汽车', '走路'],
    why: '"我坐出租车来的": đi taxi. 是…的 nhấn mạnh cách thức đã làm.',
  },
  {
    id: 'price',
    level: 'hsk2',
    lines: [
      m('这件衣服多少钱？', 'Bộ quần áo này bao nhiêu tiền?'),
      w('三百块，但是今天便宜一百。', 'Ba trăm tệ, nhưng hôm nay rẻ hơn một trăm.'),
    ],
    q: '这件衣服今天多少钱？',
    qVi: 'Hôm nay bộ quần áo này bao nhiêu tiền?',
    options: ['两百块', '三百块', '一百块'],
    why: 'Ba trăm trừ một trăm còn hai trăm. Bẫy: nghe thấy 三百 và 一百 nhưng không nghe thấy con số đáp án.',
  },
  {
    id: 'doctor',
    level: 'hsk2',
    lines: [
      w('你哥哥做什么工作？', 'Anh trai anh làm nghề gì?'),
      m('他是医生，在北京的一个医院工作。', 'Anh ấy là bác sĩ, làm ở một bệnh viện ở Bắc Kinh.'),
    ],
    q: '男的哥哥在哪儿工作？',
    qVi: 'Anh trai người nam làm việc ở đâu?',
    options: ['医院', '学校', '饭店'],
    why: '"在北京的一个医院工作": làm ở bệnh viện. Câu hỏi 在哪儿 hỏi nơi chốn.',
  },
  {
    id: 'swim',
    level: 'hsk2',
    lines: [
      m('我们明天去游泳吧？', 'Mai chúng ta đi bơi nhé?'),
      w('明天要下雨，我们下个星期去吧。', 'Mai trời mưa, tuần sau chúng ta đi nhé.'),
    ],
    q: '他们什么时候去游泳？',
    qVi: 'Khi nào họ đi bơi?',
    options: ['下个星期', '明天', '今天'],
    why: 'Mai trời mưa nên người nữ đề nghị "下个星期去吧". Bẫy: 明天 là ngày được nhắc đầu tiên.',
  },
  {
    id: 'phone-gift',
    level: 'hsk2',
    lines: [
      m('你的手机是新买的吗？', 'Điện thoại của chị mới mua à?'),
      w('不是，是我姐姐送给我的。', 'Không, là chị gái tặng tôi.'),
    ],
    q: '手机是谁送的？',
    qVi: 'Ai tặng chiếc điện thoại?',
    options: ['女的姐姐', '女的妈妈', '男的'],
    why: '"是我姐姐送给我的": chị gái của người nữ tặng. 送给 là tặng cho.',
  },
  {
    id: 'better',
    level: 'hsk2',
    lines: [
      w('你身体怎么样了？', 'Anh thấy trong người thế nào rồi?'),
      m(
        '好多了，医生说我明天就可以去上班了。',
        'Đỡ nhiều rồi, bác sĩ nói mai tôi đi làm được rồi.'
      ),
    ],
    q: '男的明天要做什么？',
    qVi: 'Ngày mai người nam sẽ làm gì?',
    options: ['去上班', '去医院', '在家休息'],
    why: '"明天就可以去上班了": mai đi làm được. Bẫy: 医生 làm người nghe nghĩ tới 医院.',
  },
  {
    id: 'tea',
    level: 'hsk2',
    lines: [
      m('你想喝点儿什么？', 'Chị muốn uống gì?'),
      w('我不喝咖啡，给我一杯茶吧。', 'Tôi không uống cà phê, cho tôi một cốc trà nhé.'),
    ],
    q: '女的要喝什么？',
    qVi: 'Người nữ muốn uống gì?',
    options: ['茶', '咖啡', '牛奶'],
    why: '"给我一杯茶吧": một cốc trà. 不喝咖啡 loại cà phê, dù nghe thấy trước.',
  },
  {
    id: 'birthday',
    level: 'hsk2',
    lines: [
      w('明天是我的生日，你能来我家吗？', 'Mai là sinh nhật tôi, anh đến nhà tôi được không?'),
      m('好的！我下午五点以后去你家。', 'Được thôi! Năm giờ chiều trở đi tôi qua nhà chị.'),
    ],
    q: '男的明天几点以后去女的家？',
    qVi: 'Ngày mai sau mấy giờ người nam đến nhà người nữ?',
    options: ['五点', '四点', '六点'],
    why: '"我下午五点以后去你家": sau năm giờ chiều.',
  },
]

export interface ShuffledDialogue extends HskDialogue {
  /** Index of the right option after shuffling. */
  answer: number
}

/** A round of dialogues in random order, the options of each shuffled. */
export function dialogueRound(
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
  return shuffle(HSK_DIALOGUES.filter((d) => d.level === level))
    .slice(0, count)
    .map((d) => {
      const options = shuffle(d.options) as [string, string, string]
      return { ...d, options, answer: options.indexOf(d.options[0]) }
    })
}
