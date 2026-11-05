import type { Pair } from './legal'

// "What's new" (/changelog). Every entry is a real release, taken from the git
// history — newest first. Add one when a change is something a learner would
// notice; leave out fixes and internal work.

export interface Release {
  /** ISO day it went live. */
  date: string
  title: Pair
  items: Pair[]
}

export const RELEASES: Release[] = [
  {
    date: '2026-11-05',
    title: ['Theo dõi điểm yếu khi luyện thi', 'Weak spots in exam practice'],
    items: [
      [
        'TOEIC Part 7 lên 25 bài (16 bài một đoạn, 9 bài hai đoạn): thêm thông báo thư viện đóng cửa, tin tuyển thực tập, tin nhắn ghế giao trễ; hoá đơn in ấn kèm email báo tính sai, lịch đào tạo kèm email đổi buổi.',
        'TOEIC Part 7 now has 25 sets (16 single, 9 double): a library closure notice, an internship ad, a chat about late chairs; a print invoice with an e-mail about a billing error, and a training schedule with a change e-mail.',
      ],
      [
        'Đọc – ghép câu hỏi và trả lời HSK 3 lên 15 cặp: thêm thức khuya chuẩn bị họp, vì sao học tiếng Trung, thử giày, tủ lạnh hết sữa, con gái học nhạc.',
        "HSK 3 question and answer now has 15 pairs: up late before a meeting, why learn Chinese, trying on shoes, out of milk and a daughter's music lessons.",
      ],
      [
        'Đọc – ghép câu hỏi và trả lời: HSK 1 và HSK 2 lên 15 cặp mỗi cấp (thêm số người trong nhà, hỏi ai, muốn ăn gì; số phòng, đợi ai, hỏi thăm sức khoẻ, màu yêu thích, hôm qua mua gì).',
        "Question and answer: HSK 1 and HSK 2 now have 15 pairs each (adding family size, who someone is, what to eat; a room number, who you wait for, feeling better, a favourite colour, yesterday's shopping).",
      ],
      [
        'TOEIC Part 1 lên 28 cảnh: thêm với tay lấy sách, ghế xếp hàng, sửa máy tính, đi dạo công viên, bắt tay, bàn ăn bày sẵn, kính hiển vi, nhà nhìn ra mặt nước.',
        'TOEIC Part 1 now has 28 scenes: reaching for a book, chairs in rows, a laptop repair, a walk in the park, a handshake, a table set for dinner, a microscope and a house overlooking the water.',
      ],
      [
        'HSK 3 đọc đoạn văn ngắn lên 15 đoạn: thêm thời tiết nhiều gió, thang máy hỏng, ôn thi, giúp hàng xóm, quán ăn phải đợi lâu.',
        'HSK 3 short passages now number 15: windy winters, a broken lift, exam night, helping a neighbour and a slow restaurant.',
      ],
      [
        'TOEIC Part 6 lên 16 đoạn: thêm thông báo nộp chi phí công tác trực tuyến, email chuyển văn phòng, thông báo bảo trì ngân hàng trực tuyến, thư nhắc gia hạn tạp chí.',
        'TOEIC Part 6 now has 16 texts: an online expense report memo, an office move e-mail, an online banking maintenance notice and a subscription renewal letter.',
      ],
      [
        'HSK 2 nghe hội thoại – chọn tranh lên 16 bài: thêm chó con, cá, sữa, đồng hồ, máy bay, ti vi.',
        'HSK 2 picture dialogues now have 16 sets: a puppy, fish, milk, a watch, a plane and the TV.',
      ],
      [
        'TOEIC Part 3 và Part 4 lên 16 bài mỗi Part, mỗi Part 3 bài có bảng: thêm đơn văn phòng phẩm (có bảng), bãi đỗ xe đóng cửa, nhân viên mới, khách dời giờ họp; tin nhắn cửa hàng nội thất, bản tin thời tiết, lịch hội thảo đổi giờ (có bảng), lễ trao giải.',
        'TOEIC Parts 3 and 4 now have 16 sets each, three of them with a graphic: a supplies order (with a graphic), a closing car park, a new trainee, a client moving a meeting; a furniture store voicemail, a weather report, a workshop schedule change (with a graphic) and an awards dinner.',
      ],
      [
        'Nghe hội thoại – câu hỏi có thêm 9 bài: HSK 3 lên 20 bài (mượn xe đạp, tủ lạnh trống, hỏi đường, tìm mũ, đổi lịch vì tuyết), HSK 2 lên 16 bài (vé máy bay, nghề của chị gái, chạy bộ, giờ mở cửa).',
        "The dialogue questions add nine sets: HSK 3 now has 20 (a lent bike, an empty fridge, asking the way, a lost hat, a trip moved for snow), HSK 2 has 16 (a plane ticket, a sister's job, morning runs, opening hours).",
      ],
      [
        'Luyện thi HSK 3 có thêm "Đọc – ghép câu hỏi và trả lời": 10 cặp câu như phần ghép câu bài Đọc của HSK 3. Phần Đọc của bài thi nhỏ HSK 3 có 3 câu dạng này, 3 câu điền từ và 4 đoạn văn ngắn.',
        'HSK 3 practice adds "Question and answer": ten pairs like the sentence matching in HSK 3 reading. The HSK 3 mini test reading now has three of them, three gap fills and four short passages.',
      ],
      [
        'Luyện thi HSK 3 có thêm "Đọc đoạn văn ngắn": 10 đoạn văn ngắn, mỗi đoạn một câu hỏi ★ và 3 phương án như phần thứ ba bài Đọc của HSK 3. Phần Đọc của bài thi nhỏ HSK 3 có 5 câu dạng này.',
        'HSK 3 practice adds "Short passages": ten short texts, each with a ★ question and three options like the third reading part of HSK 3. The HSK 3 mini test reading now has five of them.',
      ],
      [
        'TOEIC Part 7 lên 20 bài: thêm tin nhắn dời giờ gặp khách, thông báo phân loại rác, quảng cáo hội thảo kèm email đăng ký muộn, thư hẹn sửa máy kèm tin nhắn đổi lịch.',
        'TOEIC Part 7 now has 20 sets: a chat about a late client, a recycling notice, a workshop ad with a late registration e-mail, and a repair letter with a chat to reschedule.',
      ],
      [
        'TOEIC Part 5 lên 81 câu ngữ pháp: thêm câu về đại từ (him, their own, herself, whose, it) và giới từ (by, between, on, except, despite).',
        'TOEIC Part 5 now has 81 grammar questions, adding pronouns (him, their own, herself, whose, it) and prepositions (by, between, on, except, despite).',
      ],
      [
        'Trang Luyện thi TOEIC ghi số câu bạn đã làm và đã đúng ở từng Part, và chỉ ra Part bạn hay sai nhất để luyện trước.',
        'The TOEIC page shows how many questions you have answered and got right in each part, and points out your weakest part to practise first.',
      ],
    ],
  },
  {
    date: '2026-11-04',
    title: ['Thêm bài luyện TOEIC', 'More TOEIC practice'],
    items: [
      [
        'Trang Luyện thi HSK cho biết dạng câu bạn hay sai nhất ở từng cấp, tính qua mọi lượt luyện và bài thi nhỏ.',
        'The HSK practice page shows the kind of question you miss most at each level, across all your rounds and mini tests.',
      ],
      [
        'Nghe hội thoại HSK có thêm 5 đoạn cho HSK 3 (quên ô, thang máy hỏng, đeo kính, quà sinh nhật, lỡ xe buýt) và 4 đoạn cho HSK 2, có câu phải tính tuổi từ lời nói.',
        'HSK dialogues add five for HSK 3 (a forgotten umbrella, a broken lift, glasses, a birthday present, a missed bus) and four for HSK 2, one of them asking you to work out an age.',
      ],
      [
        'TOEIC Part 3 và Part 4 lên 12 bài mỗi Part: thêm hội thoại hỏng máy chiếu, giao hàng trễ, thông báo ở bảo tàng, hướng dẫn đặt phòng họp trực tuyến.',
        'TOEIC Parts 3 and 4 now have 12 sets each: a broken projector, a late delivery, a museum announcement and a new room-booking system.',
      ],
      [
        'Thẻ TOEIC Part 5 cho biết dạng câu bạn hay sai nhất qua mọi lượt đã làm (từ loại, giới từ, liên từ…), để biết nên ôn gì trước.',
        'The TOEIC Part 5 card shows the kind of question you miss most across all your rounds (word form, prepositions, conjunctions…), so you know what to work on first.',
      ],
      [
        'Dạng ghép câu hỏi và trả lời có thêm 10 cặp câu cho HSK 2, như phần ghép câu bài Đọc của HSK 2. Bài thi nhỏ HSK 2 có 3 câu dạng này.',
        'Question and answer now has ten HSK 2 pairs too, like the matching part of HSK 2 reading; the HSK 2 mini test has three of them.',
      ],
      [
        'Luyện thi HSK 1 có thêm "Đọc – ghép câu hỏi và trả lời": đọc một câu hỏi, chọn câu trả lời phù hợp trong 4 câu, như phần thứ ba bài Đọc của HSK 1. Trả lời xong thì nghe cả hai câu và xem bản dịch.',
        'HSK 1 practice adds "Question and answer": read a question and pick its answer among four, like the third reading part of HSK 1, then hear both and see the translation.',
      ],
      [
        'TOEIC Part 5 nhớ các câu ngữ pháp bạn làm sai; thẻ Part 5 có nút "Làm lại các câu đã sai", câu nào làm lại đúng thì được bỏ khỏi danh sách.',
        'TOEIC Part 5 remembers the grammar questions you missed; the Part 5 card offers them again, and each one answered right leaves the list.',
      ],
      [
        'Luyện thi HSK 2 có thêm "Nghe hội thoại – chọn tranh": nghe một đoạn hội thoại ngắn, chọn tranh đúng trong 5 tranh, như phần thứ hai bài Nghe của HSK 2.',
        'HSK 2 practice adds "Dialogue and picture": hear a short dialogue and pick its picture among five, like the second listening part of HSK 2.',
      ],
      [
        'Luyện thi HSK 2 và HSK 3 có thêm "Nghe hội thoại (听对话)": 8 đoạn cho HSK 2 và 10 đoạn cho HSK 3, hội thoại ngắn giữa một người nữ và một người nam, mỗi người một giọng, kèm câu hỏi như đề thật. Trả lời xong thì xem lời thoại và bản dịch. Phần Nghe của bài thi nhỏ HSK 2 có 3 câu, HSK 3 có 5 câu dạng này.',
        'HSK 2 and HSK 3 practice add "Dialogues (听对话)": eight and ten short exchanges between a woman and a man, each in their own voice, with a question as on the test, then the transcript and its translation. The HSK 2 and HSK 3 mini tests now have three and five of them.',
      ],
      [
        'Thẻ bài thi nhỏ TOEIC và HSK có thêm dãy cột điểm của 8 lần làm gần nhất, kèm điểm lần gần nhất và mức tăng giảm so với lần trước.',
        'The TOEIC and HSK mini test cards show the scores of your last eight attempts as a row of bars, with the latest score and the change since last time.',
      ],
      [
        'Luyện thi HSK có thêm "Đọc – chọn tranh": đọc một câu có pinyin, chọn đúng tranh trong 3 tranh, như phần thứ hai bài Đọc của HSK 1.',
        'HSK practice adds "Read and pick the picture": read a sentence with its pinyin and pick its picture among three, like the second reading part of HSK 1.',
      ],
      [
        'Luyện thi HSK có thêm "Nghe – chọn tranh (听句子选图片)": nghe một câu bằng giọng thu sẵn, chọn đúng tranh trong 3 tranh, như phần thứ hai bài Nghe của HSK 1.',
        'HSK practice adds "Pick the picture (听句子选图片)": hear a recorded sentence and pick its picture among three, like the second listening part of HSK 1.',
      ],
      [
        'TOEIC Part 3 và Part 4 có dạng "Look at the graphic": vừa nghe vừa xem bảng giá, lịch tàu, sơ đồ phòng, dự báo thời tiết để trả lời, như đề thật.',
        'TOEIC Parts 3 and 4 add "Look at the graphic" questions: listen while reading a price list, a train timetable, a room plan or a weather forecast, as on the test.',
      ],
      [
        'TOEIC Part 6 lên 12 đoạn văn: thêm thông báo phần mềm mới, giờ mở cửa siêu thị, thư cảm ơn diễn giả, tin tuyển quản lý lễ tân.',
        'TOEIC Part 6 now has 12 texts: a new-software memo, store opening hours, a thank-you letter to a speaker and a front desk job ad.',
      ],
      [
        'TOEIC Part 7 có thêm 5 bài đọc (thông báo nội bộ, bài báo, đánh giá khách sạn, quảng cáo kèm email khiếu nại, thông báo kèm phiếu đăng ký) và các dạng câu hỏi hay gặp: điều nào KHÔNG đúng, từ gần nghĩa nhất, điều suy ra được.',
        'TOEIC Part 7 adds five reading sets (a memo, a news article, a hotel review, an ad with a complaint email, a notice with a sign-up form) and the question types the test loves: what is NOT true, the closest meaning, what is suggested.',
      ],
      [
        'Làm sai một từ đang trong lịch ôn ở các bài luyện TOEIC và HSK thì từ đó được đưa lại vào ôn sớm. Từ chưa học không tự được thêm vào lịch ôn.',
        'Missing a word you are already reviewing in TOEIC or HSK practice brings it back to your reviews soon. Words you have not studied are not added on their own.',
      ],
      [
        'Luyện thi HSK có thêm "Đọc – nhìn tranh (看图判断)": đọc một từ có pinyin, nhìn tranh, chọn đúng hay sai, như phần đầu bài Đọc của HSK 1 và HSK 2. Phần Đọc của bài thi nhỏ HSK 1–2 có 5 câu dạng này.',
        'HSK practice adds "Read and look (看图判断)": read a word with its pinyin, look at the picture, say right or wrong, like the first reading part of HSK 1 and HSK 2. The reading part of the HSK 1–2 mini tests now has five of them.',
      ],
      [
        'Luyện thi HSK có thêm "Nghe – đúng hay sai (判断对错)": nghe một từ, nhìn tranh, chọn đúng hay sai, như phần đầu bài Nghe của HSK 1 và HSK 2. Bài thi nhỏ HSK 1–2 mở đầu bằng 5 câu dạng này.',
        'HSK practice adds "Right or wrong (判断对错)": hear a word, look at the picture, say right or wrong, like the first listening part of HSK 1 and HSK 2. The HSK 1–2 mini tests now open with five of them.',
      ],
      [
        'Các bài nghe TOEIC (Part 1–4) đọc bằng giọng thu sẵn thay cho giọng trình duyệt, và trong hội thoại Part 3 người nữ nói giọng nữ, người nam nói giọng nam như đề thật.',
        "The TOEIC listening parts (1–4) play recorded voices instead of the browser voice, and in Part 3 conversations the woman and the man speak in a woman's and a man's voice, as on the test.",
      ],
      [
        'Huy hiệu cho từng chủ đề (cả chủ đề TOEIC): Đồng khi đã học mọi từ, Bạc khi mọi từ đã qua vài lần ôn, Vàng khi thành thạo cả bộ. Mỗi chủ đề ghi còn bao nhiêu từ tới huy hiệu tiếp theo, và báo ngay khi vừa nhận huy hiệu mới.',
        'Medals for every topic, TOEIC themes included: bronze once every word is started, silver once every word has had a few reviews, gold when the whole deck is mastered. Each deck shows how many words the next medal needs, and a new medal is announced as soon as it is earned.',
      ],
      [
        'Ghép họ từ cho TOEIC Part 5: xếp decide, decision, decisive, decisively vào đúng ô danh từ, động từ, tính từ, trạng từ. Có 52 họ từ hay gặp trong đề, mỗi từ kèm nghĩa và đuôi từ được gạch chân.',
        'Word families for TOEIC Part 5: put decide, decision, decisive, decisively into the noun, verb, adjective and adverb slots. Fifty-two families common in the test, each form with its meaning and its ending underlined.',
      ],
      [
        'Part 2 có 60 câu hỏi – đáp (thêm câu hỏi đuôi, câu hỏi gián tiếp, lời mời, lời đề nghị giúp) và Part 1 có 20 cảnh.',
        'Part 2 has 60 question–response items (adding tag and indirect questions, invitations and offers) and Part 1 has 20 scenes.',
      ],
      [
        'TOEIC Part 5 có 71 câu ngữ pháp kèm giải thích (trước đây 43), thêm các điểm hay ra như quá khứ hoàn thành, bị động, suggest + V-ing và các cặp từ dễ nhầm (receipt / recipe, complete / compete).',
        'TOEIC Part 5 now has 71 explained grammar questions (up from 43), adding favourites such as the past perfect, the passive, suggest + -ing and look-alike words (receipt / recipe, complete / compete).',
      ],
      [
        'Luyện thi HSK có thêm "Viết chữ Hán (写汉字)": câu thiếu một chữ, có pinyin, chọn đúng chữ trong các chữ cùng âm hoặc cùng bộ thủ. Bài thi nhỏ HSK 3 có đủ 10 câu viết như đề thật.',
        'HSK practice adds "Write the character (写汉字)": a sentence missing one character, with its pinyin; pick it among characters that sound alike or share a radical. The HSK 3 mini test now has all 10 writing questions.',
      ],
      [
        'Mẹo đuôi từ cho Part 5: nhìn một từ, đoán danh từ, động từ, tính từ hay trạng từ, rồi xem quy tắc đuôi (-tion, -ive, -ly, -ize…) để làm nhanh câu hỏi từ loại.',
        'An ending tip for Part 5: see a word, tell noun, verb, adjective or adverb, then the ending rule (-tion, -ive, -ly, -ize…) that makes word-form questions quick.',
      ],
      [
        'Gấp đôi số bài của TOEIC Part 3, 4, 6 và thêm 4 bài Part 7: hội thoại đặt bàn, thuê xe, hẹn phỏng vấn; thông báo giảm giá, bản tin giao thông; thư xin lỗi khách, tin thăng chức, quy định công tác phí…',
        'Twice as many TOEIC Part 3, 4 and 6 sets and four more for Part 7: booking a table, renting a car, an interview call; a store sale, a traffic report; an apology letter, a promotion notice, a travel policy…',
      ],
    ],
  },
  {
    date: '2026-11-03',
    title: ['Luyện thi HSK', 'HSK practice'],
    items: [
      [
        'Thử thách hôm nay trên Trang chủ: 5 câu mỗi ngày, mọi người học cùng ngôn ngữ có cùng một đề, kèm chuỗi ngày liên tiếp để giữ nhịp học.',
        "Today's challenge on the home page: five questions a day, the same for everyone learning the language, with a streak of days in a row to keep you going.",
      ],
      [
        'Trang "Luyện thi HSK" cho HSK 1, 2, 3: nghe hiểu bằng giọng thu sẵn, chọn từ điền chỗ trống có pinyin, sắp xếp câu như phần Viết của HSK 3. Câu hỏi làm từ chính từ vựng của từng cấp.',
        'An "HSK practice" page for HSK 1, 2 and 3: listening with recorded audio, fill-the-gap with pinyin, and sentence building like the HSK 3 writing part, all made from each level\'s own words.',
      ],
      [
        'Bài thi nhỏ HSK theo cấp, có điểm ước lượng trên thang 200 hoặc 300 và so với mức đạt.',
        'An HSK mini test for each level, with an estimated score on the 200 or 300-point scale against the pass mark.',
      ],
    ],
  },
  {
    date: '2026-11-03',
    title: ['Luyện thi TOEIC', 'TOEIC practice'],
    items: [
      [
        'Bài thi nhỏ TOEIC: 26 câu, khoảng 20 phút, đủ 7 Part theo tỉ lệ đề thật. Cuối bài có khoảng điểm ước lượng cho Nghe và Đọc, bậc CEFR tương ứng và điểm từng Part để biết nên luyện thêm phần nào.',
        'A TOEIC mini test: 26 questions, about 20 minutes, all 7 parts in the proportions of the real test. It ends with an estimated range for Listening and Reading, the matching CEFR level and a score per part, so you know what to practise next.',
      ],
      [
        'Luyện đủ 7 Part của TOEIC: thêm Part 1 (nghe câu mô tả cảnh), Part 3 (hội thoại hai người) và Part 4 (tin nhắn thoại, thông báo, quảng cáo). Câu hỏi hiện chữ, lời thoại chỉ được đọc như đề thật; làm xong xem lại toàn bộ lời thoại.',
        'All 7 TOEIC parts to practise: Part 1 (hear statements about a scene), Part 3 (two-person conversations) and Part 4 (voicemails, announcements, ads) join the others. Questions are printed and the audio is only heard, as on the test; the transcript shows when you are done.',
      ],
      [
        'Luyện Part 6 và Part 7 của TOEIC: email, thông báo, quảng cáo, tin nhắn, hoá đơn, cả bài hai đoạn phải ghép thông tin, mỗi câu có giải thích bằng tiếng Việt.',
        'TOEIC Part 6 and Part 7 practice: emails, notices, ads, text messages, invoices, and two-text sets where you have to join the details, every answer explained in Vietnamese.',
      ],
      [
        'Luyện Part 2 của TOEIC: nghe câu hỏi và 3 câu đáp như đề thật (không hiện chữ), chọn câu đúng, rồi xem vì sao các câu kia là bẫy: lặp từ, từ nghe giống, trả lời Yes/No cho câu hỏi Wh-.',
        'TOEIC Part 2 practice: hear a question and three responses as on the test (nothing printed), pick one, then see why the others are traps: repeated words, words that sound alike, Yes/No to a Wh- question.',
      ],
      [
        'Luyện Part 5 của TOEIC: mỗi lượt 10 câu điền chỗ trống về từ loại, giới từ, thì, liên từ, đại từ và nghĩa của từ. Câu nào cũng có giải thích bằng tiếng Việt, cuối lượt biết mình yếu dạng nào.',
        'TOEIC Part 5 practice: 10 gap-fill questions a round on word forms, prepositions, tenses, conjunctions, pronouns and word meaning. Every answer is explained in Vietnamese, and the end of the round shows which kind you are weakest at.',
      ],
      [
        'Trang "Luyện thi TOEIC" trong Luyện tập: học và ôn 13 chủ đề từ vựng công sở (văn phòng, tuyển dụng, đặt hàng, đi công tác…), xem mình đã thuộc bao nhiêu, và đọc 7 Part của đề hỏi gì, mẹo làm từng Part.',
        'A "TOEIC practice" page in Practice: learn and review 13 themes of workplace words (the office, hiring, orders, business travel…), see how many you know, and read what each of the 7 parts asks with a tip for each.',
      ],
      [
        'Tab TOEIC trong "Lộ trình luyện thi": cấu trúc đề Listening & Reading (7 Part, 200 câu), thang điểm 10–990, mốc B1 và B2 theo ETS, tiến độ theo danh sách 318 từ công sở và bài kiểm tra từ vựng 20 câu.',
        'A TOEIC tab in "Exam roadmap": the Listening & Reading format (7 parts, 200 questions), the 10–990 scale, the B1 and B2 marks from ETS, progress through a 318-word workplace list and a 20-question vocabulary check.',
      ],
      [
        'Thêm 75 từ công sở hay gặp trong TOEIC như hotel, payment, delivery, shipment, inventory, applicant, reimburse, complimentary, mỗi từ có phiên âm, ví dụ, cụm đi kèm, mẹo nhớ và giọng đọc thu sẵn.',
        'Adds 75 workplace words common in TOEIC such as hotel, payment, delivery, shipment, inventory, applicant, reimburse and complimentary, each with pronunciation, an example, collocations, a memory tip and recorded audio.',
      ],
    ],
  },
  {
    date: '2026-11-03',
    title: ['Bộ thủ và cặp thanh tiếng Trung', 'Chinese radicals and tone pairs'],
    items: [
      [
        'Trang Pinyin có bảng 20 cặp thanh, mỗi ô một từ để nghe. Bài "Nghe chọn thanh" giờ rải đều các cặp và cuối lượt cho biết bạn hay nhầm cặp nào, ví dụ 2 + 3 với 3 + 2.',
        'The Pinyin page has a table of the 20 tone pairs, a word to hear in each. "Hear the tones" now spreads its questions over the pairs and tells you at the end which ones you mix up, such as 2 + 3 and 3 + 2.',
      ],
      [
        'Trang "Bộ thủ" cho tiếng Trung: 41 bộ hay gặp kèm tên Hán Việt (亻 nhân đứng, 氵 ba chấm thuỷ, 扌 tài gảy…) và các chữ trong gói chứa bộ đó, kèm bài "Đoán bộ thủ" 10 câu.',
        'A "Radicals" page for Chinese: 41 common radicals with their Sino-Vietnamese names (亻, 氵, 扌…) and the characters of the pack that contain them, plus a 10-question "Spot the radical" round.',
      ],
    ],
  },
  {
    date: '2026-11-02',
    title: ['Đọc theo truyện', 'Read stories aloud'],
    items: [
      [
        'Nút "Đọc theo" trong mỗi truyện: nghe từng câu, bấm micro đọc lại, xem câu nào máy đã nghe rõ và chỗ nào cần đọc lại. Truyện tiếng Trung chấm theo từng chữ và hiện kèm pinyin.',
        'A "Read aloud" button in every story: hear each sentence, tap the mic and say it back, and see which parts came through. Chinese stories are scored character by character, with pinyin shown.',
      ],
      [
        'Bảng Pinyin, bảng Hán Việt và bảng chữ Hangul phát âm ngay khi chạm.',
        'The Pinyin, Sino-Vietnamese and Hangul pages sound the moment you tap.',
      ],
    ],
  },
  {
    date: '2026-10-29',
    title: [
      'Tiếng Trung: đủ từ vựng HSK 3 và lộ trình HSK 3',
      'Chinese: all of HSK 3, and an HSK 3 roadmap',
    ],
    items: [
      [
        'App mở nhanh hơn: trên điện thoại và mạng 4G chậm, màn hình chính sẵn sàng sau khoảng 4,7 giây thay vì 7,7 giây ở lần đầu, và 1,6 giây thay vì 2,5 giây khi vào lại.',
        'The app opens faster: on a phone with slow 4G the home screen is ready in about 4.7 s instead of 7.7 s on the first visit, and 1.6 s instead of 2.5 s when you come back.',
      ],
      [
        'Bấm loa là nghe ngay: câu truyện, bài nghe chép, câu hỏi nghe và từ đang luyện phát âm được chuẩn bị sẵn, tiếng bật lên trong khoảng 0,1 giây thay vì 1–2 giây. Đã sửa lỗi khiến nhiều câu, nhất là câu tiếng Trung, đọc bằng giọng máy thay vì giọng thu sẵn.',
        'Tap the speaker and hear it at once: story lines, dictation, listening questions and the word you are pronouncing are prepared ahead, so the sound starts in about 0.1 s instead of 1–2 s. Fixed a bug that made many sentences, Chinese ones especially, play in the robot voice instead of the recorded one.',
      ],
      [
        'Luyện phát âm chấm điểm ngay khi bạn nói đúng, không phải chờ thêm một nhịp im lặng.',
        'Pronunciation practice scores you as soon as you say it right, without waiting for a pause.',
      ],
      [
        'Gói tiếng Trung tăng từ 330 lên 618 từ, phủ đủ 298 từ HSK 3 như 把 / 被, 如果, 虽然, 应该, 一定, 而且, 然后, 决定, 机会, 马上, 经常, 打算, 照顾, 方便…, mỗi từ có pinyin, âm Hán Việt, câu ví dụ và giọng đọc thu sẵn.',
        'The Chinese pack grows from 330 to 618 words and covers all 298 HSK 3 words such as 把 / 被, 如果, 虽然, 应该, 一定, 而且, 然后, 决定, 机会, 马上, 经常, 打算, 照顾, 方便…, each with pinyin, Hán Việt, an example and recorded audio.',
      ],
      [
        'Trang "Lộ trình luyện thi" có thêm tab HSK 3: thông tin đề và thang điểm, tiến độ theo danh sách từ và bài kiểm tra từ vựng 20 câu.',
        'The "Exam roadmap" page gains an HSK 3 tab: the test format and scores, progress through the word list and a 20-question vocabulary check.',
      ],
      [
        'Bộ chủ đề tiếng Trung chia lại thành 24 bộ gọn hơn, mỗi bộ dưới 50 từ: thêm Phương hướng & vị trí, Cảm xúc & suy nghĩ, Dự định & việc phải làm, Liên từ & phó từ…',
        'The Chinese topic decks are regrouped into 24 smaller decks of under 50 words each, adding Directions & position, Feelings & thoughts, Plans & getting things done, Linking words & adverbs…',
      ],
      [
        '9 bài ngữ pháp tiếng Trung mức HSK 3: câu chữ 把, câu bị động 被, 越来越, 虽然…但是, 一边…一边, 除了, 如果…就, bổ ngữ kết quả (写完, 找到) và bổ ngữ xu hướng (进来, 出去).',
        '9 Chinese grammar lessons at HSK 3 level: the 把 sentence, the 被 passive, 越来越, 虽然…但是, 一边…一边, 除了, 如果…就, result complements (写完, 找到) and direction complements (进来, 出去).',
      ],
      [
        '5 truyện ngắn tiếng Trung mức HSK 3 (Tìm ví, Thành phố mới, Ôn thi HSK 3, Quà sinh nhật bà, Bị cảm), dùng lại nhiều từ HSK 3 và các điểm ngữ pháp mới.',
        '5 short Chinese stories at HSK 3 level (Finding a wallet, A new city, Studying for HSK 3, Grandma’s birthday present, Catching a cold) that bring back many HSK 3 words and the new grammar points.',
      ],
    ],
  },
  {
    date: '2026-10-28',
    title: [
      'Tiếng Anh: lộ trình luyện thi A2 Key và B1 Preliminary; giọng thu sẵn cho mọi câu; audio tải nhanh hơn',
      'English: A2 Key and B1 Preliminary roadmaps; recorded voices for every sentence; faster audio',
    ],
    items: [
      [
        'Trang "Lộ trình luyện thi" có thêm tiếng Anh: A2 Key (1.000 từ lõi A1–A2) và B1 Preliminary (phần từ B1), mỗi kỳ có thông tin đề và thang điểm Cambridge, tiến độ từng bước và bài kiểm tra từ vựng 20 câu.',
        'The "Exam roadmap" page now covers English: A2 Key (the core 1,000 A1–A2 words) and B1 Preliminary (the B1 words), each with the Cambridge format and scores, step-by-step progress and a 20-question vocabulary check.',
      ],
      [
        'Cụm "Hay đi chung với", câu ngữ pháp, câu truyện và các trang Hangul, Pinyin, Lượng từ, Nghe số, bảng Hán Việt giờ đọc bằng giọng AI thu sẵn, không còn giọng máy méo trên Firefox hay Windows.',
        'Collocations, grammar sentences, story lines and the Hangul, Pinyin, measure word, numbers and Hán Việt pages now use recorded AI voices instead of the robotic browser voice on Firefox or Windows.',
      ],
      [
        'Audio được giữ sẵn ở máy chủ gần bạn, nên bấm loa lần đầu phát nhanh hơn.',
        'Audio is kept on a server near you, so the first tap on a speaker plays sooner.',
      ],
    ],
  },
  {
    date: '2026-10-22',
    title: [
      'Tiếng Trung: mẫu câu giao tiếp; âm khó cho tiếng Trung và tiếng Hàn; tiếng Hàn: giọng đọc thu sẵn',
      'Chinese: everyday phrases; tricky sounds for Chinese and Korean; Korean: pre-recorded voices',
    ],
    items: [
      [
        'Gói tiếng Trung có thêm "Mẫu câu giao tiếp": 68 câu cho 8 tình huống như chào hỏi, gọi món, mua sắm, hỏi đường, mỗi câu có pinyin, nghĩa và mẹo dùng (不好意思 hay 对不起, gọi tài xế là 师傅…). Luyện bằng cách nghe chọn nghĩa, chọn câu đúng và xếp từ thành câu.',
        'The Chinese pack now has "Everyday phrases": 68 sentences for 8 situations such as greetings, ordering, shopping and directions, each with pinyin, its meaning and a usage tip (不好意思 or 对不起, calling a driver 师傅…). Practise by hearing and picking the meaning, picking the right sentence and building it from tiles.',
      ],
      [
        'Trang "Âm khó cho người Việt" có thêm tiếng Trung (9 bài: các cặp thanh dễ lẫn như 买 mǎi / 卖 mài, zh – z, j q x, -n – -ng…) và tiếng Hàn (5 bài: âm cuối 발 / 밤 / 방, phụ âm căng 사다 / 싸다, ㅓ – ㅗ…), mỗi bài có trò thử tai.',
        'The "Tricky sounds" page now covers Chinese (9 lessons: tone pairs such as 买 mǎi / 卖 mài, zh – z, j q x, -n – -ng…) and Korean (5 lessons: finals 발 / 밤 / 방, tense consonants 사다 / 싸다, ㅓ – ㅗ…), each with an ear test.',
      ],
      [
        'Từ, câu ví dụ và mẫu câu tiếng Hàn giờ có giọng đọc AI thu sẵn, hai giọng nữ (SunHi) và nam (InJoon), không còn phụ thuộc máy có giọng tiếng Hàn hay không. Đổi giọng trong Cài đặt → Phát âm.',
        'Korean words, examples and phrases now have pre-recorded AI voices, female (SunHi) and male (InJoon), so they no longer depend on your device having a Korean voice. Switch voices in Settings → Pronunciation.',
      ],
    ],
  },
  {
    date: '2026-10-20',
    title: [
      'Tiếng Hàn: mẫu câu giao tiếp, nghe số, đơn vị đếm, biến âm, thêm từ, truyện và ngữ pháp; tiếng Trung: 4 bài ngữ pháp mới; ôn ngữ pháp theo lịch',
      'Korean: everyday phrases, numbers, counters, sound changes, more words, stories and grammar; Chinese: 4 new grammar lessons; grammar on a review schedule',
    ],
    items: [
      [
        'Màn "Nghe số" có thêm tiếng Hàn: nghe giá tiền, giờ, ngày tháng, tuổi rồi chọn đúng — luyện chỗ khó nhất của tiếng Hàn là hai bộ số (세 시 이십 분, 오천 원, 스무 살, 유월).',
        '"Hear the numbers" now does Korean: prices, times, dates and ages — practice for the hardest part, its two sets of numbers (세 시 이십 분, 오천 원, 스무 살, 유월).',
      ],
      [
        'Bài ngữ pháp đã đạt giờ quay lại để ôn sau 3, 7, 21 rồi 60 ngày, như từ vựng. Trang chủ có thẻ "Ôn ngữ pháp" khi có bài đến hạn; ôn trượt thì bài quay lại ngày hôm sau.',
        'Passed grammar lessons now come back for review after 3, 7, 21 and then 60 days, like words. Home shows a "Grammar review" card when one is due; a missed review comes back the next day.',
      ],
      [
        'Gói tiếng Hàn tăng từ 192 lên 253 từ: người trong gia đình (아버지, 할머니, 오빠…), các thứ trong tuần, mùa xuân và mùa thu, số Hán Hàn và thuần Hàn, đồ dùng, nơi chốn (편의점, 우체국…), động từ, tính từ và trạng từ hay gặp — mỗi từ có cách đọc kiểu Việt và câu ví dụ.',
        'The Korean pack grows from 192 to 253 words: family (아버지, 할머니, 오빠…), the days of the week, spring and autumn, Sino-Korean and native numbers, everyday things, places (편의점, 우체국…), and common verbs, adjectives and adverbs — each with a Vietnamese-style reading and an example.',
      ],
      [
        'Màn "Lượng từ" có thêm tiếng Hàn: 9 đơn vị đếm (개, 명, 마리, 권, 잔, 병, 장, 대, 벌) đặt cạnh "cái, người, con, quyển…" của tiếng Việt, kèm bài luyện "책 두 ___" — luyện cả số rút gọn 한, 두, 세, 네.',
        'The "Measure words" page now does Korean: 9 counters (개, 명, 마리, 권, 잔, 병, 장, 대, 벌) next to their Vietnamese counterparts, with "책 두 ___" questions that also drill the short numbers 한, 두, 세, 네.',
      ],
      [
        'Ngữ pháp tiếng Hàn thêm 2 bài: 못 ("không thể" — khác 안) và -(으)세요 để mời, nhờ lịch sự (앉으세요, 만드세요, 드세요).',
        'Korean grammar gets 2 lessons: 못 ("cannot", not the same as 안) and -(으)세요 for polite requests (앉으세요, 만드세요, 드세요).',
      ],
      [
        'Thêm 2 truyện tiếng Hàn chạm từ là ra nghĩa: "Sinh nhật bạn" (A1) và "Một ngày ở thư viện" (A2), mỗi truyện 8 câu và 3 câu hỏi.',
        'Two more Korean stories with tap-for-meaning: "A friend’s birthday" (A1) and "A day at the library" (A2), 8 sentences and 3 questions each.',
      ],
      [
        'Trang Hangul có phần "Biến âm khi đọc liền": nối âm, ㅎ yếu đi, bật hơi, âm mũi hoá, căng hoá — vì sao 음악 đọc là ư-mác, 감사합니다 là cam-xa-ham-ni-đa. Chạm từ để nghe.',
        'The Hangul page explains sound changes: linking, weak ㅎ, aspiration, nasalisation, tensing — why 음악 reads ư-mác and 감사합니다 cam-xa-ham-ni-đa. Tap a word to hear it.',
      ],
      [
        'Gói tiếng Hàn có thêm "Mẫu câu giao tiếp": 66 câu cho 8 tình huống như chào hỏi, gọi món, mua sắm, hỏi đường, kèm nghĩa và mẹo dùng. Luyện bằng cách nghe chọn nghĩa, chọn câu đúng và xếp từ thành câu.',
        'The Korean pack now has "Everyday phrases": 66 sentences for 8 situations such as greetings, ordering, shopping and directions, with meanings and usage tips. Practise by hearing and picking the meaning, picking the right sentence and building it from tiles.',
      ],
      [
        'Bài ngữ pháp tiếng Trung thứ 19: 也 (cũng) và 都 (đều) đứng ở đâu trong câu, 也都 và sự khác nhau giữa 都不 và 不都.',
        'Chinese grammar lesson 19: where 也 (also) and 都 (all) go in a sentence, 也都, and how 都不 differs from 不都.',
      ],
      [
        'Bài ngữ pháp tiếng Trung mới: 想 và 要 đều là "muốn", nhưng gọi món thì dùng 要, "không muốn" là 不想, còn 不要 nghĩa là "đừng".',
        'A new Chinese grammar lesson: 想 and 要 both mean "want", but you order with 要, "don\'t want to" is 不想, and 不要 means "don\'t!".',
      ],
      [
        'Bài ngữ pháp tiếng Trung mới: 和 ("và") chỉ nối hai danh từ như 我和他, 猫和狗. Muốn nối hai vế câu thì dùng 也.',
        'A new Chinese grammar lesson: 和 ("and") only joins nouns, like 我和他 or 猫和狗. To join two clauses, use 也.',
      ],
      [
        'Bài ngữ pháp tiếng Trung mới: 吧 ở cuối câu để rủ rê (我们走吧, "đi thôi") hay hỏi lại điều mình đoán (你是越南人吧？), khác với câu hỏi thật bằng 吗.',
        'A new Chinese grammar lesson: 吧 at the end of a sentence makes a suggestion (我们走吧, "let\'s go") or checks a guess (你是越南人吧？), unlike a real 吗 question.',
      ],
      [
        'Bài ngữ pháp tiếng Hàn mới: 도 (cũng) và 만 (chỉ) gắn thẳng vào danh từ, thay cho 은/는, 이/가, 을/를 — vì sao nói 저도 chứ không nói 저는도.',
        'A new Korean grammar lesson: 도 (also) and 만 (only) go right after the noun, in place of 은/는, 이/가, 을/를 — why it is 저도, not 저는도.',
      ],
    ],
  },
  {
    date: '2026-10-19',
    title: [
      'Buổi học đầu dễ hơn, cách đọc rõ hơn; tiếng Trung: HSK 2, gõ bính âm, lượng từ, chữ Hán qua âm Hán Việt',
      'An easier first lesson, clearer readings; Chinese: HSK 2, pinyin typing, measure words, characters by Sino-Vietnamese reading',
    ],
    items: [
      [
        'Bấm "Học 5 từ đầu tiên" là vào bài ngay. Mỗi bài có tối đa một phần ba là từ ngữ pháp (the, of, is…), phần còn lại là từ dễ hình dung như look, go, little.',
        'Tap "Learn your first 5 words" and the lesson starts right away. At most a third of a lesson are grammar words (the, of, is…); the rest are words you can picture, like look, go, little.',
      ],
      [
        'Cách đọc kiểu Việt viết đôi nguyên âm dài: sheep đọc SHIIP, ship đọc SHIP; leave LIIV, live LIV; food PHUUĐ, foot PHUT.',
        'The Vietnamese-letter readings now double long vowels: sheep reads SHIIP, ship reads SHIP; leave LIIV, live LIV; food PHUUĐ, foot PHUT.',
      ],
      [
        'Câu nói hay mỗi ngày trên Trang chủ giờ theo ngôn ngữ bạn đang học: tiếng Hàn, tiếng Trung có câu riêng.',
        'The daily saying on Home now follows the language you are learning, with its own Korean and Chinese sayings.',
      ],
      [
        'Chữ phụ đậm hơn, dễ đọc hơn khi ra ngoài trời, ở cả giao diện sáng và tối.',
        'Secondary text is darker and easier to read outdoors, in both light and dark themes.',
      ],
      [
        'Màn "Nghe số" cho tiếng Trung: nghe giá tiền, giờ giấc, ngày tháng, thứ trong tuần rồi chọn đúng — luôn có phương án dễ nhầm như 14 / 41 hay 7:30 / 7:00, như phần nghe của HSK.',
        'A "Hear the numbers" page for Chinese: hear prices, times, dates and weekdays and pick the right one — always with the classic trap like 14 / 41 or 7:30 / 7:00, as in the HSK listening parts.',
      ],
      [
        'Lộ trình luyện thi tiếng Trung có thêm HSK 2: chọn HSK 1 hoặc HSK 2 ở đầu trang, mỗi cấp có thông tin đề thi, danh sách từ, bài kiểm tra từ vựng 20 câu riêng. Thẻ từ ghi nhãn HSK 1 hoặc HSK 2.',
        'The Chinese exam roadmap adds HSK 2: pick HSK 1 or HSK 2 at the top; each level has its own exam facts, word list and 20-question vocabulary check. Word cards carry an HSK 1 or HSK 2 badge.',
      ],
      [
        'Trang mới "Chữ Hán qua âm Hán Việt" trong Luyện tập: những chữ dùng chung trong nhiều từ, kèm âm Hán Việt — biết 学 là "học" là đoán được 学校, 学习. Tìm được bằng chữ hoặc âm Hán Việt không dấu ("hoc"), và có bài "Đoán nghĩa nhờ Hán Việt": thấy 学校 (học hiệu) cùng gợi ý 学 = học như trong 学生, đoán ra "trường học". Tiếng Hàn cũng có: 학 là "học" trong 학생, 학교.',
        'New page under Practice, "Characters by Sino-Vietnamese reading": characters shared by several words, with their Sino-Vietnamese reading — know 学 is "học" and guess 学校 and 学习. Search by character or by reading without marks ("hoc"), and try "Guess by Sino-Vietnamese": see 学校 (học hiệu) with the clue 学 = học as in 学生, and work out "school". Korean has it too: 학 is "học" in 학생 and 학교.',
      ],
      [
        'Trang Pinyin có bài "Nghe chọn thanh": nghe một từ hai chữ rồi chọn đúng dấu thanh trong 4 cách viết — luyện tai cho cặp thanh điệu, chữ Hán chỉ hiện sau khi trả lời.',
        'The Pinyin page gets "Hear the tones": listen to a two-character word and pick the right tone marks out of four spellings — ear training for tone pairs, with the characters shown only after you answer.',
      ],
      [
        'Tiếng Trung có màn "Lượng từ" trong Luyện tập: 个, 本, 杯, 只, 条, 张… đặt cạnh "cái, quyển, cốc, con" của tiếng Việt, kèm bài luyện 10 câu — trả lời xong là thấy cả cụm 一本书 (yì běn shū) và nghe được.',
        'Chinese gets a "Measure words" page under Practice: 个, 本, 杯, 只, 条, 张… next to their Vietnamese counterparts, with a 10-question round — each answer shows and plays the whole phrase, like 一本书 (yì běn shū).',
      ],
      [
        'Thêm 8 truyện tiếng Trung có pinyin từng câu: "Gia đình tôi", "Tôi bị ốm", "Du lịch Bắc Kinh", "Ở nhà hàng", "Lần đầu đến Trung Quốc", "Cuối tuần", "Chiếc điện thoại mới" và "Đi mua trái cây", dùng các từ và mẫu ngữ pháp mới.',
        'Eight new Chinese stories with pinyin for every sentence: "My family", "A sick day", "A trip to Beijing", "At the restaurant", "First time in China", "The weekend", "A new phone" and "Buying fruit", built on the new words and grammar.',
      ],
      [
        'Ngữ pháp tiếng Trung thêm 11 bài cho những chỗ người Việt hay nhầm: trật tự câu (thời gian, nơi chốn đứng trước động từ), 了 cho việc đã xảy ra, 会 / 能 / 可以, 因为…所以… / 但是, 得 (他走得很快), so sánh với 比, 过 (đã từng), 要…了 (sắp) chữ cùng âm 在/再, 他/她/它, 的/得, 几 / 多少 và 有点儿 / 一点儿.',
        'Chinese grammar gets 11 lessons on points Vietnamese speakers often trip on: word order (time and place before the verb), 了 for what has happened, 会 / 能 / 可以, 因为…所以… / 但是, 得 (他走得很快), comparing with 比, 过 (have done before), 要…了 (about to) same-sound characters 在/再, 他/她/它, 的/得, 几 / 多少 and 有点儿 / 一点儿.',
      ],
      [
        'Gói tiếng Trung tăng từ 156 lên 330 từ, phủ đủ từ vựng HSK 2: thêm từ đời thường ngoài HSK 1 — anh chị em, màu sắc, bốn mùa, thuốc và sức khoẻ, xe buýt, trái/phải, đắt/rẻ, thi cử, công ty, bơi, hát, lượng từ 杯 / 只 / 条 / 张, 因为 / 所以 / 但是… — và 5 bộ chủ đề mới: Sức khoẻ & màu sắc, Học tập & công việc, Sở thích & thể thao, Thời tiết & bốn mùa, Ở nhà hàng.',
        'The Chinese pack grows from 156 to 330 words and covers HSK 2: everyday words beyond HSK 1 — siblings, colours, the four seasons, medicine and health, the bus, left/right, cheap/expensive, exams, the office, swimming, singing, the measure words 杯 / 只 / 条 / 张, 因为 / 所以 / 但是… — and 5 new topic decks: Health & colours, Study & work, Hobbies & sport, Weather & seasons, At the restaurant.',
      ],
      [
        'Tiếng Trung: không cần bàn phím chữ Hán nữa — ở Nghe – chép và câu điền từ, gõ bính âm không dấu (ví dụ "xiexie" cho 谢谢) cũng được chấm, rồi app hiện lại chữ Hán.',
        'Chinese: no Chinese keyboard needed — in dictation and gap questions you can type pinyin without tones (say "xiexie" for 谢谢), and the app shows the characters afterwards.',
      ],
      [
        'Học tiếng Hàn, tiếng Trung mà máy chưa có bàn phím Hàn hay bàn phím bính âm: dưới ô gõ có hướng dẫn thêm bàn phím cho đúng loại máy, kèm nút "Làm không cần gõ" — Nghe – chép thành xếp thẻ chữ, câu điền từ thành câu chọn đáp án.',
        'Learning Korean or Chinese without a Hangul or pinyin keyboard yet: under the typing box there are steps to add one for your device, plus "Do it without typing" — dictation becomes tapping tiles in order, and gap questions become multiple choice.',
      ],
    ],
  },
  {
    date: '2026-10-18',
    title: [
      '"Mình biết từ này rồi" và trang giới thiệu cho mọi người',
      '"I already know this word", and the introduction for everyone',
    ],
    items: [
      [
        'Nghe – chép theo truyện: trong trang đọc truyện, bấm "Nghe – chép" để chép lần lượt mọi câu của truyện. Bài ngữ pháp cũng có "Nghe – chép ví dụ".',
        'Story dictation: on a story, tap "Dictation" to write the whole story sentence by sentence. Grammar lessons have "Dictation: the examples" too.',
      ],
      [
        'Thẻ từ tiếng Trung và tiếng Hàn có mục "Cùng chữ Hán Việt": học 学生 (học sinh) là thấy ngay chữ 学 còn có trong 学校, 学习, 同学. Từ trong danh sách HSK 1 có nhãn HSK 1.',
        'Chinese and Korean word cards show "Same Sino-Vietnamese character": learn 学生 and see 学 in 学校, 学习 and 同学 too. HSK 1 words carry an HSK 1 badge.',
      ],
      [
        'Đọc truyện: chạm vào biểu tượng dịch cuối câu để xem nghĩa riêng câu đó, nút "Đọc chậm" khi nghe, và nút "Truyện tiếp theo" khi đọc xong.',
        'Stories: tap the translate icon at the end of a sentence for that sentence only, a "Slow" button for listening, and "Next story" when you finish.',
      ],
      [
        'Đang ở chỗ đông người? Ở câu nghe, bấm "Hiện không nghe được": trong 15 phút câu nghe thành câu đọc, không phát tiếng.',
        'Somewhere you can’t play sound? On a listening question, tap "Can’t listen now": for 15 minutes listening questions become reading ones, silently.',
      ],
      [
        'Cuối buổi Ôn tập và Quiz giờ có tóm tắt thay đổi: bao nhiêu từ đã thuộc, lên bậc, hay cần học lại.',
        'The end of Review and Quiz now shows what changed: words mastered, moved up, or to relearn.',
      ],
      [
        'Trên thẻ làm quen có nút "Nói thử từ này" để luyện phát âm ngay tại chỗ, không phải sang trang Luyện nói.',
        'Meet cards have "Try saying it" to practise pronunciation right there, without going to the Speaking page.',
      ],
      [
        'Trang Học có "Đã biết bộ N rồi?": làm 8 câu, đúng 7 thì bỏ qua cả bộ — các từ được hỏi lại sau 5 ngày để chắc chắn.',
        'Learn has "Already know set N?": answer 8 questions, get 7 right and skip the whole set — its words are checked again in 5 days.',
      ],
      [
        'Trên thẻ làm quen của bài học có nút "Mình biết từ này rồi": từ đó được bỏ qua trong bài, và app hỏi lại sau 5 ngày để chắc chắn. Không tính là đã thuộc cho tới khi bạn trả lời đúng.',
        'Meet cards now have "I already know this word": the word is skipped in the lesson and checked again in 5 days. It doesn’t count as mastered until you answer it.',
      ],
      [
        'Vào vocastudy.app giờ luôn mở trang giới thiệu. Nếu đã từng học, bạn thấy nút "Tiếp tục học" để vào thẳng app. App cài trên điện thoại vẫn mở vào phần học như cũ.',
        'vocastudy.app now always opens on the introduction. If you have studied before, a "Continue learning" button takes you straight in. The installed app still opens straight to your lessons.',
      ],
    ],
  },
  {
    date: '2026-10-17',
    title: [
      'Lộ trình HSK 1 / TOPIK I, kiểm tra trình độ, lưu từ khi đọc',
      'HSK 1 / TOPIK I roadmaps, a placement check, saving words while reading',
    ],
    items: [
      [
        'Bài ngữ pháp có thêm mục "Nói thành tiếng": nghe mẫu, bấm micro và đọc to 3 câu ví dụ. App chấm cả câu và tô đỏ chữ chưa nghe rõ, dùng được cho tiếng Anh, tiếng Hàn và tiếng Trung.',
        'Grammar lessons now have "Say it aloud": hear the model, tap the mic and read three examples. The app scores the whole sentence and marks the words that did not come through — in English, Korean and Chinese.',
      ],
      [
        'Lộ trình luyện thi HSK 1 (tiếng Trung) và TOPIK I (tiếng Hàn): thông tin kỳ thi có nguồn, 6 bước theo thứ tự nên học kèm chỗ bạn đã tới, và bài kiểm tra từ vựng 20 câu (10 nghe, 10 đọc). Từ làm sai có thể lưu lại để học.',
        'Exam roadmaps for HSK 1 (Chinese) and TOPIK I (Korean): exam facts with sources, six steps in the order to learn them with how far you have got, and a 20-question vocabulary check (10 listening, 10 reading). Save the words you miss to learn them.',
      ],
      [
        'Kiểm tra trình độ khoảng 3 phút ở trang Học: chọn nghĩa đúng của từ dễ trước, khó dần. Bài học sau đó bắt đầu từ chỗ bạn chưa chắc, không phải học lại từ "hello". Không cộng XP, không đổi lịch ôn.',
        'A 3-minute placement check on the Learn page: pick the meaning of easy words first, then harder ones. Lessons then start where you are no longer sure, not back at "hello". No XP, no change to your reviews.',
      ],
      [
        'Đọc truyện gặp từ chưa biết? Chạm vào từ, bấm "Lưu để học". Từ đó chờ bạn ở trang Học và được học như mọi từ mới: làm quen, tự nhớ lại, rồi vào lịch ôn. Dùng được cho cả tiếng Anh, tiếng Hàn và tiếng Trung.',
        'Met a word you don’t know in a story? Tap it and press "Save to learn". It waits for you on the Learn page and is learned like any new word: meet it, recall it, then it joins your reviews. Works in English, Korean and Chinese.',
      ],
      [
        'Mọi câu ví dụ tiếng Trung có thêm dòng pinyin ngay bên dưới — trên thẻ học, thẻ lật và Nghe thụ động — để đọc được ngay cả khi chưa thuộc chữ Hán.',
        'Every Chinese example sentence now has a pinyin line right under it — on learning cards, flashcards and hands-free listening — so you can read it before you know the characters.',
      ],
      [
        'Nghe – chép tiếng Trung có thêm gợi ý pinyin, đúng thứ cần để gõ bằng bộ gõ pinyin.',
        'Chinese dictation has a pinyin hint — exactly what you need to type with a pinyin keyboard.',
      ],
      [
        'Truyện ngắn tiếng Trung có nút "pinyin": bật lên để thấy cách đọc dưới từng câu. Ví dụ trong các bài ngữ pháp tiếng Trung cũng có pinyin.',
        'Chinese short stories have a "pinyin" button: turn it on to see how each sentence reads. Chinese grammar examples have pinyin too.',
      ],
      [
        'Gói tiếng Trung tăng lên 156 từ, phủ đủ 150 từ HSK 1: thêm số đếm 4–9, 上 / 下 / 里 / 前面 / 后面, 怎么, 怎么样, 请, 喂, 电影…',
        'The Chinese pack grows to 156 words and now covers all 150 HSK 1 words: numbers 4–9, 上 / 下 / 里 / 前面 / 后面, 怎么, 怎么样, 请, 喂, 电影…',
      ],
      [
        'Tiếng Hàn có thêm 4 bài ngữ pháp A2: thì quá khứ -았/었어요, muốn làm gì -고 싶어요, dự định -(으)ㄹ 거예요, phủ định dài -지 않아요.',
        'Korean gets 4 A2 grammar lessons: the past tense -았/었어요, wanting -고 싶어요, plans -(으)ㄹ 거예요 and the long negative -지 않아요.',
      ],
      [
        'Thêm 2 truyện tiếng Hàn A2 ("Cuối tuần trước", "Kế hoạch đi Hàn Quốc") và 10 từ rất hay gặp (저, 정말, 그리고, 그래서, 요즘…) — gói tiếng Hàn có 192 từ, các truyện chạm được nhiều từ hơn.',
        'Two A2 Korean stories ("Last weekend", "A trip to Korea") and 10 very common words (저, 정말, 그리고, 그래서, 요즘…) — the Korean pack has 192 words, and more of each story is tappable.',
      ],
      [
        'Trang chủ có lối vào thẳng tiếng Hàn và tiếng Trung; đường dẫn /home?lang=ko hay /home?lang=zh mở app ngay ở ngôn ngữ đó.',
        'The home page links straight to Korean and Chinese; /home?lang=ko or /home?lang=zh opens the app in that language.',
      ],
      [
        'VocaStudy giờ giới thiệu mình là nơi người Việt học nhiều ngoại ngữ: trang chủ có mục "Bạn muốn học ngôn ngữ nào?", trang Về chúng tôi viết lại, và bạn có thể gợi ý ngôn ngữ muốn học tiếp theo.',
        'VocaStudy now presents itself as a place for Vietnamese speakers to learn many languages: the home page asks "Which language do you want to learn?", the About page is rewritten, and you can suggest the next language.',
      ],
    ],
  },
  {
    date: '2026-10-15',
    title: ['Góp ý ngay trong app và chuông thông báo', 'In-app feedback and a notification bell'],
    items: [
      [
        'Đọc truyện ngắn: 14 truyện tiếng Anh từ A1 đến B1 (đi chợ, khám bệnh, phỏng vấn xin việc, chuyển nhà…) — chạm vào từ để xem nghĩa, mở bản dịch, trả lời câu hỏi.',
        'Short stories: 14 English stories from A1 to B1 (the market, the doctor, a job interview, moving house…) — tap a word for its meaning, open the translation, answer questions.',
      ],
      [
        'Nghe – chép: nghe một câu ví dụ rồi gõ lại, xem từng từ bạn nghe đúng hay sót.',
        'Dictation: hear an example sentence, type it, and see which words you caught or missed.',
      ],
      [
        'Tiếng Hàn (beta): 182 từ sơ cấp — chào hỏi, số đếm, màu sắc, đi lại, ăn uống… — có cách đọc kiểu Việt và câu ví dụ. Chọn ở nút ngôn ngữ trên cùng.',
        'Korean (beta): 182 beginner words — greetings, numbers, colours, getting around, food… — with Vietnamese-style readings and example sentences. Pick it from the language button at the top.',
      ],
      [
        'Tiếng Trung (beta): 132 từ sơ cấp HSK 1 có pinyin, âm Hán Việt, nghĩa tiếng Việt và câu ví dụ — học, ôn, ghép cặp, xếp câu, nghe – chép đều dùng được — cùng trang Pinyin & thanh điệu (4 thanh, biến điệu, phụ âm đầu, kiểm tra nhanh) 10 bộ từ theo chủ đề, 7 bài ngữ pháp (是, 不/没, câu hỏi, 的, lượng từ, 在, 很) và 3 truyện ngắn chạm-để-xem-nghĩa. Từ Hán Hàn trong gói tiếng Hàn cũng có âm Hán Việt (학생 = học sinh); Tra cứu tìm được không cần dấu, theo pinyin hay âm Hán Việt. Chọn ở nút ngôn ngữ trên cùng.',
        'Chinese (beta): 132 HSK 1 beginner words with pinyin, Sino-Vietnamese readings, Vietnamese meanings and example sentences — learning, reviews, matching, sentence building and dictation all work — plus a Pinyin & tones page (the four tones, tone changes, initials, a quick check) 10 topic decks, 7 grammar lessons (是, 不/没, questions, 的, measure words, 在, 很) and 3 tap-to-translate short stories. Sino-Korean words now show their Sino-Vietnamese reading too (학생 = học sinh), and the dictionary finds words without accents, by pinyin or by Sino-Vietnamese reading. Pick it from the language button at the top.',
      ],
      [
        'Bảng chữ cái Hangul cho người học tiếng Hàn: nghe từng chữ, tự ghép chữ, kiểm tra nhanh (có cả đọc từ). Thêm 6 truyện ngắn tiếng Hàn — chạm vào từ, kể cả từ có tiểu từ hay đuôi chia, để xem nghĩa — cùng 12 bộ từ theo chủ đề và 7 bài ngữ pháp tiếng Hàn (tiểu từ 은/는, 이/가, 을/를, 에/에서, đuôi -아요/-어요, phủ định 안). Khi học tiếng Hàn, menu chỉ còn những phần dùng được cho tiếng Hàn.',
        'The Hangul alphabet for Korean learners: hear each letter, build syllables, take a quick check (reading whole words too). Plus 6 short Korean stories — tap any word, particles and verb endings included, to see what it means — plus 12 Korean topic decks and 7 Korean grammar lessons (the particles 은/는, 이/가, 을/를, 에/에서, the -아요/-어요 ending, 안 for "not"). While learning Korean, the menus only show what works for Korean.',
      ],
      [
        'Ngữ pháp căn bản: 12 bài cho người mới (to be, các thì, a/an/the, giới từ, so sánh, câu hỏi…) — giải thích bằng tiếng Việt, kèm lỗi hay gặp và bài luyện.',
        'Grammar basics: 12 beginner lessons (to be, tenses, a/an/the, prepositions, comparisons, questions…) — explained in Vietnamese, with common mistakes and practice.',
      ],
      [
        'Học theo chủ đề: 19 bộ từ theo tình huống — công sở, nghề nghiệp, ăn uống, sức khoẻ, công nghệ, gia đình, thiên nhiên… Mỗi bộ có nút Học và Ôn riêng.',
        'Learn by topic: 19 decks for real situations — work, jobs, food, health, tech, family, nature… Each deck has its own Learn and Review.',
      ],
      [
        'Gửi góp ý ngay trong app (không cần mở email) — có thể cho phép trích dẫn kèm tên.',
        'Send feedback right in the app (no email needed) — and allow us to quote you if you like.',
      ],
      [
        'Chuông thông báo cạnh nút ngôn ngữ: cập nhật chính sách và những gì mới ra mắt.',
        'A notification bell beside the language button: policy updates and what just shipped.',
      ],
      [
        'Đăng ký (cả bằng Google) có bước chọn tên hiển thị; đổi tên bất cứ lúc nào trong Cài đặt.',
        'Signing up (Google too) now asks for your display name; change it any time in Settings.',
      ],
      [
        'Đăng nhập bằng Google; quên mật khẩu, đổi mật khẩu và tự xoá tài khoản.',
        'Sign in with Google; forgot password, change password and delete your account yourself.',
      ],
      [
        'Giao diện điện thoại gọn hơn: thanh trên cùng và trang Cài đặt không còn tràn màn hình.',
        'A tidier phone layout: the top bar and Settings no longer spill off the screen.',
      ],
    ],
  },
  {
    date: '2026-10-14',
    title: ['Chính sách và điều khoản theo luật mới', 'Policy and terms for the new laws'],
    items: [
      [
        'Chính sách bảo mật và Điều khoản sử dụng cập nhật theo Luật Bảo vệ dữ liệu cá nhân 2025 và Luật Trí tuệ nhân tạo 2025.',
        'The Privacy policy and Terms of use now follow Vietnam’s 2025 Personal Data Protection Law and AI Law.',
      ],
      [
        'Khi đăng ký, bạn tự tích ô đồng ý — không có gì được chọn sẵn.',
        'When you sign up, you tick the consent box yourself — nothing is pre-selected.',
      ],
      [
        'Ghi rõ nội dung nào do AI tạo, gồm cả giọng đọc phát âm.',
        'Clear labels for what AI produces, including the pronunciation voices.',
      ],
    ],
  },
  {
    date: '2026-10-13',
    title: ['Mẫu câu giao tiếp và diện mạo mới', 'Everyday phrases and a new look'],
    items: [
      [
        'Mẫu câu giao tiếp: 100 câu dùng được ngay trong 10 tình huống, có giọng đọc AI chuẩn Mỹ và bài luyện xếp câu.',
        'Everyday phrases: 100 ready-to-use phrases across 10 situations, with natural AI voices and sentence-building practice.',
      ],
      [
        'Trang giới thiệu, logo và đường dẫn gọn (vocastudy.app/phrases).',
        'A new homepage, logo and clean links (vocastudy.app/phrases).',
      ],
      [
        'Quên mật khẩu, đổi mật khẩu và tự xoá tài khoản ngay trong app.',
        'Forgot password, change password, and delete your account right in the app.',
      ],
      [
        'Trang Giới thiệu, Chính sách bảo mật và Điều khoản sử dụng.',
        'About, Privacy policy and Terms of use pages.',
      ],
    ],
  },
  {
    date: '2026-10-11',
    title: ['Giao diện tiếng Anh', 'English interface'],
    items: [
      [
        'Chuyển giao diện giữa tiếng Anh và tiếng Việt bất cứ lúc nào; trợ lý AI trả lời theo ngôn ngữ bạn chọn.',
        'Switch the interface between English and Vietnamese at any time; the AI tutor replies in your language.',
      ],
      [
        'Menu tài khoản mở ngay, không phải chờ tải gói từ.',
        'The account menu opens instantly instead of waiting for the word pack.',
      ],
      ['Tài khoản vào giai đoạn beta với danh sách chờ.', 'Accounts move to a beta waitlist.'],
    ],
  },
  {
    date: '2026-10-09',
    title: ['4.440 từ', '4,440 words'],
    items: [
      [
        'Thêm hàng trăm từ đời thường: cảm xúc, sức khoẻ, công sở, du lịch, sở thích…',
        'Hundreds more everyday words: feelings, health, work, travel, hobbies…',
      ],
      [
        '"Hôm nay còn bao nhiêu sức?" — chọn mức học vừa sức.',
        '"How much energy today?" — pick a session that fits.',
      ],
      [
        'Nghe trước những từ sắp học, rồi học luôn.',
        'Listen to the words coming up next, then learn them straight away.',
      ],
    ],
  },
  {
    date: '2026-10-08',
    title: ['Nghe, phát âm và giữ nhịp học', 'Listening, pronunciation and keeping the habit'],
    items: [
      [
        'Nghe thụ động: bấm một lần rồi cứ nghe, điều khiển từ màn hình khoá.',
        'Hands-free listening: tap once and listen, controlled from the lock screen.',
      ],
      [
        'Âm khó cho người Việt: 12 bài và trò thử tai.',
        'Hard sounds for Vietnamese speakers: 12 lessons and an ear test.',
      ],
      [
        'Khiên giữ chuỗi, mục tiêu nhỏ mỗi ngày, học nhanh 2 phút và quà nhãn dán.',
        'Streak shields, a small daily goal, 2-minute quick study and sticker gifts.',
      ],
      [
        'Nhắc học mỗi ngày qua lịch điện thoại; thống kê "7 ngày qua".',
        'A daily reminder through your phone calendar; a "last 7 days" summary.',
      ],
    ],
  },
  {
    date: '2026-10-01',
    title: ['Bầu trời sống động', 'A living sky'],
    items: [
      [
        'Nền trời sao, tuyết và sao băng phản hồi theo việc học — tắt được trong Cài đặt.',
        'A sky of stars, snow and meteors that reacts as you learn — you can turn it off in Settings.',
      ],
    ],
  },
  {
    date: '2026-09-24',
    title: ['Học sâu, nhớ lâu', 'Learn deeply, remember longer'],
    items: [
      [
        'Học theo nhóm 5 từ và tự nhớ lại thay vì tự chấm; trả lời sai thì được giảng.',
        'Learn in groups of 5 and recall instead of grading yourself; a wrong answer gets explained.',
      ],
      [
        'Ôn tập không còn "nhồi": chỉ câu trả lời đúng hạn mới đẩy từ lên.',
        'No more cramming: only reviews on schedule move a word up.',
      ],
      [
        'Trò chơi Ghép cặp và Xếp câu, Từ của ngày; vượt mốc 1.000 từ với các từ B1.',
        'Match and Order games, Word of the day; past 1,000 words with B1 vocabulary.',
      ],
    ],
  },
  {
    date: '2026-09-09',
    title: ['Học cả khi mất mạng', 'Learn offline'],
    items: [
      [
        'Sau lần mở đầu tiên, app vẫn chạy khi không có mạng.',
        'After the first visit, the app keeps working without a connection.',
      ],
    ],
  },
  {
    date: '2026-08-20',
    title: ['1.000 từ cơ bản', '1,000 core words'],
    items: [
      [
        'Đủ 1.000 từ cơ bản, mỗi từ có phiên âm, cách đọc kiểu Việt và giọng đọc AI chuẩn Mỹ.',
        'All 1,000 core words, each with IPA, a Vietnamese-letter respelling and a natural AI voice.',
      ],
    ],
  },
]
