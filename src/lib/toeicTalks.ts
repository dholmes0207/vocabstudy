import type { ReadingQuestion } from './toeicReading'

// TOEIC Part 3 ("Conversations") and Part 4 ("Talks"), docs/design/toeic.md.
// Hand-written: two people at work (Part 3) or one speaker (Part 4) — a
// voicemail, an announcement, an introduction, an ad — each with three
// questions. As on the test, the questions and options are printed and the
// talk is only heard; the transcript shows once every question is answered.
// Some sets come with a graphic (a price list, a timetable…) printed beside the
// questions, and one question needs both: "Look at the graphic.".

/** W and M take turns in a conversation; N is the one speaker of a talk. */
export type Speaker = 'W' | 'M' | 'N'

export interface TalkSet {
  id: string
  part: 3 | 4
  lines: { speaker: Speaker; text: string }[]
  /** A small table printed with the questions; its first row is the header. */
  graphic?: { title: string; rows: string[][] }
  questions: ReadingQuestion[]
}

const w = (text: string) => ({ speaker: 'W' as const, text })
const m = (text: string) => ({ speaker: 'M' as const, text })
const n = (text: string) => ({ speaker: 'N' as const, text })

export const TALK_SETS: readonly TalkSet[] = [
  // ---------------------------------------------------------------- Part 3
  {
    id: 'p3-printer',
    part: 3,
    lines: [
      w('Hi, Tom. The printer on our floor stopped working again. Do you know who I should call?'),
      m(
        'You can call the IT help desk at extension 214. But they are busy this morning because of the system update.'
      ),
      w('Hmm. I need to print the contracts for my two o’clock meeting.'),
      m('Why don’t you use the printer on the third floor? It’s usually free before lunch.'),
    ],
    questions: [
      {
        q: 'What problem does the woman mention?',
        options: [
          'A printer is not working.',
          'She missed a meeting.',
          'Her computer needs an update.',
          'A contract was lost.',
        ],
        why: 'Câu đầu: "The printer on our floor stopped working again." Vấn đề thường được nêu ngay đầu hội thoại.',
      },
      {
        q: 'Why is the help desk busy?',
        options: [
          'Because of a system update',
          'Because the staff are in a meeting',
          'Because it is lunchtime',
          'Because they are moving offices',
        ],
        why: '"They are busy this morning because of the system update."',
      },
      {
        q: 'What does the man suggest?',
        options: [
          'Using a printer on another floor',
          'Calling back after lunch',
          'Moving the meeting',
          'Buying a new printer',
        ],
        why: '"Why don’t you use the printer on the third floor?" Why don’t you… là lời gợi ý.',
      },
    ],
  },
  {
    id: 'p3-hotel',
    part: 3,
    lines: [
      m('Good afternoon, Lakeview Hotel. How can I help you?'),
      w(
        'Hi. I’d like to book a room for two nights, from March third. My company is holding a conference near your hotel.'
      ),
      m(
        'Let me check. We have a standard room for one hundred twenty dollars a night, and a business room with a desk and free breakfast for one hundred fifty.'
      ),
      w('I’ll take the business room. Does the hotel have a shuttle to the convention center?'),
      m('Yes, it leaves every thirty minutes from the front entrance.'),
    ],
    questions: [
      {
        q: 'Why is the woman traveling?',
        options: [
          'To attend a conference',
          'To visit her family',
          'To start a new job',
          'To look at an apartment',
        ],
        why: '"My company is holding a conference near your hotel."',
      },
      {
        q: 'How much will the woman pay per night?',
        options: ['$150', '$120', '$30', '$270'],
        why: 'Cô ấy chọn "the business room", giá 150 đô một đêm. 120 là giá phòng thường; 30 là số phút của xe đưa đón.',
      },
      {
        q: 'What does the man say about the shuttle?',
        options: [
          'It leaves every 30 minutes.',
          'It costs extra.',
          'It must be booked in advance.',
          'It also goes to the airport.',
        ],
        why: '"It leaves every thirty minutes from the front entrance."',
      },
    ],
  },
  {
    id: 'p3-sales',
    part: 3,
    lines: [
      w('Kevin, have you seen the sales figures for October?'),
      m(
        'Yes. Sales of our new coffee machine went up fifteen percent, but the older model isn’t selling well.'
      ),
      w('Maybe we should offer a discount on the older model before the holidays.'),
      m('Good idea. I’ll prepare a proposal and send it to the director by Thursday.'),
    ],
    questions: [
      {
        q: 'What are the speakers discussing?',
        options: ['Sales results', 'A job interview', 'A holiday trip', 'A broken machine'],
        why: 'Họ nói về "sales figures for October": kết quả bán hàng.',
      },
      {
        q: 'What does the woman suggest?',
        options: [
          'Lowering the price of a product',
          'Stopping production of a model',
          'Hiring more staff',
          'Opening a new store',
        ],
        why: '"Offer a discount on the older model" được diễn đạt lại thành "lowering the price". Đáp án Part 3 hay dùng từ khác với lời thoại.',
      },
      {
        q: 'What will the man do by Thursday?',
        options: ['Send a proposal', 'Visit a store', 'Order coffee machines', 'Meet a client'],
        why: '"I’ll prepare a proposal and send it to the director by Thursday."',
      },
    ],
  },
  {
    id: 'p3-move',
    part: 3,
    lines: [
      m('Hi, Sarah. I heard our department is moving to the new building next month.'),
      w(
        'That’s right. The move is planned for the weekend of the fourteenth, so we won’t lose any working days.'
      ),
      m('Will we need to pack our own things?'),
      w('Yes. The moving company will bring boxes on Wednesday. Just write your name on each box.'),
    ],
    questions: [
      {
        q: 'What will happen next month?',
        options: [
          'The department will move.',
          'New staff will join the team.',
          'The building will be renovated.',
          'A conference will be held.',
        ],
        why: '"Our department is moving to the new building next month."',
      },
      {
        q: 'Why is the move planned for a weekend?',
        options: [
          'To avoid losing working days',
          'Because it is cheaper',
          'Because the staff asked for it',
          'Because the building is closed on weekdays',
        ],
        why: '"…so we won’t lose any working days."',
      },
      {
        q: 'What should the man write on his boxes?',
        options: [
          'His name',
          'His new office number',
          'The moving date',
          'The name of his department',
        ],
        why: '"Just write your name on each box."',
      },
    ],
  },

  {
    id: 'p3-client-lunch',
    part: 3,
    lines: [
      m(
        'Hi, I’d like to reserve a table for six people this Friday at noon. It’s a business lunch with some clients.'
      ),
      w('Certainly. We have a private room available at that time. Would you like that?'),
      m(
        'Yes, that would be perfect. Also, one of my clients doesn’t eat meat. Do you have vegetarian dishes?'
      ),
      w(
        'Yes, we have several. I’ll note it on your reservation, and the chef can suggest a special dish.'
      ),
    ],
    questions: [
      {
        q: 'Why is the man calling?',
        options: [
          'To book a table',
          'To complain about a meal',
          'To order food for delivery',
          'To apply for a job',
        ],
        why: '"I’d like to reserve a table for six people": đặt bàn.',
      },
      {
        q: 'What does the woman offer?',
        options: ['A private room', 'A discount', 'A free dessert', 'A later time'],
        why: '"We have a private room available at that time. Would you like that?"',
      },
      {
        q: 'What does the man say about one of his clients?',
        options: [
          'The client does not eat meat.',
          'The client will be late.',
          'The client is a chef.',
          'The client wants to change the date.',
        ],
        why: '"One of my clients doesn’t eat meat": khách ăn chay.',
      },
    ],
  },
  {
    id: 'p3-rental-car',
    part: 3,
    lines: [
      w('Hello, I booked a rental car for this morning. My name is Ana Silva.'),
      m(
        'Welcome, Ms. Silva. Here is your key. The car is in space fourteen in the parking garage.'
      ),
      w('Thanks. I’ll be driving to a meeting in Riverside. Is there a map in the car?'),
      m(
        'The car has a navigation system. And please remember to return it with a full tank of gas, or there will be an extra charge.'
      ),
    ],
    questions: [
      {
        q: 'Where most likely are the speakers?',
        options: ['At a car rental office', 'At a gas station', 'At a hotel', 'At a train station'],
        why: 'Có "rental car", chìa khoá xe, chỗ đậu: quầy cho thuê xe. Câu "most likely" cần suy ra từ các chi tiết.',
      },
      {
        q: 'Why is the woman traveling?',
        options: ['To attend a meeting', 'To go on vacation', 'To visit a friend', 'To buy a car'],
        why: '"I’ll be driving to a meeting in Riverside."',
      },
      {
        q: 'What does the man remind the woman to do?',
        options: [
          'Fill up the gas tank before returning the car',
          'Park in space fourteen',
          'Return the map',
          'Pay the extra charge now',
        ],
        why: '"Please remember to return it with a full tank of gas." Số 14 là chỗ xe đang đậu.',
      },
    ],
  },
  {
    id: 'p3-website',
    part: 3,
    lines: [
      m('Jenny, how is the website redesign going? The client wants to see it on Monday.'),
      w('It’s mostly finished, but we’re still waiting for the photos from the photographer.'),
      m('Hmm. Could we use some photos from our own library for now?'),
      w('Good idea. I’ll pick a few this afternoon and replace them when the new ones arrive.'),
    ],
    questions: [
      {
        q: 'What are the speakers discussing?',
        options: ['A website redesign', 'A photo exhibition', 'An office move', 'A product launch'],
        why: '"How is the website redesign going?"',
      },
      {
        q: 'What problem does the woman mention?',
        options: [
          'Some photos have not arrived.',
          'The client has canceled.',
          'The budget is too small.',
          'A team member is sick.',
        ],
        why: '"We’re still waiting for the photos from the photographer."',
      },
      {
        q: 'What will the woman do this afternoon?',
        options: [
          'Choose some photos',
          'Call the client',
          'Meet the photographer',
          'Finish a report',
        ],
        why: '"I’ll pick a few this afternoon": pick = choose.',
      },
    ],
  },
  {
    id: 'p3-interview',
    part: 3,
    lines: [
      w(
        'Hello, this is Karen from Bright Solutions. I’m calling about your application for the accountant position.'
      ),
      m('Oh, thank you for calling.'),
      w('We’d like to invite you for an interview. Are you available next Tuesday at ten?'),
      m('I’m afraid I have a class on Tuesday mornings. Would Tuesday afternoon work?'),
      w('Sure. How about two o’clock? Please bring copies of your certificates.'),
    ],
    questions: [
      {
        q: 'Why is the woman calling?',
        options: [
          'To arrange an interview',
          'To offer a job',
          'To cancel a meeting',
          'To ask for a payment',
        ],
        why: '"We’d like to invite you for an interview." Chưa phải là nhận việc.',
      },
      {
        q: 'Why can’t the man come on Tuesday morning?',
        options: [
          'He has a class.',
          'He is traveling.',
          'He is working.',
          'He has a doctor’s appointment.',
        ],
        why: '"I have a class on Tuesday mornings."',
      },
      {
        q: 'What should the man bring?',
        options: ['Copies of his certificates', 'A photo', 'His laptop', 'A reference letter'],
        why: '"Please bring copies of your certificates."',
      },
    ],
  },

  {
    id: 'p3-catering-graphic',
    part: 3,
    graphic: {
      title: 'Lunch Box Catering — Price List',
      rows: [
        ['Item', 'Serves', 'Price'],
        ['Sandwich platter', '10', '$40'],
        ['Salad bowl', '8', '$25'],
        ['Fruit tray', '12', '$30'],
        ['Dessert box', '12', '$35'],
      ],
    },
    lines: [
      w(
        'Hi, Mark. I’m ordering lunch for Friday’s training session. We already have sandwiches. What else should we get?'
      ),
      m('How about a fruit tray? It’s healthy, and it serves twelve people.'),
      w(
        'Good idea, but Ken from accounting is allergic to some fruits. Maybe we should get something sweet instead.'
      ),
      m('Sure, that works. Can you place the order today? They need two days’ notice.'),
    ],
    questions: [
      {
        q: 'What event are the speakers preparing for?',
        options: ['A training session', 'A retirement party', 'A client visit', 'A job interview'],
        why: '"I’m ordering lunch for Friday’s training session."',
      },
      {
        q: 'Look at the graphic. How much will the woman most likely pay for the extra item?',
        options: ['$35', '$30', '$25', '$40'],
        why: 'Ghép lời nói với bảng: bỏ khay trái cây vì Ken dị ứng, chọn "something sweet" là Dessert box, giá $35. Câu hỏi graphic không bao giờ nhắc thẳng tên món: phải đổi từ "sweet" sang "Dessert".',
      },
      {
        q: 'Why does the man ask the woman to order today?',
        options: [
          'The company needs two days’ notice.',
          'Prices will go up tomorrow.',
          'He will be away on Friday.',
          'The training was moved earlier.',
        ],
        why: '"They need two days’ notice." They ở đây là công ty suất ăn.',
      },
    ],
  },
  {
    id: 'p3-train-graphic',
    part: 3,
    graphic: {
      title: 'Trains to Riverton',
      rows: [
        ['Departs', 'Type', 'Arrives'],
        ['9:10', 'Express', '10:30'],
        ['9:40', 'Local', '11:20'],
        ['10:05', 'Express', '11:25'],
        ['10:30', 'Local', '12:10'],
      ],
    },
    lines: [
      m(
        'Anna, our meeting with the client in Riverton starts at eleven thirty. Shall we take the nine ten train?'
      ),
      w(
        'I just checked online, and it’s sold out. But the station is right next to their office, so we only need to arrive before the meeting starts.'
      ),
      m('Then let’s take the express after that. It’s faster than the local trains.'),
      w('Great. I’ll buy the tickets now and send them to your phone.'),
    ],
    questions: [
      {
        q: 'Why are the speakers going to Riverton?',
        options: [
          'To meet a client',
          'To visit a factory',
          'To attend a conference',
          'To look at an office',
        ],
        why: '"our meeting with the client in Riverton starts at eleven thirty."',
      },
      {
        q: 'Look at the graphic. What time will the speakers’ train leave?',
        options: ['10:05', '9:10', '9:40', '10:30'],
        why: 'Chuyến 9:10 hết vé; "the express after that" là chuyến Express kế tiếp, 10:05, tới 11:25, kịp trước 11:30. Chuyến 9:40 là tàu Local.',
      },
      {
        q: 'What will the woman do next?',
        options: [
          'Buy the tickets',
          'Call the client',
          'Print a timetable',
          'Change the meeting time',
        ],
        why: '"I’ll buy the tickets now and send them to your phone." Câu hỏi "do next" thường trả lời ở câu cuối.',
      },
    ],
  },
  // ---------------------------------------------------------------- Part 4
  {
    id: 'p4-dentist',
    part: 4,
    lines: [
      n(
        'Hello, this is Rachel from Doctor Lee’s dental clinic, calling for Mr. James Wilson. I’m calling to remind you of your appointment tomorrow at ten thirty a.m.'
      ),
      n(
        'Please arrive ten minutes early to fill in a short form. If you need to change the time, call us at 555-0182 before five p.m. today. Thank you.'
      ),
    ],
    questions: [
      {
        q: 'Why is the speaker calling?',
        options: [
          'To remind the listener of an appointment',
          'To cancel an appointment',
          'To ask for a payment',
          'To offer a job',
        ],
        why: '"I’m calling to remind you of your appointment." Câu đầu của tin nhắn thoại thường nói mục đích.',
      },
      {
        q: 'What is the listener asked to do?',
        options: [
          'Arrive early',
          'Bring an insurance card',
          'Pay in advance',
          'Call back tomorrow',
        ],
        why: '"Please arrive ten minutes early to fill in a short form."',
      },
      {
        q: 'By when should the listener call to change the time?',
        options: ['Before 5 p.m. today', 'Tomorrow morning', 'Before 10:30 a.m.', 'At any time'],
        why: '"Call us … before five p.m. today."',
      },
    ],
  },
  {
    id: 'p4-flight',
    part: 4,
    lines: [
      n(
        'Attention, passengers on Flight 728 to Hanoi. Because of heavy rain, the departure time has been changed from three fifteen to four forty-five p.m.'
      ),
      n(
        'The flight will now leave from Gate 12 instead of Gate 8. Passengers can get a meal voucher at the information desk. We apologize for the delay.'
      ),
    ],
    questions: [
      {
        q: 'What has caused the delay?',
        options: ['Bad weather', 'A technical problem', 'A late crew', 'A busy runway'],
        why: '"Because of heavy rain": heavy rain được diễn đạt lại là bad weather.',
      },
      {
        q: 'What else has changed?',
        options: ['The gate', 'The destination', 'The airline', 'The seat numbers'],
        why: '"Gate 12 instead of Gate 8": cửa ra máy bay đã đổi.',
      },
      {
        q: 'What can passengers get at the information desk?',
        options: ['A meal voucher', 'A new ticket', 'A free upgrade', 'A hotel room'],
        why: '"Passengers can get a meal voucher at the information desk."',
      },
    ],
  },
  {
    id: 'p4-new-colleague',
    part: 4,
    lines: [
      n(
        'Good morning, everyone. Before we start today’s meeting, I’d like to introduce Laura Chen, who joined our marketing team this week.'
      ),
      n(
        'Laura worked for five years at an advertising agency in Singapore, and she will lead our new online campaign. Please stop by her desk on the second floor to say hello. Now, let’s look at this month’s budget.'
      ),
    ],
    questions: [
      {
        q: 'What is the purpose of the talk?',
        options: [
          'To introduce a new colleague',
          'To announce a promotion',
          'To explain a new budget rule',
          'To plan a trip to Singapore',
        ],
        why: '"I’d like to introduce Laura Chen, who joined our marketing team this week."',
      },
      {
        q: 'Where did Laura work before?',
        options: ['At an advertising agency', 'At a bank', 'At a hotel', 'At a university'],
        why: '"Laura worked for five years at an advertising agency in Singapore."',
      },
      {
        q: 'What will the speaker talk about next?',
        options: [
          'The monthly budget',
          'The online campaign',
          'A visit to Singapore',
          'The new office',
        ],
        why: 'Câu cuối "Now, let’s look at this month’s budget." Câu hỏi "next" thường có đáp án ở cuối bài.',
      },
    ],
  },
  {
    id: 'p4-bank-app',
    part: 4,
    lines: [
      n(
        'Are you tired of long lines at the bank? With Greenleaf Bank’s new mobile app, you can pay bills, transfer money and check your balance anytime, anywhere.'
      ),
      n(
        'Download the app this month and get a twenty-dollar bonus in your account. Visit greenleafbank.com to learn more.'
      ),
    ],
    questions: [
      {
        q: 'What is being advertised?',
        options: ['A mobile banking app', 'A new bank branch', 'A credit card', 'An online store'],
        why: '"Greenleaf Bank’s new mobile app."',
      },
      {
        q: 'According to the speaker, what can users do with the product?',
        options: ['Pay bills', 'Book flights', 'Buy groceries', 'Apply for a job'],
        why: '"You can pay bills, transfer money and check your balance."',
      },
      {
        q: 'How can listeners get a bonus?',
        options: [
          'By downloading the app this month',
          'By opening a second account',
          'By visiting a branch',
          'By inviting a friend',
        ],
        why: '"Download the app this month and get a twenty-dollar bonus."',
      },
    ],
  },
  {
    id: 'p4-store-sale',
    part: 4,
    lines: [
      n(
        'Attention, shoppers. For the next two hours, all winter jackets on the second floor are forty percent off.'
      ),
      n(
        'And today only, customers who spend more than one hundred dollars will receive a free scarf. Our store closes at nine p.m. tonight. Thank you for shopping at Westfield Department Store.'
      ),
    ],
    questions: [
      {
        q: 'Where is the announcement being made?',
        options: ['In a department store', 'At an airport', 'In a restaurant', 'In a museum'],
        why: '"Attention, shoppers" và "Westfield Department Store".',
      },
      {
        q: 'What is on sale?',
        options: ['Winter jackets', 'Scarves', 'Shoes', 'Furniture'],
        why: '"All winter jackets … are forty percent off." Khăn là quà tặng, không phải hàng giảm giá.',
      },
      {
        q: 'How can customers get a free scarf?',
        options: [
          'By spending more than $100',
          'By buying a jacket',
          'By signing up for a card',
          'By shopping before 9 p.m.',
        ],
        why: '"Customers who spend more than one hundred dollars will receive a free scarf."',
      },
    ],
  },
  {
    id: 'p4-walking-tour',
    part: 4,
    lines: [
      n(
        'Welcome to the Old Town walking tour. I’m Mark, and I’ll be your guide today. The tour lasts about two hours.'
      ),
      n(
        'We’ll start at the city museum, then visit the old market and finish at the river, where you can take a boat ride if you like. The boat ride is not included in the tour price, so please buy tickets at the pier.'
      ),
    ],
    questions: [
      {
        q: 'Who is the speaker?',
        options: ['A tour guide', 'A museum guard', 'A boat driver', 'A shop owner'],
        why: '"I’ll be your guide today."',
      },
      {
        q: 'Where will the tour end?',
        options: ['At the river', 'At the city museum', 'At the old market', 'At a hotel'],
        why: '"…and finish at the river." Bảo tàng là nơi bắt đầu.',
      },
      {
        q: 'What does the speaker say about the boat ride?',
        options: [
          'It costs extra.',
          'It is free.',
          'It has been canceled.',
          'It starts at the museum.',
        ],
        why: '"The boat ride is not included in the tour price": phải trả thêm.',
      },
    ],
  },
  {
    id: 'p4-friday-home',
    part: 4,
    lines: [
      n(
        'Hi team, this is Greg. I just wanted to let you know that starting next week, our department will try a new schedule. Every Friday, you can choose to work from home.'
      ),
      n(
        'Please tell your supervisor by Wednesday if you plan to do so, and make sure your laptop has the latest security update. Thanks, and have a good weekend.'
      ),
    ],
    questions: [
      {
        q: 'What is the message mainly about?',
        options: [
          'A new work schedule',
          'A sale on laptops',
          'A weekend party',
          'A new supervisor',
        ],
        why: '"Our department will try a new schedule."',
      },
      {
        q: 'What can employees do on Fridays?',
        options: ['Work from home', 'Leave early', 'Wear casual clothes', 'Attend training'],
        why: '"Every Friday, you can choose to work from home."',
      },
      {
        q: 'What must employees do by Wednesday?',
        options: [
          'Tell their supervisor',
          'Return their laptops',
          'Sign a contract',
          'Choose a new desk',
        ],
        why: '"Please tell your supervisor by Wednesday if you plan to do so."',
      },
    ],
  },
  {
    id: 'p4-traffic',
    part: 4,
    lines: [
      n(
        'Good morning, this is the eight o’clock traffic report. Highway 9 is very busy this morning because of road repairs near the city bridge. Drivers should take Park Avenue instead.'
      ),
      n(
        'Also, heavy rain is expected this afternoon, so please drive carefully. Our next report will be at eight thirty, right after the business news.'
      ),
    ],
    questions: [
      {
        q: 'What is causing the traffic on Highway 9?',
        options: ['Road repairs', 'An accident', 'Heavy rain', 'A sports event'],
        why: '"…because of road repairs near the city bridge." Mưa là dự báo cho buổi chiều.',
      },
      {
        q: 'What does the speaker suggest?',
        options: [
          'Using a different road',
          'Taking the train',
          'Leaving work later',
          'Staying at home',
        ],
        why: '"Drivers should take Park Avenue instead": đi đường khác.',
      },
      {
        q: 'What will be broadcast just before the next traffic report?',
        options: ['The business news', 'The weather forecast', 'Some music', 'An interview'],
        why: '"Our next report will be at eight thirty, right after the business news."',
      },
    ],
  },
  {
    id: 'p4-rooms-graphic',
    part: 4,
    graphic: {
      title: 'Hamilton Conference Center',
      rows: [
        ['Room', 'Location'],
        ['101', 'Next to the cafeteria'],
        ['102', 'By the elevators'],
        ['201', 'Second floor, east side'],
        ['202', 'Second floor, west side'],
      ],
    },
    lines: [
      n(
        'Good morning, everyone, and welcome to the regional sales conference. Before we begin, I have a quick change to announce.'
      ),
      n(
        'The finance workshop was planned for the room by the elevators, but the projector there isn’t working. So the workshop will now be held in the room next to the cafeteria.'
      ),
      n(
        'Also, lunch will be served at twelve thirty instead of twelve. Please remember to wear your name badge at all times.'
      ),
    ],
    questions: [
      {
        q: 'Who most likely are the listeners?',
        options: ['Conference attendees', 'Hotel guests', 'New employees', 'Cafeteria staff'],
        why: '"welcome to the regional sales conference." Người nghe là người dự hội nghị.',
      },
      {
        q: 'Look at the graphic. Where will the finance workshop be held?',
        options: ['Room 101', 'Room 102', 'Room 201', 'Room 202'],
        why: 'Hội thảo chuyển tới "the room next to the cafeteria", trong bảng là phòng 101. Phòng 102 (by the elevators) là phòng cũ: bẫy nghe thấy trước.',
      },
      {
        q: 'What change is made to lunch?',
        options: [
          'It will start later.',
          'It will be served in Room 202.',
          'It will be free for speakers.',
          'It has been canceled.',
        ],
        why: '"lunch will be served at twelve thirty instead of twelve": muộn hơn nửa tiếng.',
      },
    ],
  },
  {
    id: 'p4-picnic-graphic',
    part: 4,
    graphic: {
      title: 'Weather Forecast',
      rows: [
        ['Day', 'Weather'],
        ['Monday', 'Sunny'],
        ['Tuesday', 'Rain'],
        ['Wednesday', 'Sunny, strong wind'],
        ['Thursday', 'Cloudy, light wind'],
      ],
    },
    lines: [
      n('Hi, this is Julia from the events team with an update about the company picnic.'),
      n(
        'As you know, the picnic was planned for Tuesday, but rain is expected all day. We’ve decided to move it to the first day after that with no rain and only light wind, since we’ll be setting up tents.'
      ),
      n(
        'The start time stays the same, eleven A.M. If you signed up to bring a dish, please let me know by Monday whether you can still come.'
      ),
    ],
    questions: [
      {
        q: 'What is the purpose of the message?',
        options: [
          'To announce a change of date',
          'To invite people to sign up',
          'To ask for help with tents',
          'To cancel an event',
        ],
        why: 'Buổi picnic được dời ngày vì mưa. Mục đích là báo thay đổi, không phải huỷ.',
      },
      {
        q: 'Look at the graphic. On which day will the picnic be held?',
        options: ['Thursday', 'Wednesday', 'Tuesday', 'Monday'],
        why: 'Sau thứ Ba, ngày đầu tiên không mưa và chỉ gió nhẹ là thứ Năm. Thứ Tư nắng nhưng gió mạnh, không dựng lều được.',
      },
      {
        q: 'What are some listeners asked to do by Monday?',
        options: [
          'Say whether they can still come',
          'Pay for their tickets',
          'Choose a new start time',
          'Bring a tent',
        ],
        why: '"If you signed up to bring a dish, please let me know by Monday whether you can still come."',
      },
    ],
  },
]

/** A set of the part, not the one just done when there is another. */
export function pickTalk(part: 3 | 4, lastId?: string, rand: () => number = Math.random): TalkSet {
  const all = TALK_SETS.filter((s) => s.part === part)
  const pool = all.length > 1 ? all.filter((s) => s.id !== lastId) : all
  return pool[Math.floor(rand() * pool.length)]
}
