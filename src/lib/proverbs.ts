// One saying a day under the greeting, in the language being learned: a little
// encouragement, and a real phrase to learn, paired with the Vietnamese saying
// that means the same.

export interface Proverb {
  /** The saying in the language being learned. */
  text: string
  vi: string
}

export const PROVERBS: readonly Proverb[] = [
  { text: 'Practice makes perfect.', vi: 'Có công mài sắt, có ngày nên kim.' },
  { text: 'Little by little, one travels far.', vi: 'Kiến tha lâu cũng đầy tổ.' },
  { text: 'Slow and steady wins the race.', vi: 'Chậm mà chắc.' },
  {
    text: 'Every expert was once a beginner.',
    vi: 'Chuyên gia nào cũng từng là người mới bắt đầu.',
  },
  { text: 'Rome was not built in a day.', vi: 'Thành Rome không xây xong trong một ngày.' },
  { text: 'Where there is a will, there is a way.', vi: 'Có chí thì nên.' },
  { text: 'Better late than never.', vi: 'Muộn còn hơn không.' },
  { text: 'Mistakes are proof that you are trying.', vi: 'Sai là bằng chứng bạn đang cố gắng.' },
  { text: "Don't give up.", vi: 'Đừng bỏ cuộc.' },
  { text: 'Small steps every day.', vi: 'Mỗi ngày một bước nhỏ.' },
  { text: 'Learning never exhausts the mind.', vi: 'Học không bao giờ làm trí óc cạn kiệt.' },
  { text: 'Knowledge is power.', vi: 'Tri thức là sức mạnh.' },
  { text: 'Actions speak louder than words.', vi: 'Làm hơn nói.' },
  { text: 'The early bird catches the worm.', vi: 'Trâu chậm uống nước đục.' },
  { text: 'Failure is the mother of success.', vi: 'Thất bại là mẹ thành công.' },
  {
    text: 'A journey of a thousand miles begins with a single step.',
    vi: 'Đường dài ngàn dặm bắt đầu từ một bước chân.',
  },
  {
    text: 'Believe you can and you are halfway there.',
    vi: 'Tin mình làm được là đã đi được nửa đường.',
  },
  { text: 'Today a reader, tomorrow a leader.', vi: 'Hôm nay đọc sách, mai thành người dẫn đầu.' },
  { text: 'No pain, no gain.', vi: 'Không có gì dễ dàng mà có được.' },
  {
    text: 'It always seems impossible until it is done.',
    vi: 'Mọi thứ đều có vẻ bất khả thi cho đến khi làm xong.',
  },
  { text: 'You learn something new every day.', vi: 'Mỗi ngày học thêm một điều mới.' },
  { text: 'One word at a time.', vi: 'Từng từ một thôi.' },
  { text: 'Keep calm and carry on.', vi: 'Bình tĩnh và tiếp tục.' },
  { text: 'Done is better than perfect.', vi: 'Làm xong còn hơn làm hoàn hảo.' },
  { text: 'The best time to start is now.', vi: 'Thời điểm tốt nhất để bắt đầu là bây giờ.' },
  { text: 'Dream big, start small.', vi: 'Mơ lớn, bắt đầu từ việc nhỏ.' },
  { text: 'Every day is a fresh start.', vi: 'Mỗi ngày là một khởi đầu mới.' },
  { text: 'Progress, not perfection.', vi: 'Tiến bộ, không cần hoàn hảo.' },
  { text: 'Be proud of how far you have come.', vi: 'Hãy tự hào vì bạn đã đi được xa như vậy.' },
  { text: 'The more you learn, the more you grow.', vi: 'Càng học, càng lớn.' },
]

// Korean and Chinese: well-known sayings with a close Vietnamese match.
const PROVERBS_KO: readonly Proverb[] = [
  { text: '천 리 길도 한 걸음부터', vi: 'Đường ngàn dặm cũng bắt đầu từ một bước chân.' },
  { text: '시작이 반이다', vi: 'Bắt đầu là đã xong một nửa.' },
  { text: '티끌 모아 태산', vi: 'Tích tiểu thành đại.' },
  { text: '낙숫물이 댓돌을 뚫는다', vi: 'Nước chảy đá mòn.' },
  { text: '배움에는 끝이 없다', vi: 'Học, học nữa, học mãi.' },
  { text: '고생 끝에 낙이 온다', vi: 'Khổ trước sướng sau.' },
  { text: '실패는 성공의 어머니', vi: 'Thất bại là mẹ thành công.' },
  { text: '하늘은 스스로 돕는 자를 돕는다', vi: 'Trời giúp người tự giúp mình.' },
]

const PROVERBS_ZH: readonly Proverb[] = [
  { text: '千里之行，始于足下', vi: 'Hành trình ngàn dặm bắt đầu từ một bước chân.' },
  { text: '熟能生巧', vi: 'Quen tay hay việc.' },
  { text: '失败是成功之母', vi: 'Thất bại là mẹ thành công.' },
  { text: '活到老，学到老', vi: 'Học, học nữa, học mãi.' },
  { text: '有志者事竟成', vi: 'Có chí thì nên.' },
  { text: '一分耕耘，一分收获', vi: 'Gieo bao nhiêu, gặt bấy nhiêu.' },
  { text: '好好学习，天天向上', vi: 'Chăm chỉ học tập, mỗi ngày tiến bộ.' },
  { text: '学而时习之', vi: 'Học rồi thường xuyên ôn lại.' },
]

const BY_LANG: Readonly<Record<string, readonly Proverb[]>> = {
  en: PROVERBS,
  ko: PROVERBS_KO,
  zh: PROVERBS_ZH,
}

/**
 * The saying for a given epoch day in the language being learned — the same
 * all day, a new one tomorrow. Null for a language with no sayings yet.
 */
export function proverbOfDay(day: number, code = 'en'): Proverb | null {
  const list = BY_LANG[code]
  if (!list?.length) return null
  const i = ((day % list.length) + list.length) % list.length
  return list[i]
}
