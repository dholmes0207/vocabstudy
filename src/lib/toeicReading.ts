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
const MEMO: Pair = ['Thông báo nội bộ', 'Memo']
const ARTICLE: Pair = ['Bài báo', 'Article']
const REVIEW: Pair = ['Đánh giá của khách', 'Customer review']
const FORM: Pair = ['Phiếu', 'Form']

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

  {
    id: 'p6-software',
    part: 6,
    passages: [
      {
        kind: MEMO,
        text: `To: All employees
From: IT Department
Subject: New accounting software

On Monday, March 3, the accounting department will begin using new software to process invoices. The system will make it [1] for staff to track payments. [2]

All employees who submit expense reports must attend a short training session [3] the end of February. Sessions will be held every Tuesday and Thursday at 3:00 P.M. in Room 210. Please register with Ms. Green, who will send you the [4] materials before your session.`,
      },
    ],
    questions: [
      gap(
        ['easier', 'easily', 'ease', 'easiest'],
        'make it + tính từ + for…: làm cho việc gì dễ hơn. Phần mềm mới so với cũ nên dùng so sánh hơn easier.'
      ),
      gap(
        [
          'It will also reduce the time needed to approve expenses.',
          'The old software will be used until next year.',
          'Invoices should be sent by mail from now on.',
          'The accounting department is located on the fifth floor.',
        ],
        'Câu chèn tiếp ý "phần mềm giúp theo dõi thanh toán dễ hơn" bằng một lợi ích nữa (also). Phần mềm cũ dùng đến năm sau trái với ngày bắt đầu 3/3.'
      ),
      gap(
        ['before', 'since', 'during', 'among'],
        'before the end of February: trước cuối tháng Hai, đúng với phần mềm bắt đầu dùng ngày 3/3.'
      ),
      gap(
        ['training', 'trained', 'trainer', 'trains'],
        'training materials: tài liệu đào tạo, danh từ ghép. trained là quá khứ phân từ, không hợp ở đây.'
      ),
    ],
  },
  {
    id: 'p6-store-hours',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `Dear Customers,

Beginning June 1, Parkside Market will [1] its opening hours. The store will open at 7:00 A.M. instead of 8:00 A.M., so that shoppers can stop by on their way to work. [2]

In addition, our bakery section will offer fresh bread every morning. We [3] you for your continued support and look forward to serving you. If you have any questions, please speak to [4] of our staff members at the customer service desk.`,
      },
    ],
    questions: [
      gap(
        ['extend', 'extent', 'extensive', 'extension'],
        'Sau will cần động từ nguyên mẫu: will extend its opening hours (kéo dài giờ mở cửa). Mở cửa sớm hơn một tiếng là kéo dài.'
      ),
      gap(
        [
          'Closing time will remain 10:00 P.M.',
          'The store will be closed on weekends.',
          'Shoppers must show a membership card.',
          'The bakery will no longer sell bread.',
        ],
        'Đoạn đang nói giờ mở cửa; câu chèn hợp lý là giờ đóng cửa giữ nguyên. Câu về tiệm bánh trái với câu sau ("fresh bread every morning").'
      ),
      gap(
        ['thank', 'thanks', 'thanking', 'thanked'],
        'We thank you for…: chúng tôi cảm ơn quý khách vì… Chủ ngữ We ở hiện tại đi với động từ nguyên mẫu thank.'
      ),
      gap(
        ['any', 'every', 'much', 'other'],
        'any of our staff members: bất kỳ nhân viên nào. every và other không đi với of; much dùng cho danh từ không đếm được.'
      ),
    ],
  },
  {
    id: 'p6-conference-thanks',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: Dr. Helen Ward
From: Tom Reyes, Event Coordinator
Subject: Thank you

Dear Dr. Ward,

Thank you for speaking at the Regional Business Conference last Friday. Your talk on online marketing was one of the most [1] sessions of the day. [2] Many of them asked whether you would return next year.

As promised, we have [3] a copy of the photos from your session to this email. Your speaker fee will be paid [4] the end of the month.

Best regards,
Tom Reyes`,
      },
    ],
    questions: [
      gap(
        ['popular', 'popularity', 'popularly', 'populate'],
        'one of the most + tính từ + danh từ số nhiều: one of the most popular sessions. Sau most cần tính từ.'
      ),
      gap(
        [
          'Several attendees told us how useful they found it.',
          'Unfortunately, the room was too small for the audience.',
          'The conference will not be held again.',
          'Please send us your talk by next Friday.',
        ],
        'Câu sau có "Many of them", cần một câu trước nhắc tới người nghe: attendees. Câu "conference will not be held again" trái với "return next year".'
      ),
      gap(
        ['attached', 'attach', 'attaching', 'attachment'],
        'Thì hiện tại hoàn thành: have + quá khứ phân từ, we have attached (đã đính kèm).'
      ),
      gap(
        ['by', 'until', 'since', 'for'],
        'by the end of the month: chậm nhất là cuối tháng, hạn chót cho một việc xảy ra một lần. until dùng cho việc kéo dài.'
      ),
    ],
  },
  {
    id: 'p6-hiring',
    part: 6,
    passages: [
      {
        kind: JOB,
        text: `Blue River Hotels is looking for an experienced front desk manager for our new hotel in Lakeside. The successful [1] will lead a team of ten staff members and handle guest complaints.

Applicants should have at least three years of experience in the hotel industry. [2] The ability to speak a second language is a plus.

To apply, please send your résumé and a cover letter [3] hr@blueriverhotels.com. Applications must be received no later than April 15. Only those [4] for an interview will be contacted.`,
      },
    ],
    questions: [
      gap(
        ['candidate', 'candidates', 'candidacy', 'candid'],
        'The successful candidate: ứng viên được chọn. Sau The + tính từ cần danh từ, và động từ will lead cho thấy là một người, số ít.'
      ),
      gap(
        [
          'Strong communication skills are also required.',
          'The hotel will close in April.',
          'No experience is necessary for this position.',
          'Guests are asked to check out by noon.',
        ],
        'Đoạn đang liệt kê yêu cầu với ứng viên; câu chèn là một yêu cầu nữa (also required). "No experience is necessary" trái với câu trước.'
      ),
      gap(['to', 'at', 'from', 'in'], 'send something to + địa chỉ: gửi tới hr@…'),
      gap(
        ['selected', 'selecting', 'selection', 'select'],
        'Only those (who are) selected for an interview: chỉ những người được chọn. Rút gọn mệnh đề bị động dùng quá khứ phân từ.'
      ),
    ],
  },
  {
    id: 'p6-expenses',
    part: 6,
    passages: [
      {
        kind: MEMO,
        text: `To: All sales staff
From: Robert Kim, Finance Department
Re: Travel expense reports

From July 1, all travel expense reports must be submitted [1] our new online system. Paper forms will no longer be accepted. [2]

When you enter an expense, please attach a photo of the receipt. Reports without receipts will be returned for [3]. Most reports are approved within five working days, and payments are [4] added to your monthly salary.`,
      },
    ],
    questions: [
      gap(
        ['through', 'across', 'among', 'beside'],
        'submit through a system: nộp qua một hệ thống. through chỉ phương tiện, kênh.'
      ),
      gap(
        [
          'A short training video is available on the company website.',
          'The sales team met its targets last quarter.',
          'Please print three copies of each form.',
          'Our office will be closed on July 1.',
        ],
        'Đổi sang hệ thống mới thì hợp nhất là câu nói có video hướng dẫn. "Print three copies of each form" trái với câu trước (không nhận bản giấy nữa).'
      ),
      gap(
        ['correction', 'correct', 'corrected', 'correctly'],
        'Sau giới từ for cần danh từ: returned for correction (trả lại để sửa).'
      ),
      gap(
        ['automatically', 'automatic', 'automate', 'automation'],
        'Giữa are và quá khứ phân từ added cần trạng từ: are automatically added (được tự động cộng vào lương).'
      ),
    ],
  },
  {
    id: 'p6-office-move',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: All employees
From: Maria Lopez, Facilities Manager
Subject: Office move

As you know, our team will move to the fifth floor next month. To make the move as smooth as possible, please pack your personal items in the boxes [1] at the reception desk. Label each box clearly with your name and new desk number.

The moving company will come on Friday, March 8, after 6 p.m. [2] Computers and phones will be moved by the IT team, so please do not pack them yourself.

If you have any questions, feel free to contact me [3]. Thank you for your [4].`,
      },
    ],
    questions: [
      gap(
        ['provided', 'provide', 'providing', 'provider'],
        'the boxes (which are) provided at the reception desk: thùng được phát ở quầy lễ tân. Rút gọn mệnh đề bị động dùng quá khứ phân từ.'
      ),
      gap(
        [
          'All boxes should be ready by 5 p.m. that day.',
          'The fifth floor has a new coffee machine.',
          'Please move your own computer to the new floor.',
          'The reception desk will be closed next year.',
        ],
        'Công ty chuyển nhà đến sau 6 giờ, nên thùng phải xong trước 5 giờ là hợp mạch. "Move your own computer" trái với câu sau (đội IT sẽ chuyển máy).'
      ),
      gap(
        ['directly', 'direct', 'direction', 'directed'],
        'Sau động từ contact me cần trạng từ: contact me directly (liên hệ thẳng với tôi).'
      ),
      gap(
        ['cooperation', 'cooperate', 'cooperative', 'cooperatively'],
        'Sau tính từ sở hữu your cần danh từ: your cooperation (sự hợp tác của bạn).'
      ),
    ],
  },
  {
    id: 'p6-system-maintenance',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `Notice to all customers

Our online banking service will be unavailable on Sunday, October 12, from 1 a.m. to 5 a.m. During this time, we will be [1] important updates to improve the security of your accounts.

You will still be able to withdraw cash at any of our machines. [2] However, transfers and bill payments made online will not be possible [3] the update is complete.

We are sorry for the inconvenience and thank you for choosing Harbor Bank. For more information, please [4] our customer service center at 555-0110.`,
      },
    ],
    questions: [
      gap(
        ['making', 'make', 'made', 'makes'],
        'will be + V-ing là tương lai tiếp diễn: will be making updates (sẽ đang tiến hành cập nhật) trong khoảng 1–5 giờ sáng.'
      ),
      gap(
        [
          'Card payments in stores will also work as usual.',
          'Our branches will be closed for a month.',
          'Online banking is available 24 hours as usual.',
          'You can open a new account online that night.',
        ],
        'Câu trước nói những gì vẫn làm được (rút tiền); câu chèn thêm một việc vẫn làm được (thanh toán thẻ), trước khi However chuyển sang việc không làm được. Hai câu "online" trái với nội dung.'
      ),
      gap(
        ['until', 'by', 'during', 'within'],
        'not possible until the update is complete: không làm được cho tới khi cập nhật xong. until + mệnh đề chỉ mốc kết thúc của việc kéo dài.'
      ),
      gap(
        ['contact', 'contacting', 'contacts', 'contacted'],
        'Sau please dùng động từ nguyên mẫu (câu mệnh lệnh): please contact.'
      ),
    ],
  },
  {
    id: 'p6-subscription',
    part: 6,
    passages: [
      {
        kind: LETTER,
        text: `Dear Ms. Tanaka,

Thank you for being a reader of Business Week Monthly. Your subscription will [1] on November 30. To keep receiving the magazine without a break, please renew before that date.

If you renew for two years, you will save 25 percent off the regular price. [2] Simply fill out the enclosed form and return it in the envelope provided. No stamp is [3].

We look forward to continuing to bring you the latest business news. If you have already renewed, please [4] this letter.

Sincerely,
Daniel Brooks
Customer Service`,
      },
    ],
    questions: [
      gap(
        ['expire', 'expired', 'expiring', 'expiration'],
        'Sau will cần động từ nguyên mẫu: will expire (sẽ hết hạn).'
      ),
      gap(
        [
          'You will also receive a free copy of our annual guide.',
          'The magazine will stop printing next year.',
          'Prices for two-year subscriptions are higher.',
          'We have sent your magazine to the wrong address.',
        ],
        'Câu trước nêu ưu đãi khi gia hạn 2 năm; câu chèn thêm một ưu đãi nữa (also, free copy). "Prices… are higher" trái với việc được giảm 25%.'
      ),
      gap(
        ['necessary', 'necessarily', 'necessity', 'need'],
        'Sau is cần tính từ: No stamp is necessary (không cần dán tem).'
      ),
      gap(
        ['disregard', 'disregarding', 'disregarded', 'disregards'],
        'Sau please dùng động từ nguyên mẫu: please disregard this letter (xin bỏ qua thư này), câu quen thuộc khi khách đã gia hạn.'
      ),
    ],
  },
  {
    id: 'p6-volunteer',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `Volunteers Wanted — Riverside Clean-Up Day

On Saturday, April 22, the Riverside Business Association will hold its yearly clean-up of the park along the river. We are looking for volunteers to help [1] litter and plant new flowers.

The event will start at 8 a.m. and finish around noon. [2] Gloves, bags, and drinks will be provided, so you only need to bring a hat and comfortable shoes.

To sign up, please e-mail events@riversidebiz.org [3] April 15. Last year, more than 200 people took part, and we hope to make this year's event even [4].`,
      },
    ],
    questions: [
      gap(
        ['collect', 'collection', 'collected', 'collector'],
        'help + động từ nguyên mẫu: help (to) collect litter (giúp nhặt rác).'
      ),
      gap(
        [
          'Lunch will be served to all volunteers afterward.',
          'The park will be closed for the whole month.',
          'Please bring your own gloves and bags.',
          'The event was cancelled because of rain.',
        ],
        'Câu trước nói giờ kết thúc khoảng trưa, câu chèn nói bữa trưa sau đó là hợp mạch. "Bring your own gloves" trái với câu sau (găng tay được phát sẵn).'
      ),
      gap(
        ['by', 'until', 'during', 'since'],
        'by + ngày: hạn chót đăng ký, chậm nhất là ngày 15 tháng 4.'
      ),
      gap(
        ['bigger', 'big', 'biggest', 'bigness'],
        'even + so sánh hơn: even bigger (còn lớn hơn nữa), so với năm ngoái hơn 200 người.'
      ),
    ],
  },
  {
    id: 'p6-price-change',
    part: 6,
    passages: [
      {
        kind: LETTER,
        text: `Dear Valued Customer,

We are writing to let you know about a change to our delivery service. Starting March 1, the delivery fee for orders under $50 will [1] from $5 to $7.

This change is necessary because of rising fuel costs. [2] Orders of $50 or more will continue to be delivered free of charge.

We understand that this may be [3] news, and we thank you for your continued support. If you have any questions, our customer service team will be happy to [4] you.

Sincerely,
FreshMart Online`,
      },
    ],
    questions: [
      gap(
        ['increase', 'increasing', 'increased', 'increases'],
        'Sau will cần động từ nguyên mẫu: will increase (sẽ tăng) từ $5 lên $7.'
      ),
      gap(
        [
          'We have tried to keep the increase as small as possible.',
          'All delivery fees will be removed next month.',
          'Our store has opened a new branch downtown.',
          'Fuel prices have fallen sharply this year.',
        ],
        'Câu trước giải thích lý do (giá nhiên liệu tăng), câu chèn nói đã cố giữ mức tăng thấp nhất. "Fuel prices have fallen" trái với câu trước; "fees will be removed" trái với cả đoạn.'
      ),
      gap(
        ['disappointing', 'disappointed', 'disappoint', 'disappointment'],
        'Đứng trước danh từ news, chỉ tính chất của tin: disappointing (gây thất vọng). disappointed dùng cho người cảm thấy thất vọng.'
      ),
      gap(
        ['assist', 'assistant', 'assistance', 'assisted'],
        'be happy to + động từ nguyên mẫu: happy to assist you (sẵn lòng hỗ trợ bạn).'
      ),
    ],
  },
  {
    id: 'p6-welcome-email',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: Kevin Ortiz
From: Amy Chen, Human Resources
Subject: Welcome to Norton Design

Dear Kevin,

We are very happy that you will be joining our team as a graphic designer. Your first day will be Monday, June 3. Please [1] at the reception desk on the ground floor at 9 a.m.

On your first morning, you will meet your manager, Ms. Patel, and receive your laptop and ID card. [2] In the afternoon, you will attend a short training session on our design software.

Please bring a copy of your passport and your bank details so that we can set up your salary [3]. If you have any questions before you start, do not hesitate to contact me.

We look forward to [4] with you.

Best regards,
Amy Chen`,
      },
    ],
    questions: [
      gap(
        ['report', 'reported', 'reporting', 'reporter'],
        'Sau please dùng động từ nguyên mẫu: please report at the reception desk (có mặt ở quầy lễ tân).'
      ),
      gap(
        [
          'She will also give you a tour of the office.',
          'Your contract will end next month.',
          'The training will take place on Friday.',
          'Please bring your own laptop.',
        ],
        'Đoạn đang kể buổi sáng đầu tiên với Ms. Patel; câu chèn thêm việc dẫn đi xem văn phòng là hợp mạch. "Bring your own laptop" trái với câu trước (sẽ được phát laptop); training là vào buổi chiều.'
      ),
      gap(
        ['payments', 'pays', 'paid', 'payable'],
        'salary payments là danh từ ghép (việc trả lương), làm tân ngữ của set up. Sau danh từ salary chỉ có thể là một danh từ nữa.'
      ),
      gap(
        ['working', 'work', 'worked', 'works'],
        'look forward to + V-ing: look forward to working with you. to ở đây là giới từ, không phải dấu hiệu động từ nguyên mẫu.'
      ),
    ],
  },
  {
    id: 'p6-library-card',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `New Library Cards Now Available

Greenville Public Library is introducing new library cards with a built-in chip. The new cards will allow members to borrow books [1] at our self-service machines.

All current members can exchange their old cards for free at the front desk. [2] Old cards will stop working on September 30.

To get your new card, simply bring your old card and a photo ID. The process takes [3] five minutes. For more details, please visit our website or speak to a member of our [4].`,
      },
    ],
    questions: [
      gap(
        ['quickly', 'quick', 'quicker', 'quickness'],
        'Bổ nghĩa cho động từ borrow cần trạng từ: borrow books quickly (mượn sách nhanh).'
      ),
      gap(
        [
          'There is no need to make an appointment.',
          'The library will be closed until next year.',
          'New members must pay a fee of $20.',
          'Old cards can still be used after September.',
        ],
        'Câu trước nói đổi thẻ miễn phí ở quầy; câu chèn nói không cần hẹn trước là hợp mạch. "Old cards can still be used after September" trái với câu sau (thẻ cũ ngừng dùng ngày 30/9).'
      ),
      gap(
        ['only', 'once', 'alone', 'single'],
        'only + con số: chỉ mất năm phút. alone đứng sau danh từ, once là "một lần", single là tính từ "đơn lẻ".'
      ),
      gap(
        ['staff', 'staffs', 'staffing', 'staffed'],
        'a member of our staff: một nhân viên. staff là danh từ tập hợp, không thêm s trong cụm này.'
      ),
    ],
  },
  {
    id: 'p6-holiday-hours',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `Holiday Hours

Please note that all Cityline Pharmacy stores will have [1] hours during the holiday week. From December 24 to December 26, stores will open at 10 a.m. and close at 4 p.m.

[2] Our online store, however, will remain open as usual, and orders placed before noon will still be delivered the same day.

If you need a prescription filled during this period, we recommend that you order it [3]. We thank all our customers for their [4] and wish everyone a happy holiday.`,
      },
    ],
    questions: [
      gap(
        ['shorter', 'short', 'shortly', 'shortest'],
        'Đứng trước danh từ hours, so với giờ thường (mở 10 giờ, đóng 4 giờ): shorter hours (giờ mở cửa ngắn hơn).'
      ),
      gap(
        [
          'All stores will be closed on January 1.',
          'Our stores will now open earlier every day.',
          'Prescriptions can no longer be ordered online.',
          'The pharmacy has hired new staff.',
        ],
        'Đoạn đang nói giờ mở cửa dịp lễ; câu chèn thêm một ngày đóng cửa là hợp mạch. "Open earlier" trái với câu trước; "no longer online" trái với câu sau.'
      ),
      gap(
        ['in advance', 'in time', 'in case', 'in fact'],
        'order it in advance: đặt trước. in case là "phòng khi", in fact là "thật ra".'
      ),
      gap(
        ['understanding', 'understand', 'understood', 'understandable'],
        'Sau tính từ sở hữu their cần danh từ: their understanding (sự thông cảm).'
      ),
    ],
  },
  {
    id: 'p6-feedback-request',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: Ms. Laura Chen
From: Customer Care, Brightline Internet
Subject: How did we do?

Dear Ms. Chen,

Thank you for contacting our support team last week about your Internet connection. We hope the problem has been [1] solved.

To help us improve our service, we would be [2] if you could answer a short survey. It will take no more than three minutes. [3]

Simply click the link below to begin. All answers will be kept [4].

Sincerely,
Brightline Customer Care`,
      },
    ],
    questions: [
      gap(
        ['completely', 'complete', 'completion', 'completed'],
        'Giữa has been và quá khứ phân từ solved cần trạng từ: completely solved (được giải quyết hoàn toàn).'
      ),
      gap(
        ['grateful', 'gratitude', 'gratefully', 'grate'],
        'Sau would be cần tính từ: we would be grateful if… (chúng tôi rất biết ơn nếu…), câu lịch sự quen thuộc.'
      ),
      gap(
        [
          'As a thank-you, you will receive a $5 discount on your next bill.',
          'Your Internet service will be stopped next week.',
          'The survey must be completed by mail.',
          'Our support team is closed on weekdays.',
        ],
        'Sau lời nhờ làm khảo sát, câu chèn nói phần thưởng cảm ơn là hợp mạch. "Completed by mail" trái với câu sau (bấm vào đường link).'
      ),
      gap(
        ['private', 'privacy', 'privately', 'privatize'],
        'keep + tân ngữ + tính từ: answers will be kept private (câu trả lời được giữ kín).'
      ),
    ],
  },
  {
    id: 'p6-new-cafeteria',
    part: 6,
    passages: [
      {
        kind: MEMO,
        text: `To: All employees
From: Facilities Team
Re: Cafeteria reopening

We are happy to announce that the staff cafeteria will reopen on Monday after two months of renovation. The new cafeteria is [1] than before and can now seat up to 150 people.

In addition to hot meals, there will be a salad bar and a coffee corner. [2] Employees can pay with cash, a credit card, or their staff ID card.

To celebrate the reopening, all hot meals will be half price [3] the first week. We hope you enjoy the new space and look forward to [4] your comments.`,
      },
    ],
    questions: [
      gap(
        ['larger', 'large', 'largely', 'largest'],
        'Có than ngay sau nên cần so sánh hơn: larger than before (rộng hơn trước).'
      ),
      gap(
        [
          'The coffee corner will open at 7:30 a.m., before most offices start work.',
          'The cafeteria will be closed for another two months.',
          'Only cash will be accepted at the cafeteria.',
          'Hot meals will no longer be served.',
        ],
        'Câu trước vừa nhắc góc cà phê; câu chèn nói giờ mở của góc cà phê là hợp mạch. "Only cash" trái với câu sau (trả bằng thẻ được).'
      ),
      gap(
        ['during', 'while', 'among', 'between'],
        'Trước cụm danh từ the first week cần giới từ: during the first week (trong tuần đầu). while đi với mệnh đề.'
      ),
      gap(
        ['receiving', 'receive', 'received', 'receives'],
        'look forward to + V-ing: look forward to receiving your comments.'
      ),
    ],
  },
  {
    id: 'p6-volunteer-thanks',
    part: 6,
    passages: [
      {
        kind: LETTER,
        text: `Dear Mr. Tanaka,

On behalf of the Green Valley Food Bank, I would like to thank you for volunteering at our winter food drive last Saturday. [1] your help, we were able to collect more than two tons of food for local families.

Many of our volunteers said that the event was very well [2]. This is thanks in large part to the time you spent planning it with our staff. [3]

We hope you will join us [4] for our spring event in April. We will send more details next month.

With warm regards,
Helen Brooks
Volunteer Coordinator`,
      },
    ],
    questions: [
      gap(
        ['Thanks to', 'Instead of', 'In spite of', 'According to'],
        'Thanks to + danh từ: nhờ có. Nhờ sự giúp đỡ mà quyên được hơn hai tấn thực phẩm. In spite of mang nghĩa trái ngược.'
      ),
      gap(
        ['organized', 'organize', 'organizer', 'organizing'],
        'be well + quá khứ phân từ: the event was very well organized (được tổ chức rất tốt).'
      ),
      gap(
        [
          'We could not have done it without you.',
          'Unfortunately, the event had to be canceled.',
          'Next year, we plan to stop the food drive.',
          'Very few people came to help.',
        ],
        'Đoạn đang cảm ơn và khen; câu chèn "không có anh thì không làm được" hợp mạch. Ba câu kia trái với việc sự kiện thành công.'
      ),
      gap(
        ['again', 'ever', 'yet', 'still'],
        'join us again: tham gia cùng chúng tôi lần nữa, cho sự kiện mùa xuân.'
      ),
    ],
  },
  {
    id: 'p6-training-move',
    part: 6,
    passages: [
      {
        kind: EMAIL,
        text: `To: All sales staff
From: Paul Rivera
Subject: Product training

Dear team,

The product training planned for Wednesday morning has been [1] to Thursday at 10 A.M. The trainer from our main office is not able to arrive until Wednesday night.

The session will take place in Meeting Room 2 and will last about three hours. [2] Lunch will be provided afterward.

Please bring your laptop, as you will need it [3] the practice exercises. If you cannot attend, let me know by Tuesday so that I can arrange [4] session for you.

Thank you,
Paul`,
      },
    ],
    questions: [
      gap(
        ['moved', 'move', 'moving', 'mover'],
        'has been + quá khứ phân từ (bị động, hiện tại hoàn thành): buổi đào tạo đã được dời sang thứ Năm: moved.'
      ),
      gap(
        [
          'It will cover all of our new products.',
          'The trainer has already left the company.',
          'The meeting room is closed on Thursdays.',
          'Lunch is not allowed in the building.',
        ],
        'Câu chèn nói thêm về nội dung buổi học, nối với câu trước (thời lượng) và câu sau (bữa trưa). Ba câu kia mâu thuẫn với email: phòng họp vẫn dùng thứ Năm, bữa trưa có phục vụ.'
      ),
      gap(
        ['for', 'at', 'by', 'of'],
        'need it for + danh từ: cần máy tính cho phần bài tập thực hành.'
      ),
      gap(
        ['another', 'other', 'others', 'each other'],
        'another + danh từ số ít: sắp xếp một buổi khác (another session). other đi với danh từ số nhiều hoặc có the.'
      ),
    ],
  },
  {
    id: 'p6-pool-hours',
    part: 6,
    passages: [
      {
        kind: NOTICE,
        text: `To all members,

Starting on March 1, the Riverside Fitness Center pool will be open [1] 6 A.M. to 10 P.M. every day. We are making this change because many members have asked us to stay open later in the evening.

The sauna will also follow the new hours. [2], swimming lessons will continue to end at 6 P.M.

[3] To celebrate the change, members may bring a guest to the pool for free during the first week of March.

We look forward to [4] you more often.

Riverside Fitness Center`,
      },
    ],
    questions: [
      gap(
        ['from', 'since', 'during', 'between'],
        'Cấu trúc from … to …: mở cửa từ 6 giờ sáng đến 10 giờ tối. between đi với and.'
      ),
      gap(
        ['However', 'Therefore', 'For example', 'In addition'],
        'Câu sau trái ý câu trước (phòng xông hơi theo giờ mới, nhưng lớp bơi vẫn kết thúc lúc 6 giờ): However.'
      ),
      gap(
        [
          'We hope the new hours will make it easier for you to swim.',
          'The pool will be closed for the whole month of March.',
          'Guests will no longer be allowed in the pool.',
          'Members asked us to open later in the morning.',
        ],
        'Câu chèn kết lại ý đổi giờ, trước phần ưu đãi. Ba câu kia trái với thông báo: hồ bơi vẫn mở, khách được vào miễn phí, hội viên xin mở muộn hơn buổi tối chứ không phải buổi sáng.'
      ),
      gap(
        ['seeing', 'see', 'seen', 'to see'],
        'look forward to + V-ing (to ở đây là giới từ): look forward to seeing you.'
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

  {
    id: 'p7-client-chat',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Nina Ross (9:12 A.M.): Hi Paul, are we still meeting the client from Brightway at 11?
Paul Kim (9:14 A.M.): Yes, but they just called. Their flight was delayed, so they'll be here at 1 instead.
Nina Ross (9:15 A.M.): OK. Then I'll move our lunch reservation to tomorrow.
Paul Kim (9:16 A.M.): Good idea. Could you also tell Mr. Diaz? He wanted to join us.
Nina Ross (9:17 A.M.): Sure thing.`,
      },
    ],
    questions: [
      {
        q: 'Why will the client arrive later than planned?',
        options: [
          'Their flight was delayed.',
          'They forgot the meeting.',
          'They are stuck in traffic.',
          'They have another meeting first.',
        ],
        why: '"Their flight was delayed, so they\'ll be here at 1 instead."',
      },
      {
        q: 'What will Ms. Ross do about lunch?',
        options: [
          'Change the reservation to another day',
          'Cancel it completely',
          'Order food to the office',
          'Invite the client to join',
        ],
        why: '"I\'ll move our lunch reservation to tomorrow": dời sang ngày mai, không huỷ.',
      },
      {
        q: 'At 9:17 A.M., what does Ms. Ross mean when she writes, "Sure thing"?',
        options: [
          'She will contact Mr. Diaz.',
          'She is sure the client will come.',
          'She agrees to meet at 11.',
          'She has already called the client.',
        ],
        why: '"Sure thing" đáp lại lời nhờ ngay trước đó: "Could you also tell Mr. Diaz?" Cô ấy sẽ báo cho ông Diaz.',
      },
    ],
  },
  {
    id: 'p7-recycling-notice',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `To all tenants of Maple Tower

Starting March 1, the building will begin a new recycling program. Blue bins for paper and green bins for plastic and glass will be placed on every floor next to the elevators.

Large boxes should be flattened and left in the basement storage room. Please do not leave them in the hallways.

The building management thanks you for helping to keep Maple Tower clean. Questions may be directed to the management office on the first floor.`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the notice?',
        options: [
          'To introduce a recycling program',
          'To announce new tenants',
          'To explain a rent increase',
          'To close the basement',
        ],
        why: 'Câu đầu: "the building will begin a new recycling program".',
      },
      {
        q: 'Where should tenants put large boxes?',
        options: [
          'In the basement storage room',
          'Next to the elevators',
          'In the hallways',
          'In the blue bins',
        ],
        why: '"Large boxes should be flattened and left in the basement storage room." Thùng xanh dương là cho giấy thường.',
      },
      {
        q: 'What is NOT mentioned in the notice?',
        options: [
          'The cost of the program',
          'The start date',
          'Where the bins will be placed',
          'Where to ask questions',
        ],
        why: 'Câu hỏi NOT: thông báo có ngày bắt đầu (March 1), chỗ đặt thùng (next to the elevators), nơi hỏi (management office), nhưng không nói chi phí.',
      },
    ],
  },
  {
    id: 'p7-library-notice',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `Oakville Public Library — Temporary Closure

The main library on Elm Street will be closed from June 3 to June 28 while new lighting and heating systems are installed.

During this time, the Westside branch on 5th Avenue will stay open longer, from 9 a.m. to 8 p.m., Monday through Saturday. Books borrowed from the main library may be returned there.

No late fees will be charged for items due during the closure. Online services, including e-books and room booking, will not be affected.`,
      },
    ],
    questions: [
      {
        q: 'Why will the main library close?',
        options: [
          'To install new equipment',
          'To move to a new building',
          'To reduce costs',
          'To train new staff',
        ],
        why: '"while new lighting and heating systems are installed": lắp hệ thống đèn và sưởi mới, viết lại thành "install new equipment".',
      },
      {
        q: 'What is indicated about the Westside branch?',
        options: [
          'It will have longer opening hours.',
          'It will close on June 28.',
          'It does not accept returned books.',
          'It is open on Sundays.',
        ],
        why: '"will stay open longer, from 9 a.m. to 8 p.m.". Thông báo nói chỉ thứ Hai đến thứ Bảy, và chi nhánh này nhận trả sách.',
      },
      {
        q: 'What is NOT affected by the closure?',
        options: [
          'Online services',
          'Late fees',
          'Book returns at Elm Street',
          'Heating at the main library',
        ],
        why: 'Câu hỏi NOT: tìm điều thông báo nói là không đổi. "Online services… will not be affected." Phí trễ hạn được miễn, tức là có thay đổi.',
      },
    ],
  },
  {
    id: 'p7-internship',
    part: 7,
    passages: [
      {
        kind: JOB,
        text: `Summer Internship — Marketing Department

Harper & Cole, a leading furniture maker, is offering a ten-week paid internship for university students.

Interns will help plan social media campaigns, write short product descriptions, and attend weekly team meetings. Some travel to our showroom in Denver may be required.

Applicants must be in their third or fourth year of study. Experience with photo-editing software is preferred but not required.

Send your résumé and a writing sample to jobs@harpercole.com by April 20. Interviews will take place in early May.`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the advertisement?',
        options: [
          'To find students for a short-term position',
          'To announce a new furniture line',
          'To hire a marketing manager',
          'To invite customers to a showroom',
        ],
        why: '"a ten-week paid internship for university students": tuyển thực tập sinh 10 tuần, tức là vị trí ngắn hạn.',
      },
      {
        q: 'What is a requirement for applicants?',
        options: [
          'Being in the third or fourth year of university',
          'Experience with photo-editing software',
          'Living in Denver',
          'Having worked at a furniture company',
        ],
        why: '"must be in their third or fourth year". Phần mềm chỉnh ảnh là "preferred but not required" (ưu tiên, không bắt buộc), bẫy thường gặp.',
      },
      {
        q: 'What should applicants send with their résumé?',
        options: ['A writing sample', 'A photo', 'A reference letter', 'A product description'],
        why: '"Send your résumé and a writing sample". Product description là việc thực tập sinh sẽ làm, không phải hồ sơ.',
      },
    ],
  },
  {
    id: 'p7-delivery-chat',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Nina Ross (10:02): Hi Sam, the chairs for the training room were supposed to arrive this morning. Have you seen them?
Sam Lee (10:05): Not yet. I just called the store. The truck had a flat tire, so delivery is now after lunch.
Nina Ross (10:06): The training starts at 1:30. That’s cutting it close.
Sam Lee (10:08): I know. I can borrow twelve chairs from the third-floor meeting room for now.
Nina Ross (10:09): Perfect. I’ll ask Ken to help you carry them.`,
      },
    ],
    questions: [
      {
        q: 'Why are the chairs late?',
        options: [
          'A delivery truck had a problem.',
          'The store sent the wrong chairs.',
          'The order was never placed.',
          'The driver went to the wrong address.',
        ],
        why: '"The truck had a flat tire": xe tải bị xịt lốp, viết lại thành "had a problem".',
      },
      {
        q: 'At 10:06, what does Ms. Ross mean when she writes, "That’s cutting it close"?',
        options: [
          'There may not be enough time.',
          'The chairs are too small.',
          'The training room is too far.',
          'The price is too high.',
        ],
        why: '"cutting it close" là sát giờ: hàng đến sau trưa mà 1:30 đã bắt đầu, có thể không kịp. Câu sau Sam đề nghị mượn ghế cũng cho thấy điều đó.',
      },
      {
        q: 'What will Ken most likely do?',
        options: ['Help move some chairs', 'Call the store', 'Lead the training', 'Fix the truck'],
        why: '"I’ll ask Ken to help you carry them": them là mười hai chiếc ghế mượn từ tầng ba.',
      },
    ],
  },

  {
    id: 'p7-gym-memo',
    part: 7,
    passages: [
      {
        kind: MEMO,
        text: `To: All employees
From: Facilities Department
Date: October 2
Subject: New fitness room

We are pleased to announce that the new fitness room on the second floor will open on Monday, October 9. The room has treadmills, bicycles, and a small area for stretching.

The room will be open from 7 a.m. to 9 p.m. on weekdays. To use it, employees must first attend a 15-minute safety talk, held every Monday and Thursday at noon in Room 204.

Showers and lockers are available next to the room. Please bring your own towel.`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the memo?',
        options: [
          'To announce a new facility',
          'To change working hours',
          'To invite staff to a sports event',
          'To ask for volunteers',
        ],
        why: '"the new fitness room on the second floor will open": thông báo phòng tập mới, viết lại thành "a new facility".',
      },
      {
        q: 'What must employees do before using the room?',
        options: [
          'Attend a short safety talk',
          'Pay a monthly fee',
          'Book a time online',
          'Get a doctor’s note',
        ],
        why: '"employees must first attend a 15-minute safety talk". must là dấu hiệu của điều bắt buộc.',
      },
      {
        q: 'What are employees asked to bring?',
        options: ['A towel', 'A lock', 'Their ID card', 'A water bottle'],
        why: '"Please bring your own towel." Tủ đồ (lockers) đã có sẵn nên A lock là bẫy.',
      },
    ],
  },
  {
    id: 'p7-review-cafe',
    part: 7,
    passages: [
      {
        kind: REVIEW,
        text: `★★★★☆ Great place for a business lunch

I took two clients to Marino’s Kitchen last Tuesday. The pasta was excellent, and the staff were friendly and helpful. They even found us a quiet table at the back so we could talk about our project.

The only problem was the wait. Our main dishes took almost 40 minutes to arrive, although the restaurant was not very busy. I would still recommend Marino’s, but I suggest calling ahead to order if you are short on time.

— Laura Kim`,
      },
    ],
    questions: [
      {
        q: 'Why did Ms. Kim go to the restaurant?',
        options: [
          'To have a meeting with clients',
          'To celebrate a birthday',
          'To interview a chef',
          'To try a new pasta dish',
        ],
        why: '"I took two clients to Marino’s Kitchen… so we could talk about our project": bữa trưa công việc với khách.',
      },
      {
        q: 'What does Ms. Kim complain about?',
        options: ['Slow service', 'High prices', 'Noisy tables', 'Unfriendly staff'],
        why: '"The only problem was the wait… almost 40 minutes": món lên chậm. Nhân viên được khen thân thiện, bàn yên tĩnh.',
      },
      {
        q: 'What does Ms. Kim suggest?',
        options: [
          'Ordering in advance by phone',
          'Going on a busy day',
          'Sitting at the front',
          'Choosing a different restaurant',
        ],
        why: '"I suggest calling ahead to order": gọi điện đặt món trước, viết lại thành "Ordering in advance by phone".',
      },
    ],
  },
  {
    id: 'p7-package-chat',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Mark Ellis (2:14): Hi Jenny, a courier just left a large package for you at the front desk.
Jenny Park (2:15): Thanks! That must be the samples from our supplier. Can you keep it there until 4?
Mark Ellis (2:16): I’m leaving at 3 today. Shall I put it in your office instead?
Jenny Park (2:17): That would be great. The door isn’t locked.
Mark Ellis (2:18): No problem. It’s a bit heavy, so I’ll ask Tom to help me.`,
      },
    ],
    questions: [
      {
        q: 'What is most likely in the package?',
        options: ['Product samples', 'Office furniture', 'Printed reports', 'Company uniforms'],
        why: '"That must be the samples from our supplier": hàng mẫu từ nhà cung cấp.',
      },
      {
        q: 'At 2:17, what does Ms. Park mean when she writes, "The door isn’t locked"?',
        options: [
          'Mr. Ellis can enter her office.',
          'She forgot to lock her office.',
          'The front desk is open.',
          'Someone broke the lock.',
        ],
        why: 'Câu ý nghĩa: Mark hỏi có nên để gói hàng vào văn phòng của cô không, cô đồng ý và cho biết cửa không khoá, tức là anh vào được.',
      },
      {
        q: 'Why will Mr. Ellis ask Tom for help?',
        options: [
          'The package is heavy.',
          'He does not know the way.',
          'He has to leave at 2.',
          'Tom has the office key.',
        ],
        why: '"It’s a bit heavy, so I’ll ask Tom to help me." Lý do đứng trước so.',
      },
    ],
  },

  {
    id: 'p7-bike-share',
    part: 7,
    passages: [
      {
        kind: ARTICLE,
        text: `City Bike Share Expands

The city's bike share program will add 40 new stations next month, bringing the total to 120. Most of the new stations will be near train stations and universities, where demand has grown the fastest.

Since the program began two years ago, riders have taken more than one million trips. "Many people now ride a bike for the last part of their trip to work," said program manager Ana Silva.

A single ride still costs $2, but a new monthly pass for $20 will be offered starting in June.`,
      },
    ],
    questions: [
      {
        q: 'What is the article mainly about?',
        options: [
          'The growth of a bike share program',
          'A new train line',
          'The opening of a university',
          'A rise in bus fares',
        ],
        why: 'Tiêu đề và câu đầu: chương trình xe đạp công cộng thêm 40 trạm mới.',
      },
      {
        q: 'Where will most of the new stations be?',
        options: [
          'Near train stations and universities',
          'In shopping centers',
          'Next to parks',
          'Outside the city',
        ],
        why: '"Most of the new stations will be near train stations and universities".',
      },
      {
        q: 'What will change in June?',
        options: [
          'A monthly pass will be available.',
          'A single ride will cost more.',
          'The program will stop.',
          'Forty stations will close.',
        ],
        why: '"a new monthly pass for $20 will be offered starting in June". Giá một lượt "still costs $2", không đổi.',
      },
    ],
  },
  {
    id: 'p7-printer-notice',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `Important: Printing Changes

From Monday, all printers on the 3rd and 4th floors will require an employee ID card. Simply hold your card near the printer to release your document.

This change will help reduce paper waste, since documents that are never collected will be deleted after 24 hours. It will also keep private documents more secure.

If your card does not work with the printers, please visit the IT help desk in Room 105.`,
      },
    ],
    questions: [
      {
        q: 'What will employees need to print documents?',
        options: ['An ID card', 'A password', 'A new computer', 'Permission from a manager'],
        why: '"all printers… will require an employee ID card".',
      },
      {
        q: 'What is one reason for the change?',
        options: [
          'To reduce paper waste',
          'To save electricity',
          'To speed up printing',
          'To replace old printers',
        ],
        why: '"This change will help reduce paper waste". Lý do thứ hai là giữ tài liệu riêng an toàn hơn.',
      },
      {
        q: 'What happens to documents that are not collected?',
        options: [
          'They are deleted after a day.',
          'They are sent to the IT desk.',
          'They are printed on the 4th floor.',
          'They are kept for a week.',
        ],
        why: '"documents that are never collected will be deleted after 24 hours": sau một ngày.',
      },
    ],
  },
  {
    id: 'p7-team-lunch-chat',
    part: 7,
    passages: [
      {
        kind: CHAT,
        text: `Olivia Grant (11:05): Hi all, the team lunch on Friday is confirmed for 12:30 at Rosa's Kitchen.
Daniel Wu (11:07): Great. Is it the one on Pine Street or the new one by the station?
Olivia Grant (11:08): The new one. It's bigger, and they have a private room for groups.
Mia Torres (11:10): I have a client call until 12:45. I'll come right after.
Olivia Grant (11:11): No problem. I'll order for you if you tell me what you'd like.`,
      },
    ],
    questions: [
      {
        q: 'Where will the team have lunch?',
        options: [
          'At a restaurant near the station',
          'At a restaurant on Pine Street',
          'In the office',
          'At a client’s office',
        ],
        why: 'Daniel hỏi quán ở Pine Street hay quán mới cạnh nhà ga; Olivia đáp "The new one", tức là quán cạnh nhà ga.',
      },
      {
        q: 'Why will Ms. Torres be late?',
        options: [
          'She has a call with a client.',
          'She is driving from the station.',
          'She has to order food.',
          'She forgot about the lunch.',
        ],
        why: '"I have a client call until 12:45."',
      },
      {
        q: 'At 11:11, what does Ms. Grant offer to do?',
        options: [
          'Order food for Ms. Torres',
          'Change the time of the lunch',
          'Book a bigger room',
          'Call the client',
        ],
        why: '"I\'ll order for you if you tell me what you\'d like": gọi món giúp Mia.',
      },
    ],
  },
  {
    id: 'p7-elevator-notice',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `To all tenants of the Harbor Tower building

The east elevator will be closed for repairs from Monday, May 8, to Wednesday, May 10. During this time, please use the west elevator or the stairs. The west elevator will stop at every floor, so waiting times may be longer than usual.

Large deliveries should be scheduled for Thursday or later. If you need help moving heavy items before then, please call the building office at 555-0187 at least one day in advance.

We are sorry for any trouble this may cause.`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the notice?',
        options: [
          'To announce that an elevator will be out of service',
          'To introduce a new building office',
          'To ask tenants to move to another floor',
          'To explain a change in delivery companies',
        ],
        why: '"The east elevator will be closed for repairs": thông báo thang máy phía đông ngừng hoạt động để sửa.',
      },
      {
        q: 'When should tenants plan large deliveries?',
        options: ['On May 11 or later', 'On May 8', 'On May 9', 'On May 10'],
        why: 'Sửa từ thứ Hai 8/5 đến thứ Tư 10/5; "Large deliveries should be scheduled for Thursday or later": thứ Năm là 11/5.',
      },
      {
        q: 'What should tenants do if they need help with heavy items?',
        options: [
          'Contact the building office a day before',
          'Use the east elevator',
          'Wait until the repairs are finished',
          'Ask the delivery company to call',
        ],
        why: '"please call the building office at 555-0187 at least one day in advance": gọi văn phòng toà nhà trước ít nhất một ngày.',
      },
    ],
  },
  {
    id: 'p7-conference-email',
    part: 7,
    passages: [
      {
        kind: EMAIL,
        text: `To: Kevin Moore
From: Registration Team, Global Retail Forum
Subject: Your registration

Dear Mr. Moore,

Thank you for registering for the Global Retail Forum in Singapore. We have received your payment of $450 for the two-day pass.

As you requested, we have changed your workshop choice from "Online Marketing" to "Store Design," which takes place on the second day at 2 P.M. in Room B.

Please bring this e-mail or your registration number, GRF-2281, to the front desk to receive your name badge. The desk opens at 8 A.M. on both days.

Best regards,
Registration Team`,
      },
    ],
    questions: [
      {
        q: 'Why was the e-mail sent?',
        options: [
          'To confirm details of a registration',
          'To ask for a late payment',
          'To announce a new conference',
          'To cancel a workshop',
        ],
        why: 'Email xác nhận đã nhận tiền và đã đổi hội thảo nhỏ theo yêu cầu: xác nhận thông tin đăng ký.',
      },
      {
        q: 'What did Mr. Moore ask to do?',
        options: [
          'Attend a different workshop',
          'Pay for only one day',
          'Change his registration number',
          'Give a talk in Room B',
        ],
        why: '"As you requested, we have changed your workshop choice… to Store Design": ông Moore xin đổi hội thảo. Ông mua vé hai ngày.',
      },
      {
        q: 'What should Mr. Moore bring to the front desk?',
        options: [
          'His registration number',
          'His payment of $450',
          'A name badge',
          'A store design',
        ],
        why: '"Please bring this e-mail or your registration number": mang email hoặc mã đăng ký để nhận thẻ tên.',
      },
    ],
  },
  {
    id: 'p7-bakery-article',
    part: 7,
    passages: [
      {
        kind: ARTICLE,
        text: `Local Bakery to Open Second Shop

GREENVILLE — Sunrise Bakery, known for its fresh bread and fruit pies, will open a second shop on Oak Street next month. The bakery's first shop, on River Road, opened eight years ago and is often so busy that customers have to wait outside.

Owner Maria Santos said the new shop will be larger and will have tables, so customers can enjoy coffee with their pies. "Many people asked for a place to sit down," she said. The new shop will also sell sandwiches at lunchtime.

Ms. Santos plans to hire twelve new employees. Interested people can apply at the River Road shop.`,
      },
    ],
    questions: [
      {
        q: 'What is the article mainly about?',
        options: [
          'A business opening a new location',
          'A bakery moving to River Road',
          'A new coffee company in Greenville',
          'A cooking class for fruit pies',
        ],
        why: 'Tiêu đề "Local Bakery to Open Second Shop": tiệm bánh mở thêm cửa hàng thứ hai.',
      },
      {
        q: 'What is mentioned about the River Road shop?',
        options: [
          'It is often crowded.',
          'It has tables for customers.',
          'It will close next month.',
          'It sells sandwiches at lunch.',
        ],
        why: '"is often so busy that customers have to wait outside": quán cũ hay đông. Bàn ghế và bánh mì kẹp là của quán mới.',
      },
      {
        q: 'How can people apply for a job?',
        options: [
          'By visiting the River Road shop',
          'By calling Ms. Santos',
          'By going to Oak Street next month',
          'By sending an e-mail to the bakery',
        ],
        why: '"Interested people can apply at the River Road shop."',
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
  {
    id: 'p7-printer-memo',
    part: 7,
    passages: [
      {
        kind: MEMO,
        text: `MEMO
To: All employees
From: Facilities Department
Date: April 2
Subject: New printers

New printers will be installed on every floor this Thursday, April 4. Installation will begin at 8:00 A.M. and should be finished by noon. During this time, the printers on the second and third floors will not be available, so please print any important documents on Wednesday.

To use the new printers, you will need your employee ID card. Simply hold your card near the reader on the front of the printer. Staff who have lost their card should request a new one from the front desk before Thursday.

Instructions will be posted next to each printer. Questions may be sent to Ray Chen at extension 214.`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the memo?',
        options: [
          'To announce the installation of new equipment',
          'To ask staff to print fewer documents',
          'To introduce a new employee',
          'To explain a change in office hours',
        ],
        why: 'Tiêu đề "New printers" và câu đầu: máy in mới sẽ được lắp ở mọi tầng. Câu hỏi mục đích thường trả lời ở đầu bài.',
      },
      {
        q: 'What are employees advised to do on Wednesday?',
        options: [
          'Print important documents',
          'Collect their new ID cards',
          'Attend a training session',
          'Call Mr. Chen',
        ],
        why: '"please print any important documents on Wednesday", vì sáng thứ Năm máy in tầng 2 và 3 không dùng được.',
      },
      {
        q: 'What will employees need in order to use the new printers?',
        options: ['An ID card', 'A password', 'A form signed by a manager', 'A printing code'],
        why: '"you will need your employee ID card": chạm thẻ vào đầu đọc trên máy in.',
      },
    ],
  },
  {
    id: 'p7-cafe-article',
    part: 7,
    passages: [
      {
        kind: ARTICLE,
        text: `RIVERSIDE (May 10) — Bean & Leaf, the popular café on Market Street, will open a second location next month. The new café will be in the Riverside Shopping Center, next to the movie theater.

Owner Maria Santos started the business six years ago with just four tables. "Many of our customers live on the other side of the river," she said. "Now they won't have to travel so far for their morning coffee."

The new location will be larger than the original one and will seat about 60 people. Unlike the Market Street café, it will stay open until 10:00 P.M. to serve moviegoers. Ms. Santos is currently hiring 12 staff members for the new café. Interested applicants can apply on the café's website.`,
      },
    ],
    questions: [
      {
        q: 'What is the article mainly about?',
        options: [
          'The opening of a new business location',
          'The history of a shopping center',
          'A new movie theater',
          'A change of owner at a café',
        ],
        why: 'Câu đầu: Bean & Leaf "will open a second location next month". Phần còn lại nói thêm về chi nhánh mới.',
      },
      {
        q: 'Why did Ms. Santos choose the new location?',
        options: [
          'Many customers live near it.',
          'The rent is lower there.',
          'The Market Street café is closing.',
          'The movie theater asked her to open there.',
        ],
        why: '"Many of our customers live on the other side of the river… they won\'t have to travel so far."',
      },
      {
        q: 'What is NOT true about the new café?',
        options: [
          'It will be smaller than the original café.',
          'It will be next to a movie theater.',
          'It will be open until 10:00 P.M.',
          'It will have about 60 seats.',
        ],
        why: 'Câu hỏi NOT: tìm điều trái với bài. Bài nói quán mới "larger than the original one", không phải nhỏ hơn. Ba ý còn lại đều có trong bài.',
      },
      {
        q: 'The word "serve" in paragraph 3, line 2, is closest in meaning to',
        options: ['provide for', 'work as', 'deliver', 'play'],
        why: '"to serve moviegoers": phục vụ khách xem phim, tức là đáp ứng nhu cầu của họ (provide for). Câu hỏi gần nghĩa phải đọc theo ngữ cảnh, không theo nghĩa thường gặp nhất.',
      },
    ],
  },
  {
    id: 'p7-hotel-review',
    part: 7,
    passages: [
      {
        kind: REVIEW,
        text: `★★★★☆  Great location, slow check-in
Posted by Daniel Park, October 3

I stayed at the Harbor View Hotel for three nights during a business trip. The hotel is only a five-minute walk from the convention center, which was perfect for me. My room was clean and quiet, and the free breakfast had plenty of choices.

The only problem was check-in. I arrived at 3:00 P.M. and had to wait almost 40 minutes because only one person was working at the front desk. The manager apologized and gave me a voucher for a free dinner at the hotel restaurant, which I appreciated.

I would definitely stay here again on my next trip.`,
      },
    ],
    questions: [
      {
        q: 'Why did Mr. Park stay at the hotel?',
        options: [
          'He was on a business trip.',
          'He was on vacation with his family.',
          'He was attending a wedding.',
          'He was moving to the city.',
        ],
        why: '"I stayed at the Harbor View Hotel for three nights during a business trip."',
      },
      {
        q: 'What did Mr. Park like about the hotel?',
        options: [
          'It was close to the convention center.',
          'Check-in was quick.',
          'The rooms had a harbor view.',
          'Dinner was included in the price.',
        ],
        why: '"only a five-minute walk from the convention center, which was perfect for me". Tên khách sạn có "Harbor View" nhưng bài không nói phòng nhìn ra cảng: bẫy lặp từ.',
      },
      {
        q: 'What did the manager give Mr. Park?',
        options: [
          'A voucher for a meal',
          'A room upgrade',
          'A refund for one night',
          'A free breakfast',
        ],
        why: '"gave me a voucher for a free dinner at the hotel restaurant". Bữa sáng vốn đã miễn phí cho mọi khách.',
      },
    ],
  },
  {
    id: 'p7-sale-order',
    part: 7,
    passages: [
      {
        kind: AD,
        text: `OFFICE PLUS — Spring Sale!
April 15–30 only

• 20% off all office chairs
• Buy two boxes of copy paper, get one free
• Free delivery on orders over $150

Order online at www.officeplus.com or call 555-0182.
Business customers with an Office Plus account receive an extra 5% off.`,
      },
      {
        kind: EMAIL,
        text: `To: orders@officeplus.com
From: Helen Wu, Lane Design Studio
Date: April 18
Subject: Order 7731

Hello,

Yesterday I ordered six office chairs and four boxes of copy paper for our studio. The total came to $640, so I expected free delivery, but a $25 delivery charge was added to my bill. Also, I only received four boxes of paper, although the sale says I should get two free ones.

Could you please correct my bill? We have had an Office Plus business account for three years.

Thank you,
Helen Wu`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the email?',
        options: [
          'To report problems with an order',
          'To open a business account',
          'To ask about the dates of a sale',
          'To cancel an order',
        ],
        why: 'Cô ấy nêu hai lỗi (phí giao hàng, thiếu giấy) và hỏi "Could you please correct my bill?"',
      },
      {
        q: 'Why should Ms. Wu not have paid for delivery?',
        options: [
          'Her order was over $150.',
          'She picked the order up herself.',
          'She ordered before April 15.',
          'Delivery is always free for business customers.',
        ],
        why: 'Ghép hai đoạn: quảng cáo hứa "Free delivery on orders over $150", đơn của cô ấy $640.',
      },
      {
        q: 'How many boxes of paper should Ms. Wu have received in total?',
        options: ['Six', 'Four', 'Two', 'Eight'],
        why: '"Buy two, get one free": mua 4 hộp thì được tặng 2, tổng cộng 6. Cô ấy chỉ nhận 4.',
      },
      {
        q: 'What is suggested about Lane Design Studio?',
        options: [
          'It should receive an extra discount.',
          'It placed the order by phone.',
          'It is a new customer of Office Plus.',
          'It ordered chairs that were not on sale.',
        ],
        why: 'Ghép hai đoạn: studio có tài khoản doanh nghiệp ba năm nay, mà quảng cáo nói khách có tài khoản được giảm thêm 5%. "suggested" là hỏi điều suy ra được.',
      },
    ],
  },
  {
    id: 'p7-volunteer-form',
    part: 7,
    passages: [
      {
        kind: NOTICE,
        text: `City Park Clean-Up Day — Saturday, June 8, 9:00 A.M. to 1:00 P.M.

Volunteers are needed to help clean Lakeside Park. Gloves, bags, and drinks will be provided. Lunch will be served at 1:00 P.M. for all volunteers.

Volunteers under 16 must come with an adult. Please register by June 3 so that we know how much lunch to order. Groups of five or more should register through our office by phone at 555-0147.`,
      },
      {
        kind: FORM,
        text: `Clean-Up Day — Volunteer Registration

Name: Paul Grant
Number of people: 3 (myself and my two children, ages 12 and 14)
Arrival time: 10:00 A.M.
Staying for lunch: Yes
Comments: We can only stay until noon, but my children would really like to help. Could you tell me which entrance is closest to the parking lot?
Date submitted: June 5`,
      },
    ],
    questions: [
      {
        q: 'What is NOT mentioned as something volunteers will receive?',
        options: ['T-shirts', 'Gloves', 'Drinks', 'Lunch'],
        why: 'Câu hỏi NOT: thông báo nêu găng tay, túi, đồ uống và bữa trưa, không có áo phông.',
      },
      {
        q: 'Why are Mr. Grant’s children allowed to take part?',
        options: [
          'They will come with an adult.',
          'They are over 16.',
          'They registered as a group.',
          'They live near the park.',
        ],
        why: 'Ghép hai đoạn: dưới 16 tuổi phải đi cùng người lớn; hai con 12 và 14 tuổi đi cùng ông Grant.',
      },
      {
        q: 'What problem is there with Mr. Grant’s form?',
        options: [
          'He submitted it after the deadline.',
          'He should have registered by phone.',
          'He did not give his children’s ages.',
          'He chose an arrival time after the event ends.',
        ],
        why: 'Hạn đăng ký là June 3, phiếu nộp June 5. Nhóm 3 người nên không cần gọi điện (từ 5 người trở lên).',
      },
      {
        q: 'What information is inconsistent on the form?',
        options: [
          'He says he will stay for lunch but leave at noon.',
          'He gives two different arrival times.',
          'He lists four people but names three.',
          'He asks for the parking lot but says he will walk.',
        ],
        why: 'Bữa trưa phục vụ lúc 1:00 P.M., nhưng ông ấy chỉ ở được tới trưa (noon) mà vẫn đánh dấu "Staying for lunch: Yes".',
      },
    ],
  },
  {
    id: 'p7-training-invoice',
    part: 7,
    passages: [
      {
        kind: AD,
        text: `Speak with Confidence — One-Day Workshop
Saturday, May 18, 9:00 A.M. – 4:00 P.M., Lakeside Hotel

Learn how to give clear and powerful presentations at work.
Fee: $120 per person, lunch included.
Groups of four or more from the same company: $100 per person.
Register by May 10 at www.speakconfidence.com.`,
      },
      {
        kind: EMAIL,
        text: `To: info@speakconfidence.com
From: Rita Chan, Green Leaf Foods
Date: May 12
Subject: Registration

Hello,

I would like to register five people from our sales team for the workshop on May 18. I know the deadline has passed, but I hope there is still room. Could you also tell me whether vegetarian meals are available? Two of my colleagues do not eat meat.

Thank you,
Rita Chan`,
      },
    ],
    questions: [
      {
        q: 'What is the workshop about?',
        options: [
          'Giving presentations',
          'Selling food products',
          'Planning business trips',
          'Using new software',
        ],
        why: '"Learn how to give clear and powerful presentations at work."',
      },
      {
        q: 'How much will Green Leaf Foods most likely pay per person?',
        options: ['$100', '$120', '$90', '$500'],
        why: 'Ghép hai đoạn: nhóm từ bốn người cùng công ty được $100 một người; bà Chan đăng ký năm người. $500 là tổng cho cả năm người, không phải giá một người.',
      },
      {
        q: 'What problem does Ms. Chan mention?',
        options: [
          'She is registering after the deadline.',
          'The workshop is too expensive.',
          'The hotel is too far away.',
          'Her team cannot attend on Saturday.',
        ],
        why: 'Hạn đăng ký là May 10, email gửi May 12: "I know the deadline has passed".',
      },
      {
        q: 'What does Ms. Chan ask about?',
        options: ['Meals without meat', 'Hotel rooms', 'A refund', 'Parking'],
        why: '"Could you also tell me whether vegetarian meals are available?" Hai đồng nghiệp không ăn thịt.',
      },
    ],
  },
  {
    id: 'p7-repair-letter',
    part: 7,
    passages: [
      {
        kind: LETTER,
        text: `Dear Mr. Watts,

Thank you for choosing HomeFix for the repair of your washing machine. Our technician, Ken Ono, will visit your home on Tuesday, June 4, between 2:00 and 4:00 P.M.

Please make sure someone over 18 is at home during the visit. If you need to change the appointment, call us at least one day in advance at 555-0190.

Sincerely,
HomeFix Customer Service`,
      },
      {
        kind: CHAT,
        text: `Leo Watts (June 3, 6:40 P.M.): Hi, this is Leo Watts. I have a repair visit tomorrow afternoon, but I have to stay late at work. Is Thursday possible?
HomeFix (June 3, 6:45 P.M.): Hello Mr. Watts. Thursday afternoon is fully booked, but we have an opening on Thursday at 9:00 A.M.
Leo Watts (June 3, 6:46 P.M.): That works. Thanks!`,
      },
    ],
    questions: [
      {
        q: 'What is the purpose of the letter?',
        options: [
          'To confirm a repair appointment',
          'To advertise a new washing machine',
          'To ask for a payment',
          'To introduce a new technician',
        ],
        why: 'Thư báo ngày giờ kỹ thuật viên đến sửa máy giặt: xác nhận lịch hẹn.',
      },
      {
        q: 'Why does Mr. Watts want to change the appointment?',
        options: [
          'He has to work late.',
          'His washing machine is working again.',
          'He will be on vacation.',
          'He wants a different technician.',
        ],
        why: '"I have to stay late at work."',
      },
      {
        q: 'What is suggested about Mr. Watts’s request?',
        options: [
          'It was made at least one day before the visit.',
          'It was made too late to change anything.',
          'It was sent by e-mail.',
          'It was rejected.',
        ],
        why: 'Ghép hai đoạn: thư yêu cầu đổi lịch trước ít nhất một ngày; ông Watts nhắn ngày 3/6 cho lịch hẹn ngày 4/6, vẫn đúng hạn. "suggested" là hỏi điều suy ra được.',
      },
      {
        q: 'When will the technician most likely visit?',
        options: [
          'Thursday morning',
          'Thursday afternoon',
          'Tuesday afternoon',
          'Wednesday morning',
        ],
        why: 'Chiều thứ Năm đã kín lịch, còn 9:00 sáng thứ Năm và ông Watts trả lời "That works".',
      },
    ],
  },
  {
    id: 'p7-print-invoice',
    part: 7,
    passages: [
      {
        kind: INVOICE,
        text: `QuickPrint Services — Invoice #4471
Customer: Bayview Dental Clinic
Date: September 9

500 business cards ........ $60
200 appointment cards ..... $45
100 posters (A3) .......... $120
Delivery .................. $15

Total ..................... $240

Payment due within 30 days.`,
      },
      {
        kind: EMAIL,
        text: `To: QuickPrint Services
From: Grace Lim, Bayview Dental Clinic
Subject: Invoice #4471

Hello,

Thank you for the quick delivery. Everything looks great, but I noticed that we were charged for 100 posters. We ordered only 50, and that is what we received. Could you please send a corrected invoice?

Also, we would like to order the same appointment cards again next month.

Best regards,
Grace Lim`,
      },
    ],
    questions: [
      {
        q: 'Why did Ms. Lim write the e-mail?',
        options: [
          'To point out a billing error',
          'To complain about a late delivery',
          'To cancel an order',
          'To ask for a new design',
        ],
        why: 'Cô ấy cảm ơn vì giao nhanh, rồi nêu vấn đề chính: bị tính 100 tờ áp phích trong khi chỉ đặt 50.',
      },
      {
        q: 'How much should the posters most likely cost on the corrected invoice?',
        options: ['$60', '$120', '$45', '$240'],
        why: 'Ghép hai đoạn: 100 tờ giá $120 (hoá đơn), nên 50 tờ là $60. Bẫy: $60 cũng là giá danh thiếp, nhưng ở đây là phép tính.',
      },
      {
        q: 'What does Ms. Lim plan to do next month?',
        options: [
          'Order appointment cards',
          'Order more posters',
          'Pay the full invoice',
          'Visit the print shop',
        ],
        why: '"we would like to order the same appointment cards again next month".',
      },
    ],
  },
  {
    id: 'p7-training-schedule',
    part: 7,
    passages: [
      {
        kind: SCHEDULE,
        text: `New Employee Training — Week of March 10

Monday     9:00–12:00   Company policies        Room 201
Tuesday    9:00–12:00   Computer systems        Room 305
Wednesday  1:00–4:00    Customer service        Room 201
Thursday   1:00–4:00    Safety training         Warehouse
Friday     9:00–11:00   Meeting with managers   Room 410`,
      },
      {
        kind: EMAIL,
        text: `To: New employees
From: Paula Green, Human Resources
Subject: Change to training schedule

Dear all,

Because of a fire inspection, the warehouse will be closed on Thursday. The session planned there will move to Friday afternoon from 1:00 to 4:00, in the same place. The other sessions will not change.

Please wear closed shoes for this session.

Paula Green`,
      },
    ],
    questions: [
      {
        q: 'Why was the schedule changed?',
        options: [
          'A building will be inspected.',
          'A manager is on vacation.',
          'A room is too small.',
          'A trainer is sick.',
        ],
        why: '"Because of a fire inspection, the warehouse will be closed": kiểm tra phòng cháy, viết lại thành "inspected".',
      },
      {
        q: 'Which session will now take place on Friday afternoon?',
        options: [
          'Safety training',
          'Customer service',
          'Computer systems',
          'Meeting with managers',
        ],
        why: 'Ghép hai đoạn: buổi ở nhà kho (Warehouse) dời sang chiều thứ Sáu, và theo lịch buổi ở nhà kho là Safety training.',
      },
      {
        q: 'What are employees asked to do?',
        options: [
          'Wear suitable shoes',
          'Bring their computers',
          'Go to Room 410 on Thursday',
          'Sign up for a new session',
        ],
        why: '"Please wear closed shoes for this session": đi giày kín mũi, viết lại thành "suitable shoes".',
      },
    ],
  },
  {
    id: 'p7-hotel-booking',
    part: 7,
    passages: [
      {
        kind: AD,
        text: `Seaside Inn — Spring Offer

Standard room: $90 per night
Sea-view room: $130 per night

Stay three nights or more and get 15% off your total bill.
Free breakfast for all guests. Parking: $10 per day.`,
      },
      {
        kind: EMAIL,
        text: `To: bookings@seasideinn.com
From: Paul Rivera
Subject: Reservation

Hello,

I would like to book a sea-view room for my wife and me from April 12 to April 14 (two nights). We will arrive by train, so we will not need a parking space.

Could you also tell me if there is a restaurant near the hotel that is open late? Our train arrives at 9:30 p.m.

Thank you,
Paul Rivera`,
      },
    ],
    questions: [
      {
        q: 'How much will Mr. Rivera most likely pay for his room?',
        options: ['$260', '$221', '$180', '$270'],
        why: 'Ghép hai đoạn: phòng nhìn ra biển $130 một đêm, ở hai đêm là $260. Chỉ ở từ ba đêm mới được giảm 15%, nên $221 là bẫy.',
      },
      {
        q: 'Why will Mr. Rivera not pay for parking?',
        options: [
          'He will travel by train.',
          'Parking is free for guests.',
          'He booked a sea-view room.',
          'He is staying three nights.',
        ],
        why: '"We will arrive by train, so we will not need a parking space." Quảng cáo ghi đỗ xe $10 một ngày, không miễn phí.',
      },
      {
        q: 'What does Mr. Rivera ask about?',
        options: [
          'A place to eat late in the evening',
          'A discount for long stays',
          'The time breakfast is served',
          'A train schedule',
        ],
        why: '"is there a restaurant near the hotel that is open late?" vì tàu đến lúc 9:30 tối.',
      },
    ],
  },
  {
    id: 'p7-job-schedule',
    part: 7,
    passages: [
      {
        kind: JOB,
        text: `Part-Time Sales Assistant — Lakeview Bookstore

We are looking for a friendly sales assistant to work 20 hours a week, mainly on weekends. Duties include helping customers, arranging books on shelves, and using the cash register.

Experience in retail is helpful but not required. Applicants must be available on Saturdays and Sundays.

Please send your résumé to Ms. Ito at jobs@lakeviewbooks.com.`,
      },
      {
        kind: EMAIL,
        text: `To: jobs@lakeviewbooks.com
From: Sam Wilson
Subject: Sales assistant position

Dear Ms. Ito,

I am writing to apply for the part-time sales assistant position. I am a university student studying literature, and I worked at a café for two years, so I am used to serving customers.

I have classes on weekday mornings, but I am free every weekend and on weekday evenings after 5 p.m. My résumé is attached.

Best regards,
Sam Wilson`,
      },
    ],
    questions: [
      {
        q: 'What is NOT mentioned as a duty of the job?',
        options: [
          'Ordering new books',
          'Helping customers',
          'Arranging books',
          'Using the cash register',
        ],
        why: 'Câu NOT: tin tuyển dụng liệt kê giúp khách, xếp sách, dùng máy tính tiền. Đặt sách mới không được nhắc.',
      },
      {
        q: 'Why does Mr. Wilson mention the café?',
        options: [
          'To show he has experience with customers',
          'To explain why he cannot work on weekends',
          'To ask for a higher salary',
          'To suggest a place to meet',
        ],
        why: '"I worked at a café for two years, so I am used to serving customers": nêu kinh nghiệm phục vụ khách.',
      },
      {
        q: 'What requirement of the job does Mr. Wilson meet?',
        options: [
          'He is free on weekends.',
          'He has worked in a bookstore.',
          'He can work weekday mornings.',
          'He has studied business.',
        ],
        why: 'Ghép hai đoạn: tin tuyển dụng bắt buộc rảnh thứ Bảy và Chủ nhật; Sam viết "I am free every weekend". Sáng các ngày thường anh ấy có lớp.',
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
