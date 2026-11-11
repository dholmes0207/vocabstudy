import type { ConfusableGroup, ConfusableSentence } from './confusables'

// English words a Vietnamese learner mixes up because one Vietnamese word
// covers both: "làm" is make and do, "mượn" is borrow and lend, "nói" is say
// and tell. Same shape as the Chinese groups in lib/confusables.ts; the
// sentences use the base form so the gap takes the word exactly as listed.

const s = (text: string, answer: string, vi: string): ConfusableSentence => ({
  text,
  answer,
  vi,
})

export const EN_CONFUSABLES: ConfusableGroup[] = [
  {
    id: 'make-do',
    emoji: '🛠️',
    chars: [
      { ch: 'make', vi: 'làm ra, tạo ra' },
      { ch: 'do', vi: 'làm (việc, nhiệm vụ)' },
    ],
    rule: [
      'make: tạo ra thứ trước đó chưa có (make a cake, make a mistake, make friends). do: làm một việc, một nhiệm vụ (do homework, do the dishes, do your best).',
      'make: create something that wasn’t there (make a cake, make a mistake, make friends). do: carry out a task (do homework, do the dishes, do your best).',
    ],
    sentences: [
      s('Can you help me ＿ my homework?', 'do', 'Bạn giúp tôi làm bài tập được không?'),
      s(
        'I’m going to ＿ a cake for her birthday.',
        'make',
        'Tôi sẽ làm một cái bánh cho sinh nhật cô ấy.'
      ),
      s('Don’t worry — everyone can ＿ a mistake.', 'make', 'Đừng lo, ai cũng có thể mắc lỗi.'),
      s('Let’s ＿ the dishes together after dinner.', 'do', 'Ăn tối xong mình cùng rửa bát nhé.'),
      s('It’s easy to ＿ friends at university.', 'make', 'Ở đại học kết bạn dễ lắm.'),
      s('Just try to ＿ your best in the exam.', 'do', 'Cứ cố hết sức trong bài thi là được.'),
    ],
  },
  {
    id: 'say-tell',
    emoji: '💬',
    chars: [
      { ch: 'say', vi: 'nói (ra lời gì)' },
      { ch: 'tell', vi: 'nói với ai, kể' },
    ],
    rule: [
      'tell đi với người nghe ngay sau (tell me, tell her) và trong tell a story, tell the truth. say đi với lời được nói (say hello, say something).',
      'tell takes the listener straight after (tell me, tell her), and goes in tell a story, tell the truth. say takes the words (say hello, say something).',
    ],
    sentences: [
      s(
        'Can you ＿ me the way to the station?',
        'tell',
        'Bạn chỉ giúp tôi đường ra ga được không?'
      ),
      s('What did she ＿ about the trip?', 'say', 'Cô ấy nói gì về chuyến đi?'),
      s('You should always ＿ the truth.', 'tell', 'Bạn nên luôn nói thật.'),
      s('How do you ＿ “thank you” in Chinese?', 'say', '“Cảm ơn” tiếng Trung nói thế nào?'),
      s('My grandmother loves to ＿ stories.', 'tell', 'Bà tôi rất thích kể chuyện.'),
    ],
  },
  {
    id: 'borrow-lend',
    emoji: '🤝',
    chars: [
      { ch: 'borrow', vi: 'mượn (về mình)' },
      { ch: 'lend', vi: 'cho mượn' },
    ],
    rule: [
      'Tiếng Việt chỉ có "mượn", tiếng Anh tách hai chiều: borrow là mình lấy về (borrow from), lend là mình đưa đi (lend to).',
      'Vietnamese says "mượn" both ways; English splits them: borrow is taking (borrow from), lend is giving (lend to).',
    ],
    sentences: [
      s('Can I ＿ your pen for a minute?', 'borrow', 'Tôi mượn bút bạn một lát được không?'),
      s(
        'Could you ＿ me some money until Friday?',
        'lend',
        'Bạn cho tôi mượn ít tiền tới thứ Sáu được không?'
      ),
      s(
        'You can ＿ books from the library for two weeks.',
        'borrow',
        'Bạn có thể mượn sách thư viện trong hai tuần.'
      ),
      s('It’s raining — I’ll ＿ you my umbrella.', 'lend', 'Trời mưa đấy, tôi cho bạn mượn ô.'),
    ],
  },
  {
    id: 'bring-take',
    emoji: '🎒',
    chars: [
      { ch: 'bring', vi: 'mang tới (chỗ người nói)' },
      { ch: 'take', vi: 'mang đi (chỗ khác)' },
    ],
    rule: [
      'bring: mang về phía người nói ("lại đây"). take: mang ra khỏi chỗ này, tới nơi khác ("đi đi").',
      'bring: towards the speaker ("over here"). take: away from here, to somewhere else ("over there").',
    ],
    sentences: [
      s('Don’t forget to ＿ an umbrella when you go out.', 'take', 'Ra ngoài nhớ mang ô theo.'),
      s(
        'Can you ＿ me a glass of water, please?',
        'bring',
        'Bạn mang cho tôi cốc nước được không?'
      ),
      s(
        'Please ＿ your passport when you come to our office.',
        'bring',
        'Khi tới văn phòng chúng tôi, vui lòng mang theo hộ chiếu.'
      ),
      s(
        'I’ll ＿ the children to school this morning.',
        'take',
        'Sáng nay tôi sẽ đưa bọn trẻ đi học.'
      ),
    ],
  },
  {
    id: 'lose-miss',
    emoji: '🚌',
    chars: [
      { ch: 'lose', vi: 'làm mất; thua' },
      { ch: 'miss', vi: 'lỡ, nhỡ; nhớ (ai)' },
    ],
    rule: [
      'lose: làm mất đồ, hoặc thua trận. miss: lỡ (xe, chuyến bay, buổi học) hoặc nhớ ai đó.',
      'lose: no longer have something, or be beaten. miss: be too late for (a bus, a class), or long for someone.',
    ],
    sentences: [
      s('Hurry up or we’ll ＿ the bus!', 'miss', 'Nhanh lên kẻo lỡ xe buýt!'),
      s('Keep your ticket safe — don’t ＿ it.', 'lose', 'Giữ vé cẩn thận, đừng làm mất.'),
      s('I really ＿ my family when I’m abroad.', 'miss', 'Khi ở nước ngoài tôi rất nhớ gia đình.'),
      s(
        'If we ＿ this match, we’re out of the cup.',
        'lose',
        'Nếu thua trận này, chúng ta bị loại khỏi cúp.'
      ),
    ],
  },
  {
    id: 'bored-boring',
    emoji: '🥱',
    chars: [
      { ch: 'bored', vi: '(ai đó) thấy chán' },
      { ch: 'boring', vi: '(cái gì) gây chán' },
    ],
    rule: [
      '-ed là cảm giác của người (I’m bored = tôi thấy chán). -ing là cái gây ra cảm giác đó (the film is boring = phim chán). Tương tự interested / interesting, tired / tiring.',
      '-ed is how a person feels (I’m bored). -ing is what causes it (the film is boring). The same goes for interested / interesting, tired / tiring.',
    ],
    sentences: [
      s('This film is so ＿ that I fell asleep.', 'boring', 'Phim này chán tới mức tôi ngủ gật.'),
      s(
        'I’m ＿ — let’s go out and do something.',
        'bored',
        'Tôi chán quá, mình ra ngoài làm gì đi.'
      ),
      s('The lesson was long and ＿.', 'boring', 'Buổi học dài và chán.'),
      s(
        'The children got ＿ waiting in the car.',
        'bored',
        'Bọn trẻ ngồi đợi trong xe tới phát chán.'
      ),
    ],
  },
  {
    id: 'hear-listen',
    emoji: '👂',
    chars: [
      { ch: 'hear', vi: 'nghe thấy' },
      { ch: 'listen', vi: 'lắng nghe' },
    ],
    rule: [
      'hear: âm thanh tự lọt vào tai, không cần cố (hear a noise). listen (to): chủ động chú ý nghe (listen to music, listen to me).',
      'hear: sound reaches you without trying (hear a noise). listen (to): pay attention on purpose (listen to music, listen to me).',
    ],
    sentences: [
      s('I like to ＿ to music on the bus.', 'listen', 'Tôi thích nghe nhạc trên xe buýt.'),
      s('Can you ＿ me at the back of the room?', 'hear', 'Cuối phòng có nghe thấy tôi không?'),
      s(
        'Did you ＿ that strange noise outside?',
        'hear',
        'Bạn có nghe thấy tiếng động lạ bên ngoài không?'
      ),
      s('Please ＿ carefully to the instructions.', 'listen', 'Vui lòng lắng nghe kỹ hướng dẫn.'),
    ],
  },
  {
    id: 'fun-funny',
    emoji: '🎉',
    chars: [
      { ch: 'fun', vi: 'vui, thú vị' },
      { ch: 'funny', vi: 'buồn cười' },
    ],
    rule: [
      'fun: vui, làm thì thích (a fun party, have fun). funny: buồn cười, làm người ta cười (a funny joke).',
      'fun: enjoyable (a fun party, have fun). funny: makes you laugh (a funny joke).',
    ],
    sentences: [
      s('We had a lot of ＿ at the beach.', 'fun', 'Chúng tôi chơi ở biển rất vui.'),
      s(
        'He told a ＿ joke and everyone laughed.',
        'funny',
        'Anh ấy kể một câu chuyện cười và ai cũng cười.'
      ),
      s('Why are you laughing? What’s so ＿?', 'funny', 'Sao bạn cười? Có gì buồn cười thế?'),
      s(
        'The party was really ＿ — we danced all night.',
        'fun',
        'Bữa tiệc vui lắm, chúng tôi nhảy suốt đêm.'
      ),
    ],
  },
]
