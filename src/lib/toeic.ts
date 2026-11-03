import type { Word } from '@/types'

// TOEIC vocabulary by theme (docs/design/toeic.md). ETS publishes no TOEIC word
// list: these are the workplace words of the English pack, grouped by the
// situations the Listening & Reading test is built around (ordering, hiring,
// business travel…). Each word belongs to one theme only.

type Pair = [vi: string, en: string]

export interface ToeicTheme {
  id: string
  emoji: string
  title: Pair
  /** Headwords of the English pack, space-separated. */
  words: string
}

export const TOEIC_THEMES: readonly ToeicTheme[] = [
  {
    id: 'office',
    emoji: '🗂️',
    title: ['Văn phòng', 'The office'],
    words:
      'office desk copy printer file document folder memo deadline schedule reschedule meeting agenda colleague coworker supervisor manager assistant department division staff employee shift task project report presentation handout projector extension workload overtime cabinet photocopier stapler',
  },
  {
    id: 'hr',
    emoji: '🧑‍💼',
    title: ['Tuyển dụng & nhân sự', 'Hiring & HR'],
    words:
      'hire recruit applicant candidate interview qualification experience position vacancy salary wage bonus benefit promotion retire resign train trainee orientation evaluation performance contract permanent temporary personnel reference skill career employer',
  },
  {
    id: 'finance',
    emoji: '💰',
    title: ['Tài chính & kế toán', 'Finance & accounting'],
    words:
      'budget profit loss revenue expense cost invoice payment account bank loan interest tax receipt refund reimburse reimbursement balance deposit withdraw transaction fee charge estimate investment investor shareholder fund financial quarterly',
  },
  {
    id: 'business',
    emoji: '🏢',
    title: ['Công ty & hợp tác', 'Companies & deals'],
    words:
      'company firm branch headquarters subsidiary merger acquisition stakeholder competitor strategy policy procedure regulation proposal negotiate agreement partner partnership executive director board',
  },
  {
    id: 'sales',
    emoji: '🛍️',
    title: ['Bán hàng & tiếp thị', 'Sales & marketing'],
    words:
      'customer client sale discount price purchase order supplier vendor retail retailer wholesale product brand advertise advertisement campaign marketing survey launch demand commercial catalog brochure coupon voucher warranty complaint',
  },
  {
    id: 'shipping',
    emoji: '📦',
    title: ['Đặt hàng & vận chuyển', 'Orders & shipping'],
    words:
      'ship shipment deliver delivery package parcel warehouse stock inventory supply distribute distribution freight cargo courier dispatch track tracking container load logistics procurement',
  },
  {
    id: 'manufacturing',
    emoji: '🏭',
    title: ['Nhà máy & sản xuất', 'Factories & production'],
    words:
      'factory plant produce production manufacture manufacturer machine equipment assemble assembly quality inspect inspection defect safety operate operator maintenance repair component material output capacity',
  },
  {
    id: 'travel',
    emoji: '✈️',
    title: ['Đi công tác', 'Business travel'],
    words:
      'travel trip flight airline airport boarding passenger luggage baggage ticket reservation reserve book itinerary hotel accommodation depart departure arrive arrival delay cancel cancellation destination tour passport visa commute commuter confirmation',
  },
  {
    id: 'dining',
    emoji: '🍽️',
    title: ['Ăn uống & tiệc', 'Dining & catering'],
    words:
      'restaurant menu waiter waitress chef cuisine dish meal catering banquet dessert beverage bill tip serve server snack lunch dinner complimentary',
  },
  {
    id: 'housing',
    emoji: '🏠',
    title: ['Nhà cửa & văn phòng thuê', 'Property & premises'],
    words:
      'rent tenant landlord lease apartment property agent building floor lobby elevator renovate renovation premises relocate relocation utility electricity plumber furniture move',
  },
  {
    id: 'health',
    emoji: '🩺',
    title: ['Sức khoẻ', 'Health'],
    words:
      'clinic hospital doctor nurse patient appointment insurance medicine prescription pharmacy treatment symptom checkup emergency dentist health medical',
  },
  {
    id: 'tech',
    emoji: '💻',
    title: ['Máy tính & công nghệ', 'Computers & tech'],
    words:
      'computer software hardware program website internet email password download upload update install network technician online device screen keyboard data database',
  },
  {
    id: 'events',
    emoji: '🎤',
    title: ['Hội nghị & sự kiện', 'Conferences & events'],
    words:
      'event conference seminar workshop exhibition fair venue register registration attend attendee participant speaker keynote host invitation ceremony award celebrate session enclose notify',
  },
]

/** Every TOEIC headword, theme by theme. */
export const TOEIC_WORDS: readonly string[] = TOEIC_THEMES.flatMap((t) => t.words.split(' '))

/** The pack's words of a theme, in the theme's order. */
export function themeWords(theme: ToeicTheme, words: readonly Word[]): Word[] {
  const byWord = new Map(words.map((w) => [w.word, w]))
  return theme.words.split(' ').flatMap((h) => {
    const w = byWord.get(h)
    return w ? [w] : []
  })
}
