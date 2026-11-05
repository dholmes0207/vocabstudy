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
  {
    id: 'weather',
    text: '这里的冬天虽然不太冷，但是经常刮风，所以出门的时候最好多穿一件衣服。',
    vi: 'Mùa đông ở đây tuy không lạnh lắm, nhưng hay có gió, nên khi ra ngoài tốt nhất mặc thêm một chiếc áo.',
    q: '这里的冬天怎么样？',
    qVi: 'Mùa đông ở đây thế nào?',
    options: ['经常刮风', '特别冷', '经常下雪'],
    why: '虽然…但是…: ý chính nằm sau 但是, "经常刮风" (hay có gió). Câu nói rõ là không lạnh lắm.',
  },
  {
    id: 'elevator',
    text: '我们公司在十八层，电梯坏了的时候，大家只好走上去，到办公室的时候都累得不想说话。',
    vi: 'Công ty chúng tôi ở tầng mười tám, khi thang máy hỏng, mọi người đành đi bộ lên, đến văn phòng ai cũng mệt đến mức không muốn nói.',
    q: '电梯坏了的时候，大家怎么样？',
    qVi: 'Khi thang máy hỏng, mọi người thế nào?',
    options: ['很累', '不去上班', '在楼下等'],
    why: '"只好走上去…都累得不想说话": đành đi bộ lên nên rất mệt. 累得… là bổ ngữ mức độ: mệt đến mức…',
  },
  {
    id: 'exam',
    text: '明天就要考试了，可是我还有两本书没看完，今天晚上看来又要很晚才能睡觉了。',
    vi: 'Mai thi rồi, nhưng tôi còn hai quyển sách chưa đọc xong, xem ra tối nay lại phải rất khuya mới ngủ được.',
    q: '他今天晚上可能会怎么样？',
    qVi: 'Tối nay anh ấy có thể sẽ thế nào?',
    options: ['很晚睡觉', '去看电影', '早点儿休息'],
    why: '"看来又要很晚才能睡觉了": xem ra lại phải khuya mới ngủ. 才 nhấn mạnh việc xảy ra muộn.',
  },
  {
    id: 'neighbor',
    text: '我的邻居是一位老人，他一个人住。每个周末我都去帮他买东西，有时候也和他一起看电视。',
    vi: 'Hàng xóm của tôi là một cụ già, ông sống một mình. Cuối tuần nào tôi cũng đi mua đồ giúp ông, có lúc còn cùng ông xem ti vi.',
    q: '他周末常常做什么？',
    qVi: 'Cuối tuần anh ấy thường làm gì?',
    options: ['帮邻居买东西', '去老人家吃饭', '和朋友看电视'],
    why: '"每个周末我都去帮他买东西": cuối tuần nào cũng đi mua đồ giúp. Xem ti vi là với ông cụ, không phải với bạn.',
  },
  {
    id: 'restaurant',
    text: '这家饭馆的菜很好吃，但是服务员太少，每次都要等很长时间，所以我现在不常去了。',
    vi: 'Món ăn ở quán này rất ngon, nhưng ít người phục vụ quá, lần nào cũng phải đợi rất lâu, nên giờ tôi không hay đến nữa.',
    q: '他为什么现在不常去那家饭馆了？',
    qVi: 'Vì sao giờ anh ấy không hay đến quán đó nữa?',
    options: ['要等很长时间', '菜不好吃', '饭馆太远了'],
    why: '"每次都要等很长时间，所以…不常去了": lần nào cũng phải đợi lâu. Món ăn được khen ngon nên 菜不好吃 là sai.',
  },
  {
    id: 'meeting-move',
    text: '本来下午三点的会议，因为经理还在机场，所以换到明天上午十点了，请大家注意时间。',
    vi: 'Cuộc họp vốn lúc ba giờ chiều, vì giám đốc còn ở sân bay nên đổi sang mười giờ sáng mai, mọi người chú ý giờ nhé.',
    q: '会议现在是什么时候？',
    qVi: 'Cuộc họp giờ là lúc nào?',
    options: ['明天上午十点', '今天下午三点', '明天下午三点'],
    why: '本来… (vốn là) nêu giờ cũ, 换到… (đổi sang) nêu giờ mới: mười giờ sáng mai.',
  },
  {
    id: 'kids-sport',
    text: '我儿子以前不爱运动，每天只在家玩电脑。自从开始每天和同学踢足球，他变得又健康又快乐。',
    vi: 'Con trai tôi trước đây không thích vận động, ngày nào cũng chỉ ở nhà chơi máy tính. Từ khi ngày nào cũng đá bóng với bạn, nó trở nên vừa khoẻ vừa vui.',
    q: '儿子现在怎么样？',
    qVi: 'Con trai giờ thế nào?',
    options: ['身体好，也很快乐', '还是爱玩电脑', '不想上学'],
    why: '以前… (trước đây) là chuyện cũ; 自从… (từ khi) mở ra chuyện bây giờ: 又健康又快乐.',
  },
  {
    id: 'supermarket',
    text: '家旁边新开了一个超市，东西很多，还比别的地方便宜一些，就是晚上九点就关门了。',
    vi: 'Cạnh nhà mới mở một siêu thị, đồ rất nhiều, lại rẻ hơn chỗ khác một chút, chỉ là chín giờ tối đã đóng cửa.',
    q: '这个超市有什么问题？',
    qVi: 'Siêu thị này có vấn đề gì?',
    options: ['关门太早', '东西太少', '离家太远'],
    why: '就是… ở cuối câu nêu điểm chưa tốt: chín giờ tối đã đóng cửa. Đồ nhiều và ở ngay cạnh nhà.',
  },
  {
    id: 'lost-key',
    text: '我刚才找了半天钥匙，最后发现它就在我的包里。我现在真是越来越容易忘事了。',
    vi: 'Lúc nãy tôi tìm chìa khoá mãi, cuối cùng phát hiện nó ở ngay trong túi tôi. Giờ tôi đúng là càng ngày càng hay quên.',
    q: '钥匙在哪儿？',
    qVi: 'Chìa khoá ở đâu?',
    options: ['包里', '桌子上', '门后面'],
    why: '"它就在我的包里": ở ngay trong túi. 越来越… là "càng ngày càng…".',
  },
  {
    id: 'bus-ride',
    text: '从我家到公司，坐地铁要四十分钟，坐公共汽车要一个小时，但是公共汽车站就在我家门口，所以我一般坐公共汽车。',
    vi: 'Từ nhà tôi đến công ty, đi tàu điện ngầm mất bốn mươi phút, đi xe buýt mất một tiếng, nhưng bến xe buýt ở ngay trước cửa nhà tôi, nên tôi thường đi xe buýt.',
    q: '他为什么一般坐公共汽车？',
    qVi: 'Vì sao anh ấy thường đi xe buýt?',
    options: ['车站离家很近', '公共汽车更快', '地铁太贵了'],
    why: '"但是公共汽车站就在我家门口，所以…": bến xe ở ngay cửa nhà. Xe buýt chậm hơn (một tiếng so với bốn mươi phút).',
  },
  {
    id: 'garden',
    text: '我奶奶家的院子里种了很多花，每年春天都特别漂亮，邻居们经常过来照相。',
    vi: 'Trong sân nhà bà tôi trồng rất nhiều hoa, mùa xuân năm nào cũng đặc biệt đẹp, hàng xóm hay sang chụp ảnh.',
    q: '邻居们为什么经常过来？',
    qVi: 'Vì sao hàng xóm hay sang?',
    options: ['照相', '买花', '找奶奶吃饭'],
    why: '"邻居们经常过来照相": sang chụp ảnh vì hoa đẹp. Không ai nói mua hoa.',
  },
  {
    id: 'late-flight',
    text: '因为下大雪，飞机晚了两个小时，我到北京的时候已经是晚上十一点了。',
    vi: 'Vì tuyết rơi dày, máy bay trễ hai tiếng, lúc tôi đến Bắc Kinh đã là mười một giờ đêm.',
    q: '飞机为什么晚了？',
    qVi: 'Vì sao máy bay bị trễ?',
    options: ['下大雪', '飞机坏了', '人太多'],
    why: '因为…: lý do đứng sau 因为, "下大雪" (tuyết rơi dày).',
  },
  {
    id: 'english-class',
    text: '我的英语不太好，所以每个星期二和星期四晚上都去学校上课，现在已经能和外国朋友说一些简单的话了。',
    vi: 'Tiếng Anh của tôi không tốt lắm, nên tối thứ Ba và thứ Năm hằng tuần đều đến trường học, giờ đã có thể nói vài câu đơn giản với bạn nước ngoài.',
    q: '他每个星期上几次英语课？',
    qVi: 'Mỗi tuần anh ấy học tiếng Anh mấy buổi?',
    options: ['两次', '一次', '三次'],
    why: '"每个星期二和星期四": thứ Ba và thứ Năm, tức là hai buổi một tuần.',
  },
  {
    id: 'cheaper-online',
    text: '这件衣服在商店里卖三百块，在网上只要两百块，所以我决定在网上买。',
    vi: 'Chiếc áo này ở cửa hàng bán ba trăm tệ, trên mạng chỉ hai trăm tệ, nên tôi quyết định mua trên mạng.',
    q: '他为什么在网上买衣服？',
    qVi: 'Vì sao anh ấy mua áo trên mạng?',
    options: ['网上更便宜', '商店关门了', '网上的更好看'],
    why: 'Ba trăm tệ ở cửa hàng, hai trăm tệ trên mạng: trên mạng rẻ hơn, nên 所以… mua trên mạng.',
  },
  {
    id: 'forgot-key',
    text: '今天早上出门太着急了，我把钥匙忘在家里了，只好给妻子打电话，让她早点儿回来开门。',
    vi: 'Sáng nay ra khỏi nhà vội quá, tôi để quên chìa khoá ở nhà, đành gọi điện cho vợ, nhờ cô ấy về sớm mở cửa.',
    q: '他为什么给妻子打电话？',
    qVi: 'Vì sao anh ấy gọi điện cho vợ?',
    options: ['他没带钥匙', '妻子生病了', '他要晚回家'],
    why: '"把钥匙忘在家里了，只好给妻子打电话": quên chìa khoá nên đành gọi vợ về mở cửa. 只好 là "đành".',
  },
  {
    id: 'weekend-market',
    text: '每个星期六上午，我家附近都有一个小市场，那里的水果和菜都很新鲜，而且比超市便宜。',
    vi: 'Sáng thứ Bảy hằng tuần, gần nhà tôi có một cái chợ nhỏ, hoa quả và rau ở đó đều rất tươi, mà còn rẻ hơn siêu thị.',
    q: '关于这个市场，可以知道什么？',
    qVi: 'Có thể biết điều gì về cái chợ này?',
    options: ['东西比超市便宜', '每天都开', '离家很远'],
    why: '"而且比超市便宜": còn rẻ hơn siêu thị. Chợ chỉ họp sáng thứ Bảy và ở gần nhà.',
  },
  {
    id: 'new-colleague',
    text: '新来的同事姓张，他以前在银行工作过，所以对数字特别认真，大家都说跟他一起工作很放心。',
    vi: 'Đồng nghiệp mới họ Trương, trước đây anh ấy từng làm ở ngân hàng, nên rất cẩn thận với con số, mọi người đều nói làm việc cùng anh ấy rất yên tâm.',
    q: '小张以前做什么工作？',
    qVi: 'Trước đây anh Trương làm công việc gì?',
    options: ['在银行工作', '当老师', '当医生'],
    why: '"他以前在银行工作过": từng làm ở ngân hàng. 过 chỉ trải nghiệm đã có.',
  },
  {
    id: 'rainy-plan',
    text: '我们本来打算周末去公园骑自行车，可是天气预报说要下雨，只好在家看电影了。',
    vi: 'Chúng tôi vốn định cuối tuần đi công viên đạp xe, nhưng dự báo thời tiết nói sẽ mưa, đành chuyển sang ở nhà xem phim.',
    q: '他们周末最后做什么？',
    qVi: 'Cuối tuần rốt cuộc họ làm gì?',
    options: ['在家看电影', '去公园骑车', '去商店买东西'],
    why: '本来… (vốn định) là kế hoạch cũ; 只好… (đành) là điều thực tế: ở nhà xem phim.',
  },
  {
    id: 'early-bird',
    text: '我习惯早睡早起，每天晚上十点就睡觉，早上六点起床，这样白天工作的时候一点儿也不累。',
    vi: 'Tôi quen ngủ sớm dậy sớm, tối nào cũng mười giờ đi ngủ, sáu giờ sáng dậy, như vậy ban ngày làm việc chẳng thấy mệt chút nào.',
    q: '他每天几点起床？',
    qVi: 'Mỗi ngày anh ấy dậy lúc mấy giờ?',
    options: ['六点', '十点', '八点'],
    why: '"早上六点起床": sáu giờ sáng dậy. 十点 là giờ đi ngủ.',
  },
  {
    id: 'gift-shop',
    text: '这家店的东西虽然不便宜，但是都很特别，我每次给朋友买礼物都来这儿。',
    vi: 'Đồ ở cửa hàng này tuy không rẻ, nhưng đều rất đặc biệt, lần nào mua quà cho bạn tôi cũng đến đây.',
    q: '他为什么常来这家店？',
    qVi: 'Vì sao anh ấy hay đến cửa hàng này?',
    options: ['东西很特别', '东西很便宜', '离家很近'],
    why: '虽然…但是…: ý chính sau 但是, "都很特别" (đều rất đặc biệt). Câu nói rõ là không rẻ.',
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
