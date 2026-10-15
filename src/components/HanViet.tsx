import type { Word } from '@/types'
import { useT } from '@/lib/i18n'

/**
 * The Sino-Vietnamese reading of a Chinese word (学生 → HỌC SINH): a head start
 * only Vietnamese learners have (docs/design/chinese.md). Rendered next to the
 * meaning, never on a question side, because it often is the meaning.
 */
export default function HanViet({ word, className = '' }: { word: Word; className?: string }) {
  const t = useT()
  if (!word.hanViet) return null
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}>
      {t('Hán Việt', 'Sino-Vietnamese')}:{' '}
      <b className="font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        {word.hanViet}
      </b>
    </p>
  )
}
