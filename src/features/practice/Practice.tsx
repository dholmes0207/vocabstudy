import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProvideContext } from '@/store/contextStore'
import { GROUPS, GROUP_OF, KIND_OF, PRACTICE, entryDesc, type PracticeEntry } from './entries'
import { useTilt } from '@/hooks/useTilt'
import { useT } from '@/lib/i18n'
import { useSettings } from '@/store/settingsStore'
import { useVisited } from '@/store/visitedStore'
import { NO_ACTIVITY, useActivity } from '@/store/activityStore'
import { availableIn } from '@/lib/packContent'
import { pickDiscovery, practiceRoot } from '@/lib/discover'
import { today } from '@/lib/date'

// The "Luyện tập" hub: everything that practises words you have already met,
// in groups by skill (task 2.4 in docs/PLAN.md), with one suggestion for today
// on top, a "new" mark on screens not opened yet and the sessions done so far.

/** Screens tried before the others get a "new" mark. */
const NEW_MARK_AFTER = 5

export default function Practice() {
  useProvideContext('Luyện tập')
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const seen = useVisited((s) => s.seen)
  const counts = useActivity((s) => s.counts[code] ?? NO_ACTIVITY)
  const entries = PRACTICE.filter((e) => availableIn(e.to, code))
  const suggestion = pickDiscovery(
    entries.map((e) => practiceRoot(e.to)),
    seen,
    today()
  )
  const suggested = entries.find((e) => practiceRoot(e.to) === suggestion)
  const badge = (e: PracticeEntry): string | null => {
    const kind = KIND_OF[e.to]
    const done = kind ? (counts[kind] ?? 0) : 0
    if (done > 0) return t(`${done} lượt`, `${done} done`)
    // To a newcomer everything is new; the mark helps once a few are tried.
    if (seen.length < NEW_MARK_AFTER || seen.includes(practiceRoot(e.to))) return null
    return t('Mới', 'New')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Luyện tập', 'Practice')}</span>{' '}
          <span aria-hidden="true">💪</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Dùng lại những từ đã gặp theo nhiều cách — càng đa dạng càng nhớ lâu.',
            'Use the words you have met in many ways — the more varied, the longer they stick.'
          )}
        </p>
      </header>

      {suggested && (
        <section aria-labelledby="practice-suggested">
          <h2
            id="practice-suggested"
            className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('Gợi ý cho bạn hôm nay', 'Suggested for you today')}
          </h2>
          <EntryCard entry={suggested} code={code} badge={badge(suggested)} />
        </section>
      )}

      {GROUPS.map((g) => {
        // Today's suggestion is already on top; listed once, the hub stays short.
        const mine = entries.filter((e) => GROUP_OF[e.to] === g.id && e !== suggested)
        if (!mine.length) return null
        return (
          <section key={g.id} aria-labelledby={`practice-${g.id}`}>
            <h2
              id={`practice-${g.id}`}
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {t(g.title, g.titleEn)}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mine.map((e) => (
                <EntryCard key={e.to} entry={e} code={code} badge={badge(e)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function EntryCard({
  entry: e,
  code,
  badge,
}: {
  entry: PracticeEntry
  code: string
  badge: string | null
}) {
  const t = useT()
  const tilt = useTilt(6)
  const desc = entryDesc(e, code)
  return (
    <Link to={e.to} className="card tilt flex items-center gap-4 p-4 active:scale-[0.99]" {...tilt}>
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow ${e.tone}`}
      >
        {typeof e.icon === 'string' ? e.icon : <e.icon className="h-6 w-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 font-bold">
          {t(e.title, e.titleEn)}
          {badge && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">
          {t(desc.desc, desc.descEn)}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
    </Link>
  )
}
