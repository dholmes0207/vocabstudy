import { PICTURE_WORDS } from './hskPractice'

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
  {
    id: 'umbrella',
    level: 'hsk3',
    lines: [
      w('外面在下雨，你带伞了吗？', 'Bên ngoài đang mưa, anh mang ô chưa?'),
      m('忘了。不过没关系，我的车就在楼下。', 'Quên mất. Nhưng không sao, xe tôi ở ngay dưới nhà.'),
    ],
    q: '男的为什么说没关系？',
    qVi: 'Vì sao người nam nói không sao?',
    options: ['他的车就在楼下', '雨已经不下了', '他有两把伞'],
    why: '"我的车就在楼下": xe ở ngay dưới, nên không cần ô. 不过 = nhưng.',
  },
  {
    id: 'elevator',
    level: 'hsk3',
    lines: [
      m('电梯坏了，我们只能走上去了。', 'Thang máy hỏng rồi, chúng ta chỉ có thể đi bộ lên thôi.'),
      w('还好办公室在三楼，不太高。', 'May mà văn phòng ở tầng ba, không cao lắm.'),
    ],
    q: '他们的办公室在几楼？',
    qVi: 'Văn phòng của họ ở tầng mấy?',
    options: ['三楼', '一楼', '十楼'],
    why: '"办公室在三楼": tầng ba. 还好 = may mà.',
  },
  {
    id: 'glasses',
    level: 'hsk3',
    lines: [
      w('你最近怎么总是戴眼镜？', 'Dạo này sao anh lúc nào cũng đeo kính?'),
      m(
        '我每天用电脑工作十个小时，眼睛越来越不好了。',
        'Ngày nào tôi cũng làm việc với máy tính mười tiếng, mắt ngày càng kém.'
      ),
    ],
    q: '男的眼睛为什么不好了？',
    qVi: 'Vì sao mắt người nam kém đi?',
    options: ['用电脑的时间太长', '晚上看书太多', '身体生病了'],
    why: '"每天用电脑工作十个小时": dùng máy tính quá lâu. 越来越 = ngày càng.',
  },
  {
    id: 'gift',
    level: 'hsk3',
    lines: [
      m(
        '下个月是我妈妈的生日，你觉得我送她什么礼物好？',
        'Tháng sau là sinh nhật mẹ tôi, chị thấy tôi nên tặng mẹ quà gì?'
      ),
      w(
        '她不是喜欢花吗？你可以送她一些花，再带她去饭馆吃饭。',
        'Bác chẳng phải thích hoa sao? Anh có thể tặng ít hoa, rồi đưa bác đi ăn nhà hàng.'
      ),
    ],
    q: '女的让男的做什么？',
    qVi: 'Người nữ khuyên người nam làm gì?',
    options: ['送花，再去吃饭', '买一本书', '去旅游'],
    why: '"送她一些花，再带她去饭馆吃饭". 不是…吗? là câu hỏi tu từ: "chẳng phải… sao?", ý là bác thích hoa.',
  },
  {
    id: 'bus-late',
    level: 'hsk3',
    lines: [
      w('你今天怎么迟到了？', 'Sao hôm nay anh đi muộn?'),
      m(
        '公共汽车等了半个小时也没来，最后我只好坐出租车。',
        'Đợi xe buýt nửa tiếng mà không thấy, cuối cùng tôi đành đi taxi.'
      ),
    ],
    q: '男的最后是怎么来的？',
    qVi: 'Cuối cùng người nam đến bằng gì?',
    options: ['坐出租车', '坐公共汽车', '骑自行车'],
    why: '"最后我只好坐出租车": cuối cùng đành đi taxi. Bẫy: 公共汽车 được nhắc trước nhưng không đến.',
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
  {
    id: 'cold',
    level: 'hsk2',
    lines: [
      w('今天很冷，你多穿点儿衣服。', 'Hôm nay lạnh lắm, anh mặc thêm áo vào.'),
      m('好的，我再穿一件。', 'Được, tôi mặc thêm một cái.'),
    ],
    q: '今天天气怎么样？',
    qVi: 'Thời tiết hôm nay thế nào?',
    options: ['很冷', '很热', '下雨了'],
    why: '"今天很冷": hôm nay lạnh.',
  },
  {
    id: 'brother-age',
    level: 'hsk2',
    lines: [
      m('你哥哥比你大几岁？', 'Anh trai chị hơn chị mấy tuổi?'),
      w('他比我大三岁，今年二十五岁。', 'Anh ấy hơn tôi ba tuổi, năm nay hai mươi lăm tuổi.'),
    ],
    q: '女的今年多大？',
    qVi: 'Năm nay người nữ bao nhiêu tuổi?',
    options: ['二十二岁', '二十五岁', '三岁'],
    why: 'Anh trai 25 tuổi, hơn cô ấy 3 tuổi, nên cô ấy 22 tuổi. Phải tính, không có số này trong lời nói.',
  },
  {
    id: 'library',
    level: 'hsk2',
    lines: [
      w(
        '你下午去哪儿了？我给你打电话，你没回。',
        'Chiều nay anh đi đâu? Tôi gọi điện mà anh không gọi lại.'
      ),
      m('我在学校看书，手机没开。', 'Tôi ở trường đọc sách, không bật điện thoại.'),
    ],
    q: '男的下午在做什么？',
    qVi: 'Chiều nay người nam làm gì?',
    options: ['看书', '打电话', '睡觉'],
    why: '"我在学校看书": đọc sách ở trường. Người nữ mới là người gọi điện.',
  },
  {
    id: 'fruit',
    level: 'hsk2',
    lines: [
      m('你想吃什么水果？', 'Chị muốn ăn hoa quả gì?'),
      w('西瓜太大了，我们买几个苹果吧。', 'Dưa hấu to quá, mình mua mấy quả táo đi.'),
    ],
    q: '他们要买什么？',
    qVi: 'Họ sẽ mua gì?',
    options: ['苹果', '西瓜', '鸡蛋'],
    why: '"我们买几个苹果吧". Dưa hấu bị loại vì to quá.',
  },
  {
    id: 'bike',
    level: 'hsk3',
    lines: [
      w('你的自行车呢？今天怎么走路来了？', 'Xe đạp của anh đâu? Sao hôm nay đi bộ đến?'),
      m(
        '我把自行车借给弟弟了，他今天要用。',
        'Tôi cho em trai mượn xe đạp rồi, hôm nay nó cần dùng.'
      ),
    ],
    q: '男的为什么走路来？',
    qVi: 'Vì sao người nam đi bộ đến?',
    options: ['自行车借给弟弟了', '自行车坏了', '想锻炼身体'],
    why: '"我把自行车借给弟弟了": cho em trai mượn xe. Không ai nói xe hỏng hay muốn tập thể dục.',
  },
  {
    id: 'fridge',
    level: 'hsk3',
    lines: [
      m('今天晚上我们在家做饭吧？', 'Tối nay mình nấu cơm ở nhà nhé?'),
      w(
        '冰箱里什么都没有了，我们还是去外面吃吧。',
        'Tủ lạnh chẳng còn gì cả, mình ra ngoài ăn đi.'
      ),
    ],
    q: '他们晚上可能在哪儿吃饭？',
    qVi: 'Tối nay có lẽ họ ăn cơm ở đâu?',
    options: ['饭馆', '家里', '朋友家'],
    why: '还是…吧 ("hay là… đi") nêu lựa chọn cuối cùng: tủ lạnh trống nên họ ra ngoài ăn, tức là ăn ở quán.',
  },
  {
    id: 'bank',
    level: 'hsk3',
    lines: [
      w('请问，去银行怎么走？', 'Xin hỏi, đến ngân hàng đi thế nào?'),
      m(
        '一直往前走，到第二个路口往左走，就能看到了。',
        'Cứ đi thẳng, đến ngã tư thứ hai thì rẽ trái là thấy.'
      ),
    ],
    q: '银行在哪儿？',
    qVi: 'Ngân hàng ở đâu?',
    options: ['第二个路口左边', '第一个路口左边', '第二个路口右边'],
    why: '"第二个路口往左走": ngã tư thứ hai, rẽ trái. Hai phương án kia đổi một chi tiết, phải nghe đủ cả hai.',
  },
  {
    id: 'hat',
    level: 'hsk3',
    lines: [
      m('你看见我的帽子了吗？我找了半天了。', 'Em có thấy mũ của anh không? Anh tìm mãi rồi.'),
      w('在门后面，昨天你回来的时候放在那儿了。', 'Ở sau cửa, hôm qua lúc anh về đã để ở đó.'),
    ],
    q: '帽子在哪儿？',
    qVi: 'Cái mũ ở đâu?',
    options: ['门后面', '桌子上', '包里'],
    why: '"在门后面": ở sau cửa. Câu sau chỉ giải thích vì sao nó ở đó.',
  },
  {
    id: 'snow',
    level: 'hsk3',
    lines: [
      w('听说明天要下雪，我们还去爬山吗？', 'Nghe nói mai có tuyết, mình còn đi leo núi không?'),
      m(
        '如果下雪，我们就换个时间，下个星期再去。',
        'Nếu có tuyết thì mình đổi thời gian, tuần sau hãy đi.'
      ),
    ],
    q: '如果明天下雪，他们会怎么做？',
    qVi: 'Nếu mai có tuyết, họ sẽ làm gì?',
    options: ['下个星期再去', '还去爬山', '在家看电视'],
    why: '如果…就…: "nếu… thì…". Có tuyết thì đổi sang tuần sau, nên 还去爬山 là sai.',
  },
  {
    id: 'ticket',
    level: 'hsk2',
    lines: [
      m('你买到机票了吗？', 'Chị mua được vé máy bay chưa?'),
      w('买到了，是明天上午八点的。', 'Mua được rồi, chuyến tám giờ sáng mai.'),
    ],
    q: '女的买的是几点的机票？',
    qVi: 'Người nữ mua vé máy bay mấy giờ?',
    options: ['上午八点', '下午八点', '晚上八点'],
    why: '"明天上午八点": tám giờ sáng mai. Ba phương án cùng là tám giờ, chỉ khác buổi.',
  },
  {
    id: 'sister-job',
    level: 'hsk2',
    lines: [
      w('你姐姐在哪儿工作？', 'Chị gái anh làm việc ở đâu?'),
      m('她在医院工作，是医生。', 'Chị ấy làm ở bệnh viện, là bác sĩ.'),
    ],
    q: '男的的姐姐做什么工作？',
    qVi: 'Chị gái người nam làm nghề gì?',
    options: ['医生', '老师', '服务员'],
    why: '"是医生": là bác sĩ. 医院 (bệnh viện) cũng gợi ý đáp án.',
  },
  {
    id: 'running',
    level: 'hsk2',
    lines: [
      m('你每天早上都去跑步吗？', 'Sáng nào chị cũng đi chạy à?'),
      w(
        '是的，我每天六点起床，跑一个小时。',
        'Đúng vậy, ngày nào tôi cũng dậy lúc sáu giờ, chạy một tiếng.'
      ),
    ],
    q: '女的每天跑多长时间？',
    qVi: 'Mỗi ngày người nữ chạy bao lâu?',
    options: ['一个小时', '两个小时', '六个小时'],
    why: '"跑一个小时": chạy một tiếng. 六点 là giờ dậy, nên 六个小时 là bẫy.',
  },
  {
    id: 'shop-open',
    level: 'hsk2',
    lines: [
      m('这个商店几点开门？', 'Cửa hàng này mấy giờ mở cửa?'),
      w(
        '早上九点开门，现在是八点五十，我们等一会儿吧。',
        'Chín giờ sáng mở cửa, bây giờ là tám giờ năm mươi, mình đợi một lát nhé.'
      ),
    ],
    q: '现在几点？',
    qVi: 'Bây giờ là mấy giờ?',
    options: ['八点五十', '九点', '九点十分'],
    why: '"现在是八点五十": bây giờ là tám giờ năm mươi. Bẫy: 九点 là giờ mở cửa.',
  },
  {
    id: 'computer-broken',
    level: 'hsk3',
    lines: [
      w('你的电脑怎么了？一直在看它。', 'Máy tính của anh sao thế? Cứ nhìn nó mãi.'),
      m(
        '它突然不能上网了，我下午还要给经理发邮件呢。',
        'Nó bỗng không vào mạng được, chiều nay tôi còn phải gửi email cho giám đốc.'
      ),
    ],
    q: '男的的电脑有什么问题？',
    qVi: 'Máy tính của người nam có vấn đề gì?',
    options: ['不能上网', '太旧了', '不能打字'],
    why: '"突然不能上网了": bỗng không vào mạng được. Gửi email là việc anh ấy cần làm, không phải vấn đề.',
  },
  {
    id: 'kitchen',
    level: 'hsk3',
    lines: [
      m('你做的菜真好吃，是跟谁学的？', 'Món chị nấu ngon thật, chị học ai vậy?'),
      w(
        '我奶奶。我小时候经常在厨房看她做饭。',
        'Bà tôi. Hồi nhỏ tôi hay ở trong bếp xem bà nấu ăn.'
      ),
    ],
    q: '女的做饭是跟谁学的？',
    qVi: 'Người nữ học nấu ăn từ ai?',
    options: ['奶奶', '妈妈', '老师'],
    why: '"我奶奶": bà. Câu sau kể chuyện hồi nhỏ xem bà nấu ăn ở bếp.',
  },
  {
    id: 'flight-change',
    level: 'hsk3',
    lines: [
      w(
        '你不是明天早上的飞机吗？怎么今天就去机场了？',
        'Không phải anh bay sáng mai sao? Sao hôm nay đã ra sân bay rồi?'
      ),
      m(
        '明天有大雪，飞机的时间变了，我只好今天晚上走。',
        'Mai có tuyết lớn, giờ bay đã đổi, tôi đành đi tối nay.'
      ),
    ],
    q: '男的什么时候走？',
    qVi: 'Người nam đi khi nào?',
    options: ['今天晚上', '明天早上', '明天晚上'],
    why: '"我只好今天晚上走": đành đi tối nay. Bẫy: 明天早上 là giờ bay cũ.',
  },
  {
    id: 'class-room',
    level: 'hsk3',
    lines: [
      m('请问，汉语课还在三号教室吗？', 'Xin hỏi, lớp tiếng Trung vẫn ở phòng số 3 à?'),
      w(
        '不在了，从这个星期开始换到二楼的八号教室了。',
        'Không còn nữa, từ tuần này đổi sang phòng số 8 ở tầng hai rồi.'
      ),
    ],
    q: '汉语课现在在哪个教室？',
    qVi: 'Lớp tiếng Trung giờ ở phòng nào?',
    options: ['八号教室', '三号教室', '二号教室'],
    why: '"换到二楼的八号教室了": đổi sang phòng số 8. 三号 là phòng cũ; 二 là số tầng, không phải số phòng.',
  },
  {
    id: 'gift-choice',
    level: 'hsk3',
    lines: [
      w(
        '下个星期是爸爸的生日，送他什么好呢？',
        'Tuần sau là sinh nhật bố, tặng bố gì thì hay nhỉ?'
      ),
      m(
        '他最近总说眼睛不舒服，我们给他买一个新的电脑吧，大一点儿的。',
        'Dạo này bố hay kêu mỏi mắt, mình mua cho bố cái máy tính mới đi, loại to hơn chút.'
      ),
    ],
    q: '他们可能给爸爸买什么？',
    qVi: 'Họ có thể mua gì cho bố?',
    options: ['电脑', '眼镜', '手表'],
    why: '"给他买一个新的电脑吧": mua máy tính mới. Bẫy: nghe 眼睛 dễ chọn 眼镜.',
  },
  {
    id: 'weekend-plan',
    level: 'hsk2',
    lines: [
      m('这个星期六你想做什么？', 'Thứ Bảy này chị muốn làm gì?'),
      w('我想在家休息，上个星期太累了。', 'Tôi muốn ở nhà nghỉ, tuần trước mệt quá.'),
    ],
    q: '女的这个星期六想做什么？',
    qVi: 'Thứ Bảy này người nữ muốn làm gì?',
    options: ['在家休息', '去旅游', '去朋友家'],
    why: '"我想在家休息": muốn ở nhà nghỉ. Tuần trước mệt là lý do.',
  },
  {
    id: 'train-ticket',
    level: 'hsk2',
    lines: [
      w('去北京的票多少钱一张？', 'Vé đi Bắc Kinh bao nhiêu tiền một vé?'),
      m('一百五十块，孩子的票是七十五块。', 'Một trăm năm mươi tệ, vé trẻ em là bảy mươi lăm tệ.'),
    ],
    q: '一张孩子的票多少钱？',
    qVi: 'Một vé trẻ em bao nhiêu tiền?',
    options: ['七十五块', '一百五十块', '一百块'],
    why: '"孩子的票是七十五块". Bẫy: 一百五十块 là giá vé người lớn, nghe trước.',
  },
  {
    id: 'coffee-sleep',
    level: 'hsk2',
    lines: [
      m('你要不要喝杯咖啡？', 'Chị có muốn uống cốc cà phê không?'),
      w(
        '不了，现在已经晚上了，喝咖啡我会睡不着。',
        'Thôi, giờ đã tối rồi, uống cà phê tôi sẽ không ngủ được.'
      ),
    ],
    q: '女的为什么不喝咖啡？',
    qVi: 'Vì sao người nữ không uống cà phê?',
    options: ['会睡不着', '不喜欢咖啡', '已经喝了'],
    why: '"喝咖啡我会睡不着": uống cà phê sẽ không ngủ được. Không ai nói cô ấy không thích.',
  },
  {
    id: 'new-house',
    level: 'hsk2',
    lines: [
      w('你的新家离公司远吗？', 'Nhà mới của anh có xa công ty không?'),
      m(
        '不远，坐公共汽车二十分钟就到，比以前近多了。',
        'Không xa, đi xe buýt hai mươi phút là tới, gần hơn trước nhiều.'
      ),
    ],
    q: '男的怎么去公司？',
    qVi: 'Người nam đến công ty bằng gì?',
    options: ['坐公共汽车', '开车', '走路'],
    why: '"坐公共汽车二十分钟就到": đi xe buýt. 二十分钟 là thời gian, không phải cách đi.',
  },
  {
    id: 'phone-battery',
    level: 'hsk3',
    lines: [
      w('我给你打了好几次电话，你怎么不接？', 'Tôi gọi cho anh mấy lần, sao anh không nghe?'),
      m(
        '对不起，我的手机没电了，我刚回到家才发现。',
        'Xin lỗi, điện thoại tôi hết pin, tôi vừa về đến nhà mới phát hiện.'
      ),
    ],
    q: '男的为什么没接电话？',
    qVi: 'Vì sao người nam không nghe điện thoại?',
    options: ['手机没电了', '他在开会', '他睡觉了'],
    why: '"我的手机没电了": điện thoại hết pin. 才 nhấn mạnh việc phát hiện muộn.',
  },
  {
    id: 'bus-stop',
    level: 'hsk3',
    lines: [
      m('请问，去图书馆坐几路车？', 'Xin hỏi, đến thư viện đi xe tuyến số mấy?'),
      w(
        '你可以坐十二路，不过现在路上车多，走路过去可能更快。',
        'Anh có thể đi tuyến 12, nhưng giờ đường đông xe, đi bộ có lẽ nhanh hơn.'
      ),
    ],
    q: '女的觉得怎么去更快？',
    qVi: 'Người nữ thấy đi cách nào nhanh hơn?',
    options: ['走路', '坐十二路车', '坐出租车'],
    why: 'Sau 不过 là ý chính: "走路过去可能更快". 十二路 chỉ là cách thứ nhất cô ấy nhắc tới.',
  },
  {
    id: 'concert-ticket',
    level: 'hsk3',
    lines: [
      w(
        '这个周末的音乐会你去吗？我多了一张票。',
        'Buổi hoà nhạc cuối tuần này anh có đi không? Tôi thừa một vé.'
      ),
      m(
        '太好了！我一直想去，可是票早就卖完了。',
        'Tốt quá! Tôi luôn muốn đi, nhưng vé bán hết từ lâu rồi.'
      ),
    ],
    q: '男的为什么没有票？',
    qVi: 'Vì sao người nam không có vé?',
    options: ['票卖完了', '票太贵了', '他忘了买'],
    why: '"票早就卖完了": vé đã bán hết từ lâu. 早就 là "từ lâu đã".',
  },
  {
    id: 'weekend-work',
    level: 'hsk3',
    lines: [
      m('你这个星期六还要上班吗？', 'Thứ Bảy này chị vẫn phải đi làm à?'),
      w(
        '本来要去的，但是经理说工作已经做完了，大家可以休息。',
        'Lúc đầu phải đi, nhưng giám đốc nói việc đã làm xong rồi, mọi người được nghỉ.'
      ),
    ],
    q: '女的星期六会做什么？',
    qVi: 'Thứ Bảy người nữ sẽ làm gì?',
    options: ['休息', '上班', '见经理'],
    why: '本来… (lúc đầu) là kế hoạch cũ, sau 但是 là điều thực tế: được nghỉ.',
  },
  {
    id: 'blue-shirt',
    level: 'hsk3',
    lines: [
      w(
        '你觉得我穿这件蓝色的好看，还是那件白色的？',
        'Anh thấy tôi mặc chiếc màu xanh đẹp, hay chiếc màu trắng?'
      ),
      m(
        '蓝色的更好看，而且明天的会议很重要，白色的有点儿太简单了。',
        'Màu xanh đẹp hơn, hơn nữa cuộc họp mai rất quan trọng, màu trắng hơi đơn giản quá.'
      ),
    ],
    q: '男的觉得女的应该穿哪件？',
    qVi: 'Người nam thấy người nữ nên mặc chiếc nào?',
    options: ['蓝色的', '白色的', '黑色的'],
    why: '"蓝色的更好看": màu xanh đẹp hơn, còn màu trắng bị chê đơn giản. 还是 trong câu hỏi lựa chọn là "hay là".',
  },
  {
    id: 'lunch-time',
    level: 'hsk2',
    lines: [
      w('我们几点去吃午饭？', 'Mấy giờ mình đi ăn trưa?'),
      m(
        '十二点吧，我还有一点儿工作没做完。',
        'Mười hai giờ nhé, tôi còn một ít việc chưa làm xong.'
      ),
    ],
    q: '他们几点去吃午饭？',
    qVi: 'Mấy giờ họ đi ăn trưa?',
    options: ['十二点', '十一点', '一点'],
    why: '"十二点吧": mười hai giờ. 吧 ở cuối câu là lời đề nghị.',
  },
  {
    id: 'doctor-visit',
    level: 'hsk2',
    lines: [
      m('你怎么了？要不要去医院？', 'Chị sao thế? Có cần đi bệnh viện không?'),
      w('我只是有点儿累，休息一下就好了。', 'Tôi chỉ hơi mệt thôi, nghỉ một chút là khỏe.'),
    ],
    q: '女的怎么了？',
    qVi: 'Người nữ bị làm sao?',
    options: ['有点儿累', '生病了', '想去医院'],
    why: '"我只是有点儿累": chỉ hơi mệt. 只是 cho thấy không nghiêm trọng: không ốm, không cần đi bệnh viện.',
  },
  {
    id: 'new-phone',
    level: 'hsk2',
    lines: [
      w('你的手机是新的吗？很漂亮。', 'Điện thoại của anh mới à? Đẹp quá.'),
      m(
        '是我哥哥送给我的，他上个月去北京的时候买的。',
        'Anh trai tôi tặng, anh ấy mua tháng trước khi đi Bắc Kinh.'
      ),
    ],
    q: '手机是谁买的？',
    qVi: 'Điện thoại là ai mua?',
    options: ['男的的哥哥', '男的', '女的'],
    why: '"是我哥哥送给我的…他…买的": anh trai mua rồi tặng. Người nam chỉ là người nhận.',
  },
  {
    id: 'rain-bike',
    level: 'hsk2',
    lines: [
      m('下雨了，你今天还骑自行车去学校吗？', 'Trời mưa rồi, hôm nay em vẫn đạp xe đến trường à?'),
      w('不了，我坐公共汽车去。', 'Thôi, em đi xe buýt.'),
    ],
    q: '女的今天怎么去学校？',
    qVi: 'Hôm nay người nữ đến trường bằng gì?',
    options: ['坐公共汽车', '骑自行车', '走路'],
    why: '"不了，我坐公共汽车去": không đạp xe nữa, đi xe buýt. Bẫy: 自行车 nghe thấy trong câu hỏi.',
  },
  {
    id: 'birthday-cake',
    level: 'hsk3',
    lines: [
      w('明天是小李的生日，我们送他什么？', 'Mai là sinh nhật Tiểu Lý, mình tặng cậu ấy gì?'),
      m(
        '他最喜欢吃甜的，我们去买个蛋糕吧，再写几句祝他生日快乐的话。',
        'Cậu ấy thích ăn đồ ngọt nhất, mình đi mua một cái bánh kem đi, viết thêm mấy câu chúc sinh nhật.'
      ),
    ],
    q: '他们打算送小李什么？',
    qVi: 'Họ định tặng Tiểu Lý gì?',
    options: ['蛋糕', '书', '花'],
    why: '"我们去买个蛋糕吧": mua bánh kem, vì cậu ấy thích đồ ngọt.',
  },
  {
    id: 'library-close',
    level: 'hsk3',
    lines: [
      m('现在几点了？我想去还书。', 'Giờ mấy giờ rồi? Tôi muốn đi trả sách.'),
      w(
        '快五点了，可是今天是星期六，下午四点就关门了，你明天再去吧。',
        'Gần năm giờ rồi, nhưng hôm nay thứ Bảy, bốn giờ chiều đã đóng cửa, mai anh hãy đi.'
      ),
    ],
    q: '男的今天为什么不能去还书？',
    qVi: 'Vì sao hôm nay người nam không thể đi trả sách?',
    options: ['已经关门了', '书找不到了', '他太忙了'],
    why: 'Thứ Bảy bốn giờ đã đóng cửa, mà bây giờ gần năm giờ. Bẫy: 五点 là giờ hiện tại, không phải giờ đóng cửa.',
  },
  {
    id: 'move-house',
    level: 'hsk3',
    lines: [
      w('听说你要搬家了？', 'Nghe nói anh sắp chuyển nhà à?'),
      m(
        '对，新家离公司很近，走路只要十分钟，以后不用每天早上坐地铁了。',
        'Đúng, nhà mới gần công ty, đi bộ chỉ mười phút, sau này không phải sáng nào cũng đi tàu điện ngầm nữa.'
      ),
    ],
    q: '男的为什么要搬家？',
    qVi: 'Vì sao người nam chuyển nhà?',
    options: ['离公司近', '房子更大', '地铁站很近'],
    why: '"新家离公司很近": nhà mới gần công ty. Sau này không cần đi tàu điện ngầm nữa, nên "地铁站很近" là bẫy.',
  },
  {
    id: 'cold-weather',
    level: 'hsk3',
    lines: [
      m('外面刮大风，你就穿这么少？', 'Ngoài trời gió to, chị mặc ít thế à?'),
      w(
        '我只是去楼下拿个东西，马上就回来，不会感冒的。',
        'Tôi chỉ xuống dưới lầu lấy đồ, về ngay thôi, không bị cảm đâu.'
      ),
    ],
    q: '女的要去做什么？',
    qVi: 'Người nữ định đi làm gì?',
    options: ['去楼下拿东西', '去看医生', '去公园跑步'],
    why: '"我只是去楼下拿个东西": chỉ xuống lầu lấy đồ. 只是 cho thấy việc nhỏ, nhanh.',
  },
  {
    id: 'exam-result',
    level: 'hsk3',
    lines: [
      w('你的考试成绩出来了吗？', 'Kết quả thi của anh có chưa?'),
      m(
        '出来了，比我想的好，数学考了九十分，只是英语差了一点儿。',
        'Có rồi, tốt hơn tôi nghĩ, toán được chín mươi điểm, chỉ là tiếng Anh kém một chút.'
      ),
    ],
    q: '男的哪门课考得不太好？',
    qVi: 'Môn nào người nam thi không tốt lắm?',
    options: ['英语', '数学', '历史'],
    why: '"只是英语差了一点儿": chỉ có tiếng Anh kém một chút. 只是 ở đây nêu điểm chưa tốt.',
  },
  {
    id: 'teacher-where',
    level: 'hsk2',
    lines: [
      m(
        '王老师下午在哪儿？我想问他一个问题。',
        'Chiều nay thầy Vương ở đâu? Tôi muốn hỏi thầy một câu.'
      ),
      w('他上午在家，下午去学校上课。', 'Buổi sáng thầy ở nhà, buổi chiều đến trường dạy.'),
    ],
    q: '王老师下午在哪儿？',
    qVi: 'Chiều nay thầy Vương ở đâu?',
    options: ['学校', '家里', '医院'],
    why: '"下午去学校上课": chiều đến trường dạy. 在家 là buổi sáng.',
  },
  {
    id: 'fruit-price',
    level: 'hsk2',
    lines: [
      w('这个西瓜多少钱？', 'Quả dưa hấu này bao nhiêu tiền?'),
      m(
        '十块，你买两个的话，我只要十八块。',
        'Mười tệ, nếu chị mua hai quả, tôi chỉ lấy mười tám tệ.'
      ),
    ],
    q: '买两个西瓜要多少钱？',
    qVi: 'Mua hai quả dưa hấu hết bao nhiêu tiền?',
    options: ['十八块', '十块', '二十块'],
    why: '"你买两个的话，我只要十八块": mua hai quả chỉ mười tám tệ. Bẫy: 十块 là giá một quả; 二十块 là phép nhân không có giảm giá.',
  },
  {
    id: 'go-out',
    level: 'hsk2',
    lines: [
      m('晚上我们出去吃饭吧？', 'Tối nay mình ra ngoài ăn nhé?'),
      w(
        '今天太累了，我想在家休息，我们明天去吧。',
        'Hôm nay mệt quá, em muốn ở nhà nghỉ, mai mình đi nhé.'
      ),
    ],
    q: '他们什么时候出去吃饭？',
    qVi: 'Khi nào họ ra ngoài ăn?',
    options: ['明天', '今天晚上', '下个星期'],
    why: '"我们明天去吧": mai đi. Tối nay người nữ muốn ở nhà nghỉ.',
  },
  {
    id: 'learn-chinese',
    level: 'hsk2',
    lines: [
      w('你学汉语多长时间了？', 'Anh học tiếng Trung bao lâu rồi?'),
      m(
        '两年了，我每天晚上都看一个小时的汉语书。',
        'Hai năm rồi, tối nào tôi cũng đọc sách tiếng Trung một tiếng.'
      ),
    ],
    q: '男的学汉语多长时间了？',
    qVi: 'Người nam học tiếng Trung bao lâu rồi?',
    options: ['两年', '一个小时', '一年'],
    why: '"两年了": hai năm rồi. 一个小时 là thời gian đọc sách mỗi tối, không phải thời gian đã học.',
  },
  {
    id: 'meeting-floor',
    level: 'hsk3',
    lines: [
      w('下午的会议还在三楼吗？', 'Cuộc họp chiều nay vẫn ở tầng ba à?'),
      m(
        '不在了，三楼的会议室有人用，我们换到了五楼。',
        'Không còn nữa, phòng họp tầng ba có người dùng, chúng ta đổi lên tầng năm rồi.'
      ),
    ],
    q: '下午的会议在几楼？',
    qVi: 'Cuộc họp chiều nay ở tầng mấy?',
    options: ['五楼', '三楼', '四楼'],
    why: '"我们换到了五楼": đã đổi lên tầng năm. Bẫy: 三楼 là chỗ cũ, người nữ nhắc tới đầu tiên.',
  },
  {
    id: 'subway-late',
    level: 'hsk3',
    lines: [
      m('你怎么才到？我等了你半个小时。', 'Sao giờ chị mới đến? Tôi đợi chị nửa tiếng rồi.'),
      w(
        '对不起，地铁坏了，我只好换了公共汽车。',
        'Xin lỗi, tàu điện ngầm hỏng, tôi đành phải đổi sang xe buýt.'
      ),
    ],
    q: '女的为什么来晚了？',
    qVi: 'Vì sao người nữ đến muộn?',
    options: ['地铁坏了', '她起床晚了', '公共汽车太慢'],
    why: '"地铁坏了，我只好换了公共汽车": tàu điện ngầm hỏng nên đến muộn. Xe buýt là cách cô ấy đi sau đó, không phải lý do.',
  },
  {
    id: 'shoes-price',
    level: 'hsk3',
    lines: [
      w('这双鞋你觉得怎么样？', 'Anh thấy đôi giày này thế nào?'),
      m(
        '颜色不错，但是有点儿贵，我们再去别的商店看看吧。',
        'Màu đẹp, nhưng hơi đắt, chúng ta đi cửa hàng khác xem thêm đi.'
      ),
    ],
    q: '男的觉得这双鞋怎么样？',
    qVi: 'Người nam thấy đôi giày này thế nào?',
    options: ['有点儿贵', '颜色不好', '太小了'],
    why: '"颜色不错，但是有点儿贵": màu đẹp nhưng hơi đắt. Sau 但是 là ý chính.',
  },
  {
    id: 'travel-october',
    level: 'hsk3',
    lines: [
      m('你打算什么时候去旅游？', 'Chị định khi nào đi du lịch?'),
      w(
        '本来想下个月去，但是公司太忙了，只好等到十月了。',
        'Vốn định tháng sau đi, nhưng công ty bận quá, đành đợi đến tháng mười.'
      ),
    ],
    q: '女的什么时候去旅游？',
    qVi: 'Khi nào người nữ đi du lịch?',
    options: ['十月', '下个月', '这个周末'],
    why: '"只好等到十月了": đành đợi đến tháng mười. Bẫy: 下个月 là kế hoạch ban đầu (本来), đã thay đổi.',
  },
  {
    id: 'dog-park',
    level: 'hsk3',
    lines: [
      w('你家的小狗怎么不见了？', 'Con chó nhỏ nhà anh đâu mất rồi?'),
      m('我妈妈带它去公园了，一会儿就回来。', 'Mẹ tôi dắt nó đi công viên rồi, lát nữa sẽ về.'),
    ],
    q: '小狗现在在哪儿？',
    qVi: 'Con chó nhỏ bây giờ ở đâu?',
    options: ['公园', '家里', '医院'],
    why: '"我妈妈带它去公园了": mẹ dắt nó đi công viên. Lát nữa mới về nhà.',
  },
  {
    id: 'dinner-time',
    level: 'hsk2',
    lines: [
      w('我们几点吃晚饭？', 'Mấy giờ chúng ta ăn tối?'),
      m(
        '七点吧，我六点下班，回家要一个小时。',
        'Bảy giờ nhé, sáu giờ anh tan làm, về nhà mất một tiếng.'
      ),
    ],
    q: '他们几点吃晚饭？',
    qVi: 'Mấy giờ họ ăn tối?',
    options: ['七点', '六点', '八点'],
    why: '"七点吧": bảy giờ. Bẫy: 六点 là giờ tan làm, cộng thêm một tiếng về nhà mới là bảy giờ.',
  },
  {
    id: 'buy-milk',
    level: 'hsk2',
    lines: [
      m('你去商店买什么？', 'Em đi cửa hàng mua gì thế?'),
      w('买牛奶和鸡蛋，家里没有了。', 'Mua sữa với trứng, ở nhà hết rồi.'),
    ],
    q: '女的去商店买什么？',
    qVi: 'Người nữ đi cửa hàng mua gì?',
    options: ['牛奶和鸡蛋', '苹果和西瓜', '米饭和茶'],
    why: '"买牛奶和鸡蛋": mua sữa và trứng, vì ở nhà hết rồi.',
  },
  {
    id: 'sister-room',
    level: 'hsk2',
    lines: [
      w('这是谁的房间？', 'Đây là phòng của ai?'),
      m(
        '是我姐姐的，她去北京了，下个月回来。',
        'Của chị gái tôi, chị ấy đi Bắc Kinh rồi, tháng sau mới về.'
      ),
    ],
    q: '姐姐什么时候回来？',
    qVi: 'Khi nào chị gái về?',
    options: ['下个月', '明天', '下个星期'],
    why: '"下个月回来": tháng sau về. Chú ý phân biệt 下个月 (tháng sau) với 下个星期 (tuần sau).',
  },
  {
    id: 'morning-run',
    level: 'hsk2',
    lines: [
      m('你每天早上做什么运动？', 'Sáng nào chị cũng tập môn gì?'),
      w('我去跑步，每天跑四十分钟。', 'Tôi đi chạy bộ, mỗi ngày chạy bốn mươi phút.'),
    ],
    q: '女的每天早上做什么？',
    qVi: 'Sáng nào người nữ cũng làm gì?',
    options: ['跑步', '游泳', '打篮球'],
    why: '"我去跑步": đi chạy bộ. 四十分钟 là thời gian chạy mỗi ngày.',
  },
  {
    id: 'work-late',
    level: 'hsk3',
    lines: [
      w(
        '医生说你要多休息，你怎么还在工作？',
        'Bác sĩ bảo anh phải nghỉ ngơi nhiều, sao anh vẫn còn làm việc?'
      ),
      m(
        '这个报告明天上午就要用，写完我就去睡觉。',
        'Bản báo cáo này sáng mai phải dùng rồi, viết xong tôi đi ngủ ngay.'
      ),
    ],
    q: '男的为什么还在工作？',
    qVi: 'Vì sao người nam vẫn còn làm việc?',
    options: ['报告明天要用', '他不累', '医生让他工作'],
    why: '"这个报告明天上午就要用": sáng mai phải dùng báo cáo. Bác sĩ bảo nghỉ ngơi, không phải bảo làm việc.',
  },
  {
    id: 'umbrella-office',
    level: 'hsk3',
    lines: [
      m('外面阴天了，你带伞了吗？', 'Bên ngoài trời âm u rồi, chị mang ô chưa?'),
      w('带了，可是我把它忘在办公室了。', 'Mang rồi, nhưng tôi để quên nó ở văn phòng.'),
    ],
    q: '女的的伞在哪儿？',
    qVi: 'Ô của người nữ ở đâu?',
    options: ['办公室', '包里', '家里'],
    why: '"我把它忘在办公室了": để quên ở văn phòng. 把 + vật + 忘在 + nơi: để quên vật ở đâu.',
  },
  {
    id: 'restaurant-full',
    level: 'hsk3',
    lines: [
      w('这家饭馆人太多了，要等一个小时。', 'Quán này đông quá, phải đợi một tiếng.'),
      m(
        '那我们去旁边那家吧，那儿的菜也很好吃。',
        'Vậy chúng ta sang quán bên cạnh đi, món ở đó cũng rất ngon.'
      ),
    ],
    q: '他们最后可能去哪儿吃饭？',
    qVi: 'Cuối cùng họ có thể đi ăn ở đâu?',
    options: ['旁边的饭馆', '这家饭馆', '家里'],
    why: '"那我们去旁边那家吧": sang quán bên cạnh, vì quán này phải đợi một tiếng.',
  },
  {
    id: 'movie-sold-out',
    level: 'hsk3',
    lines: [
      m('你买到明天的电影票了吗？', 'Chị mua được vé xem phim ngày mai chưa?'),
      w('没有，都卖完了，我买了后天的。', 'Chưa, bán hết rồi, tôi mua vé ngày kia.'),
    ],
    q: '女的买了哪天的票？',
    qVi: 'Người nữ mua vé ngày nào?',
    options: ['后天', '明天', '今天'],
    why: '"我买了后天的": mua vé ngày kia. Bẫy: 明天 là ngày muốn mua nhưng đã hết vé.',
  },
  {
    id: 'bike-broken',
    level: 'hsk3',
    lines: [
      w('你今天怎么走路来上班？', 'Hôm nay sao anh đi bộ đi làm?'),
      m('我的自行车坏了，明天才能拿回来。', 'Xe đạp của tôi hỏng rồi, mai mới lấy về được.'),
    ],
    q: '男的今天为什么走路来？',
    qVi: 'Vì sao hôm nay người nam đi bộ đến?',
    options: ['自行车坏了', '想锻炼身体', '公共汽车太慢'],
    why: '"我的自行车坏了": xe đạp hỏng. 才 ở đây là phải đến mai mới lấy lại được.',
  },
  {
    id: 'new-clothes',
    level: 'hsk2',
    lines: [
      m('你的新衣服是在哪儿买的？', 'Bộ quần áo mới của chị mua ở đâu thế?'),
      w('在学校旁边的商店，只要一百块。', 'Ở cửa hàng cạnh trường, chỉ có một trăm tệ.'),
    ],
    q: '女的的新衣服多少钱？',
    qVi: 'Quần áo mới của người nữ bao nhiêu tiền?',
    options: ['一百块', '两百块', '五十块'],
    why: '"只要一百块": chỉ một trăm tệ. 只要 nhấn mạnh là rẻ.',
  },
  {
    id: 'wait-bus',
    level: 'hsk2',
    lines: [
      w('你在这儿等谁？', 'Anh đang đợi ai ở đây thế?'),
      m('我在等我妻子，她说五分钟以后到。', 'Tôi đang đợi vợ tôi, cô ấy nói năm phút nữa sẽ đến.'),
    ],
    q: '男的在等谁？',
    qVi: 'Người nam đang đợi ai?',
    options: ['妻子', '妹妹', '朋友'],
    why: '"我在等我妻子": đang đợi vợ. 在 + động từ chỉ việc đang diễn ra.',
  },
  {
    id: 'rain-tomorrow',
    level: 'hsk2',
    lines: [
      w('明天会下雨吗？', 'Ngày mai có mưa không?'),
      m('会，所以我们后天再去买东西吧。', 'Có, nên ngày kia chúng ta hãy đi mua đồ.'),
    ],
    q: '他们什么时候去买东西？',
    qVi: 'Khi nào họ đi mua đồ?',
    options: ['后天', '明天', '今天'],
    why: '"我们后天再去买东西吧": ngày kia mới đi. Bẫy: 明天 là ngày có mưa.',
  },
  {
    id: 'watch-tv',
    level: 'hsk2',
    lines: [
      m('晚上你常常做什么？', 'Buổi tối chị thường làm gì?'),
      w(
        '我喜欢在家看电视，有时候也看书。',
        'Tôi thích ở nhà xem ti vi, thỉnh thoảng cũng đọc sách.'
      ),
    ],
    q: '女的晚上常常做什么？',
    qVi: 'Buổi tối người nữ thường làm gì?',
    options: ['看电视', '去跑步', '学汉语'],
    why: '"我喜欢在家看电视": thích ở nhà xem ti vi. 有时候 (thỉnh thoảng) mới đọc sách.',
  },
]

export interface ShuffledDialogue extends Omit<HskDialogue, 'options'> {
  options: string[]
  /** Index of the right option after shuffling. */
  answer: number
  /** The options are pictures (emoji), and no question is read. */
  pictures?: boolean
}

/**
 * HSK 2 listening, part two: a short dialogue, then pick the picture that goes
 * with it. Each dialogue names exactly one word with a picture (PICTURE_WORDS),
 * so only one picture fits (lib/hskDialogues.test.ts).
 */
export interface PictureDialogue {
  id: string
  /** The word whose picture is the answer. */
  picture: string
  lines: HskDialogue['lines']
}

export const PICTURE_DIALOGUES: readonly PictureDialogue[] = [
  {
    id: 'cat',
    picture: '猫',
    lines: [
      w('你的小猫叫什么名字？', 'Con mèo nhỏ của anh tên là gì?'),
      m('它叫白白，因为它是白色的。', 'Nó tên là Bạch Bạch, vì nó màu trắng.'),
    ],
  },
  {
    id: 'apples',
    picture: '苹果',
    lines: [
      m('这些苹果怎么卖？', 'Những quả táo này bán thế nào?'),
      w('三块一个，都很好吃。', 'Ba tệ một quả, quả nào cũng ngon.'),
    ],
  },
  {
    id: 'taxi-station',
    picture: '出租车',
    lines: [
      w('时间不多了，我们怎么去？', 'Không còn nhiều thời gian, chúng ta đi bằng gì?'),
      m('坐出租车吧，快一点儿。', 'Đi taxi đi, nhanh hơn một chút.'),
    ],
  },
  {
    id: 'phone',
    picture: '手机',
    lines: [
      m('你看见我的手机了吗？', 'Chị có thấy điện thoại của tôi không?'),
      w('在桌子上，你去看看。', 'Ở trên bàn, anh ra xem đi.'),
    ],
  },
  {
    id: 'coffee',
    picture: '咖啡',
    lines: [
      w('你想喝点儿什么？', 'Anh muốn uống gì?'),
      m('我想喝一杯咖啡，谢谢。', 'Tôi muốn uống một cốc cà phê, cảm ơn.'),
    ],
  },
  {
    id: 'hospital',
    picture: '医院',
    lines: [
      m('你怎么了？', 'Chị sao vậy?'),
      w('我身体不好，想去医院看看。', 'Tôi thấy không khoẻ, muốn đi bệnh viện khám.'),
    ],
  },
  {
    id: 'eggs',
    picture: '鸡蛋',
    lines: [
      w('早上你吃了什么？', 'Sáng nay anh ăn gì?'),
      m('我吃了两个鸡蛋。', 'Tôi ăn hai quả trứng.'),
    ],
  },
  {
    id: 'computer',
    picture: '电脑',
    lines: [
      m('你在做什么呢？', 'Chị đang làm gì thế?'),
      w('我在用电脑工作，有很多事。', 'Tôi đang làm việc trên máy tính, nhiều việc lắm.'),
    ],
  },
  {
    id: 'bus',
    picture: '公共汽车',
    lines: [
      w('你每天怎么上班？', 'Hằng ngày anh đi làm bằng gì?'),
      m('我坐公共汽车，二十分钟就到了。', 'Tôi đi xe buýt, hai mươi phút là đến.'),
    ],
  },
  {
    id: 'watermelon',
    picture: '西瓜',
    lines: [
      m('今天太热了，我们吃点儿西瓜吧。', 'Hôm nay nóng quá, chúng ta ăn chút dưa hấu đi.'),
      w('好的，我去买。', 'Được, tôi đi mua.'),
    ],
  },
  {
    id: 'dog',
    picture: '狗',
    lines: [
      w('那只小狗是你的吗？', 'Con chó nhỏ kia là của anh à?'),
      m('是的，它每天都和我一起跑步。', 'Đúng vậy, ngày nào nó cũng chạy bộ cùng tôi.'),
    ],
  },
  {
    id: 'fish',
    picture: '鱼',
    lines: [
      m('晚上你想吃什么？', 'Tối nay chị muốn ăn gì?'),
      w('我们做鱼吧，我昨天买了一条。', 'Mình nấu cá đi, hôm qua tôi mua một con rồi.'),
    ],
  },
  {
    id: 'milk',
    picture: '牛奶',
    lines: [
      w('早上你喝什么？', 'Buổi sáng anh uống gì?'),
      m('我每天早上喝一杯牛奶。', 'Sáng nào tôi cũng uống một cốc sữa.'),
    ],
  },
  {
    id: 'watch',
    picture: '手表',
    lines: [
      m('这块手表是新买的吗？', 'Chiếc đồng hồ này mới mua à?'),
      w('对，是我丈夫上个星期送给我的。', 'Đúng, chồng tôi tặng tôi tuần trước.'),
    ],
  },
  {
    id: 'plane',
    picture: '飞机',
    lines: [
      w('你明天怎么去北京？', 'Mai anh đi Bắc Kinh bằng gì?'),
      m('坐飞机，两个小时就到了。', 'Đi máy bay, hai tiếng là tới.'),
    ],
  },
  {
    id: 'tv',
    picture: '电视',
    lines: [
      m('你晚上常常做什么？', 'Buổi tối chị hay làm gì?'),
      w('吃完饭以后，我喜欢看一会儿电视。', 'Ăn cơm xong, tôi thích xem ti vi một lúc.'),
    ],
  },
  {
    id: 'medicine',
    picture: '药',
    lines: [
      w('你身体怎么样了？', 'Sức khoẻ của anh thế nào rồi?'),
      m('还有点儿累，我每天吃三次药。', 'Vẫn hơi mệt, ngày nào tôi cũng uống thuốc ba lần.'),
    ],
  },
  {
    id: 'newspaper',
    picture: '报纸',
    lines: [
      m('你每天早上做什么？', 'Sáng nào chị cũng làm gì?'),
      w('我吃完早饭以后看一会儿报纸。', 'Ăn sáng xong tôi đọc báo một lúc.'),
    ],
  },
  {
    id: 'noodles',
    picture: '面条',
    lines: [
      w('中午你想吃什么？', 'Trưa nay anh muốn ăn gì?'),
      m('天气这么冷，我们去吃面条吧。', 'Trời lạnh thế này, mình đi ăn mì đi.'),
    ],
  },
  {
    id: 'chair',
    picture: '椅子',
    lines: [
      m('这个房间里怎么没有椅子？我们坐哪儿？', 'Sao phòng này không có ghế? Chúng ta ngồi đâu?'),
      w('旁边的房间里有，我去找两个。', 'Phòng bên cạnh có, tôi đi tìm hai cái.'),
    ],
  },
  {
    id: 'tea',
    picture: '茶',
    lines: [
      w('你想喝什么？', 'Anh muốn uống gì?'),
      m('来一杯热茶吧，今天有点儿冷。', 'Cho một cốc trà nóng nhé, hôm nay hơi lạnh.'),
    ],
  },
  {
    id: 'ticket',
    picture: '票',
    lines: [
      m('明天去北京的票你买好了吗？', 'Vé đi Bắc Kinh ngày mai em mua xong chưa?'),
      w('买好了，是早上八点的。', 'Mua xong rồi, chuyến tám giờ sáng.'),
    ],
  },
  {
    id: 'new-book',
    picture: '书',
    lines: [
      w('你在看什么？', 'Anh đang đọc gì vậy?'),
      m('一本新书，是我朋友写的，很好看。', 'Một quyển sách mới, bạn tôi viết, hay lắm.'),
    ],
  },
  {
    id: 'clothes',
    picture: '衣服',
    lines: [
      m('你今天买什么了？', 'Hôm nay chị mua gì?'),
      w('买了一件衣服，是白色的，不太贵。', 'Mua một bộ quần áo, màu trắng, không đắt lắm.'),
    ],
  },
  {
    id: 'snow-out',
    picture: '雪',
    lines: [
      w('外面下雪了，你看见了吗？', 'Bên ngoài tuyết rơi rồi, anh thấy chưa?'),
      m(
        '看见了，今天太冷了，我们别出去了。',
        'Thấy rồi, hôm nay lạnh quá, chúng ta đừng ra ngoài nữa.'
      ),
    ],
  },
  {
    id: 'bike-work',
    picture: '自行车',
    lines: [
      m('你每天怎么去公司？', 'Hằng ngày chị đến công ty bằng gì?'),
      w('我骑自行车去，二十分钟就到了。', 'Tôi đi xe đạp, hai mươi phút là đến.'),
    ],
  },
  {
    id: 'boat-trip',
    picture: '船',
    lines: [
      w('我们坐什么去那里？', 'Chúng ta đi đến đó bằng gì?'),
      m('坐船去吧，路上很漂亮。', 'Đi thuyền đi, dọc đường rất đẹp.'),
    ],
  },
  {
    id: 'movie-night',
    picture: '电影',
    lines: [
      m('晚上你想做什么？', 'Tối nay chị muốn làm gì?'),
      w('我们去看电影吧，七点开始。', 'Chúng ta đi xem phim đi, bảy giờ bắt đầu.'),
    ],
  },
  {
    id: 'airport-time',
    picture: '机场',
    lines: [
      w('你明天几点去机场？', 'Ngày mai mấy giờ anh ra sân bay?'),
      m('早上七点，我要去北京。', 'Bảy giờ sáng, tôi phải đi Bắc Kinh.'),
    ],
  },
  {
    id: 'rice-lunch',
    picture: '米饭',
    lines: [
      m('中午你想吃什么？', 'Trưa nay chị muốn ăn gì?'),
      w('我想吃米饭和羊肉。', 'Tôi muốn ăn cơm với thịt dê.'),
    ],
  },
  {
    id: 'birthday-treat',
    picture: '生日',
    lines: [
      w('今天是我的生日。', 'Hôm nay là sinh nhật của tôi.'),
      m('生日快乐！晚上我请你吃饭。', 'Chúc mừng sinh nhật! Tối nay tôi mời chị ăn cơm.'),
    ],
  },
  {
    id: 'tired-eyes',
    picture: '眼睛',
    lines: [
      m('你的眼睛怎么了？', 'Mắt chị sao thế?'),
      w('昨天晚上睡得太晚了，有点儿累。', 'Tối qua tôi ngủ muộn quá, hơi mệt.'),
    ],
  },
  {
    id: 'teacher-name',
    picture: '老师',
    lines: [
      w('前面那个人是谁？', 'Người phía trước kia là ai?'),
      m('是我们的汉语老师，她姓王。', 'Là cô giáo tiếng Trung của chúng tôi, cô ấy họ Vương.'),
    ],
  },
  {
    id: 'see-doctor',
    picture: '医生',
    lines: [
      m('你身体怎么样？', 'Sức khỏe của chị thế nào?'),
      w('不太好，下午我要去看医生。', 'Không khỏe lắm, chiều nay tôi phải đi khám bác sĩ.'),
    ],
  },
  {
    id: 'school-near',
    picture: '学校',
    lines: [
      w('你儿子在哪儿上学？', 'Con trai anh học ở đâu?'),
      m('在前面那个学校，走路五分钟就到。', 'Ở ngôi trường phía trước kia, đi bộ năm phút là đến.'),
    ],
  },
  {
    id: 'go-shop',
    picture: '商店',
    lines: [
      m('你去哪儿？', 'Chị đi đâu thế?'),
      w('去商店买点儿东西，你要什么吗？', 'Đi cửa hàng mua ít đồ, anh có cần gì không?'),
    ],
  },
  {
    id: 'have-money',
    picture: '钱',
    lines: [
      w('你身上有钱吗？我想买点儿吃的。', 'Anh có mang tiền không? Tôi muốn mua chút đồ ăn.'),
      m('有，给你一百块。', 'Có, đưa chị một trăm tệ.'),
    ],
  },
  {
    id: 'child-age',
    picture: '孩子',
    lines: [
      m('你的孩子几岁了？', 'Con chị mấy tuổi rồi?'),
      w('她今年六岁，明年上小学。', 'Con bé năm nay sáu tuổi, sang năm vào tiểu học.'),
    ],
  },
]

/**
 * A round of picture dialogues: each answer's picture among five, the others
 * pictures of words the dialogue does not say, from the pack's HSK 1–2 words.
 */
export function pictureDialogueRound(
  words: readonly { word: string; emoji?: string }[],
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
  const emoji = new Map(words.filter((w) => w.emoji).map((w) => [w.word, w.emoji!]))
  const pictured = PICTURE_WORDS.filter((p) => emoji.has(p))
  return shuffle(PICTURE_DIALOGUES)
    .filter((d) => emoji.has(d.picture))
    .slice(0, count)
    .map((d) => {
      const said = d.lines.map((l) => l.zh).join('')
      const others = shuffle(pictured.filter((p) => p !== d.picture && !said.includes(p)))
        .slice(0, 4)
        .map((p) => emoji.get(p)!)
      const options = shuffle([emoji.get(d.picture)!, ...others])
      return {
        id: d.id,
        level: 'hsk2' as const,
        lines: d.lines,
        q: '',
        qVi: '',
        why: '',
        options,
        answer: options.indexOf(emoji.get(d.picture)!),
        pictures: true,
      }
    })
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
