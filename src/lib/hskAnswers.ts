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
]

/** The pairs of a level. */
export const PAIRS = { hsk1: HSK1_PAIRS, hsk2: HSK2_PAIRS } as const

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
