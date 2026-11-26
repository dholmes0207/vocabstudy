import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { usePathStates } from '@/hooks/usePathContext'
import { pathFor, practiceSuggestion, type PathLevel } from '@/lib/learningPath'
import { useT } from '@/lib/i18n'

// "Tiếp theo trên lộ trình" at the end of a lesson or a review (task 2.2 in
// docs/PLAN.md): one practice step of the level in progress, so today's
// session flows on instead of ending on a menu. Nothing for packs without a path.

const NO_LEVELS: readonly PathLevel[] = []

export default function NextOnPath() {
  const code = useSettings((s) => s.currentLang)
  const levels = pathFor(code) ?? NO_LEVELS
  const states = usePathStates(code, levels)
  const t = useT()
  const next = levels.length ? practiceSuggestion(states) : undefined
  if (!next) return null
  const { step, value } = next
  return (
    <Link
      to={step.to}
      className="flex w-full items-center gap-3 rounded-2xl bg-brand-50 p-3 text-left text-sm transition hover:bg-brand-100 dark:bg-brand-900/40 dark:hover:bg-brand-900/60"
    >
      <span className="text-2xl" aria-hidden="true">
        {step.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
          {t('Tiếp theo trên lộ trình', 'Next on your path')}
        </span>
        <span className="block font-semibold">{t(...step.title)}</span>
        <span className="block text-slate-600 dark:text-slate-300">
          {value}/{step.goal} {t(...step.unit)}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    </Link>
  )
}
