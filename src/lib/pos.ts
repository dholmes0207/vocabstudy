import type { PosCategory, UiLang } from '@/types'

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

/** English label for each part-of-speech category. */
export const POS_LABEL_EN: Record<PosCategory, string> = {
  noun: 'Noun',
  verb: 'Verb',
  adjective: 'Adjective',
  adverb: 'Adverb',
  preposition: 'Preposition',
  conjunction: 'Conjunction',
  pronoun: 'Pronoun',
  determiner: 'Determiner',
  article: 'Article',
  other: 'Other',
}

export function posLabel(c: PosCategory, lang: UiLang): string {
  return (lang === 'en' ? POS_LABEL_EN : POS_LABEL)[c]
}
