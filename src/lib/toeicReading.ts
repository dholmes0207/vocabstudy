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
]

export interface ShuffledQuestion extends ReadingQuestion {
  answer: number
}

/** A set with each question's options shuffled; `answer` points at the right one. */
export function shuffleSet(
  set: ReadingSet,
  rand: () => number = Math.random
): { set: ReadingSet; questions: ShuffledQuestion[] } {
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
