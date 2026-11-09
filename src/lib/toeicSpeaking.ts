// "TOEIC Speaking" (docs/design/toeic-speaking.md): four tasks of the TOEIC
// Speaking test. Read a short text aloud (Questions 1–2), answer three
// questions on an everyday topic in a telephone survey (Questions 5–7),
// answer a caller from a schedule on screen (Questions 8–10), and give an
// opinion with reasons (Question 11). Each answer is recorded; the
// questions come with a sample answer and one phrase worth borrowing (`key`
// is part of `a`). Pure; data inline like lib/hskk.ts.

export interface SampleAnswer {
  a: string
  key: string
}

export interface ReadAloud {
  id: string
  text: string
}

export interface SurveySet {
  id: string
  /** The situation the test sets up before the questions. */
  intro: string
  questions: { q: string; seconds: number; sample: SampleAnswer }[]
}

/** Questions 8–10: a schedule or notice on screen, and a caller asking about it. */
export interface InfoSet {
  id: string
  title: string
  /** The lines of the schedule, as the test shows them. */
  lines: string[]
  /** What the caller says before the questions. */
  intro: string
  questions: { q: string; seconds: number; sample: SampleAnswer }[]
}

export interface OpinionPrompt {
  id: string
  prompt: string
  sample: SampleAnswer
}

export type ToeicSpeakingTask = 'read' | 'respond' | 'info' | 'opinion'

/** Seconds to prepare and to speak, as in the test. */
export const READ_SECONDS = 45
export const OPINION_SECONDS = 60

export const READ_ALOUD: ReadAloud[] = [
  {
    id: 'library',
    text: 'Welcome to Riverside Library. We are open from nine a.m. to eight p.m., Monday through Saturday. Visitors can borrow books, magazines and DVDs, and free Wi-Fi is available throughout the building. If you need help finding anything, please ask a member of staff at the front desk.',
  },
  {
    id: 'train',
    text: 'Attention, passengers. The ten fifteen train to Central Station has been delayed by approximately twenty minutes because of a signal problem. We apologize for the inconvenience. Passengers may wait in the main hall, where hot drinks and snacks are available. Thank you for your patience.',
  },
  {
    id: 'restaurant',
    text: 'Thank you for calling Green Leaf Restaurant. We are currently closed. Our opening hours are eleven a.m. to ten p.m., Tuesday to Sunday. To make a reservation, please visit our website or call back during business hours. We look forward to serving you.',
  },
  {
    id: 'weather',
    text: 'And now for the weekend weather. Saturday will be warm and sunny, with temperatures reaching thirty degrees. On Sunday, however, clouds will move in from the west, bringing heavy rain and strong winds in the afternoon. If you are planning a trip, take an umbrella.',
  },
]

const q = (text: string, seconds: number, a: string, key: string) => ({
  q: text,
  seconds,
  sample: { a, key },
})

export const SURVEYS: SurveySet[] = [
  {
    id: 'shopping',
    intro:
      'Imagine that a marketing firm is doing research in your area. You have agreed to take part in a telephone interview about shopping.',
    questions: [
      q(
        'How often do you go shopping, and where do you usually go?',
        15,
        'I go shopping about twice a week, usually at a supermarket near my home, because it’s convenient.',
        'because it’s convenient'
      ),
      q(
        'Do you prefer shopping alone or with friends? Why?',
        15,
        'I prefer shopping alone, because I can take my time and I don’t have to wait for anyone.',
        'I can take my time'
      ),
      q(
        'Would you like to shop online more often in the future? Why or why not?',
        30,
        'Yes, I would. Online shopping saves a lot of time, and I can easily compare prices from different stores. However, for clothes I still like to go to a shop, because I want to try them on first.',
        'However, for clothes'
      ),
    ],
  },
  {
    id: 'exercise',
    intro:
      'Imagine that a health magazine is doing research for an article. You have agreed to take part in a telephone interview about exercise.',
    questions: [
      q(
        'How often do you exercise, and what kind of exercise do you do?',
        15,
        'I exercise three times a week. I usually go jogging in the park near my house.',
        'three times a week'
      ),
      q(
        'Where is the best place to exercise in your city?',
        15,
        'I think the best place is the riverside park, because it’s large, green and free for everyone.',
        'I think the best place is'
      ),
      q(
        'If a gym opened near your workplace, would you join it? Why or why not?',
        30,
        'Probably not. I’d rather exercise outdoors, because fresh air helps me relax after work. Also, gym memberships can be quite expensive, so jogging in the park is a better choice for me.',
        'I’d rather'
      ),
    ],
  },
  {
    id: 'travel',
    intro:
      'Imagine that a travel agency is doing research in your country. You have agreed to take part in a telephone interview about holidays.',
    questions: [
      q(
        'When was the last time you went on a trip, and where did you go?',
        15,
        'The last time I went on a trip was in July. I went to Da Nang with my family for four days.',
        'The last time I went on a trip was'
      ),
      q(
        'Do you prefer to travel by plane or by train? Why?',
        15,
        'I prefer to travel by plane, because it’s much faster, and these days tickets are not very expensive.',
        'it’s much faster'
      ),
      q(
        'What information do you look for before you choose a hotel?',
        30,
        'First, I check the location, because I want to be close to the places I plan to visit. Then I read reviews from other guests to see if the rooms are clean and the staff are friendly. Finally, of course, I compare prices.',
        'First, I check'
      ),
    ],
  },
]

export const INFO_SETS: InfoSet[] = [
  {
    id: 'conference',
    title: 'Riverside Business Conference · Saturday, May 18 · Grand Hotel',
    lines: [
      '9:00 a.m. Registration and coffee',
      '9:30 a.m. Opening talk: The Future of Online Shopping (Dr. Lisa Chen)',
      '11:00 a.m. Workshop: Social Media Marketing (Tom Wright)',
      '12:30 p.m. Lunch (included)',
      '2:00 p.m. Panel: Starting a Small Business (cancelled)',
      '3:30 p.m. Workshop: Writing a Business Plan (Maria Lopez)',
      'Fee: $80 ($60 if you register before May 1)',
    ],
    intro:
      'Hi, I’m thinking of going to the business conference, but I don’t have the schedule. Could you answer a few questions for me?',
    questions: [
      q(
        'What time does the conference start, and where is it?',
        15,
        'The conference starts at nine a.m. with registration and coffee, and it’s being held at the Grand Hotel.',
        'it’s being held at'
      ),
      q(
        'I heard there’s a panel on starting a small business. Is that right?',
        15,
        'I’m sorry, but that panel has been cancelled. However, there’s a workshop on writing a business plan at three thirty, which might interest you.',
        'I’m sorry, but'
      ),
      q(
        'Could you tell me about the workshops on the schedule?',
        30,
        'Sure. There are two workshops. The first one is at eleven a.m. It’s about social media marketing, and it’s led by Tom Wright. The second one starts at three thirty in the afternoon, when Maria Lopez will talk about writing a business plan. Lunch at twelve thirty is included in the fee.',
        'There are two workshops'
      ),
    ],
  },
  {
    id: 'interviews',
    title: 'Interview schedule · Brightway Marketing · Thursday, June 6 · Room 204',
    lines: [
      '9:00 a.m. Anna Kim (Sales Assistant)',
      '10:00 a.m. David Park (Graphic Designer)',
      '11:00 a.m. Sara Nguyen (Sales Assistant)',
      '1:30 p.m. James Lee (Office Manager), moved to Friday',
      '2:30 p.m. Emma Brown (Graphic Designer)',
    ],
    intro:
      'Hi, this is Mr. Adams. I’m on the interview panel on Thursday, but I left the schedule at home. Can you help me?',
    questions: [
      q(
        'Where will the interviews take place, and what time is the first one?',
        15,
        'The interviews will take place in Room 204, and the first one starts at nine a.m. with Anna Kim.',
        'will take place in'
      ),
      q(
        'I’ll be interviewing James Lee at one thirty, right?',
        15,
        'Actually, no. James Lee’s interview has been moved to Friday, so you’ll have a break at one thirty.',
        'has been moved to'
      ),
      q(
        'Who is applying for the graphic designer position?',
        30,
        'There are two candidates for the graphic designer position. The first is David Park, whose interview is at ten a.m. The second is Emma Brown, and her interview is at two thirty in the afternoon.',
        'There are two candidates'
      ),
    ],
  },
  {
    id: 'city-tour',
    title: 'Green City Day Tour · Every Sunday · $45 per person',
    lines: [
      '8:00 a.m. Pick-up from the Central Hotel',
      '9:00 a.m. Visit to the History Museum',
      '11:30 a.m. Boat trip on the river',
      '1:00 p.m. Lunch at a local restaurant (not included)',
      '3:00 p.m. Shopping at the Old Town Market',
      '5:00 p.m. Return to the hotel',
    ],
    intro: 'Hi, I saw your advertisement for the city tour, and I’d like some information.',
    questions: [
      q(
        'How much does the tour cost, and where does it start?',
        15,
        'The tour costs forty-five dollars per person, and it starts with a pick-up from the Central Hotel at eight a.m.',
        'per person'
      ),
      q(
        'Is lunch included in the price?',
        15,
        'No, I’m afraid lunch isn’t included. You’ll stop at a local restaurant at one p.m., but you’ll need to pay for it yourself.',
        'I’m afraid'
      ),
      q(
        'What will we do in the morning?',
        30,
        'In the morning, you’ll be picked up from the Central Hotel at eight. At nine you’ll visit the History Museum, and then at eleven thirty there’s a boat trip on the river before lunch.',
        'and then'
      ),
    ],
  },
]

export const OPINIONS: OpinionPrompt[] = [
  {
    id: 'company-size',
    prompt:
      'Some people prefer to work for a large company, while others prefer a small company. Which do you prefer, and why? Give reasons or examples to support your opinion.',
    sample: {
      a: 'Personally, I would prefer to work for a large company, for two main reasons. First, large companies usually offer better training programs, so employees can develop new skills and get promoted. For example, my cousin works for an international bank, and the company paid for her English course. Second, large companies are often more stable, so there is less risk of losing your job. Of course, small companies can be more friendly and flexible, but for my career, a large company is the better choice.',
      key: 'for two main reasons',
    },
  },
  {
    id: 'work-from-home',
    prompt:
      'Do you agree or disagree with the following statement? Employees should be allowed to work from home at least one day a week. Use specific reasons and examples to support your opinion.',
    sample: {
      a: 'I agree with this statement. To begin with, working from home saves time, because employees don’t have to commute. In big cities like Ho Chi Minh City, people can spend two hours a day in traffic, so one day at home gives them more energy. In addition, many people find it easier to concentrate at home, without the noise of the office. As long as employees finish their work on time, I think one day a week at home is good for both workers and companies.',
      key: 'To begin with',
    },
  },
  {
    id: 'good-manager',
    prompt:
      'What is the most important quality of a good manager? Use specific reasons and examples to support your opinion.',
    sample: {
      a: 'In my opinion, the most important quality of a good manager is good communication. A manager needs to explain goals clearly, so that everyone in the team knows what to do. For instance, at my last job, our manager held a short meeting every Monday to share the plan for the week, and it helped us avoid a lot of mistakes. A good communicator also listens to staff and gives useful feedback. That’s why I believe communication matters more than any other skill.',
      key: 'That’s why I believe',
    },
  },
]

/** XP for a finished task, whatever was said: the point is to speak. */
export const TOEIC_SPEAKING_XP = 10
