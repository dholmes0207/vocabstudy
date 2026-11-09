import { wordCount } from './ielts'

// "TOEIC Writing: trả lời email" (docs/design/toeic-writing.md): Questions 6–7
// of the TOEIC Writing test. The learner reads an email and replies doing
// exactly what the directions ask (ask two questions, make one suggestion…).
// The page ticks a checklist as the reply grows and shows a model answer.
// Pure; data inline like lib/toeicSpeaking.ts.

export interface EmailTask {
  id: string
  from: string
  subject: string
  body: string
  /** The directions, as the test prints them. */
  directions: string
  /** What the directions ask for, in Vietnamese, for the checklist. */
  asks: [vi: string, en: string]
  /** How many questions the reply must ask (counted by question marks). */
  questions: number
  model: string
}

export const EMAIL_TASKS: EmailTask[] = [
  {
    id: 'fitness',
    from: 'Linda Park, Riverside Fitness Center',
    subject: 'New pool and classes',
    body: 'Dear member, We are pleased to announce that Riverside Fitness Center will open a new swimming pool next month. We are also planning to offer evening yoga classes. We would like to hear what our members think about these plans.',
    directions:
      'Respond to the email as if you are a member of the fitness center. In your email, ask TWO questions and make ONE suggestion.',
    asks: ['Hỏi 2 câu và đưa ra 1 đề xuất', 'Ask two questions and make one suggestion'],
    questions: 2,
    model:
      'Dear Ms. Park,\n\nThank you for letting us know about the new swimming pool. I have two questions. First, will members have to pay extra to use the pool? Second, what time will the evening yoga classes start? I work until six, so I hope they will begin after seven.\n\nI would also suggest offering swimming lessons for beginners on weekends, because many members, including me, cannot swim very well.\n\nBest regards,\nMinh Tran',
  },
  {
    id: 'laptop',
    from: 'Customer Service, BrightTech Electronics',
    subject: 'Your recent order',
    body: 'Dear Customer, Thank you for your recent purchase of a BrightTech laptop. We hope you are enjoying it. We would appreciate it if you could tell us about your experience with our product and our service.',
    directions:
      'Respond to the email as if you are the customer. In your email, describe ONE problem you have had and make TWO requests.',
    asks: ['Nêu 1 vấn đề và đưa ra 2 yêu cầu', 'Describe one problem and make two requests'],
    questions: 2,
    model:
      'Dear BrightTech Customer Service,\n\nThank you for your email. I am generally happy with my new laptop, but I have had one problem: the battery only lasts about two hours, even though the website said it would last eight.\n\nI have two requests. Could you please send me a replacement battery or explain how to fix the problem? Also, could you tell me whether the laptop is still under warranty if I need to send it back?\n\nI look forward to hearing from you.\n\nSincerely,\nLan Nguyen',
  },
  {
    id: 'picnic',
    from: 'Mark Wilson, Human Resources',
    subject: 'Company picnic',
    body: 'Dear all, We are organizing a picnic for all staff next month. We have not decided on the place or the date yet, and we would welcome your ideas.',
    directions:
      'Respond to the email as if you are an employee. In your email, give TWO suggestions and ask ONE question.',
    asks: ['Đưa ra 2 đề xuất và hỏi 1 câu', 'Give two suggestions and ask one question'],
    questions: 1,
    model:
      'Dear Mr. Wilson,\n\nThank you for organizing the company picnic. I think it is a great idea, and I have two suggestions. First, Green Lake Park would be a good place, because it is close to the office and has plenty of space for games. Second, a Saturday in the middle of the month might be best, since many people are busy at the end of the month.\n\nI also have one question: will employees be allowed to bring their families?\n\nKind regards,\nHoa Le',
  },
]

/** Fewest words for a reply that does the whole task. */
export const EMAIL_MIN_WORDS = 50

export interface EmailCheck {
  greeting: boolean
  closing: boolean
  questions: number
  words: number
}

/** What the checklist looks at: a greeting, a sign-off, questions asked, length. */
export function checkEmail(reply: string): EmailCheck {
  const text = reply.trim()
  return {
    greeting: /^(dear|hi|hello)\b/i.test(text),
    closing: /\b(regards|sincerely|best wishes|thank you|thanks|look forward)\b/i.test(
      text.split(/\n/).slice(-4).join(' ')
    ),
    questions: (text.match(/\?/g) ?? []).length,
    words: wordCount(text),
  }
}

/** XP for handing in a reply. */
export const EMAIL_XP = 10
