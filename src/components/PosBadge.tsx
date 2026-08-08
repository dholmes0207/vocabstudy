import type { PosCategory } from '@/types'

const STYLES: Record<PosCategory, string> = {
  noun: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  verb: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  adjective: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  adverb: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  preposition: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  conjunction: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  pronoun: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  determiner: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  article: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

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

interface Props {
  category: PosCategory
  /** Raw pos label to show, e.g. "n./v.". Falls back to the category label. */
  raw?: string
  className?: string
}

export default function PosBadge({ category, raw, className = '' }: Props) {
  return (
    <span className={`chip ${STYLES[category]} ${className}`} title={POS_LABEL[category]}>
      {raw || POS_LABEL[category]}
    </span>
  )
}
