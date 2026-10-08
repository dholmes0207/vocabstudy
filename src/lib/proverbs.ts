// One English saying a day under the greeting: a little encouragement, and a
// real phrase to learn, paired with the Vietnamese saying that means the same.

export interface Proverb {
  en: string
  vi: string
}

export const PROVERBS: readonly Proverb[] = [
  { en: 'Practice makes perfect.', vi: 'Có công mài sắt, có ngày nên kim.' },
  { en: 'Little by little, one travels far.', vi: 'Kiến tha lâu cũng đầy tổ.' },
  { en: 'Slow and steady wins the race.', vi: 'Chậm mà chắc.' },
  { en: 'Every expert was once a beginner.', vi: 'Chuyên gia nào cũng từng là người mới bắt đầu.' },
  { en: 'Rome was not built in a day.', vi: 'Thành Rome không xây xong trong một ngày.' },
  { en: 'Where there is a will, there is a way.', vi: 'Có chí thì nên.' },
  { en: 'Better late than never.', vi: 'Muộn còn hơn không.' },
  { en: 'Mistakes are proof that you are trying.', vi: 'Sai là bằng chứng bạn đang cố gắng.' },
  { en: "Don't give up.", vi: 'Đừng bỏ cuộc.' },
  { en: 'Small steps every day.', vi: 'Mỗi ngày một bước nhỏ.' },
  { en: 'Learning never exhausts the mind.', vi: 'Học không bao giờ làm trí óc cạn kiệt.' },
  { en: 'Knowledge is power.', vi: 'Tri thức là sức mạnh.' },
  { en: 'Actions speak louder than words.', vi: 'Làm hơn nói.' },
  { en: 'The early bird catches the worm.', vi: 'Trâu chậm uống nước đục.' },
  { en: 'Failure is the mother of success.', vi: 'Thất bại là mẹ thành công.' },
  {
    en: 'A journey of a thousand miles begins with a single step.',
    vi: 'Đường dài ngàn dặm bắt đầu từ một bước chân.',
  },
  {
    en: 'Believe you can and you are halfway there.',
    vi: 'Tin mình làm được là đã đi được nửa đường.',
  },
  { en: 'Today a reader, tomorrow a leader.', vi: 'Hôm nay đọc sách, mai thành người dẫn đầu.' },
  { en: 'No pain, no gain.', vi: 'Không có gì dễ dàng mà có được.' },
  {
    en: 'It always seems impossible until it is done.',
    vi: 'Mọi thứ đều có vẻ bất khả thi cho đến khi làm xong.',
  },
  { en: 'You learn something new every day.', vi: 'Mỗi ngày học thêm một điều mới.' },
  { en: 'One word at a time.', vi: 'Từng từ một thôi.' },
  { en: 'Keep calm and carry on.', vi: 'Bình tĩnh và tiếp tục.' },
  { en: 'Done is better than perfect.', vi: 'Làm xong còn hơn làm hoàn hảo.' },
  { en: 'The best time to start is now.', vi: 'Thời điểm tốt nhất để bắt đầu là bây giờ.' },
  { en: 'Dream big, start small.', vi: 'Mơ lớn, bắt đầu từ việc nhỏ.' },
  { en: 'Every day is a fresh start.', vi: 'Mỗi ngày là một khởi đầu mới.' },
  { en: 'Progress, not perfection.', vi: 'Tiến bộ, không cần hoàn hảo.' },
  { en: 'Be proud of how far you have come.', vi: 'Hãy tự hào vì bạn đã đi được xa như vậy.' },
  { en: 'The more you learn, the more you grow.', vi: 'Càng học, càng lớn.' },
]

/** The saying for a given epoch day — the same all day, a new one tomorrow. */
export function proverbOfDay(day: number): Proverb {
  const i = ((day % PROVERBS.length) + PROVERBS.length) % PROVERBS.length
  return PROVERBS[i]
}
