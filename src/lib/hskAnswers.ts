// HSK 1 reading, part three (问答匹配): a question, and its answer among the
// others' answers. Hand-written with HSK 1 words only (lib/hskAnswers.test.ts
// checks every character), each pair with its Vietnamese.

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

export interface AnswerQuestion {
  pair: AnswerPair
  options: string[]
  answer: number
}

/** A round of questions, each answer among three others' answers. */
export function answerRound(count = 10, rand: () => number = Math.random): AnswerQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(HSK1_PAIRS)
    .slice(0, count)
    .map((pair) => {
      const others = shuffle(HSK1_PAIRS.filter((p) => p.id !== pair.id))
        .slice(0, 3)
        .map((p) => p.a)
      const options = shuffle([pair.a, ...others])
      return { pair, options, answer: options.indexOf(pair.a) }
    })
}
