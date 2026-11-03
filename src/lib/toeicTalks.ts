import type { ReadingQuestion } from './toeicReading'

// TOEIC Part 3 ("Conversations") and Part 4 ("Talks"), docs/design/toeic.md.
// Hand-written: two people at work (Part 3) or one speaker (Part 4) — a
// voicemail, an announcement, an introduction, an ad — each with three
// questions. As on the test, the questions and options are printed and the
// talk is only heard; the transcript shows once every question is answered.

/** W and M take turns in a conversation; N is the one speaker of a talk. */
export type Speaker = 'W' | 'M' | 'N'

export interface TalkSet {
  id: string
  part: 3 | 4
  lines: { speaker: Speaker; text: string }[]
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
]

/** A set of the part, not the one just done when there is another. */
export function pickTalk(part: 3 | 4, lastId?: string, rand: () => number = Math.random): TalkSet {
  const all = TALK_SETS.filter((s) => s.part === part)
  const pool = all.length > 1 ? all.filter((s) => s.id !== lastId) : all
  return pool[Math.floor(rand() * pool.length)]
}
