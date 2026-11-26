import { Flag } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { reportContent } from '@/store/feedbackStore'
import { useT } from '@/lib/i18n'
import type { Word } from '@/types'

// "Báo lỗi" under a word card or an answered question (task 4.4 in
// docs/PLAN.md): opens the feedback form as a content report for this word.

export default function ReportContentButton({
  word,
  where,
  className = '',
}: {
  word: Word
  where: string
  className?: string
}) {
  const t = useT()
  const pack = useSettings((s) => s.currentLang)
  return (
    <button
      type="button"
      onClick={() => reportContent({ pack, wordId: word.id, word: word.word, where })}
      className={`inline-flex min-h-6 items-center gap-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline dark:text-slate-400 dark:hover:text-rose-400 ${className}`}
    >
      <Flag className="h-3.5 w-3.5" aria-hidden="true" />
      {t('Báo lỗi nội dung', 'Report a content error')}
    </button>
  )
}
