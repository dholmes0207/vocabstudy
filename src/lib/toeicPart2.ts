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

  // More prompts (04/11/2026): tag and indirect questions, offers, problems.
  item(
    'You’ve met our new director, haven’t you?',
    [
      'Yes, at the meeting last week.',
      'The director’s office is upstairs.',
      'No, I haven’t read it yet.',
    ],
    'Câu hỏi đuôi (…, haven’t you?) được trả lời như câu hỏi Yes/No. (Bẫy) câu giữa lặp director; "read it" không hợp với gặp người.'
  ),
  item(
    'Could you tell me where the conference room is?',
    ['It’s at the end of the hall.', 'Yes, I’ll tell him.', 'The conference starts at nine.'],
    'Câu hỏi gián tiếp Could you tell me where…? hỏi nơi chốn. (Bẫy) "tell him" lặp tell; câu cuối lặp conference nhưng trả lời giờ.'
  ),
  item(
    'Would you like me to print the agenda?',
    ['That would be helpful, thanks.', 'The printer is new.', 'Yes, I like it.'],
    'Would you like me to…? là lời đề nghị giúp: đáp nhận hoặc từ chối. (Bẫy) printer lặp âm print; "I like it" lặp like với nghĩa khác.'
  ),
  item(
    'The air conditioner in my office isn’t working.',
    [
      'I’ll call maintenance right away.',
      'It’s working hours now.',
      'Yes, the office is very big.',
    ],
    'Câu báo vấn đề: đáp bằng cách xử lý. (Bẫy) "working hours" lặp working với nghĩa khác.'
  ),
  item(
    'When is the report due?',
    ['By Thursday afternoon.', 'About twenty pages.', 'I already read it.'],
    'When hỏi thời hạn. (Bẫy) "twenty pages" trả lời How long (dài bao nhiêu).'
  ),
  item(
    'Who will lead the training session?',
    ['Someone from the IT department.', 'In Room 5.', 'It lasts two hours.'],
    'Who hỏi người; câu đáp có thể chỉ nói chung chung (someone from…). Hai câu kia trả lời Where và How long.'
  ),
  item(
    'Why did the sales numbers go down?',
    ['A competitor lowered its prices.', 'They’re on page three.', 'No, they went up.'],
    'Why hỏi lý do, đáp không cần Because. (Bẫy) "No" không trả lời được câu hỏi Wh-.'
  ),
  item(
    'Where can I park my car?',
    ['There’s a lot behind the building.', 'Yes, I can.', 'It’s a new car.'],
    'Where hỏi nơi chốn. (Bẫy) "Yes, I can" lặp can; câu cuối lặp car.'
  ),
  item(
    'How about meeting for lunch tomorrow?',
    ['Sure, what time works for you?', 'I had a big lunch.', 'About an hour ago.'],
    'How about…? là lời rủ: đáp đồng ý hoặc từ chối. (Bẫy) lặp lunch; "an hour ago" trả lời When ở quá khứ.'
  ),
  item(
    'Is this seat taken?',
    ['No, please go ahead.', 'It takes about ten minutes.', 'I’ll take the train.'],
    'Hỏi ghế có người ngồi chưa: "No, please go ahead" (chưa, mời ngồi). (Bẫy) takes và take lặp từ với nghĩa khác.'
  ),
  item(
    'Which supplier did we choose?',
    ['The one with the lowest price.', 'We chose it last month.', 'Yes, they supply paper.'],
    'Which hỏi cái nào. (Bẫy) "last month" trả lời When; supply lặp âm supplier.'
  ),
  item(
    'Do you want me to book a taxi for you?',
    ['No thanks, I’ll take the subway.', 'The book is on my desk.', 'Yes, it was a long trip.'],
    'Lời đề nghị giúp: đáp nhận hoặc từ chối kèm lý do. (Bẫy) book (quyển sách) cùng chữ với book (đặt).'
  ),
  item(
    'How long have you worked at this company?',
    ['For about five years.', 'It’s a long way.', 'At the main office.'],
    'How long have you…? hỏi khoảng thời gian: For about five years. (Bẫy) "a long way" lặp long.'
  ),
  item(
    'Has the shipment arrived yet?',
    ['It’s expected this afternoon.', 'Yes, I shipped it.', 'At the front gate.'],
    'Hỏi hàng đến chưa: câu đáp gián tiếp "dự kiến chiều nay đến" vẫn đúng. (Bẫy) shipped lặp âm shipment.'
  ),
  item(
    'Why don’t you ask Maria for help?',
    ['That’s a good idea.', 'Because she was late.', 'She asked me yesterday.'],
    'Why don’t you…? là lời gợi ý, không hỏi lý do. (Bẫy) câu Because trả lời lý do; asked lặp ask.'
  ),
  item(
    'What’s the price of this printer?',
    ['It’s on sale for 200 dollars.', 'It prints very fast.', 'Next to the window.'],
    'Hỏi giá. (Bẫy) prints lặp âm printer; câu cuối trả lời Where.'
  ),
  item(
    'I can’t find my security badge.',
    ['You can get a new one at reception.', 'Yes, it’s very secure.', 'I found the report.'],
    'Câu báo vấn đề: đáp bằng cách giải quyết. (Bẫy) secure lặp âm security; found là quá khứ của find.'
  ),
  item(
    'Will the store be open on Sunday?',
    ['Only in the morning.', 'It opened last year.', 'I’ll store them in the closet.'],
    'Câu hỏi Yes/No có thể đáp bằng thông tin cụ thể: "Only in the morning". (Bẫy) store (cửa hàng / cất giữ), opened lặp open.'
  ),
  item(
    'Who should I send the invoice to?',
    ['The accounting department.', 'I sent it yesterday.', 'Two hundred dollars.'],
    'Hỏi gửi cho ai: đáp bằng bộ phận. (Bẫy) sent là quá khứ của send; câu cuối nói số tiền.'
  ),
  item(
    'Let’s take a short break.',
    ['Good idea, I need some coffee.', 'The window is broken.', 'It’s a short movie.'],
    'Lời rủ: đáp đồng ý. (Bẫy) broken nghe gần break; short lặp lại với nghĩa khác.'
  ),
  item(
    'Which bus goes to the convention center?',
    ['The number 12, I think.', 'The convention was very useful.', 'About twenty minutes.'],
    'Which hỏi chọn cái nào: số xe buýt. (Bẫy) câu thứ hai lặp convention; "twenty minutes" trả lời How long.'
  ),
  item(
    'Who should I give these receipts to?',
    [
      'Leave them with Mr. Chen in accounting.',
      'Yes, I received them.',
      'They’re on sale this week.',
    ],
    'Who hỏi người: Mr. Chen. (Bẫy) "received" nghe gần receipts; Yes/No không trả lời câu Wh-.'
  ),
  item(
    'When will the new printer be installed?',
    ['I haven’t heard yet.', 'On the second floor.', 'Yes, it prints quickly.'],
    'Câu trả lời gián tiếp "chưa nghe tin" vẫn đúng, kiểu đáp án rất hay gặp. (Bẫy) nơi chốn cho câu When; prints lặp âm printer.'
  ),
  item(
    'Didn’t you finish the budget report?',
    [
      'I’m still waiting for the sales numbers.',
      'The budget is very tight.',
      'At the end of the report.',
    ],
    'Câu hỏi phủ định: đáp bằng lý do chưa xong cũng là trả lời. (Bẫy) lặp budget và report.'
  ),
  item(
    'Let’s take a short break before the next session.',
    [
      'Good idea, I need some coffee.',
      'The session was cancelled last week.',
      'It broke yesterday.',
    ],
    'Let’s… là lời đề nghị, đáp bằng đồng ý. (Bẫy) "broke" nghe gần break; câu thứ hai lặp session.'
  ),
  item(
    'How long will the repairs take?',
    ['About two days.', 'Twice a year.', 'The repair shop on Pine Street.'],
    'How long hỏi khoảng thời gian: two days. (Bẫy) "Twice a year" trả lời How often; câu cuối lặp repair, trả lời nơi chốn.'
  ),
  item(
    'Is the training session on Monday or Tuesday?',
    ['It was moved to Wednesday.', 'Yes, it is.', 'I trained for a marathon.'],
    'Câu hỏi lựa chọn có thể đáp bằng phương án thứ ba: dời sang thứ Tư. (Bẫy) Yes không chọn được; trained lặp âm training.'
  ),
  item(
    'Could you show me how to use the scanner?',
    ['Sure, it’s quite simple.', 'The show starts at eight.', 'I used it to scan my passport.'],
    'Lời nhờ Could you…? đáp bằng đồng ý. (Bẫy) "show" lặp từ với nghĩa khác (buổi diễn); câu cuối lặp use và scan.'
  ),
  item(
    'The client wants to change the delivery date.',
    ['To which day?', 'Our clients are very happy.', 'It was delivered by truck.'],
    'Câu trần thuật: đáp bằng câu hỏi tiếp theo hợp lý (đổi sang ngày nào?). (Bẫy) lặp client và delivered.'
  ),
  item(
    'Why don’t we hire a temporary assistant?',
    ['That would really help.', 'Because it was too high.', 'She’s been here for a year.'],
    'Why don’t we… là lời gợi ý, không hỏi lý do, nên Because… sai. Đáp bằng đồng ý: "That would really help."'
  ),
  item(
    'Where can I find the latest price list?',
    ['It’s on the shared drive.', 'Prices went up last month.', 'At the latest, by Friday.'],
    'Where hỏi chỗ tìm: trên ổ chung. (Bẫy) "at the latest" lặp latest với nghĩa khác (muộn nhất); câu giữa lặp price.'
  ),
  item(
    'Whose turn is it to clean the break room?',
    ['I think it’s Maria’s.', 'Turn left at the corner.', 'The room is very clean.'],
    'Whose hỏi của ai: lượt của Maria. (Bẫy) "Turn left" lặp turn với nghĩa khác (rẽ); câu cuối lặp room và clean.'
  ),
  item(
    'What time does the bank open on Saturdays?',
    ['Not until ten.', 'At the bank on Oak Street.', 'Yes, it’s open today.'],
    'What time hỏi giờ: "Not until ten" (mãi đến 10 giờ). (Bẫy) câu giữa lặp bank, trả lời nơi chốn; Yes/No không trả lời câu Wh-.'
  ),
  item(
    'Who’s giving the presentation tomorrow?',
    ['I believe it’s Mr. Patel.', 'It’s a nice present.', 'At ten in the morning.'],
    'Who hỏi người. (Bẫy) "present" nghe gần presentation; "At ten" trả lời thời gian.'
  ),
  item(
    'Where can I get a parking permit?',
    ['From the security office downstairs.', 'Parking is free on weekends.', 'For about a month.'],
    'Where hỏi nơi lấy giấy phép. (Bẫy) câu giữa lặp parking; "For about a month" trả lời How long.'
  ),
  item(
    'Why is the copier making that noise?',
    [
      'The technician is coming to check it.',
      'Please make two copies.',
      'It’s very noisy outside.',
    ],
    'Câu trả lời không nói thẳng lý do nhưng đúng ý: thợ sắp đến kiểm tra. (Bẫy) "copies" nghe gần copier; "noisy" lặp âm noise.'
  ),
  item(
    'How did the client meeting go?',
    ['Better than we expected.', 'By taxi.', 'At the client’s office.'],
    'How did … go hỏi kết quả (diễn ra thế nào). (Bẫy) "By taxi" trả lời đi bằng gì; câu cuối lặp client, trả lời nơi chốn.'
  ),
  item(
    'Have you met our new manager yet?',
    ['Only briefly, at lunch.', 'The meeting is at two.', 'Yes, it’s a new menu.'],
    'Câu hỏi Yes/No có thể đáp gián tiếp: "chỉ gặp qua lúc ăn trưa" nghĩa là đã gặp. (Bẫy) meeting lặp âm met; "new menu" nghe gần new manager.'
  ),
  item(
    'Should we order lunch now or wait for Sam?',
    ['Let’s wait a few more minutes.', 'I ordered it online.', 'Yes, lunch was delicious.'],
    'Câu lựa chọn: chọn đợi Sam. (Bẫy) "ordered" lặp order ở thì quá khứ; Yes không chọn được.'
  ),
  item(
    'Would you mind closing the window?',
    ['Not at all.', 'It’s closed on Sundays.', 'I mind the store.'],
    'Would you mind…? hỏi có phiền không: "Not at all" (không phiền đâu) là đồng ý. (Bẫy) "closed" lặp close; "mind" lặp từ với nghĩa khác (trông coi).'
  ),
  item(
    'Isn’t the report due today?',
    ['No, the deadline was moved to Friday.', 'He reported it yesterday.', 'Two hundred pages.'],
    'Câu hỏi phủ định: đáp No và nêu hạn mới. (Bẫy) "reported" lặp report; số trang không trả lời câu hỏi.'
  ),
  item(
    'The printer on the third floor is out of paper again.',
    ['I’ll bring some up right away.', 'I read the paper this morning.', 'It printed in color.'],
    'Câu trần thuật về vấn đề: đáp bằng lời đề nghị giải quyết. (Bẫy) "paper" lặp từ với nghĩa khác (tờ báo); "printed" lặp âm printer.'
  ),
  item(
    'How many people signed up for the workshop?',
    ['Around thirty so far.', 'Sign here, please.', 'In the main hall.'],
    'How many hỏi số lượng. (Bẫy) "Sign" lặp âm signed; câu cuối trả lời nơi chốn.'
  ),
  item(
    'When will the new chairs be delivered?',
    ['The store hasn’t told us yet.', 'Yes, they’re very comfortable.', 'Twelve chairs.'],
    'Câu trả lời "chưa biết" vẫn đúng cho câu When. (Bẫy) Yes/No cho câu Wh-; câu cuối lặp chairs, trả lời số lượng.'
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
