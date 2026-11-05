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

  // More scenes (04/11/2026).
  item(
    '🧑‍💼📞🗂️',
    'Một người đàn ông đang nói điện thoại ở bàn làm việc.',
    [
      'A man is talking on the phone.',
      'A man is filing some papers.',
      'A man is leaving the office.',
      'A phone is being repaired.',
    ],
    'talking on the phone = đang nói điện thoại. "filing some papers" có đồ vật trong tranh nhưng sai hành động.'
  ),
  item(
    '🪟🧽🏢',
    'Một người công nhân đang lau cửa kính toà nhà.',
    [
      'A worker is cleaning a window.',
      'A window is being installed.',
      'A worker is opening a door.',
      'The building is being painted.',
    ],
    'cleaning a window = lau cửa sổ. "being installed" (đang được lắp) đúng đồ vật nhưng sai việc.'
  ),
  item(
    '🚗🚗🚗🅿️',
    'Nhiều ô tô đậu thành hàng trong bãi xe, không có ai.',
    [
      'Some cars are parked in a row.',
      'A man is driving out of a parking lot.',
      'Some cars are being washed.',
      'Traffic is moving on a highway.',
    ],
    'are parked in a row = đậu thành hàng (trạng thái). Tranh không có người nên câu có người lái xe đều sai.'
  ),
  item(
    '☕🫖🍪',
    'Tách cà phê và đĩa bánh được đặt trên bàn.',
    [
      'Some cups have been placed on a table.',
      'A woman is pouring tea.',
      'Some cookies are being baked.',
      'The table is being cleared.',
    ],
    'have been placed = đã được đặt (trạng thái). Các câu kia nói về hành động đang diễn ra mà tranh không có.'
  ),
  item(
    '👷‍♀️🪜🧱',
    'Một công nhân đang leo thang.',
    [
      'A worker is climbing a ladder.',
      'A ladder is lying on the ground.',
      'A worker is building a wall.',
      'Some bricks are being delivered.',
    ],
    'climbing a ladder = leo thang. "lying on the ground" sai vì thang đang được dùng.'
  ),
  item(
    '🧑‍🏫👩‍🎓👨‍🎓📝',
    'Học viên đang ghi chép trong lúc một người thuyết trình.',
    [
      'Some people are taking notes.',
      'Some people are leaving the room.',
      'A woman is handing out papers.',
      'The seats are all empty.',
    ],
    'taking notes = ghi chép. "The seats are all empty" mâu thuẫn với cảnh có người ngồi nghe.'
  ),
  item(
    '🛳️⚓🌊',
    'Một con tàu đang neo ở cảng.',
    [
      'A ship is docked at a port.',
      'Some passengers are swimming.',
      'A ship is sailing in a storm.',
      'Some boxes are being unloaded from a truck.',
    ],
    'is docked at a port = đang neo ở cảng. Tranh không có bão hay người bơi.'
  ),
  item(
    '🧑‍🍳🥗🍽️',
    'Một người phục vụ đang dọn món ăn ra bàn.',
    [
      'A server is bringing food to a table.',
      'A customer is paying the bill.',
      'Some dishes are being washed.',
      'A chef is cutting vegetables.',
    ],
    'bringing food to a table = mang món ăn ra bàn. Các câu kia có người hoặc việc không có trong tranh.'
  ),
  item(
    '🧍📚🔝',
    'Một người đàn ông đang với tay lấy sách trên kệ cao.',
    [
      'He’s reaching for a book on a shelf.',
      'He’s reading a book at a desk.',
      'He’s putting books into a box.',
      'Some books are lying on the floor.',
    ],
    'reaching for = với tay lấy. "reading at a desk" sai vì anh ấy đang đứng ở kệ, không ngồi đọc.'
  ),
  item(
    '🪑🪑🪑🪑🎤',
    'Hàng ghế xếp thẳng hàng trước một sân khấu, chưa có ai ngồi.',
    [
      'Chairs have been arranged in rows.',
      'People are sitting in the audience.',
      'A man is speaking on a stage.',
      'Some chairs are being folded.',
    ],
    'have been arranged = đã được xếp (xong rồi). Tranh không có người nên câu về khán giả và người nói đều sai.'
  ),
  item(
    '🧑‍🔧💻🛠️',
    'Một kỹ thuật viên đang sửa máy tính xách tay.',
    [
      'A laptop is being repaired.',
      'A laptop is being packed into a bag.',
      'A technician is talking on the phone.',
      'Some laptops are on display in a store.',
    ],
    'is being repaired = đang được sửa. "being packed" đúng đồ vật nhưng sai hành động, kiểu bẫy hay gặp.'
  ),
  item(
    '👫🚶🌳',
    'Hai người đang đi bộ dọc theo con đường trong công viên.',
    [
      'They’re walking along a path.',
      'They’re sitting on a bench.',
      'They’re planting some trees.',
      'They’re crossing a busy street.',
    ],
    'walking along a path = đi dọc theo lối đi. "planting trees" dùng đúng từ trees trong tranh nhưng sai hành động.'
  ),
  item(
    '🧑‍💼🤝🧑‍💼',
    'Hai người mặc vest đang bắt tay nhau.',
    [
      'They’re shaking hands.',
      'They’re signing a contract.',
      'They’re waving goodbye.',
      'They’re exchanging business cards.',
    ],
    'shaking hands = bắt tay. Ba câu kia đều là việc hay đi kèm cuộc gặp nhưng không có trong tranh.'
  ),
  item(
    '🍽️🍷🕯️',
    'Một bàn ăn đã được bày sẵn đĩa, ly và nến, chưa có khách.',
    [
      'A table has been set for a meal.',
      'Some diners are eating dinner.',
      'A waiter is clearing the table.',
      'Some candles are being lit.',
    ],
    'has been set = đã được bày sẵn. "clearing the table" (dọn bàn) là việc ngược lại, và tranh không có người.'
  ),
  item(
    '🧑‍🔬🔬',
    'Một nhà khoa học đang nhìn vào kính hiển vi.',
    [
      'She’s looking into a microscope.',
      'She’s cleaning a microscope.',
      'She’s writing in a notebook.',
      'She’s putting on a lab coat.',
    ],
    'looking into a microscope = nhìn vào kính hiển vi. "cleaning a microscope" đúng đồ vật, sai hành động.'
  ),
  item(
    '🏠🌊⛵',
    'Một ngôi nhà nằm bên bờ nước, có thuyền buồm ở xa.',
    [
      'A house overlooks the water.',
      'A boat is being pulled onto the shore.',
      'Some people are swimming near a boat.',
      'A house is under construction.',
    ],
    'overlook = nhìn ra (cảnh), từ hay gặp trong Part 1 khi tả nhà, cửa sổ. Tranh không có người và nhà đã xây xong.'
  ),
  item(
    '👩‍💼📋🖨️',
    'Một người phụ nữ đang lấy giấy ra khỏi máy photo.',
    [
      'She’s removing some papers from a copier.',
      'She’s fixing a copier.',
      'She’s handing out some documents.',
      'She’s throwing papers into a bin.',
    ],
    'removing papers from a copier = lấy giấy ra khỏi máy photo. "fixing" đúng đồ vật nhưng sai hành động.'
  ),
  item(
    '🛒🛒🛒🏪',
    'Mấy chiếc xe đẩy được xếp thành hàng trước cửa siêu thị, không có ai.',
    [
      'Some shopping carts are lined up outside a store.',
      'A woman is pushing a shopping cart.',
      'Some carts are being filled with groceries.',
      'The store is closed for repairs.',
    ],
    'are lined up = được xếp thành hàng. Tranh không có người nên câu có người đẩy xe và "being filled" đều sai.'
  ),
  item(
    '🧑‍🔧🪜💡',
    'Một người đàn ông đứng trên thang để thay bóng đèn.',
    [
      'He’s standing on a ladder.',
      'He’s carrying a ladder outside.',
      'He’s turning off the lights.',
      'He’s painting the ceiling.',
    ],
    'standing on a ladder = đứng trên thang. "carrying a ladder" dùng đúng từ ladder nhưng sai hành động.'
  ),
  item(
    '📦🗄️🏭',
    'Thùng hàng được xếp chồng cao trên kệ trong nhà kho.',
    [
      'Boxes have been stacked on shelves.',
      'A worker is opening a box.',
      'Some shelves are being installed.',
      'A truck is parked in the warehouse.',
    ],
    'have been stacked = đã được xếp chồng (trạng thái). "are being installed" là việc đang làm, mà tranh chỉ có kệ đã có sẵn.'
  ),
  item(
    '👨‍👩‍👧🍽️🌳',
    'Một gia đình đang ăn ngoài trời dưới gốc cây.',
    [
      'They’re eating outdoors.',
      'They’re cooking in a kitchen.',
      'They’re planting a tree.',
      'They’re waiting in line at a restaurant.',
    ],
    'eating outdoors = ăn ngoài trời. "planting a tree" dùng đúng từ tree nhưng sai hành động; "in a kitchen" sai nơi chốn.'
  ),
  item(
    '🧑‍💼🖊️📄',
    'Một người đàn ông đang ký tên vào giấy tờ.',
    [
      'He’s signing a document.',
      'He’s reading a newspaper.',
      'He’s printing a document.',
      'He’s mailing a letter.',
    ],
    'signing a document = ký giấy tờ. "printing a document" đúng đồ vật nhưng sai hành động.'
  ),
  item(
    '🚴‍♀️🛣️',
    'Một người phụ nữ đang đạp xe trên đường.',
    [
      'She’s riding a bicycle along a road.',
      'She’s repairing a bicycle.',
      'A bicycle is leaning against a fence.',
      'She’s crossing the street on foot.',
    ],
    'riding a bicycle = đang đạp xe. "leaning against a fence" là xe dựng một chỗ, không có người; hai câu kia sai hành động.'
  ),
  item(
    '🧑‍🍳🍞🔥',
    'Một người thợ làm bánh đang cho bánh mì vào lò.',
    [
      'A baker is putting bread into an oven.',
      'Some bread is being sliced.',
      'A baker is washing his hands.',
      'Some loaves are displayed in a window.',
    ],
    'putting … into an oven = cho vào lò. "is being sliced" đúng đồ vật (bánh mì) nhưng sai hành động.'
  ),
  item(
    '🧑‍💼🧳🚕',
    'Một người đàn ông đang đặt va li vào cốp xe taxi.',
    [
      'A man is putting a suitcase into a car.',
      'A man is unpacking his suitcase.',
      'A taxi is parked in a garage.',
      'A man is getting out of a car.',
    ],
    'putting a suitcase into a car = đặt va li vào xe. unpacking là lấy đồ ra khỏi va li; câu cuối là xuống xe.'
  ),
  item(
    '🌳🪑🪑🌳',
    'Mấy chiếc ghế dài trong công viên, không có ai ngồi.',
    [
      'Some benches are unoccupied.',
      'Some people are sitting on the benches.',
      'Some trees are being cut down.',
      'Some benches are being painted.',
    ],
    'unoccupied = không có người ngồi. Tranh không có người, nên mọi câu "is being + V3" (cần người làm) đều sai.'
  ),
  item(
    '👩‍⚕️🩺🧒',
    'Một bác sĩ đang khám cho một em bé.',
    [
      'A doctor is examining a child.',
      'A child is taking some medicine.',
      'A doctor is writing a prescription.',
      'A child is drawing a picture.',
    ],
    'examining = đang khám. Uống thuốc, viết đơn thuốc là việc liên quan nhưng không có trong tranh.'
  ),
  item(
    '📄📌🗒️',
    'Mấy tờ thông báo đã được ghim lên bảng tin, không có ai.',
    [
      'Some notices have been posted on a board.',
      'Some papers are being thrown away.',
      'A woman is writing on a board.',
      'A board is being installed.',
    ],
    'have been posted = đã được dán sẵn (trạng thái). Tranh không có người nên các câu "is being + V3" và "A woman is writing" đều sai.'
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
