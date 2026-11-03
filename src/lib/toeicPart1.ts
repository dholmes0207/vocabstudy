import type { Part2Question } from './toeicPart2'

// TOEIC Part 1, "Photographs" (docs/design/toeic.md). The app has no photos:
// each scene is a row of emoji with a short description in Vietnamese, and the
// four statements are only heard. What it trains is the ear for the sentences
// Part 1 is made of: "is being loaded", "is leaning against", "are stacked".

export interface Part1Item {
  emoji: string
  /** What the "photo" shows, in Vietnamese. */
  scene: string
  /** The right statement first; rounds shuffle them. */
  statements: [string, string, string, string]
  why: string
}

const item = (
  emoji: string,
  scene: string,
  statements: [string, string, string, string],
  why: string
): Part1Item => ({ emoji, scene, statements, why })

export const PART1_BANK: readonly Part1Item[] = [
  item(
    '👩‍💻⌨️',
    'Một người phụ nữ đang gõ bàn phím máy tính.',
    [
      'She’s typing on a keyboard.',
      'She’s pouring some coffee.',
      'She’s opening a window.',
      'She’s hanging up her coat.',
    ],
    'typing on a keyboard = gõ bàn phím. Các câu kia đều là hành động không có trong tranh.'
  ),
  item(
    '📦📦🚚',
    'Mấy thùng hàng đang được chất lên xe tải.',
    [
      'Some boxes are being loaded onto a truck.',
      'A truck is parked in a garage.',
      'Some boxes are being opened.',
      'A man is driving a truck.',
    ],
    'is/are being + V3 là việc đang được làm: are being loaded (đang được chất lên). "being opened" đúng đồ vật nhưng sai hành động.'
  ),
  item(
    '🧑‍🍳🍳',
    'Một đầu bếp đang nấu ăn bằng chảo.',
    [
      'A chef is cooking in a pan.',
      'A chef is washing the dishes.',
      'A waiter is taking an order.',
      'Some plates are on a shelf.',
    ],
    'cooking in a pan = nấu bằng chảo. Câu về người phục vụ và kệ đĩa nói đến thứ không có trong tranh.'
  ),
  item(
    '👥🪑🗣️',
    'Một nhóm người đang ngồi họp quanh bàn.',
    [
      'Some people are sitting around a table.',
      'Some people are standing in line.',
      'A table is being moved.',
      'The chairs are stacked in a corner.',
    ],
    'sitting around a table = ngồi quanh bàn. "stacked" (xếp chồng) sai vì ghế đang có người ngồi.'
  ),
  item(
    '🚲🧱',
    'Một chiếc xe đạp đang dựa vào bức tường, không có ai.',
    [
      'A bicycle is leaning against a wall.',
      'A man is riding a bicycle.',
      'A wall is being painted.',
      'Some bicycles are for sale.',
    ],
    'leaning against = dựa vào. Tranh không có người nên mọi câu có người làm gì đó đều sai.'
  ),
  item(
    '🧑‍🔧🔧🚗',
    'Một người thợ đang sửa ô tô.',
    [
      'A mechanic is repairing a car.',
      'A car is being washed.',
      'A man is buying a car.',
      'Some tires are piled up.',
    ],
    'repairing = sửa chữa. "being washed" đúng chiếc xe nhưng sai việc đang làm.'
  ),
  item(
    '📚📚🗄️',
    'Sách được xếp chồng trên bàn làm việc.',
    [
      'Some books are stacked on a desk.',
      'A woman is reading a book.',
      'Some books are being put in a box.',
      'A shelf is empty.',
    ],
    'are stacked = được xếp chồng (trạng thái). "are being put in a box" là đang có người làm, tranh không có.'
  ),
  item(
    '🧑‍🌾🪴💧',
    'Một người đàn ông đang tưới cây.',
    [
      'A man is watering some plants.',
      'A man is cutting down a tree.',
      'Some flowers are being sold.',
      'A garden is covered in snow.',
    ],
    'watering = tưới nước. Các câu kia có từ liên quan đến cây nhưng sai hành động hoặc cảnh.'
  ),
  item(
    '🧳🧍🧍🛫',
    'Hành khách đang xếp hàng ở quầy làm thủ tục sân bay.',
    [
      'Passengers are waiting in line at a counter.',
      'A plane is taking off.',
      'A suitcase is being opened.',
      'Passengers are getting on a bus.',
    ],
    'waiting in line = xếp hàng chờ. Máy bay cất cánh không có trong cảnh quầy thủ tục.'
  ),
  item(
    '👩‍🏫📊🖥️',
    'Một người phụ nữ đang chỉ vào biểu đồ trên màn hình.',
    [
      'A woman is pointing at a chart.',
      'A woman is turning off a projector.',
      'A chart is being printed.',
      'A woman is writing on a notepad.',
    ],
    'pointing at = chỉ vào. "turning off a projector" đúng thiết bị nhưng sai hành động.'
  ),
  item(
    '🧹🧼🏢',
    'Một người đang lau sàn hành lang.',
    [
      'Someone is mopping the floor.',
      'Someone is climbing the stairs.',
      'The floor is being painted.',
      'A rug is being rolled up.',
    ],
    'mopping the floor = lau sàn. "being painted" đúng sàn nhà nhưng sai hành động.'
  ),
  item(
    '🧑🛒🍎',
    'Một người đàn ông đang chọn táo ở quầy hoa quả.',
    [
      'A man is choosing some fruit.',
      'A man is pushing a cart out of the store.',
      'Some fruit is being weighed.',
      'The fruit stand is closed.',
    ],
    'choosing some fruit = đang chọn hoa quả. Quầy đang có người mua nên không thể "closed".'
  ),
]

/** Items in one round, as many as Part 1 has on the test. */
export const PART1_ROUND = 6

export interface Part1Question extends Part2Question {
  emoji: string
  scene: string
}

/** A round: the scene in place of a question, four statements heard as (A)–(D). */
export function part1Round(rand: () => number = Math.random): Part1Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(PART1_BANK)
    .slice(0, PART1_ROUND)
    .map((it) => {
      const options = shuffle(it.statements)
      return {
        prompt: '',
        responses: [it.statements[0], it.statements[1], it.statements[2]],
        options,
        answer: options.indexOf(it.statements[0]),
        why: it.why,
        emoji: it.emoji,
        scene: it.scene,
      }
    })
}
