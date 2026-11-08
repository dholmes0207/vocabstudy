import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useVisited } from '@/store/visitedStore'
import { PRACTICE } from '@/features/practice/entries'
import { availableIn } from '@/lib/packContent'
import { pickDiscovery } from '@/lib/discover'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'

/**
 * "Hôm nay thử gì mới?": one practice screen this device has not opened yet
 * (counted from when the app started keeping track), a different one each
 * day, until all have been tried.
 */
export default function DiscoverCard() {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const seen = useVisited((s) => s.seen)
  const entries = PRACTICE.filter((e) => availableIn(e.to, code))
  const pick = pickDiscovery(
    entries.map((e) => e.to),
    seen,
    today()
  )
  const entry = entries.find((e) => e.to === pick)
  if (!entry) return null
  return (
    <Link
      to={entry.to}
      className="card flex items-center gap-4 border-2 border-dashed border-fuchsia-300 p-4 transition hover:shadow-lg dark:border-fuchsia-500/40"
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow ${entry.tone}`}
        aria-hidden="true"
      >
        {typeof entry.icon === 'string' ? entry.icon : <entry.icon className="h-6 w-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">
          ✨ {t('Hôm nay thử gì mới?', 'Try something new today')}
        </span>
        <span className="block font-bold">{t(entry.title, entry.titleEn)}</span>
        <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
          {t(entry.desc, entry.descEn)}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
    </Link>
  )
}
