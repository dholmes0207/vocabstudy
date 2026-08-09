import type { PosCategory } from '@/types'

/** Vietnamese label for each part-of-speech category. */
export const POS_LABEL: Record<PosCategory, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  preposition: 'Giới từ',
  conjunction: 'Liên từ',
  pronoun: 'Đại từ',
  determiner: 'Từ hạn định',
  article: 'Mạo từ',
  other: 'Khác',
}
