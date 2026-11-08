import type { Attempt } from '@/store/examStore'
import { useT } from '@/lib/i18n'

/**
 * The latest attempts at a mini test as a row of thin bars, oldest first, so
 * the trend shows at a glance. One series in the brand color: the latest score
 * is the only label, each bar names its score on hover, and a table carries the
 * same numbers for screen readers. Nothing until there are two attempts.
 */
export default function AttemptTrail({ attempts }: { attempts: readonly Attempt[] }) {
  const t = useT()
  if (attempts.length < 2) return null
  const pct = (a: Attempt) => (a.total ? Math.round((100 * a.correct) / a.total) : 0)
  const last = attempts[attempts.length - 1]
  const change = last.correct - attempts[attempts.length - 2].correct
  return (
    <figure className="flex items-end gap-3">
      <div
        className="flex h-10 items-end gap-0.5 border-b border-slate-300 dark:border-slate-600"
        aria-hidden="true"
      >
        {attempts.map((a, i) => (
          <div
            key={i}
            title={t(
              `Lần ${i + 1}: ${a.correct}/${a.total}`,
              `Attempt ${i + 1}: ${a.correct}/${a.total}`
            )}
            className={`w-2 rounded-t ${i === attempts.length - 1 ? 'bg-brand-600 dark:bg-brand-400' : 'bg-brand-300 dark:bg-brand-700'}`}
            style={{ height: `${Math.max(pct(a), 4)}%` }}
          />
        ))}
      </div>
      <figcaption className="text-xs text-slate-500 dark:text-slate-400">
        {t(`Lần gần nhất: ${last.correct}/${last.total}`, `Latest: ${last.correct}/${last.total}`)}
        {change !== 0 &&
          t(
            ` (${change > 0 ? '+' : ''}${change} so với lần trước)`,
            ` (${change > 0 ? '+' : ''}${change} since last time)`
          )}
      </figcaption>
      {/* sr-only on a wrapper: a table ignores width: 1px. */}
      <div className="sr-only">
        <table>
          <caption>{t('Các lần làm gần đây', 'Recent attempts')}</caption>
          <tbody>
            {attempts.map((a, i) => (
              <tr key={i}>
                <th scope="row">{t(`Lần ${i + 1}`, `Attempt ${i + 1}`)}</th>
                <td>
                  {a.correct}/{a.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
