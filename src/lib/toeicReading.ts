// TOEIC Part 6 ("Text completion") and Part 7 ("Reading comprehension"),
// docs/design/toeic.md. Hand-written workplace texts: an email, a notice, an
// ad, a text-message chat… Part 6 texts carry four gaps written [1]–[4], one of
// them for a whole sentence; Part 7 sets have one passage or two linked ones,
// and a question on a pair needs a detail from each. Every answer is explained
// in Vietnamese.

type Pair = [vi: string, en: string]

export interface ReadingQuestion {
  /** The question; empty for a Part 6 gap, which is named by its number. */
  q: string
  /** The right option first; rounds shuffle them. */
  options: [string, string, string, string]
  why: string
}

export interface ReadingSet {
  id: string
  part: 6 | 7
  passages: { kind: Pair; text: string }[]
  questions: ReadingQuestion[]
}

const EMAIL: Pair = ['Email', 'Email']
const NOTICE: Pair = ['Thông báo', 'Notice']
const AD: Pair = ['Quảng cáo', 'Advertisement']
const CHAT: Pair = ['Tin nhắn', 'Text messages']
const INVOICE: Pair = ['Hoá đơn', 'Invoice']
const SCHEDULE: Pair = ['Lịch đặt phòng', 'Room schedule']
const JOB: Pair = ['Tin tuyển dụng', 'Job advertisement']
const LETTER: Pair = ['Thư', 'Letter']

const gap = (options: [string, string, string, string], why: string): ReadingQuestion => ({
  q: '',
  options,
  why,
})

export const READING_SETS: readonly ReadingSet[] = [
  // ---------------------------------------------------------------- Part 6
  {
    id: 'p6-parking',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: All staff
From: Linda Park, Office Manager
Subject: Parking lot repairs

Starting next Monday, the east parking lot will be closed [1] repairs. The work is expected to take about two weeks. [2] During this time, staff may park in the west lot or at the public garage on Pine Street. The company will [3] the cost of parking at the garage. Please keep your receipts and give them to the accounting department at the end of the month.

Thank you for your [4].`,
      },
    ],
    questions: [
      gap(
        ['for', 'from', 'with', 'by'],
        'closed for repairs: đóng cửa để sửa chữa. for chỉ mục đích.'
      ),
      gap(
        [
          'We apologize for any inconvenience this may cause.',
          'The new parking lot opened last year.',
          'Please park in the east lot as usual.',
          'Our office will move to Pine Street.',
        ],
        'Câu xin lỗi vì sự bất tiện hợp với tin bãi xe đóng cửa. "Park in the east lot as usual" trái với nội dung; hai câu còn lại không liên quan.'
      ),
      gap(
        ['reimburse', 'reimbursed', 'reimbursement', 'reimbursing'],
        'Sau will cần động từ nguyên mẫu: will reimburse (sẽ hoàn trả). Câu sau nhắc giữ hoá đơn, đúng với việc hoàn tiền.'
      ),
      gap(
        ['patience', 'patient', 'patiently', 'patients'],
        'Sau tính từ sở hữu your cần danh từ: patience (sự kiên nhẫn). patients là bệnh nhân.'
      ),
    ],
  },
  {
    id: 'p6-rooftop',
    part: 6,
    passages: [
      {
        kind: AD,
        text: `Greenfield Hotel is pleased to announce that our newly [1] rooftop restaurant will open on May 1. Guests can enjoy [2] views of the city while tasting dishes made with fresh local ingredients. [3]

To celebrate the opening, all hotel guests will receive a 20 percent discount on dinner throughout May. Reservations are [4] and can be made at the front desk or on our website.`,
      },
    ],
    questions: [
      gap(
        ['renovated', 'renovate', 'renovation', 'renovating'],
        'newly + quá khứ phân từ làm tính từ: newly renovated (mới được cải tạo).'
      ),
      gap(
        ['amazing', 'amaze', 'amazingly', 'amazement'],
        'Đứng trước danh từ views cần tính từ: amazing views (cảnh đẹp tuyệt).'
      ),
      gap(
        [
          'The restaurant is open from 6 p.m. to 11 p.m. every day.',
          'The hotel was built in 1990.',
          'Breakfast is not included in the room rate.',
          'Our chef has recently left the company.',
        ],
        'Đoạn đang giới thiệu nhà hàng mới, nên câu về giờ mở cửa hợp mạch nhất. Câu về đầu bếp nghỉ việc đi ngược ý quảng cáo.'
      ),
      gap(
        ['recommended', 'recommend', 'recommending', 'recommendation'],
        'are + quá khứ phân từ là câu bị động: Reservations are recommended (nên đặt bàn trước).'
      ),
    ],
  },
  {
    id: 'p6-chairs',
    part: 6,
    passages: [
      {
        kind: LETTER,
        text: `Dear Mr. Alvarez,

Thank you for your order of 50 office chairs. Unfortunately, the model you selected is [1] out of stock. We expect a new shipment [2] the end of the month. [3]

If you prefer not to wait, we can offer a similar model at the same price. Please [4] us know your decision by Friday so that we can process your order.

Sincerely,
Karen Lee, Customer Service`,
      },
    ],
    questions: [
      gap(
        ['temporarily', 'temporary', 'temporariness', 'temporaries'],
        'Bổ nghĩa cho cụm out of stock cần trạng từ: temporarily out of stock (tạm hết hàng).'
      ),
      gap(
        ['by', 'since', 'during', 'between'],
        'by the end of the month: chậm nhất là cuối tháng.'
      ),
      gap(
        [
          'We will send your chairs as soon as they arrive.',
          'Your order has already been delivered.',
          'Thank you for applying for the position.',
          'This model is no longer produced.',
        ],
        'Hàng sắp về nên câu hứa gửi ngay khi hàng đến là hợp. "Already been delivered" trái với "out of stock"; "no longer produced" trái với "new shipment".'
      ),
      gap(
        ['let', 'make', 'have', 'allow'],
        'let somebody know: báo cho ai biết. allow phải đi với to (allow us to know).'
      ),
    ],
  },
  {
    id: 'p6-bank-job',
    part: 6,
    passages: [
      {
        kind: JOB,
        text: `Westbridge Bank is looking for experienced customer service [1] to join its downtown branch. Successful candidates will answer customer questions, open new accounts and [2] our online banking services. [3]

Applicants should have at least two years of experience in a similar position. To apply, please send your CV and a cover letter to jobs@westbridgebank.com [4] March 31.`,
      },
    ],
    questions: [
      gap(
        ['representatives', 'represent', 'representation', 'represented'],
        'Ngân hàng tìm người: customer service representatives (nhân viên chăm sóc khách hàng), số nhiều.'
      ),
      gap(
        ['explain', 'explains', 'explaining', 'explained'],
        'Song song với answer và open sau will: động từ nguyên mẫu explain.'
      ),
      gap(
        [
          'The position offers a competitive salary and health insurance.',
          'The bank closed its downtown branch last year.',
          'Customers can now pay their bills by phone.',
          'Thank you for your recent application.',
        ],
        'Tin tuyển dụng thường nói quyền lợi của vị trí. Câu về chi nhánh đã đóng cửa mâu thuẫn với việc tuyển người cho chi nhánh đó.'
      ),
      gap(
        ['before', 'until', 'among', 'while'],
        'Hạn nộp: before March 31 (trước ngày 31/3). until dùng cho việc kéo dài đến mốc đó; while cần một mệnh đề.'
      ),
    ],
  },

  {
    id: 'p6-training',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `MEMO
To: Sales staff
From: Paul Nguyen, IT Department

Our new customer database will be [1] on Monday, May 15. To help everyone get used to the system, we will hold two training sessions next week. [2] Each session lasts about an hour and takes place in Meeting Room 4.

Please complete the [3] form on the company intranet by Friday. Staff who cannot attend either session should contact me [4] so that we can arrange another time.`,
      },
    ],
    questions: [
      gap(
        ['launched', 'launch', 'launching', 'launches'],
        'will be + quá khứ phân từ là bị động: will be launched (sẽ được đưa vào dùng).'
      ),
      gap(
        [
          'The first is on Tuesday at 10 a.m., and the second is on Thursday at 2 p.m.',
          'The old database has worked well for many years.',
          'Please bring your laptop to the holiday party.',
          'Sales increased by 10 percent last quarter.',
        ],
        'Câu trước nói có hai buổi đào tạo; câu nêu giờ của hai buổi nối tiếp tự nhiên nhất.'
      ),
      gap(
        ['registration', 'register', 'registered', 'registering'],
        'Danh từ ghép: registration form (phiếu đăng ký). Sau the và trước form cần danh từ bổ nghĩa.'
      ),
      gap(
        ['directly', 'direct', 'direction', 'directed'],
        'Bổ nghĩa cho động từ contact: trạng từ directly (liên hệ trực tiếp).'
      ),
    ],
  },
  {
    id: 'p6-broken-handle',
    part: 6,
    passages: [
      {
        kind: LETTER,
        text: `Dear Ms. Patel,

Thank you for [1] us about the problem with your recent order. We are sorry that the coffee maker arrived with a broken handle. [2]

A replacement has already been sent and should reach you [3] three business days. Please keep the damaged item; there is no need to return it. We value your business and hope you will [4] to shop with us.

Sincerely,
Brian Ortiz, Customer Care`,
      },
    ],
    questions: [
      gap(
        ['contacting', 'contact', 'contacted', 'contacts'],
        'Thank you for + V-ing: cảm ơn vì đã liên hệ.'
      ),
      gap(
        [
          'We have confirmed that the item was damaged during shipping.',
          'Our store will close early on Friday.',
          'We are pleased that you enjoyed the product.',
          'Please send us your payment as soon as possible.',
        ],
        'Sau lời xin lỗi về món hàng hỏng, câu xác nhận nguyên nhân là hợp. "Enjoyed the product" mâu thuẫn với việc hàng bị hỏng.'
      ),
      gap(
        ['within', 'since', 'among', 'until'],
        'within three business days: trong vòng ba ngày làm việc.'
      ),
      gap(
        ['continue', 'continued', 'continuing', 'continuation'],
        'Sau will là động từ nguyên mẫu: continue to shop (tiếp tục mua sắm).'
      ),
    ],
  },
  {
    id: 'p6-promotion',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `Hanson Electronics is pleased to announce that Maria Gomez has been [1] to Director of Marketing. Ms. Gomez joined the company eight years ago as a sales assistant. [2]

Under her leadership, the marketing team launched three successful products and [3] the company's online sales. Ms. Gomez will begin her new role on July 1. Please join us in [4] her on this well-deserved promotion.`,
      },
    ],
    questions: [
      gap(
        ['promoted', 'promoting', 'promotion', 'promote'],
        'has been + quá khứ phân từ: has been promoted (đã được thăng chức).'
      ),
      gap(
        [
          'Since then, she has held several positions in sales and marketing.',
          'She plans to retire from the company next month.',
          'The company is now accepting applications for her position.',
          'The new store will open downtown in the spring.',
        ],
        'Câu trước kể cô ấy vào công ty từ vị trí trợ lý; câu kể các vị trí sau đó nối mạch. "Retire next month" mâu thuẫn với việc nhận vị trí mới.'
      ),
      gap(
        ['doubled', 'double', 'doubling', 'doubles'],
        'Song song với launched (quá khứ): launched … and doubled (tăng gấp đôi).'
      ),
      gap(
        ['congratulating', 'congratulate', 'congratulated', 'congratulations'],
        'join us in + V-ing: cùng chúng tôi chúc mừng cô ấy.'
      ),
    ],
  },
  {
    id: 'p6-elevators',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `NOTICE TO ALL TENANTS

The elevators in Building B will be [1] from 8 a.m. to 6 p.m. on Saturday, October 7, for regular maintenance. During this time, tenants must use the stairs. [2]

We understand that this may be [3] for some of you, especially those on the upper floors. If you need help moving heavy items that day, please [4] the building manager in advance.

Kingsley Property Management`,
      },
    ],
    questions: [
      gap(
        ['unavailable', 'available', 'availability', 'unavailably'],
        'Sau will be cần tính từ; thang máy đang bảo trì nên không dùng được: unavailable.'
      ),
      gap(
        [
          'The elevators in Building A will operate as usual.',
          'The building will be painted next year.',
          'Rent is due on the first day of each month.',
          'The stairs will also be closed for cleaning.',
        ],
        'Câu về thang máy toà A vẫn chạy bình thường hợp với thông báo. "Stairs will also be closed" mâu thuẫn với câu trước (phải đi thang bộ).'
      ),
      gap(
        ['inconvenient', 'inconvenience', 'inconveniently', 'convenience'],
        'be + tính từ: may be inconvenient (có thể bất tiện).'
      ),
      gap(
        ['notify', 'notification', 'notified', 'notifying'],
        'please + động từ nguyên mẫu: please notify the building manager (hãy báo cho quản lý toà nhà).'
      ),
    ],
  },

  // ------------------------------------------------------- Part 7, single
  {
    id: 'p7-kitchen',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `NOTICE

The 3rd-floor kitchen will be cleaned on Friday, June 9, from 2 p.m. to 5 p.m. Please remove all personal food items from the refrigerator by 1 p.m. on Friday. Any items left after that time will be thrown away.

Coffee and tea will be available in the 5th-floor kitchen during the cleaning.

Facilities Department`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the notice?',
        options: [
          'To announce a kitchen cleaning',
          'To introduce a new coffee machine',
          'To invite staff to a party',
          'To explain where to buy lunch',
        ],
        why: 'Câu đầu nói bếp tầng 3 sẽ được dọn vào thứ Sáu. Câu đầu của thông báo thường nêu mục đích.',
      },
      {
        q: 'What should staff do by 1 p.m. on Friday?',
        options: [
          'Take their food out of the refrigerator',
          'Clean the kitchen',
          'Order coffee and tea',
          'Contact the Facilities Department',
        ],
        why: '"Please remove all personal food items from the refrigerator by 1 p.m." Câu đúng diễn đạt lại bằng từ khác: remove → take out.',
      },
      {
        q: 'Where can staff get coffee on Friday afternoon?',
        options: [
          'In the 5th-floor kitchen',
          'In the 3rd-floor kitchen',
          'At a café across the street',
          'At the Facilities Department',
        ],
        why: '"Coffee and tea will be available in the 5th-floor kitchen during the cleaning."',
      },
    ],
  },
  {
    id: 'p7-flight',
    part: 7,
    passages: [
      {
        kind: EMAIL,
        text: `From: Daniel Cho
To: Maria Santos
Subject: Sales conference

Hi Maria,

I'm afraid I won't be able to give my presentation at the sales conference on Thursday. My flight from Singapore was canceled, and the earliest flight I could book arrives on Friday morning.

Could you present the quarterly results in my place? All the slides are in the shared folder, and I'll call you tomorrow to go over the main points.

Thanks,
Daniel`,
      },
    ],
    questions: [
      {
        q: 'Why did Daniel write the email?',
        options: [
          'To ask Maria to give a presentation for him',
          'To book a flight to Singapore',
          'To invite Maria to a conference',
          'To send Maria the sales figures',
        ],
        why: '"Could you present the quarterly results in my place?" Đây là lý do chính của email.',
      },
      {
        q: 'What is suggested about Daniel?',
        options: [
          'He is in Singapore now',
          'He will arrive on Wednesday',
          'He missed a meeting last week',
          'He works in the accounting department',
        ],
        why: 'Chuyến bay "from Singapore" bị huỷ, nên hiện anh ấy đang ở Singapore. Câu hỏi "suggested" cần suy ra, không có sẵn trong bài.',
      },
      {
        q: 'What will Daniel do tomorrow?',
        options: [
          'Call Maria',
          'Upload the slides',
          'Attend the conference',
          'Cancel the presentation',
        ],
        why: '"I\'ll call you tomorrow to go over the main points." Slide đã có sẵn trong thư mục chung.',
      },
    ],
  },
  {
    id: 'p7-brightway',
    part: 7,
    passages: [
      {
        kind: AD,
        text: `Brightway Office Supplies — Spring Sale!

30% off all printer paper and ink from April 1 to April 15.
Free delivery on orders over $100.
Members of our Business Club get an extra 5% off every order.

Not a member yet? Join for free at any of our stores or at brightway.com.`,
      },
    ],
    questions: [
      {
        q: 'What is being advertised?',
        options: [
          'A sale at an office supply store',
          'A new printer model',
          'A delivery company',
          'A business training course',
        ],
        why: 'Tiêu đề "Spring Sale" của Brightway Office Supplies: một đợt giảm giá văn phòng phẩm.',
      },
      {
        q: 'How can customers get free delivery?',
        options: [
          'By spending more than $100',
          'By joining the Business Club',
          'By ordering before April 1',
          'By buying printer ink',
        ],
        why: '"Free delivery on orders over $100." Gia nhập câu lạc bộ chỉ được giảm thêm 5%.',
      },
      {
        q: 'What is true about the Business Club?',
        options: [
          'It costs nothing to join',
          'It costs $100 a year',
          'Members can only order online',
          'Members get 30% off every order',
        ],
        why: '"Join for free": tham gia miễn phí, ở cửa hàng hoặc trên web. Thành viên được giảm thêm 5%, không phải 30%.',
      },
    ],
  },
  {
    id: 'p7-warehouse',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Ana Ruiz (9:12 A.M.): Hi Ben, are you still at the warehouse?
Ben Park (9:14 A.M.): Yes, I'm checking the new shipment now.
Ana Ruiz (9:15 A.M.): Great. Could you count the boxes of printer paper? The store says we're running low.
Ben Park (9:20 A.M.): There are only 12 boxes left. Should I order more?
Ana Ruiz (9:21 A.M.): Yes, please order 30 boxes from our usual supplier.
Ben Park (9:22 A.M.): Will do.`,
      },
    ],
    questions: [
      {
        q: 'Where is Ben?',
        options: ['At a warehouse', 'At the store', "At a supplier's office", 'At home'],
        why: 'Ana hỏi "are you still at the warehouse?", Ben trả lời "Yes".',
      },
      {
        q: 'At 9:22 A.M., what does Ben most likely mean when he writes, "Will do"?',
        options: [
          'He will place an order',
          'He will count the boxes again',
          'He will visit the store',
          'He will check the shipment later',
        ],
        why: '"Will do" = tôi sẽ làm, đáp lại lời nhờ ngay trước đó: đặt 30 thùng. Part 7 hay hỏi ý của một câu ngắn trong tin nhắn như vậy.',
      },
      {
        q: 'How many boxes of printer paper does Ana want Ben to order?',
        options: ['30', '12', '42', '18'],
        why: '"Please order 30 boxes." 12 là số thùng còn lại trong kho.',
      },
    ],
  },
  {
    id: 'p7-catering',
    part: 7,
    passages: [
      {
        kind: INVOICE,
        text: `Lakeside Catering — INVOICE #4471

Bill to: Hanson Accounting
Event: Staff lunch, May 18

Sandwich platters (6) ........ $180
Fruit trays (2) ............... $50
Beverages (30 people) ......... $60
Delivery ...................... $0

Total ......................... $290
Payment is due within 30 days. Thank you for your business!`,
      },
    ],
    questions: [
      {
        q: 'What kind of business is Lakeside?',
        options: [
          'A catering company',
          'An accounting firm',
          'A delivery service',
          'A supermarket',
        ],
        why: 'Tên Lakeside Catering và các món trong hoá đơn. Hanson Accounting là bên trả tiền.',
      },
      {
        q: 'What is indicated about the delivery?',
        options: ['It was free of charge', 'It cost $60', 'It was late', 'It was paid in advance'],
        why: 'Dòng Delivery ghi $0: giao hàng miễn phí. $60 là tiền đồ uống.',
      },
      {
        q: 'When must Hanson Accounting pay?',
        options: ['Within 30 days', 'On May 18', 'Before the lunch', 'Within a week'],
        why: '"Payment is due within 30 days."',
      },
    ],
  },

  // -------------------------------------------------------- Part 7, double
  {
    id: 'p7-rooms',
    part: 7,
    passages: [
      {
        kind: SCHEDULE,
        text: `Riverside Business Center — Room bookings, Wednesday

Room A (20 seats): 9:00–11:00, Marketing team meeting
Room B (8 seats): 10:00–12:00, Job interviews (Human Resources)
Room C (40 seats): 12:00–4:00, Training session for new staff`,
      },
      {
        kind: EMAIL,
        text: `From: Grace Kim, Human Resources
To: Office Manager
Subject: Room B on Wednesday

Hello,

The job interviews on Wednesday will take longer than planned, because we now have six candidates instead of four. Could we keep Room B until 1:00? If that is not possible, we could move to any room with at least six seats.

Thank you,
Grace`,
      },
    ],
    questions: [
      {
        q: 'Why did Grace write the email?',
        options: [
          'To ask for a longer room booking',
          'To cancel the job interviews',
          'To book a room for a training session',
          'To invite the office manager to a meeting',
        ],
        why: '"Could we keep Room B until 1:00?" Buổi phỏng vấn kéo dài hơn dự kiến.',
      },
      {
        q: 'Which room could Grace’s team use from 12:00 to 1:00 if Room B is not available?',
        options: ['Room A', 'Room C', 'Room D', 'None of the rooms'],
        why: 'Ghép hai đoạn: cần phòng có ít nhất 6 ghế, trống từ 12:00 đến 1:00. Phòng A (20 ghế) trống sau 11:00; phòng C có lớp đào tạo từ 12:00.',
      },
      {
        q: 'How many candidates were originally going to be interviewed?',
        options: ['Four', 'Six', 'Eight', 'Twenty'],
        why: '"six candidates instead of four": ban đầu là 4 người. 8 là số ghế phòng B.',
      },
    ],
  },
  {
    id: 'p7-gym',
    part: 7,
    passages: [
      {
        kind: AD,
        text: `Join Sunrise Fitness Center!

Monthly membership: $40
Annual membership: $400 (save $80!)

All members can use the pool and take free yoga classes on weekends.
Personal training sessions are available for $25 each.`,
      },
      {
        kind: EMAIL,
        text: `To: Sunrise Fitness Center
From: Leo Martin
Subject: Charge on my account

Hello,

I signed up for an annual membership last week. Yesterday I booked two personal training sessions, but I was charged $60 for them. Could you please check this?

Thank you,
Leo Martin`,
      },
    ],
    questions: [
      {
        q: 'How much did Leo pay for his membership?',
        options: ['$400', '$40', '$480', '$60'],
        why: 'Ghép hai đoạn: Leo mua gói năm (email), gói năm giá $400 (quảng cáo).',
      },
      {
        q: 'What problem does Leo mention?',
        options: [
          'He was charged too much for training',
          'The pool was closed',
          'His membership was canceled',
          'A yoga class was full',
        ],
        why: 'Hai buổi tập riêng giá 2 × $25 = $50 theo quảng cáo, nhưng Leo bị tính $60.',
      },
      {
        q: 'What is true about the yoga classes?',
        options: [
          'They are free on weekends',
          'They cost $25 each',
          'They are only for annual members',
          'They take place in the pool',
        ],
        why: '"All members can … take free yoga classes on weekends." $25 là giá một buổi tập riêng.',
      },
    ],
  },
  {
    id: 'p7-hotel-job',
    part: 7,
    passages: [
      {
        kind: JOB,
        text: `Coastline Hotel is hiring!

Position: Front desk clerk (full-time)
Requirements: at least one year of experience in a hotel or similar business; good English; computer skills
Duties: checking guests in and out, answering phone calls, handling reservations
Benefits: free meals during shifts, paid holidays, a staff discount at all Coastline hotels

To apply, send your CV to hr@coastlinehotel.com by June 30. Interviews will be held in the first week of July.`,
      },
    ],
    questions: [
      {
        q: 'What position is being advertised?',
        options: ['Front desk clerk', 'Hotel chef', 'Hotel manager', 'Bus driver'],
        why: '"Position: Front desk clerk": nhân viên lễ tân.',
      },
      {
        q: 'What is NOT mentioned as a benefit?',
        options: ['Free parking', 'Free meals', 'Paid holidays', 'A staff discount'],
        why: 'Câu hỏi NOT: tìm thứ không có trong bài. Bài nêu bữa ăn miễn phí, nghỉ có lương, giảm giá; không nói gì về chỗ đậu xe.',
      },
      {
        q: 'When will the interviews take place?',
        options: ['In early July', 'By June 30', 'In late July', 'Next week'],
        why: '"Interviews will be held in the first week of July." June 30 là hạn nộp hồ sơ.',
      },
    ],
  },
  {
    id: 'p7-travel-policy',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `MEMO
To: All employees
From: Human Resources
Subject: New travel expense policy

Starting September 1, employees traveling for work must book flights and hotels through our travel agency, Skyway Travel. Bookings made in other ways will not be reimbursed unless a manager approves them in advance.

Meal expenses of up to $50 per day will be reimbursed when receipts are provided. Please contact Human Resources if you have any questions.`,
      },
    ],
    questions: [
      {
        q: 'What is the memo mainly about?',
        options: [
          'A change in travel rules',
          'The opening of a travel agency',
          'A company trip',
          'The holiday schedule',
        ],
        why: 'Tiêu đề "New travel expense policy": quy định mới về chi phí công tác.',
      },
      {
        q: 'What must employees do to be reimbursed for meals?',
        options: [
          'Provide receipts',
          'Book through Skyway Travel',
          'Get a manager’s approval',
          'Spend more than $50',
        ],
        why: '"Meal expenses … will be reimbursed when receipts are provided." Phê duyệt của quản lý chỉ dành cho đặt vé ngoài Skyway.',
      },
      {
        q: 'What is indicated about bookings not made through Skyway Travel?',
        options: [
          'They need a manager’s approval in advance to be reimbursed.',
          'They are usually cheaper.',
          'They are not allowed under any condition.',
          'They must be made before September 1.',
        ],
        why: '"…will not be reimbursed unless a manager approves them in advance." unless = trừ khi.',
      },
    ],
  },
  {
    id: 'p7-lamp-chat',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Kim Lee (2:05 P.M.): Hello, I ordered a desk lamp from your website last week, order number 58213. It still hasn't arrived.
Omar, Customer Service (2:06 P.M.): I'm sorry to hear that. Let me check. Your order was sent to an old address on Lake Road.
Kim Lee (2:08 P.M.): Oh no, I moved last month. I thought I had updated my account.
Omar, Customer Service (2:09 P.M.): No problem. I'll send a new lamp to your current address today at no extra cost.
Kim Lee (2:10 P.M.): That's great, thanks!`,
      },
    ],
    questions: [
      {
        q: 'Why did Ms. Lee contact the company?',
        options: [
          'Her order has not arrived.',
          'She received the wrong color.',
          'She wants to cancel an order.',
          'She wants to change her payment method.',
        ],
        why: '"It still hasn\'t arrived." Lý do liên hệ thường nằm ở tin nhắn đầu.',
      },
      {
        q: 'What caused the problem?',
        options: [
          'The order was sent to an old address.',
          'The lamp was out of stock.',
          'The lamp was damaged.',
          'The order number was wrong.',
        ],
        why: '"Your order was sent to an old address on Lake Road" và cô ấy đã chuyển nhà.',
      },
      {
        q: 'At 2:10 P.M., what does Ms. Lee most likely mean when she writes, "That\'s great"?',
        options: [
          'She is happy with the solution.',
          'She likes the design of the lamp.',
          'She has just received the lamp.',
          'She wants a discount.',
        ],
        why: '"That\'s great" đáp lại lời hứa gửi đèn mới miễn phí: cô ấy hài lòng với cách giải quyết.',
      },
    ],
  },
  {
    id: 'p7-forum',
    part: 7,
    passages: [
      {
        kind: SCHEDULE,
        text: `Green Business Forum — Saturday, March 9

9:00   Welcome speech — Linda Moore, Forum Director
9:30   Green packaging for online stores — Sara Blake
11:00  Coffee break
11:30  Saving energy in the office — Dr. Ken Ito
1:00   Lunch (included with registration)`,
      },
      {
        kind: EMAIL,
        text: `From: Sara Blake
To: Linda Moore
Subject: Saturday

Hi Linda,

I'm sorry, but my train arrives in the city at 10:00 on Saturday, so I will miss the start of my talk. Would it be possible to switch my session with Dr. Ito's? If not, I could speak after lunch instead.

Best,
Sara`,
      },
    ],
    questions: [
      {
        q: 'Why did Ms. Blake write the email?',
        options: [
          'To ask to change the time of her talk',
          'To cancel her registration',
          'To book a train ticket',
          'To invite Ms. Moore to lunch',
        ],
        why: '"Would it be possible to switch my session with Dr. Ito\'s?" Cô ấy muốn đổi giờ nói.',
      },
      {
        q: 'If Ms. Blake’s request is accepted, when will she speak?',
        options: ['At 11:30', 'At 9:30', 'At 1:00', 'At 10:00'],
        why: 'Ghép hai đoạn: đổi với phiên của Dr. Ito thì cô ấy nói vào giờ của ông ấy, 11:30. 9:30 là giờ cũ của cô ấy.',
      },
      {
        q: 'What is indicated about lunch?',
        options: [
          'It is included with registration.',
          'It starts at 11:00.',
          'Ms. Moore will give a speech during it.',
          'It is not served on Saturday.',
        ],
        why: 'Lịch ghi "Lunch (included with registration)". 11:00 là giờ nghỉ uống cà phê.',
      },
    ],
  },
]

export interface ShuffledQuestion extends ReadingQuestion {
  answer: number
}

/** A set with each question's options shuffled; `answer` points at the right one. */
export function shuffleSet<S extends { questions: readonly ReadingQuestion[] }>(
  set: S,
  rand: () => number = Math.random
): { set: S; questions: ShuffledQuestion[] } {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  return {
    set,
    questions: set.questions.map((qn) => {
      const options = shuffle(qn.options) as ReadingQuestion['options']
      return { ...qn, options, answer: options.indexOf(qn.options[0]) }
    }),
  }
}

/** A set of the part, not the one just done when there is another. */
export function pickSet(
  part: 6 | 7,
  lastId?: string,
  rand: () => number = Math.random
): ReadingSet {
  const all = READING_SETS.filter((s) => s.part === part)
  const pool = all.length > 1 ? all.filter((s) => s.id !== lastId) : all
  return pool[Math.floor(rand() * pool.length)]
}
