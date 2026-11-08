// "Thành ngữ tiếng Anh" (docs/design/english-idioms.md): everyday English
// idioms that make speech sound natural (IELTS Speaking rewards them), each
// with what the words literally say, what it really means, and the
// Vietnamese saying that matches when there is one. The practice asks what
// one means, or which word is missing. Pure; data inline like lib/chengyu.ts.

export type Pair = [vi: string, en: string]

export interface Idiom {
  phrase: string
  /** The word hidden in "which word is missing?" (appears once in the phrase). */
  key: string
  /** What the words say, word for word, in Vietnamese. */
  literal: string
  meaning: Pair
  example: { en: string; vi: string }
}

const i = (
  phrase: string,
  key: string,
  literal: string,
  meaning: Pair,
  example: [en: string, vi: string]
): Idiom => ({ phrase, key, literal, meaning, example: { en: example[0], vi: example[1] } })

export const IDIOMS: Idiom[] = [
  i(
    'a piece of cake',
    'cake',
    'một miếng bánh',
    ['dễ như ăn kẹo', 'very easy'],
    ['The listening test was a piece of cake.', 'Bài nghe dễ như ăn kẹo.']
  ),
  i(
    'break the ice',
    'ice',
    'phá lớp băng',
    ['phá tan không khí ngại ngùng', 'make people feel relaxed at first'],
    ['He told a funny story to break the ice.', 'Anh ấy kể một chuyện vui để mọi người bớt ngại.']
  ),
  i(
    'under the weather',
    'weather',
    'ở dưới thời tiết',
    ['hơi mệt, khó ở', 'a little ill'],
    ['I’m feeling a bit under the weather today.', 'Hôm nay tôi thấy hơi khó ở.']
  ),
  i(
    'hit the books',
    'books',
    'đánh vào sách',
    ['vùi đầu vào học', 'study hard'],
    [
      'I can’t come out tonight — I have to hit the books.',
      'Tối nay tôi không đi được, phải vùi đầu học bài.',
    ]
  ),
  i(
    'cost an arm and a leg',
    'leg',
    'tốn một cánh tay và một cái chân',
    ['đắt cắt cổ', 'be very expensive'],
    ['That new phone costs an arm and a leg.', 'Cái điện thoại mới đó đắt cắt cổ.']
  ),
  i(
    'once in a blue moon',
    'moon',
    'mỗi lần trăng xanh',
    ['năm thì mười hoạ', 'very rarely'],
    ['I only eat fast food once in a blue moon.', 'Năm thì mười hoạ tôi mới ăn đồ ăn nhanh.']
  ),
  i(
    'call it a day',
    'day',
    'gọi nó là một ngày',
    ['nghỉ tay, hôm nay tới đây thôi', 'stop working for today'],
    ['We’ve done enough. Let’s call it a day.', 'Làm thế đủ rồi, hôm nay nghỉ ở đây thôi.']
  ),
  i(
    'let the cat out of the bag',
    'cat',
    'thả con mèo ra khỏi túi',
    ['lỡ để lộ bí mật', 'tell a secret by mistake'],
    [
      'Who let the cat out of the bag about the surprise party?',
      'Ai làm lộ chuyện bữa tiệc bất ngờ thế?',
    ]
  ),
  i(
    'the ball is in your court',
    'court',
    'quả bóng đang ở phần sân của bạn',
    ['tới lượt bạn quyết định', 'it’s your turn to decide'],
    [
      'I’ve made my offer — now the ball is in your court.',
      'Tôi đưa ra đề nghị rồi, giờ tới lượt bạn quyết định.',
    ]
  ),
  i(
    'hit the nail on the head',
    'nail',
    'đóng trúng đầu đinh',
    ['nói trúng phóc', 'describe exactly what is right'],
    [
      'You hit the nail on the head — that’s exactly the problem.',
      'Bạn nói trúng phóc, vấn đề chính là ở đó.',
    ]
  ),
  i(
    'in hot water',
    'hot',
    'ở trong nước nóng',
    ['gặp rắc rối', 'in trouble'],
    ['He’s in hot water for being late again.', 'Anh ta lại gặp rắc rối vì đi muộn.']
  ),
  i(
    'on cloud nine',
    'nine',
    'ở trên tầng mây thứ chín',
    ['sướng như lên tiên', 'extremely happy'],
    ['She was on cloud nine after getting band 7.', 'Cô ấy sướng như lên tiên khi được band 7.']
  ),
  i(
    'a blessing in disguise',
    'disguise',
    'phước lành đội lốt',
    ['trong cái rủi có cái may', 'a bad thing that turns out good'],
    [
      'Missing that bus was a blessing in disguise — I met my best friend at the stop.',
      'Lỡ chuyến xe hoá ra lại may, tôi gặp bạn thân ở bến.',
    ]
  ),
  i(
    'kill two birds with one stone',
    'birds',
    'một hòn đá giết hai con chim',
    ['một công đôi việc', 'do two things at once'],
    [
      'Cycling to work kills two birds with one stone: it’s cheap and healthy.',
      'Đạp xe đi làm là một công đôi việc: vừa rẻ vừa khoẻ.',
    ]
  ),
  i(
    'when pigs fly',
    'pigs',
    'khi lợn biết bay',
    ['còn lâu, chẳng bao giờ', 'never'],
    ['He’ll tidy his room when pigs fly!', 'Còn lâu cậu ấy mới dọn phòng!']
  ),
  i(
    'get cold feet',
    'feet',
    'bị lạnh chân',
    ['chùn bước vào phút chót', 'become too nervous to do something'],
    ['I almost got cold feet before my speaking test.', 'Suýt nữa tôi chùn bước trước giờ thi nói.']
  ),
  i(
    'see eye to eye',
    'see',
    'nhìn mắt đối mắt',
    ['đồng quan điểm', 'agree'],
    [
      'My brother and I don’t always see eye to eye.',
      'Anh trai và tôi không phải lúc nào cũng cùng ý.',
    ]
  ),
  i(
    'burn the midnight oil',
    'oil',
    'đốt dầu lúc nửa đêm',
    ['thức khuya học, làm', 'work or study late at night'],
    ['I had to burn the midnight oil before the exam.', 'Trước kỳ thi tôi phải thức khuya ôn bài.']
  ),
  i(
    'a storm in a teacup',
    'teacup',
    'cơn bão trong tách trà',
    ['chuyện bé xé ra to', 'a fuss about something small'],
    [
      'Don’t worry about their argument — it’s a storm in a teacup.',
      'Đừng lo chuyện họ cãi nhau, chỉ là chuyện bé xé ra to.',
    ]
  ),
  i(
    'actions speak louder than words',
    'louder',
    'hành động nói to hơn lời nói',
    ['nói ít làm nhiều, việc làm hơn lời nói', 'what you do matters more than what you say'],
    [
      'Don’t just promise to help — actions speak louder than words.',
      'Đừng chỉ hứa giúp, việc làm mới quan trọng hơn lời nói.',
    ]
  ),
]

export const GAP = '＿'

/** The idiom with its key word hidden. */
export const withGap = (it: Idiom): string =>
  it.phrase
    .split(' ')
    .map((w) => (w === it.key ? GAP : w))
    .join(' ')

export type IdiomQuestion =
  | { kind: 'meaning'; item: Idiom; options: Pair[]; answer: number }
  | { kind: 'missing'; item: Idiom; options: string[]; answer: number }

/**
 * A round of `size` questions on different idioms, alternating "what does it
 * mean?" and "which word is missing?", wrong options from other idioms.
 */
export function idiomRound(
  size = 10,
  rand: () => number = Math.random,
  pool: readonly Idiom[] = IDIOMS
): IdiomQuestion[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let j = a.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1))
      ;[a[j], a[k]] = [a[k], a[j]]
    }
    return a
  }
  return shuffle(pool)
    .slice(0, size)
    .map((item, n): IdiomQuestion => {
      const others = shuffle(pool.filter((o) => o.phrase !== item.phrase)).slice(0, 3)
      if (n % 2 === 0) {
        const options = shuffle([item.meaning, ...others.map((o) => o.meaning)])
        return { kind: 'meaning', item, options, answer: options.indexOf(item.meaning) }
      }
      const options = shuffle([item.key, ...others.map((o) => o.key)])
      return { kind: 'missing', item, options, answer: options.indexOf(item.key) }
    })
}

/** XP for a round, as for the Chinese idioms. */
export const idiomXp = (correct: number, total: number): number =>
  5 + correct * 2 + (correct === total && total > 0 ? 5 : 0)
