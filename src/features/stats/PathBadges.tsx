import { Link } from 'react-router-dom'
import { useSettings } from '@/store/settingsStore'
import { NO_PASSED, usePath } from '@/store/pathStore'
import { usePathStates } from '@/hooks/usePathContext'
import { CLEAR_AT, pathFor, type PathLevel } from '@/lib/learningPath'
import { useT } from '@/lib/i18n'

/**
 * The level path's medals on the stats page: one per level, lit once it is
 * cleared, with a cup on the levels whose challenge was won.
 */
export default function PathBadges() {
  const code = useSettings((s) => s.currentLang)
  const levels = pathFor(code)
  return levels ? <Medals code={code} levels={levels} /> : null
}

function Medals({ code, levels }: { code: string; levels: PathLevel[] }) {
  const t = useT()
  const states = usePathStates(code, levels)
  const passed = usePath((s) => s.passed[code] ?? NO_PASSED)
  const cleared = states.filter((s) => s.unlocked && s.ratio >= CLEAR_AT).length
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-bold">{t('Huy chương lộ trình 🗺️', 'Path medals 🗺️')}</h2>
        <Link to="/path" className="text-sm font-semibold text-brand-600 dark:text-brand-300">
          {t(`${cleared}/${levels.length} cấp`, `${cleared}/${levels.length} levels`)}
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {states.map((s) => {
          const lit = s.unlocked && s.ratio >= CLEAR_AT
          const won = passed.includes(s.level.n)
          const label = t(
            `Cấp ${s.level.n}: ${s.level.title[0]}${lit ? ' (đã qua)' : ''}${won ? ', đã thắng thử thách' : ''}`,
            `Level ${s.level.n}: ${s.level.title[1]}${lit ? ' (cleared)' : ''}${won ? ', challenge won' : ''}`
          )
          return (
            <li key={s.level.n} className="flex flex-col items-center gap-1 text-center">
              <span
                role="img"
                aria-label={label}
                title={label}
                className={`relative grid h-14 w-14 place-items-center rounded-full text-2xl shadow ${
                  lit
                    ? `bg-gradient-to-br ${s.level.tone}`
                    : 'bg-slate-100 opacity-50 grayscale dark:bg-slate-800'
                }`}
              >
                {s.level.icon}
                {won && (
                  <span className="absolute -right-1 -top-1 text-base" aria-hidden="true">
                    🏆
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t(...s.level.title)}
              </span>
              {!lit && s.unlocked && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {Math.round(s.ratio * 100)}%
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
