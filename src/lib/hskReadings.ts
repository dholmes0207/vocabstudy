// HSK 3 reading, part three: a short passage, then a question (★…) with three
// options. Hand-written with HSK 1–3 words only (lib/hskReadings.test.ts
// checks every character), each with its Vietnamese and the reason.

export interface HskReading {
  id: string
  text: string
  vi: string
  /** The question, without the ★ the test prints before it. */
  q: string
  qVi: string
  /** The right option first; rounds shuffle them. */
  options: [string, string, string]
  why: string
}

export const HSK3_READINGS: readonly HskReading[] = [
  {
    id: 'early',
    text: '我每天早上六点起床，先跑半个小时步，然后洗澡、吃早饭，七点半坐地铁去公司。',
    vi: 'Mỗi sáng tôi dậy lúc sáu giờ, chạy bộ nửa tiếng, rồi tắm, ăn sáng, bảy rưỡi đi tàu điện ngầm đến công ty.',
    q: '他起床以后先做什么？',
    qVi: 'Dậy xong anh ấy làm gì trước?',
    options: ['跑步', '洗澡', '吃早饭'],
    why: '先…然后…: trước tiên chạy bộ, rồi mới tắm và ăn sáng.',
  },
  {
    id: 'shop',
    text: '这家商店的东西又便宜又好，所以周末来买东西的人特别多，最好早点儿来。',
    vi: 'Đồ ở cửa hàng này vừa rẻ vừa tốt, nên cuối tuần người đến mua rất đông, tốt nhất nên đến sớm.',
    q: '为什么周末最好早点儿来？',
    qVi: 'Vì sao cuối tuần nên đến sớm?',
    options: ['人很多', '东西很贵', '商店很远'],
    why: '"来买东西的人特别多": người đến mua rất đông. 又…又… là "vừa… vừa…".',
  },
  {
    id: 'rain',
    text: '今天下午突然下起了大雨，小王没带伞，只好在公司等雨小了再回家。',
    vi: 'Chiều nay bỗng mưa to, Tiểu Vương không mang ô, đành ở công ty đợi mưa nhỏ bớt rồi mới về.',
    q: '小王为什么没有马上回家？',
    qVi: 'Vì sao Tiểu Vương không về nhà ngay?',
    options: ['下雨了，他没带伞', '他还有很多工作', '他在等朋友'],
    why: '"下起了大雨，小王没带伞，只好…等雨小了": trời mưa mà không có ô. 只好 là "đành".',
  },
  {
    id: 'teacher',
    text: '王老师教我们数学已经三年了。她上课很认真，也很关心我们，同学们都很喜欢她。',
    vi: 'Cô Vương dạy toán chúng tôi đã ba năm. Cô dạy rất nghiêm túc, cũng rất quan tâm chúng tôi, các bạn đều rất thích cô.',
    q: '关于王老师，可以知道什么？',
    qVi: 'Có thể biết điều gì về cô Vương?',
    options: ['同学们都喜欢她', '她刚来学校', '她教音乐'],
    why: 'Câu cuối: "同学们都很喜欢她". Cô dạy toán ba năm rồi, không phải mới đến, không dạy nhạc.',
  },
  {
    id: 'phone',
    text: '我的手机用了五年，经常有问题，昨天我终于买了一个新的，比旧的快多了。',
    vi: 'Điện thoại của tôi dùng năm năm, hay bị trục trặc, hôm qua cuối cùng tôi mua cái mới, nhanh hơn cái cũ nhiều.',
    q: '他为什么买了新手机？',
    qVi: 'Vì sao anh ấy mua điện thoại mới?',
    options: ['旧手机经常有问题', '旧手机太小了', '新手机很便宜'],
    why: '"用了五年，经常有问题": dùng lâu và hay hỏng. 终于 là "cuối cùng thì".',
  },
  {
    id: 'trip',
    text: '这次去北京旅游，我们一共玩儿了五天，看了很多有名的地方，就是天气有点儿冷。',
    vi: 'Lần này đi du lịch Bắc Kinh, chúng tôi chơi tổng cộng năm ngày, xem nhiều nơi nổi tiếng, chỉ có điều trời hơi lạnh.',
    q: '他们觉得这次旅游哪里不太好？',
    qVi: 'Họ thấy chuyến du lịch này có gì chưa tốt?',
    options: ['天气有点儿冷', '时间太短', '地方不有名'],
    why: '就是… ở cuối câu nêu điểm chưa tốt: "就是天气有点儿冷".',
  },
  {
    id: 'cook',
    text: '妈妈做的菜特别好吃，可是她工作很忙，只有周末才有时间给我们做饭。',
    vi: 'Mẹ nấu ăn rất ngon, nhưng mẹ bận việc, chỉ cuối tuần mới có thời gian nấu cho chúng tôi.',
    q: '妈妈什么时候给他们做饭？',
    qVi: 'Khi nào mẹ nấu ăn cho họ?',
    options: ['周末', '每天晚上', '每天中午'],
    why: '只有…才…: chỉ khi… mới… "只有周末才有时间": chỉ cuối tuần mới có thời gian.',
  },
  {
    id: 'library',
    text: '学校的图书馆晚上十点关门。如果你想借书，最好九点半以前去，因为九点半以后就不能借了。',
    vi: 'Thư viện trường đóng cửa lúc mười giờ tối. Muốn mượn sách thì nên đến trước chín rưỡi, vì sau chín rưỡi không mượn được nữa.',
    q: '想借书的话，最晚几点以前去？',
    qVi: 'Muốn mượn sách thì muộn nhất phải đến trước mấy giờ?',
    options: ['九点半', '十点', '九点'],
    why: 'Thư viện đóng lúc 10 giờ, nhưng sau 9 rưỡi thì không mượn sách được. Bẫy: 十点 là giờ đóng cửa.',
  },
  {
    id: 'bike',
    text: '我家离公司不远，所以我一般骑自行车上班，又方便又能锻炼身体。',
    vi: 'Nhà tôi cách công ty không xa, nên tôi thường đạp xe đi làm, vừa tiện vừa rèn luyện được sức khoẻ.',
    q: '他怎么去上班？',
    qVi: 'Anh ấy đi làm bằng gì?',
    options: ['骑自行车', '坐地铁', '开车'],
    why: '"我一般骑自行车上班". 一般 là "thường".',
  },
  {
    id: 'birthday',
    text: '下个星期是我女儿的生日，她一直想要一只小狗，所以我决定送她一只。',
    vi: 'Tuần sau là sinh nhật con gái tôi, con bé luôn muốn có một con chó nhỏ, nên tôi quyết định tặng con một con.',
    q: '他要送女儿什么？',
    qVi: 'Anh ấy sẽ tặng con gái gì?',
    options: ['一只小狗', '一只小猫', '一本书'],
    why: '"她一直想要一只小狗，所以我决定送她一只": tặng một con chó nhỏ.',
  },
]

export interface ShuffledReading extends Omit<HskReading, 'options'> {
  options: string[]
  answer: number
}

/** A round of passages in random order, the options of each shuffled. */
export function readingRound(count = 5, rand: () => number = Math.random): ShuffledReading[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(HSK3_READINGS)
    .slice(0, count)
    .map((r) => {
      const options = shuffle(r.options)
      return { ...r, options, answer: options.indexOf(r.options[0]) }
    })
}
