// HSK 1 reading, part three (问答匹配), and the matching part of HSK 2
// reading: a sentence, and its answer among the others' answers. Hand-written
// with the words of the level and below only (lib/hskAnswers.test.ts checks
// every character), each pair with its Vietnamese.

export interface AnswerPair {
  id: string
  q: string
  a: string
  qVi: string
  aVi: string
}

export const HSK1_PAIRS: readonly AnswerPair[] = [
  {
    id: 'name',
    q: '你叫什么名字？',
    a: '我叫王小明。',
    qVi: 'Bạn tên là gì?',
    aVi: 'Tôi tên là Vương Tiểu Minh.',
  },
  {
    id: 'where',
    q: '你是哪国人？',
    a: '我是中国人。',
    qVi: 'Bạn là người nước nào?',
    aVi: 'Tôi là người Trung Quốc.',
  },
  {
    id: 'age',
    q: '你女儿几岁了？',
    a: '她今年五岁。',
    qVi: 'Con gái bạn mấy tuổi rồi?',
    aVi: 'Năm nay cháu năm tuổi.',
  },
  {
    id: 'time',
    q: '现在几点？',
    a: '下午三点。',
    qVi: 'Bây giờ là mấy giờ?',
    aVi: 'Ba giờ chiều.',
  },
  {
    id: 'drink',
    q: '你想喝什么？',
    a: '我想喝茶。',
    qVi: 'Bạn muốn uống gì?',
    aVi: 'Tôi muốn uống trà.',
  },
  {
    id: 'weather',
    q: '明天天气怎么样？',
    a: '明天很冷。',
    qVi: 'Thời tiết ngày mai thế nào?',
    aVi: 'Ngày mai rất lạnh.',
  },
  {
    id: 'price',
    q: '这个杯子多少钱？',
    a: '十五块。',
    qVi: 'Cái cốc này bao nhiêu tiền?',
    aVi: 'Mười lăm tệ.',
  },
  {
    id: 'cat',
    q: '你家有猫吗？',
    a: '有，我家有一只猫。',
    qVi: 'Nhà bạn có mèo không?',
    aVi: 'Có, nhà tôi có một con mèo.',
  },
  {
    id: 'go',
    q: '你去哪儿？',
    a: '我去商店买东西。',
    qVi: 'Bạn đi đâu đấy?',
    aVi: 'Tôi đi cửa hàng mua đồ.',
  },
  {
    id: 'how',
    q: '你怎么去学校？',
    a: '我坐出租车去。',
    qVi: 'Bạn đến trường bằng gì?',
    aVi: 'Tôi đi taxi.',
  },
  { id: 'thanks', q: '谢谢你！', a: '不客气。', qVi: 'Cảm ơn bạn!', aVi: 'Không có gì.' },
  { id: 'sorry', q: '对不起！', a: '没关系。', qVi: 'Xin lỗi!', aVi: 'Không sao.' },
  {
    id: 'family',
    q: '你家有几口人？',
    a: '我家有四口人。',
    qVi: 'Nhà bạn có mấy người?',
    aVi: 'Nhà tôi có bốn người.',
  },
  {
    id: 'who',
    q: '他是谁？',
    a: '他是我的朋友。',
    qVi: 'Anh ấy là ai?',
    aVi: 'Anh ấy là bạn của tôi.',
  },
  {
    id: 'eat',
    q: '你想吃什么？',
    a: '我想吃米饭。',
    qVi: 'Bạn muốn ăn gì?',
    aVi: 'Tôi muốn ăn cơm.',
  },
]

/**
 * HSK 2 reading, the matching part: a sentence and the one that answers or
 * follows it, with HSK 1–2 words.
 */
export const HSK2_PAIRS: readonly AnswerPair[] = [
  {
    id: 'late',
    q: '你怎么来晚了？',
    a: '对不起，路上车太多了。',
    qVi: 'Sao anh đến muộn thế?',
    aVi: 'Xin lỗi, đường đông xe quá.',
  },
  {
    id: 'job',
    q: '你妻子做什么工作？',
    a: '她是医生，在医院工作。',
    qVi: 'Vợ anh làm nghề gì?',
    aVi: 'Cô ấy là bác sĩ, làm ở bệnh viện.',
  },
  {
    id: 'tired',
    q: '你看起来很累。',
    a: '是的，我昨天晚上没睡好。',
    qVi: 'Trông anh mệt lắm.',
    aVi: 'Đúng vậy, tối qua tôi ngủ không ngon.',
  },
  {
    id: 'rain',
    q: '外面下雨了吗？',
    a: '下了，你别出去了。',
    qVi: 'Bên ngoài mưa rồi à?',
    aVi: 'Mưa rồi, anh đừng ra ngoài nữa.',
  },
  {
    id: 'far',
    q: '你家离公司远吗？',
    a: '不远，走路十分钟就到了。',
    qVi: 'Nhà anh có xa công ty không?',
    aVi: 'Không xa, đi bộ mười phút là tới.',
  },
  {
    id: 'birthday',
    q: '明天是你的生日吧？',
    a: '对，我想请朋友们吃饭。',
    qVi: 'Mai là sinh nhật chị phải không?',
    aVi: 'Đúng, tôi muốn mời bạn bè đi ăn.',
  },
  {
    id: 'sport',
    q: '你喜欢什么运动？',
    a: '我最喜欢游泳。',
    qVi: 'Bạn thích môn thể thao nào?',
    aVi: 'Tôi thích bơi nhất.',
  },
  {
    id: 'exam',
    q: '考试准备得怎么样了？',
    a: '还不错，我每天都在学习。',
    qVi: 'Chuẩn bị thi đến đâu rồi?',
    aVi: 'Cũng ổn, ngày nào tôi cũng học bài.',
  },
  {
    id: 'phone',
    q: '我可以用一下你的手机吗？',
    a: '可以，给你。',
    qVi: 'Tôi dùng điện thoại của bạn một chút được không?',
    aVi: 'Được, của bạn đây.',
  },
  {
    id: 'meet',
    q: '我们几点在哪儿见面？',
    a: '下午两点，在学校门口。',
    qVi: 'Mấy giờ chúng ta gặp nhau ở đâu?',
    aVi: 'Hai giờ chiều, ở cổng trường.',
  },
  {
    id: 'room',
    q: '你的房间号是多少？',
    a: '是三一五。',
    qVi: 'Số phòng của bạn là bao nhiêu?',
    aVi: 'Là ba một năm.',
  },
  {
    id: 'wait',
    q: '你在等谁？',
    a: '我在等我妹妹，她马上就到。',
    qVi: 'Bạn đang đợi ai?',
    aVi: 'Tôi đang đợi em gái, nó sắp đến rồi.',
  },
  {
    id: 'better',
    q: '你身体怎么样了？',
    a: '好多了，明天可以去上班了。',
    qVi: 'Sức khoẻ của bạn thế nào rồi?',
    aVi: 'Đỡ nhiều rồi, mai có thể đi làm được.',
  },
  {
    id: 'color',
    q: '你喜欢什么颜色？',
    a: '我喜欢红色。',
    qVi: 'Bạn thích màu gì?',
    aVi: 'Tôi thích màu đỏ.',
  },
  {
    id: 'bought',
    q: '你昨天买了什么？',
    a: '我买了一件新衣服。',
    qVi: 'Hôm qua bạn đã mua gì?',
    aVi: 'Tôi đã mua một bộ quần áo mới.',
  },
]

/** HSK 3 reading, part one: a sentence and the one that answers or follows it. */
export const HSK3_PAIRS: readonly AnswerPair[] = [
  {
    id: 'computer',
    q: '我的电脑突然不能用了。',
    a: '别着急，我帮你检查一下。',
    qVi: 'Máy tính của tôi bỗng không dùng được nữa.',
    aVi: 'Đừng lo, để tôi kiểm tra giúp.',
  },
  {
    id: 'travel',
    q: '这个周末你打算去哪儿旅游？',
    a: '我想去南方，那儿冬天也不冷。',
    qVi: 'Cuối tuần này bạn định đi du lịch đâu?',
    aVi: 'Tôi muốn đi miền Nam, ở đó mùa đông cũng không lạnh.',
  },
  {
    id: 'weight',
    q: '你最近好像瘦了。',
    a: '是啊，我每天下班以后都去锻炼。',
    qVi: 'Dạo này trông bạn gầy đi.',
    aVi: 'Đúng vậy, ngày nào tan làm tôi cũng đi tập.',
  },
  {
    id: 'meeting',
    q: '会议几点结束？',
    a: '应该是十一点半，你还要等一会儿。',
    qVi: 'Mấy giờ cuộc họp kết thúc?',
    aVi: 'Chắc là mười một giờ rưỡi, anh còn phải đợi một lát.',
  },
  {
    id: 'glasses',
    q: '你看见我的眼镜了吗？',
    a: '在你的包里，我刚才看见了。',
    qVi: 'Bạn có thấy kính của tôi không?',
    aVi: 'Ở trong túi của bạn, tôi vừa thấy.',
  },
  {
    id: 'cold',
    q: '你感冒了吗？声音怎么变了？',
    a: '有点儿，昨天晚上忘了关空调。',
    qVi: 'Bạn bị cảm à? Sao giọng khác thế?',
    aVi: 'Hơi hơi, tối qua tôi quên tắt điều hoà.',
  },
  {
    id: 'help',
    q: '这个箱子太重了，我一个人搬不动。',
    a: '没关系，我来帮你。',
    qVi: 'Cái thùng này nặng quá, một mình tôi không bê nổi.',
    aVi: 'Không sao, để tôi giúp.',
  },
  {
    id: 'hungry',
    q: '我有点儿饿了，附近有饭馆吗？',
    a: '有，前面那个银行的旁边就有一个。',
    qVi: 'Tôi hơi đói, gần đây có quán ăn không?',
    aVi: 'Có, ngay cạnh ngân hàng phía trước có một quán.',
  },
  {
    id: 'exam',
    q: '这次考试你考得怎么样？',
    a: '比上次好多了，老师也说我有进步。',
    qVi: 'Lần thi này bạn làm bài thế nào?',
    aVi: 'Tốt hơn lần trước nhiều, thầy cũng nói tôi tiến bộ.',
  },
  {
    id: 'umbrella',
    q: '外面好像要下雨了。',
    a: '那你带上我的伞吧。',
    qVi: 'Bên ngoài hình như sắp mưa.',
    aVi: 'Vậy bạn mang ô của tôi đi.',
  },
]

/** The pairs of a level. */
export const PAIRS = { hsk1: HSK1_PAIRS, hsk2: HSK2_PAIRS, hsk3: HSK3_PAIRS } as const

export interface AnswerQuestion {
  pair: AnswerPair
  options: string[]
  answer: number
}

/** A round of questions, each answer among three others' answers. */
export function answerRound(
  level: keyof typeof PAIRS,
  count = 10,
  rand: () => number = Math.random
): AnswerQuestion[] {
  const pairs = PAIRS[level]
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(pairs)
    .slice(0, count)
    .map((pair) => {
      const others = shuffle(pairs.filter((p) => p.id !== pair.id))
        .slice(0, 3)
        .map((p) => p.a)
      const options = shuffle([pair.a, ...others])
      return { pair, options, answer: options.indexOf(pair.a) }
    })
}
