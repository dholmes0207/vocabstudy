import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useGrammar } from '@/store/grammarStore'
import { PASS_SCORE, dueUnits, loadGrammarPack, type GrammarUnit } from '@/lib/grammar'
import { availableIn } from '@/lib/packContent'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'

/** Lessons shown by name on the card; the count covers the rest. */
const SHOWN = 3

/**
 * "Ôn ngữ pháp" on Home (docs/design/grammar.md): passed lessons come back on
 * a 3 / 7 / 21 / 60-day ladder, like words do. Renders nothing until one is due.
 */
export default function GrammarReviewCard() {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const progress = useGrammar((s) => s.progress)
  const [units, setUnits] = useState<GrammarUnit[] | null>(null)
  const hasGrammar = availableIn('/grammar', code)

  useEffect(() => {
    if (!hasGrammar) return
    let live = true
    loadGrammarPack(code)
      .then((p) => live && setUnits(p.units))
      // No card is better than a broken one; the Grammar page shows the error.
      .catch(() => {})
    return () => {
      live = false
    }
  }, [code, hasGrammar])

  if (!hasGrammar || !units) return null
  const byId = new Map(units.map((u) => [u.id, u]))
  const due = dueUnits(
    progress,
    units.map((u) => u.id),
    today()
  )
  if (due.length === 0) return null

  return (
    <section className="card p-5" aria-labelledby="grammar-review">
      <h2 id="grammar-review" className="font-bold">
        📐 {t('Ôn ngữ pháp', 'Grammar review')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          `${due.length} bài đến hạn ôn. Làm lại phần luyện tập, đạt ${PASS_SCORE}% là bài giãn sang lần ôn sau.`,
          `${due.length} ${due.length === 1 ? 'lesson is' : 'lessons are'} due. Redo the practice — ${PASS_SCORE}% pushes the next review further out.`
        )}
      </p>
      <ul className="mt-3 space-y-2">
        {due.slice(0, SHOWN).map((id) => {
          const u = byId.get(id)!
          return (
            <li key={id}>
              <Link
                to={`/grammar/${id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-brand-400 dark:border-slate-700"
              >
                <span aria-hidden="true">{u.emoji}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{t(...u.title)}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
