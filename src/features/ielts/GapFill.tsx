import { summaryParts, type GapTask } from '@/lib/ielts'
import { useT } from '@/lib/i18n'
import type { GapFillState } from './useGapFill'

// A text with gaps and a box of words, some spare (IELTS summary completion,
// the Task 1 model report). Tap a word to drop it in the open gap (the first
// empty one, or the one tapped); tap a filled gap to take its word back. Once
// checked, each gap shows its answer and why.

export default function GapFill({
  task,
  state,
  checked,
}: {
  task: GapTask
  state: GapFillState
  checked: boolean
}) {
  const t = useT()
  const { fills, open, put, tapGap } = state
  const total = task.answers.length
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t(
          `Chọn từ trong hộp cho mỗi chỗ trống. Có ${task.box.length - total} từ thừa.`,
          `Choose a word from the box for each gap. ${task.box.length - total} words are extra.`
        )}
      </p>
      <p className="leading-loose" lang="en">
        {summaryParts(task.text).map((part, i) => {
          if (typeof part === 'string') return <span key={i}>{part}</span>
          const f = fills[part]
          const ok = checked && f === task.answers[part]
          const style = checked
            ? ok
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
              : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
            : part === open
              ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200 dark:bg-violet-950/40 dark:ring-violet-500/30'
              : f === null
                ? 'border-dashed border-slate-300 dark:border-slate-600'
                : 'border-violet-300 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-950/40'
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => tapGap(part)}
              aria-label={t(
                `Chỗ trống ${part + 1}: ${f === null ? 'trống' : task.box[f]}`,
                `Gap ${part + 1}: ${f === null ? 'empty' : task.box[f]}`
              )}
              className={`mx-0.5 inline-flex min-w-[5.5rem] items-center justify-center rounded-lg border-2 px-2 py-0.5 align-baseline font-semibold transition ${style}`}
            >
              <span className="mr-1 text-[10px] font-bold text-slate-400">{part + 1}</span>
              {f === null ? ' ' : task.box[f]}
            </button>
          )
        })}
      </p>
      {!checked && (
        <ul className="flex flex-wrap gap-2" aria-label={t('Hộp từ', 'Word box')} lang="en">
          {task.box.map((w, i) => {
            const used = fills.includes(i)
            return (
              <li key={w}>
                <button
                  type="button"
                  onClick={() => put(i)}
                  disabled={open < 0 && !used}
                  className={`rounded-xl border-2 px-3 py-1.5 font-semibold transition active:scale-95 ${
                    used
                      ? 'border-slate-200 text-slate-400 line-through dark:border-slate-700'
                      : 'border-slate-300 bg-white hover:border-violet-400 dark:border-slate-600 dark:bg-slate-900'
                  }`}
                >
                  {w}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {checked && (
        <ol className="space-y-2 text-sm">
          {task.answers.map((a, i) => {
            const ok = fills[i] === a
            return (
              <li
                key={i}
                className={`rounded-xl p-3 ${
                  ok
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
                }`}
              >
                <b>
                  {i + 1}. <span lang="en">{task.box[a]}</span>
                  {ok ? ' ✓' : ''}
                </b>{' '}
                {task.why[i]}
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
