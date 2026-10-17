import { Link } from 'react-router-dom'
import { ArrowRight, BookmarkCheck, BookmarkPlus, CheckCircle2 } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useSavedIds, useSavedWords } from '@/store/savedWordsStore'
import { phaseOf } from '@/lib/srs'
import { useT } from '@/lib/i18n'

/**
 * "Lưu để học" for one word of the active pack (docs/design/saved-words.md).
 * A word already in the review schedule needs nothing more, so it only says so.
 */
export default function SaveWordButton({ wordId }: { wordId: number }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const started = useStudy((s) => phaseOf(s.progress[code]?.cards[wordId]) !== 'new')
  const saved = useSavedIds(code).includes(wordId)
  const toggle = useSavedWords((s) => s.toggle)

  if (started)
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {t('Đã có trong lịch ôn', 'Already in your reviews')}
      </p>
    )

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggle(code, wordId)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
          saved
            ? 'bg-brand-600 text-white hover:bg-brand-700'
            : 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-200'
        }`}
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {saved ? t('Đã lưu để học', 'Saved to learn') : t('Lưu để học', 'Save to learn')}
      </button>
      {saved && (
        <Link
          to="/learn"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          {t('Học ngay', 'Learn now')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
