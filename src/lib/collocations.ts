// "Kết hợp từ" (docs/design/collocations.md): English word partners that
// Vietnamese learners get wrong by translating word for word — "mở đèn" is
// not "open the light", "uống thuốc" is not "drink medicine". Each item has
// the Vietnamese phrase, the natural English, the word-for-word slip, and a
// sentence to fill. The practice offers the right partner beside the slip
// and one more wrong word. Pure; data inline like lib/idiomsEn.ts.

export type Pair = [vi: string, en: string]

export type CollocationTheme =
  'daily' | 'study' | 'work' | 'ielts' | 'hobby' | 'health' | 'tech' | 'travel'

export interface Theme {
  id: CollocationTheme
  emoji: string
  title: Pair
}

export const THEMES: Theme[] = [
  { id: 'daily', emoji: '🏠', title: ['Đời sống hằng ngày', 'Everyday life'] },
  { id: 'study', emoji: '📚', title: ['Học hành, thi cử', 'Study and exams'] },
  { id: 'work', emoji: '💼', title: ['Công việc, tiền bạc', 'Work and money'] },
  {
    id: 'ielts',
    emoji: '🌍',
    title: ['Xã hội, môi trường (IELTS)', 'Society and environment (IELTS)'],
  },
  { id: 'health', emoji: '🩺', title: ['Sức khoẻ', 'Health'] },
  { id: 'tech', emoji: '💻', title: ['Công nghệ', 'Technology'] },
  { id: 'travel', emoji: '✈️', title: ['Du lịch', 'Travel'] },
]

/** The gap in a practice sentence. */
export const GAP = '___'

export interface Collocation {
  theme: CollocationTheme
  /** The Vietnamese phrase learners start from. */
  vi: string
  /** Natural English. */
  right: string
  /** What word-for-word translation gives. */
  slip: string
  /** A sentence with one gap, filled by `answer`. */
  sentence: string
  answer: string
  /** Two wrong partners; the first is the word-for-word one used in `slip`. */
  traps: [string, string]
  /** Why, in Vietnamese. */
  why: string
  /** Pinyin of `right`, for Chinese. */
  reading?: string
}

const c = (
  theme: CollocationTheme,
  vi: string,
  right: string,
  slip: string,
  sentence: string,
  answer: string,
  traps: [string, string],
  why: string
): Collocation => ({ theme, vi, right, slip, sentence, answer, traps, why })

export const COLLOCATIONS: Collocation[] = [
  // Everyday life
  c(
    'daily',
    'mưa to',
    'heavy rain',
    'big rain',
    'We got wet in the ___ rain on the way home.',
    'heavy',
    ['big', 'tall'],
    'Mưa to, kẹt xe nặng đều dùng heavy: heavy rain, heavy traffic. "big rain" là dịch từng chữ.'
  ),
  c(
    'daily',
    'đường đông xe, kẹt xe',
    'heavy traffic',
    'crowded traffic',
    'There is always ___ traffic in the city centre at six o’clock.',
    'heavy',
    ['crowded', 'fat'],
    'Xe cộ đông là heavy traffic. crowded dùng cho nơi chốn: a crowded street, a crowded bus.'
  ),
  c(
    'daily',
    'bật đèn',
    'turn on the light',
    'open the light',
    'It’s dark in here. Can you ___ the light?',
    'turn on',
    ['open', 'start'],
    'Bật / tắt đồ điện là turn on / turn off (switch on / off). open chỉ dùng cho cửa, hộp, sách.'
  ),
  c(
    'daily',
    'uống thuốc',
    'take medicine',
    'drink medicine',
    'Don’t forget to ___ your medicine after lunch.',
    'take',
    ['drink', 'eat'],
    'Thuốc (viên hay nước) đều dùng take: take medicine, take a pill. drink chỉ dùng cho đồ uống.'
  ),
  c(
    'daily',
    'chụp ảnh',
    'take a photo',
    'catch a photo',
    'Excuse me, could you ___ a photo of us?',
    'take',
    ['catch', 'make'],
    'Chụp ảnh là take a photo / take a picture. "chụp" không dịch thành catch.'
  ),
  c(
    'daily',
    'cà phê đặc',
    'strong coffee',
    'thick coffee',
    'I need a cup of ___ coffee to wake up.',
    'strong',
    ['thick', 'hard'],
    'Cà phê, trà đậm là strong; nhạt là weak. thick dùng cho súp, sốt sệt, không dùng cho cà phê.'
  ),
  // Study and exams
  c(
    'study',
    'tiếp thu kiến thức',
    'gain knowledge',
    'learn knowledge',
    'Reading widely is a good way to ___ knowledge.',
    'gain',
    ['learn', 'catch'],
    'learn đã có nghĩa là "học để biết", nên không đi với knowledge. Dùng gain / acquire knowledge, hoặc chỉ learn a lot.'
  ),
  c(
    'study',
    'đi thi, dự thi',
    'take a test',
    'join a test',
    'She will ___ the IELTS test next month.',
    'take',
    ['join', 'go'],
    'Dự thi là take (hoặc sit) an exam / a test. join dùng cho câu lạc bộ, nhóm: join a club.'
  ),
  c(
    'study',
    'tiến bộ',
    'make progress',
    'do progress',
    'You have ___ great progress this term.',
    'made',
    ['done', 'had'],
    'Tiến bộ là make progress. Không nói do progress hay have progress.'
  ),
  c(
    'study',
    'chú ý',
    'pay attention',
    'put attention',
    'Please ___ attention to the instructions.',
    'pay',
    ['put', 'take'],
    'Chú ý là pay attention (to). "put attention" là dịch từ "đặt sự chú ý".'
  ),
  c(
    'study',
    'mắc lỗi',
    'make a mistake',
    'fall a mistake',
    'Everyone ___ mistakes when they learn a new language.',
    'makes',
    ['falls', 'does'],
    'Mắc lỗi là make a mistake. "mắc" không dịch thành fall; do cũng không đi với mistake.'
  ),
  c(
    'study',
    'học thuộc lòng',
    'learn by heart',
    'study by heart',
    'We had to ___ the poem by heart.',
    'learn',
    ['study', 'read'],
    'Học thuộc lòng là learn something by heart (hoặc memorise). Không nói study by heart.'
  ),
  // Work and money
  c(
    'work',
    'kiếm tiền',
    'earn money',
    'find money',
    'Many students work part-time to ___ money.',
    'earn',
    ['find', 'search'],
    'Kiếm tiền là earn money (hoặc make money). find money là "nhặt được tiền".'
  ),
  c(
    'work',
    'giá đắt',
    'a high price',
    'an expensive price',
    'Flats in the city centre sell at a very ___ price.',
    'high',
    ['expensive', 'tall'],
    'Món đồ thì expensive, còn giá thì high / low: a high price. "expensive price" là lặp nghĩa.'
  ),
  c(
    'work',
    'đưa ra quyết định',
    'make a decision',
    'do a decision',
    'It took us a week to ___ a decision.',
    'make',
    ['do', 'bring'],
    'Quyết định là make a decision. "đưa ra" không dịch thành bring.'
  ),
  c(
    'work',
    'tổ chức cuộc họp',
    'hold a meeting',
    'do a meeting',
    'We ___ a short meeting every Monday morning.',
    'hold',
    ['do', 'build'],
    'Họp là hold / have a meeting. do không đi với meeting.'
  ),
  c(
    'work',
    'kịp hạn chót',
    'meet a deadline',
    'catch a deadline',
    'I worked all night to ___ the deadline.',
    'meet',
    ['catch', 'arrive'],
    'Kịp hạn là meet a deadline, trễ hạn là miss a deadline. catch dùng cho xe buýt, tàu: catch a bus.'
  ),
  c(
    'work',
    'nộp đơn xin việc',
    'apply for a job',
    'submit for a job',
    'She ___ for a job at a bank last week.',
    'applied',
    ['submitted', 'requested'],
    'Xin việc là apply for a job. submit đi với giấy tờ: submit an application, submit a form.'
  ),
  // Society and environment (IELTS)
  c(
    'ielts',
    'nâng cao nhận thức',
    'raise awareness',
    'lift awareness',
    'Schools should ___ awareness of climate change.',
    'raise',
    ['lift', 'upgrade'],
    'Nâng cao nhận thức là raise awareness (of). Cụm rất hay dùng trong IELTS Writing Task 2.'
  ),
  c(
    'ielts',
    'gây ra mối đe doạ',
    'pose a threat',
    'bring a threat',
    'Plastic waste ___ a serious threat to sea life.',
    'poses',
    ['brings', 'makes'],
    'Gây ra mối đe doạ là pose a threat (to). bring a threat là dịch từng chữ.'
  ),
  c(
    'ielts',
    'khoảng cách giàu nghèo',
    'the gap between rich and poor',
    'the distance between rich and poor',
    'The ___ between rich and poor is getting wider.',
    'gap',
    ['distance', 'space'],
    'Chênh lệch giữa hai nhóm là gap. distance là khoảng cách về đường đi.'
  ),
  c(
    'ielts',
    'giải quyết vấn đề',
    'tackle a problem',
    'answer a problem',
    'The government must ___ the problem of air pollution.',
    'tackle',
    ['answer', 'release'],
    'Giải quyết vấn đề là tackle / solve / deal with a problem. answer đi với câu hỏi: answer a question.'
  ),
  c(
    'ielts',
    'đóng vai trò quan trọng',
    'play an important role',
    'act an important role',
    'Technology ___ an important role in modern education.',
    'plays',
    ['acts', 'does'],
    'Đóng vai trò là play a role / play a part. act đi với kịch: act in a play.'
  ),
  c(
    'ielts',
    'bảo vệ môi trường',
    'protect the environment',
    'guard the environment',
    'We all have a duty to ___ the environment.',
    'protect',
    ['guard', 'keep'],
    'Bảo vệ môi trường là protect the environment. guard là canh gác (người, cửa).'
  ),
  // Health
  c(
    'health',
    'bị cảm',
    'catch a cold',
    'I was cold',
    'I ___ a cold after walking home in the rain.',
    'caught',
    ['was', 'took'],
    '"I was cold" là "tôi thấy lạnh". Bị cảm là catch a cold (hoặc have a cold).'
  ),
  c(
    'health',
    'đi khám bệnh',
    'see a doctor',
    'check a doctor',
    'You should ___ a doctor about that cough.',
    'see',
    ['check', 'meet'],
    'Đi khám là see a doctor (hoặc go to the doctor). Bác sĩ mới là người check you; meet a doctor là gặp gỡ xã giao.'
  ),
  c(
    'health',
    'tập thể dục',
    'do exercise',
    'practise exercise',
    'I try to ___ some exercise every morning.',
    'do',
    ['practise', 'play'],
    'Tập thể dục là do exercise (hoặc take exercise). practise dùng cho kỹ năng: practise the piano; play cho môn thể thao: play football.'
  ),
  c(
    'health',
    'ăn kiêng',
    'go on a diet',
    'eat a diet',
    'She decided to ___ on a diet before the wedding.',
    'go',
    ['eat', 'make'],
    'Bắt đầu ăn kiêng là go on a diet, đang ăn kiêng là be on a diet. "eat a diet" là dịch từng chữ.'
  ),
  c(
    'health',
    'sốt cao',
    'a high fever',
    'a big fever',
    'The baby has a ___ fever, so we are going to the hospital.',
    'high',
    ['big', 'tall'],
    'Sốt, huyết áp, nhiệt độ cao dùng high: a high fever, high blood pressure. Không dùng big.'
  ),
  c(
    'health',
    'thức khuya',
    'stay up late',
    'wake up late',
    'I ___ up late to finish my essay.',
    'stayed',
    ['woke', 'opened'],
    'Thức khuya là stay up late. wake up late là "dậy muộn", nghĩa ngược hẳn.'
  ),
  // Technology
  c(
    'tech',
    'mở máy tính',
    'turn on the computer',
    'open the computer',
    'Please ___ the computer before the lesson starts.',
    'turn on',
    ['open', 'light'],
    'Bật máy là turn on / switch on. open the computer nghe như tháo vỏ máy ra.'
  ),
  c(
    'tech',
    'up ảnh lên mạng',
    'post a photo',
    'up a photo',
    'She ___ a photo of her lunch on Instagram.',
    'posted',
    ['upped', 'raised'],
    '"Up ảnh" là cách nói của tiếng Việt; tiếng Anh dùng post a photo, upload a photo, share a photo.'
  ),
  c(
    'tech',
    'đặt mật khẩu',
    'set a password',
    'put a password',
    'You need to ___ a strong password for your account.',
    'set',
    ['put', 'place'],
    'Đặt mật khẩu là set (hoặc create) a password. "đặt" ở đây không dịch thành put.'
  ),
  c(
    'tech',
    'lướt web',
    'surf the internet',
    'slide the web',
    'He spends hours ___ the internet every evening.',
    'surfing',
    ['sliding', 'swimming'],
    'Lướt mạng là surf the internet (hoặc browse the web), như lướt sóng. slide là trượt.'
  ),
  c(
    'tech',
    'hết pin',
    'run out of battery',
    'out of pin',
    'My phone has ___ out of battery.',
    'run',
    ['gone', 'finished'],
    '"Pin" là từ tiếng Việt; tiếng Anh là battery. Hết pin: run out of battery, hoặc my battery is dead / flat.'
  ),
  c(
    'tech',
    'bắt wifi',
    'connect to the wifi',
    'catch the wifi',
    'I can’t ___ to the wifi in this café.',
    'connect',
    ['catch', 'hold'],
    'Bắt wifi là connect to the wifi (get on the wifi). catch không dùng cho mạng.'
  ),
  // Travel
  c(
    'travel',
    'đặt phòng khách sạn',
    'book a room',
    'order a room',
    'We ___ a hotel room near the beach.',
    'booked',
    ['ordered', 'bought'],
    'Đặt trước phòng, vé, bàn là book (hoặc reserve). order dùng cho đồ ăn, hàng hoá: order a pizza.'
  ),
  c(
    'travel',
    'lên máy bay',
    'board the plane',
    'go up the plane',
    'Passengers can ___ the plane in ten minutes.',
    'board',
    ['climb', 'go'],
    'Lên máy bay là board the plane hoặc get on the plane. "go up" là dịch chữ "lên".'
  ),
  c(
    'travel',
    'xếp hàng',
    'stand in line',
    'arrange a line',
    'We had to ___ in line for an hour to get tickets.',
    'stand',
    ['arrange', 'put'],
    'Xếp hàng là stand in line / queue (up). arrange là sắp xếp đồ vật, không dùng cho người xếp hàng.'
  ),
  c(
    'travel',
    'trả phòng',
    'check out',
    'return the room',
    'We have to ___ out of the hotel by noon.',
    'check',
    ['return', 'give'],
    'Nhận phòng là check in, trả phòng là check out. "return the room" là dịch từng chữ.'
  ),
  c(
    'travel',
    'hỏi đường',
    'ask for directions',
    'ask the road',
    'We got lost, so we asked someone for ___.',
    'directions',
    ['the road', 'the street'],
    'Hỏi đường là ask for directions (hoặc ask the way). "ask the road" là hỏi con đường, vô nghĩa.'
  ),
  c(
    'travel',
    'đi xe buýt',
    'take the bus',
    'sit the bus',
    'I usually ___ the bus to work.',
    'take',
    ['sit', 'go'],
    '"Ngồi xe buýt" là take the bus (hoặc go by bus). sit chỉ là ngồi; go phải có by: go by bus.'
  ),
]

// Chinese: the verb that goes with the noun, where Vietnamese picks another
// ("uống thuốc" is 吃药, "đội mũ" is 戴帽子, "đánh đàn" is 弹吉他).
export const THEMES_ZH: Theme[] = [
  { id: 'daily', emoji: '🏠', title: ['Đời sống hằng ngày', 'Everyday life'] },
  { id: 'study', emoji: '📚', title: ['Học tập, công việc', 'Study and work'] },
  { id: 'hobby', emoji: '🎸', title: ['Sở thích, thể thao', 'Hobbies and sport'] },
]

const z = (
  theme: CollocationTheme,
  vi: string,
  right: string,
  reading: string,
  slip: string,
  sentence: string,
  answer: string,
  traps: [string, string],
  why: string
): Collocation => ({ theme, vi, right, reading, slip, sentence, answer, traps, why })

export const COLLOCATIONS_ZH: Collocation[] = [
  // Everyday life
  z(
    'daily',
    'uống thuốc',
    '吃药',
    'chī yào',
    '喝药',
    '这种药一天___三次，每次两片。',
    '吃',
    ['喝', '打'],
    'Tiếng Trung nói 吃药 ("ăn thuốc"), nhất là thuốc viên. 喝 chỉ dùng khi uống thuốc nước, như 喝中药.'
  ),
  z(
    'daily',
    'đội mũ',
    '戴帽子',
    'dài màozi',
    '穿帽子',
    '外面太阳很大，你___上帽子吧。',
    '戴',
    ['穿', '盖'],
    '穿 dùng cho quần áo, giày dép. Mũ, kính, đồng hồ, khẩu trang thì dùng 戴: 戴帽子, 戴眼镜.'
  ),
  z(
    'daily',
    'đánh răng',
    '刷牙',
    'shuā yá',
    '打牙',
    '我每天早上起床以后先___牙。',
    '刷',
    ['打', '拍'],
    'Đánh răng là 刷牙 ("chải răng"). 打 là "đánh" nhưng không đi với răng.'
  ),
  z(
    'daily',
    'gọi điện thoại',
    '打电话',
    'dǎ diànhuà',
    '叫电话',
    '到了以后给我___个电话。',
    '打',
    ['叫', '做'],
    'Gọi điện là 打电话. 叫 là gọi tên, gọi người (叫他过来), không đi với 电话.'
  ),
  z(
    'daily',
    'đi xe đạp',
    '骑自行车',
    'qí zìxíngchē',
    '开自行车',
    '我每天___自行车上班。',
    '骑',
    ['开', '走'],
    'Xe phải ngồi dạng chân (xe đạp, xe máy, ngựa) dùng 骑; ô tô, tàu dùng 开. "đi" không dịch thành 走.'
  ),
  z(
    'daily',
    'chụp ảnh',
    '拍照片',
    'pāi zhàopiàn',
    '打照片',
    '这里很漂亮，我们___张照片吧！',
    '拍',
    ['打', '做'],
    'Chụp ảnh là 拍照 / 拍照片 (hoặc 照相). Không dùng 打 hay 做.'
  ),
  z(
    'daily',
    'gửi tin nhắn',
    '发短信',
    'fā duǎnxìn',
    '送短信',
    '我给妈妈___了一条短信，说我晚点回家。',
    '发',
    ['送', '寄'],
    'Gửi tin nhắn, email là 发: 发短信, 发邮件, 发微信. 送 là đưa, tặng (送礼物); 寄 là gửi qua bưu điện (寄信).'
  ),
  z(
    'daily',
    'lên mạng',
    '上网',
    'shàng wǎng',
    '进网',
    '我晚上常常___网看新闻。',
    '上',
    ['进', '入'],
    'Lên mạng là 上网, giống 上课, 上班. 进 là đi vào một chỗ có thật (进教室), không đi với 网.'
  ),
  // Study and work
  z(
    'study',
    'mắc lỗi',
    '犯错误',
    'fàn cuòwù',
    '做错误',
    '学外语的时候，谁都会___错误。',
    '犯',
    ['做', '打'],
    'Mắc lỗi là 犯错误 (phạm lỗi). 做错 là làm sai một việc cụ thể: 这道题我做错了.'
  ),
  z(
    'study',
    'nâng cao trình độ',
    '提高水平',
    'tígāo shuǐpíng',
    '升高水平',
    '我想去中国留学，___我的汉语水平。',
    '提高',
    ['升高', '加高'],
    'Nâng cao trình độ, chất lượng là 提高. 升高 dùng cho nhiệt độ, vị trí (温度升高); 加高 là xây cao thêm.'
  ),
  z(
    'study',
    'tham gia kỳ thi',
    '参加考试',
    'cānjiā kǎoshì',
    '加入考试',
    '下个月我要___HSK三级考试。',
    '参加',
    ['加入', '进入'],
    'Tham gia hoạt động, kỳ thi là 参加. 加入 là gia nhập một tổ chức: 加入俱乐部.'
  ),
  z(
    'study',
    'kiếm tiền',
    '挣钱',
    'zhèng qián',
    '找钱',
    '他每天工作很累，就是为了多___钱。',
    '挣',
    ['找', '寻'],
    'Kiếm tiền là 挣钱 hoặc 赚钱. 找钱 nghĩa là "thối tiền" khi mua hàng: 找您五块.'
  ),
  z(
    'study',
    'trả lời câu hỏi',
    '回答问题',
    'huídá wèntí',
    '答应问题',
    '请你___我的问题。',
    '回答',
    ['答应', '还'],
    'Trả lời câu hỏi là 回答. 答应 là "đồng ý, nhận lời": 他答应帮我.'
  ),
  z(
    'study',
    'họp',
    '开会',
    'kāi huì',
    '做会',
    '我们每个星期一上午___会。',
    '开',
    ['做', '打'],
    'Họp là 开会 ("mở cuộc họp"). Không dùng 做 hay 打.'
  ),
  z(
    'study',
    'xin nghỉ',
    '请假',
    'qǐng jià',
    '求假',
    '我发烧了，明天要向老师___假。',
    '请',
    ['求', '要'],
    'Xin nghỉ học, nghỉ phép là 请假. 求 là "cầu xin" (求你帮帮我), không đi với 假.'
  ),
  z(
    'study',
    'tan làm',
    '下班',
    'xià bān',
    '完班',
    '我们公司六点___班，我六点半就到家了。',
    '下',
    ['完', '出'],
    'Đi làm là 上班, tan làm là 下班 (học cũng vậy: 上课, 下课). Muốn nói "làm xong việc" thì là 做完工作.'
  ),
  // Hobbies and sport
  z(
    'hobby',
    'đá bóng',
    '踢足球',
    'tī zúqiú',
    '打足球',
    '他很喜欢___足球，每个周末都去。',
    '踢',
    ['打', '弹'],
    'Bóng đá dùng chân nên là 踢; bóng rổ, cầu lông, bóng bàn dùng tay hoặc vợt nên là 打: 打篮球.'
  ),
  z(
    'hobby',
    'đánh đàn ghi-ta',
    '弹吉他',
    'tán jítā',
    '打吉他',
    '他会___吉他，还会唱歌。',
    '弹',
    ['打', '拉'],
    'Đàn gảy, đàn phím (ghi-ta, piano) dùng 弹; đàn kéo (violin, nhị) dùng 拉. "đánh đàn" không dịch thành 打.'
  ),
  z(
    'hobby',
    'chơi piano',
    '弹钢琴',
    'tán gāngqín',
    '玩钢琴',
    '她从五岁开始学___钢琴。',
    '弹',
    ['玩', '打'],
    'Chơi đàn piano là 弹钢琴. 玩 là chơi đùa, chơi game, không dùng cho nhạc cụ khi học đàn.'
  ),
  z(
    'hobby',
    'thả diều',
    '放风筝',
    'fàng fēngzheng',
    '飞风筝',
    '春天到了，孩子们在公园里___风筝。',
    '放',
    ['飞', '打'],
    'Thả diều là 放风筝 ("thả"). 飞 là "bay", chủ ngữ là cái diều: 风筝飞得很高.'
  ),
  z(
    'hobby',
    'tập thể dục',
    '锻炼身体',
    'duànliàn shēntǐ',
    '练习身体',
    '我每天早上去公园___身体。',
    '锻炼',
    ['练习', '学习'],
    'Rèn luyện thân thể là 锻炼身体. 练习 là luyện một kỹ năng: 练习口语, 练习写字.'
  ),
  z(
    'hobby',
    'đánh cờ',
    '下棋',
    'xià qí',
    '打棋',
    '爷爷每天下午在公园里跟朋友___棋。',
    '下',
    ['打', '做'],
    'Chơi cờ (cờ tướng, cờ vây) là 下棋, "đặt quân cờ xuống". "đánh cờ" không dịch thành 打; 打 dùng cho bóng: 打篮球.'
  ),
  z(
    'hobby',
    'kéo đàn violin',
    '拉小提琴',
    'lā xiǎotíqín',
    '弹小提琴',
    '她从小学___小提琴，现在在乐团演奏。',
    '拉',
    ['弹', '打'],
    'Đàn có cung kéo (violin, cello, đàn nhị) dùng 拉. 弹 dành cho đàn gảy, đàn phím: 弹吉他, 弹钢琴.'
  ),
]

/** Each pack's themes and items. */
export const COLLOCATION_PACKS: Record<'en' | 'zh', { themes: Theme[]; items: Collocation[] }> = {
  en: { themes: THEMES, items: COLLOCATIONS },
  zh: { themes: THEMES_ZH, items: COLLOCATIONS_ZH },
}

/** The sentence with its gap filled. */
export const filled = (it: Collocation, word = it.answer): string => it.sentence.replace(GAP, word)

export interface CollocationQuestion {
  /**
   * "fill": the sentence with a gap, the partner beside two traps.
   * "pick": two whole sentences, the natural one and the word-for-word slip.
   */
  kind: 'fill' | 'pick'
  item: Collocation
  options: string[]
  answer: number
}

/**
 * A round: items from every theme (or one), taking turns between filling the
 * gap (the partner beside two traps) and picking the natural sentence of two.
 */
export function collocationRound(
  size = 10,
  theme?: CollocationTheme,
  rand: () => number = Math.random,
  pool: readonly Collocation[] = COLLOCATIONS
): CollocationQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1))
      ;[a[j], a[k]] = [a[k], a[j]]
    }
    return a
  }
  return shuffle(pool.filter((x) => !theme || x.theme === theme))
    .slice(0, size)
    .map((item, n): CollocationQuestion => {
      if (n % 2 === 1) {
        const right = filled(item)
        const options = shuffle([right, filled(item, item.traps[0])])
        return { kind: 'pick', item, options, answer: options.indexOf(right) }
      }
      const options = shuffle([item.answer, ...item.traps])
      return { kind: 'fill', item, options, answer: options.indexOf(item.answer) }
    })
}

/** XP for a round, as for the idioms. */
export const collocationXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
