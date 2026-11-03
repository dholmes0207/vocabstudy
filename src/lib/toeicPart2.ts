// TOEIC Part 2, "Question–response" (docs/design/toeic.md): hear a question or
// statement, then three responses, none of them printed; pick the one that
// fits. Hand-written, each with why the right one fits and how the others trap
// the ear: a repeated word, a word that sounds alike, Yes/No to a Wh- question,
// an answer to a different question word.

export interface Part2Item {
  prompt: string
  /** The right response first; rounds shuffle them. */
  responses: [string, string, string]
  why: string
}

const item = (prompt: string, responses: [string, string, string], why: string): Part2Item => ({
  prompt,
  responses,
  why,
})

export const PART2_BANK: readonly Part2Item[] = [
  item(
    'Where is the nearest post office?',
    ['Next to the bank on Main Street.', 'I posted it yesterday.', 'At nine o’clock.'],
    'Where hỏi nơi chốn. (Bẫy) "posted" lặp âm post; "At nine o’clock" trả lời thời gian.'
  ),
  item(
    'When does the meeting start?',
    ['At two thirty.', 'In the conference room.', 'Yes, it was a good meeting.'],
    'When hỏi thời gian. (Bẫy) "In the conference room" trả lời nơi chốn; Yes/No không trả lời được câu hỏi Wh-, lại lặp từ meeting.'
  ),
  item(
    'Who is in charge of the new project?',
    ['Ms. Lopez from marketing.', 'It’s free of charge.', 'The project starts in May.'],
    'Who hỏi người. (Bẫy) "free of charge" lặp từ charge với nghĩa khác (miễn phí); câu cuối lặp project.'
  ),
  item(
    'Why was the flight delayed?',
    ['Because of the storm.', 'Flight 205 to Tokyo.', 'I’d like a window seat.'],
    'Why hỏi lý do: Because of… (Bẫy) hai câu kia chỉ có từ liên quan đến chuyến bay.'
  ),
  item(
    'How much does the printer cost?',
    ['About three hundred dollars.', 'It prints in color.', 'Twice a week.'],
    'How much hỏi giá. (Bẫy) "Twice a week" trả lời How often; "prints" lặp âm của printer.'
  ),
  item(
    'How often do you visit the factory?',
    ['About once a month.', 'It’s near the airport.', 'Very much, thank you.'],
    'How often hỏi tần suất: once a month.'
  ),
  item(
    'Would you like coffee or tea?',
    ['Tea, if you have it.', 'Yes, please.', 'The coffee shop is closed.'],
    'Câu hỏi lựa chọn (A or B): chọn một trong hai. "Yes, please" không trả lời được câu hỏi lựa chọn; câu cuối lặp coffee.'
  ),
  item(
    'Can you send me the sales report?',
    ['Sure, I’ll email it right away.', 'Sales went up last month.', 'He sent a letter.'],
    'Lời nhờ (Can you…?) được đáp bằng đồng ý hoặc từ chối. (Bẫy) lặp sales, và sent là quá khứ của send.'
  ),
  item(
    'Didn’t you go to the conference last week?',
    ['No, I had to stay in the office.', 'It’s in the main hall.', 'Next week is fine.'],
    'Câu hỏi phủ định vẫn trả lời như câu hỏi thường: No, (tôi không đi). (Bẫy) "Next week" lặp week.'
  ),
  item(
    'The copy machine is out of paper again.',
    [
      'I’ll get some from the supply room.',
      'Yes, three copies, please.',
      'It’s a new coffee machine.',
    ],
    'Câu trần thuật báo một vấn đề: câu đáp hay là cách xử lý. (Bẫy) "copies" lặp copy; "coffee" nghe gần giống copy.'
  ),
  item(
    'Where should I put these boxes?',
    ['In the storage room, please.', 'They’re very heavy boxes.', 'Yesterday afternoon.'],
    'Where hỏi nơi chốn. (Bẫy) câu giữa lặp boxes; câu cuối trả lời thời gian.'
  ),
  item(
    'Who’s going to pick up the clients from the airport?',
    ['I think Mr. Davis is.', 'At the international terminal.', 'They picked the blue one.'],
    'Who hỏi người. (Bẫy) terminal là nơi chốn; picked lặp âm pick với nghĩa khác (chọn).'
  ),
  item(
    'When will the new menu be ready?',
    ['By the end of the week.', 'I’ll have the soup.', 'In the kitchen.'],
    'When hỏi thời gian: By the end of the week. (Bẫy) gọi món và nơi chốn đều chỉ liên quan đến nhà hàng.'
  ),
  item(
    'Why don’t we take a short break?',
    ['That’s a good idea.', 'Because it’s broken.', 'No, it wasn’t me.'],
    'Why don’t we…? là lời đề nghị, không hỏi lý do: đáp đồng ý hoặc từ chối. (Bẫy) "Because" trả lời lý do, và broken nghe gần break.'
  ),
  item(
    'Is the parking lot behind the building?',
    ['No, it’s across the street.', 'It’s a big building.', 'Yes, I bought a new car.'],
    'Câu hỏi Yes/No về vị trí: No, rồi nói chỗ đúng. (Bẫy) lặp building; "Yes" nhưng nói chuyện khác.'
  ),
  item(
    'How long will the renovation take?',
    ['About three weeks.', 'The lobby looks great.', 'It’s ten meters long.'],
    'How long hỏi thời gian kéo dài. (Bẫy) "ten meters long" lặp long với nghĩa chiều dài.'
  ),
  item(
    'Which hotel are you staying at?',
    ['The one near the station.', 'For three nights.', 'Yes, I’m staying.'],
    'Which hỏi cái nào: The one near the station. (Bẫy) "For three nights" trả lời How long.'
  ),
  item(
    'Have you finished the budget proposal?',
    ['Almost. I’ll send it this afternoon.', 'I proposed a new plan.', 'It’s a large budget.'],
    'Hỏi đã xong chưa: "Almost" (sắp xong). (Bẫy) proposed lặp âm proposal; câu cuối lặp budget.'
  ),
  item(
    'Could you help me move this desk?',
    ['Of course. Where to?', 'It’s a wooden desk.', 'I moved last year.'],
    'Lời nhờ: đồng ý rồi hỏi thêm. (Bẫy) lặp desk; moved lặp move với nghĩa chuyển nhà.'
  ),
  item(
    'What time does the store close today?',
    ['At eight p.m.', 'It’s very close to here.', 'Today is Friday.'],
    'What time hỏi giờ. (Bẫy) close (gần) viết giống close (đóng cửa) nhưng đọc khác; câu cuối lặp today.'
  ),
  item(
    'Whose jacket is this?',
    ['I think it’s Tom’s.', 'It’s on the chair.', 'Yes, it fits well.'],
    'Whose hỏi của ai: Tom’s.'
  ),
  item(
    'Should we order lunch for the meeting?',
    ['Yes, sandwiches would be good.', 'In alphabetical order.', 'I had lunch at noon.'],
    'Hỏi ý kiến: Yes, kèm gợi ý. (Bẫy) order lặp với nghĩa thứ tự; lunch lặp lại.'
  ),
  item(
    'The train to Busan leaves at six.',
    ['Then we’d better hurry.', 'I’m training new staff.', 'Six tickets, please.'],
    'Câu trần thuật về giờ tàu: câu đáp phản ứng với thông tin đó. (Bẫy) training nghe giống train; six lặp lại.'
  ),
  item(
    'Where can I find the application form?',
    ['On our website.', 'I applied last week.', 'Fill it in with a pen.'],
    'Where hỏi nơi chốn: On our website. (Bẫy) applied lặp âm application.'
  ),
  item(
    'Why is the office so quiet today?',
    ['Most people are at a training session.', 'Please be quiet.', 'It’s a big office.'],
    'Why hỏi lý do. (Bẫy) hai câu kia lặp quiet và office.'
  ),
  item(
    'Who should I give this invoice to?',
    [
      'Leave it with the accounting department.',
      'Twenty dollars, please.',
      'I gave it back yesterday.',
    ],
    'Hỏi đưa cho ai: chỉ ra bộ phận cũng được. (Bẫy) gave là quá khứ của give.'
  ),
  item(
    'How did the presentation go?',
    ['It went very well, thanks.', 'By train.', 'Ten slides.'],
    'How did … go? = diễn ra thế nào. (Bẫy) "By train" hiểu go là đi lại.'
  ),
  item(
    'Are you taking the bus or driving to work?',
    ['I usually drive.', 'Yes, I am.', 'The bus stop is over there.'],
    'Câu hỏi lựa chọn: chọn một trong hai. "Yes, I am" không trả lời được; câu cuối lặp bus.'
  ),
  item(
    'When did you receive the shipment?',
    ['Early this morning.', 'From a supplier in Korea.', 'It will arrive soon.'],
    'When hỏi thời gian, ở quá khứ: Early this morning. (Bẫy) "will arrive" sai thì; câu giữa trả lời từ đâu.'
  ),
  item(
    'Do you know where Ms. Chen’s office is?',
    ['It’s on the third floor.', 'Yes, I know her well.', 'It’s a nice office.'],
    'Câu hỏi gián tiếp Do you know where…? thực chất hỏi nơi chốn. (Bẫy) "Yes, I know her" lặp know.'
  ),
  item(
    'Let’s meet in the lobby at nine.',
    ['OK, see you then.', 'The hotel has a large lobby.', 'Nine people are coming.'],
    'Lời hẹn: đáp đồng ý. (Bẫy) lặp lobby và nine.'
  ),
  item(
    'Why did you call the technician?',
    ['The air conditioner isn’t working.', 'He’s a skilled technician.', 'I called at noon.'],
    'Why hỏi lý do, câu đáp không cần Because. (Bẫy) lặp technician và called.'
  ),
  item(
    'Which department does Mr. Wong work in?',
    ['Human resources.', 'He works very hard.', 'On the fifth floor.'],
    'Which department hỏi bộ phận nào. (Bẫy) works lặp work; câu cuối trả lời Where.'
  ),
  item(
    'Isn’t the report due tomorrow?',
    ['No, they extended the deadline.', 'It’s a long report.', 'Two copies of it.'],
    'Câu hỏi phủ định để xác nhận: No, (không phải ngày mai). (Bẫy) lặp report.'
  ),
  item(
    'How many people are coming to the training session?',
    ['About twenty.', 'Next Tuesday.', 'In room 301.'],
    'How many hỏi số lượng. (Bẫy) thời gian và nơi chốn của buổi đào tạo.'
  ),
  item(
    'Where did you buy that laptop?',
    ['At the electronics store downtown.', 'Last month.', 'Yes, it’s mine.'],
    'Where hỏi nơi chốn. (Bẫy) "Last month" trả lời When.'
  ),
  item(
    'Could I borrow your stapler?',
    ['Sure, here you are.', 'It’s a red stapler.', 'I’ll lend you some money.'],
    'Xin mượn: đáp đồng ý. (Bẫy) lặp stapler; lend là cho mượn, nói sang chuyện tiền.'
  ),
  item(
    'When is the deadline for the job application?',
    ['This Friday.', 'In the personnel office.', 'Three applicants.'],
    'When hỏi thời gian. (Bẫy) applicants lặp âm application; câu giữa trả lời Where.'
  ),
  item(
    'Who left these documents on my desk?',
    ['I think it was the new intern.', 'Leave them on the table.', 'Yes, they’re important.'],
    'Who hỏi người. (Bẫy) leave lặp left; "Yes" không trả lời được câu hỏi Wh-.'
  ),
  item(
    'What did you think of the new office?',
    ['It’s much brighter than the old one.', 'I think it’s at ten.', 'Across from the bank.'],
    'What did you think of…? hỏi nhận xét. (Bẫy) think lặp lại với nghĩa khác; câu cuối trả lời Where.'
  ),
]

/** Items in one round. */
export const PART2_ROUND = 10

export interface Part2Question extends Part2Item {
  /** The responses as heard: (A), (B), (C) — and (D) for a Part 1 statement. */
  options: string[]
  answer: number
}

export function part2Round(rand: () => number = Math.random): Part2Question[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return shuffle(PART2_BANK)
    .slice(0, PART2_ROUND)
    .map((it) => {
      const options = shuffle(it.responses)
      return { ...it, options, answer: options.indexOf(it.responses[0]) }
    })
}
