import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { usePathStates } from '@/hooks/usePathContext'
import { useDailyQuest } from '@/hooks/useDailyQuest'
import { currentLevel, nextStep, pathFor, type PathLevel } from '@/lib/learningPath'
import { useT } from '@/lib/i18n'

/** The home screen's way into the level path: where you are and what comes next. */
export default function PathCard() {
  const code = useSettings((s) => s.currentLang)
  const levels = pathFor(code)
  return levels ? <Card code={code} levels={levels} /> : null
}

function Card({ code, levels }: { code: string; levels: PathLevel[] }) {
  const t = useT()
  const states = usePathStates(code, levels)
  const daily = useDailyQuest(code, states)
  const current = currentLevel(states)
  if (!current) return null
  const step = nextStep(current)
  const pct = Math.round(current.ratio * 100)
  return (
    <Link
      to="/path"
      className={`flex items-center gap-4 rounded-3xl bg-gradient-to-br ${current.level.tone} p-4 text-white shadow-md transition hover:shadow-lg`}
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 text-3xl"
        aria-hidden="true"
      >
        {current.level.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-white/80">
          {t('Lộ trình theo cấp', 'Level path')} ·{' '}
          {t(
            `Cấp ${current.level.n}/${levels.length}`,
            `Level ${current.level.n}/${levels.length}`
          )}
        </span>
        <span className="block truncate text-lg font-extrabold">{t(...current.level.title)}</span>
        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-white/30">
          <span className="block h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </span>
        <span className="mt-1 block truncate text-sm text-white/90">
          {pct}%{step && ` · ${t('Tiếp theo', 'Next')}: ${t(...step.step.title)}`}
        </span>
        {daily && !daily.quest.claimed && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
            {daily.done
              ? t('🎁 Nhiệm vụ xong, vào nhận quà', '🎁 Quest done, claim it')
              : t('🎯 Có nhiệm vụ hôm nay', '🎯 Today’s quest is waiting')}
          </span>
        )}
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  )
}
