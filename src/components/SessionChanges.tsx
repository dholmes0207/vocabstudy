import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { phaseDelta, type PhaseSnapshot } from '@/lib/sessionDelta'
import { useT } from '@/lib/i18n'

/**
 * What a session did to its words, as chips under the score (lib/sessionDelta.ts).
 * Renders nothing when no word changed stage.
 */
export default function SessionChanges({ before }: { before: PhaseSnapshot }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards) ?? NO_CARDS
  const d = phaseDelta(before, cards)
  const chips = [
    d.mastered > 0 && ['⭐', t(`+${d.mastered} từ đã thuộc`, `+${d.mastered} mastered`)],
    d.up > 0 && ['📈', t(`${d.up} từ lên bậc ôn`, `${d.up} moved up`)],
    d.started > 0 && ['🌱', t(`+${d.started} từ vào lịch ôn`, `+${d.started} now in reviews`)],
    d.down > 0 && ['🔁', t(`${d.down} từ cần học lại`, `${d.down} to relearn`)],
  ].filter(Boolean) as [string, string][]
  if (!chips.length) return null
  return (
    <ul
      className="flex w-full flex-wrap justify-center gap-2"
      aria-label={t('Thay đổi', 'Changes')}
    >
      {chips.map(([emoji, label]) => (
        <li
          key={label}
          className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <span aria-hidden="true">{emoji}</span> {label}
        </li>
      ))}
    </ul>
  )
}
