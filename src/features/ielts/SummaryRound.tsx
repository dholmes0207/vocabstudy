import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { summaryParts, type ReadingPassage } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// IELTS Reading, Summary completion: a short summary of the passage with
// gaps, and a box with more words than gaps. Tap a word to drop it in the
// gap that is open (the first empty one, or the one tapped), tap a filled gap
// to take its word back. Checked at once, each gap with where the passage
// says it.

const XP_PER_RIGHT = 3

export default function SummaryRound({
  passage,
  onAgain,
  onExit,
}: {
  passage: ReadingPassage
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const record = useIelts((s) => s.recordSummary)
  const log = useActivity((s) => s.log)
  const sm = passage.summary
  const parts = summaryParts(sm.text)
  const total = sm.answers.length
  const [fills, setFills] = useState<(number | null)[]>(() => sm.answers.map(() => null))
  const [chosen, setChosen] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const open = chosen ?? fills.indexOf(null)
  const right = sm.answers.filter((a, i) => fills[i] === a).length
  const ready = fills.every((f) => f !== null)

  const put = (word: number) => {
    if (checked || open < 0) return
    setFills((fs) => fs.map((f, i) => (i === open ? word : f === word ? null : f)))
    setChosen(null)
  }
  const tapGap = (gap: number) => {
    if (checked) return
    setFills((fs) => fs.map((f, i) => (i === gap ? null : f)))
    setChosen(gap)
  }
  const check = () => {
    setChecked(true)
    record(passage.id, right, total)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-reading')
    if (soundOn) buzz(right === total)
    if (right === total) celebrate(1.2)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="btn-ghost h-9 w-9 p-0"
          aria-label={t('Thoát', 'Exit')}
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          📝 {t('Điền tóm tắt', 'Summary completion')} · {t(...passage.title)}
        </p>
      </div>

      <details className="card p-5" open={!checked}>
        <summary className="cursor-pointer font-bold">
          <span aria-hidden="true">{passage.emoji}</span> {t('Bài đọc', 'The passage')}
        </summary>
        <div className="mt-3 space-y-3" lang="en">
          {passage.passage.map((para, i) => (
            <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-200">
              {para}
            </p>
          ))}
        </div>
      </details>

      <section className="card space-y-4 border-2 border-violet-200 p-5 dark:border-violet-500/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(
            `Chọn từ trong hộp cho mỗi chỗ trống. Có ${sm.box.length - total} từ thừa.`,
            `Choose a word from the box for each gap. ${sm.box.length - total} words are extra.`
          )}
        </p>
        <p className="leading-loose" lang="en">
          {parts.map((part, i) => {
            if (typeof part === 'string') return <span key={i}>{part}</span>
            const f = fills[part]
            const ok = checked && f === sm.answers[part]
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
                  `Chỗ trống ${part + 1}: ${f === null ? 'trống' : sm.box[f]}`,
                  `Gap ${part + 1}: ${f === null ? 'empty' : sm.box[f]}`
                )}
                className={`mx-0.5 inline-flex min-w-[5.5rem] items-center justify-center rounded-lg border-2 px-2 py-0.5 align-baseline font-semibold transition ${style}`}
              >
                <span className="mr-1 text-[10px] font-bold text-slate-400">{part + 1}</span>
                {f === null ? ' ' : sm.box[f]}
              </button>
            )
          })}
        </p>
        {!checked && (
          <ul className="flex flex-wrap gap-2" aria-label={t('Hộp từ', 'Word box')} lang="en">
            {sm.box.map((w, i) => {
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
            {sm.answers.map((a, i) => {
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
                    {i + 1}. <span lang="en">{sm.box[a]}</span>
                    {ok ? ' ✓' : ''}
                  </b>{' '}
                  {sm.why[i]}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" disabled={!ready} onClick={check}>
          <Check className="h-4 w-4" />{' '}
          {ready
            ? t('Kiểm tra', 'Check')
            : t(`Điền đủ ${total} chỗ trống`, `Fill all ${total} gaps`)}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {right === total ? '🏆 ' : ''}
              {t(
                `${right}/${total} chỗ đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${total} right · +${right * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            {t(
              '💡 Mẹo: đoán loại từ cho mỗi chỗ trống trước (danh từ, tính từ, động từ…), rồi tìm chỗ trong bài nói cùng ý bằng từ khác.',
              '💡 Tip: guess the kind of word each gap needs first (noun, adjective, verb…), then find where the passage says the same thing in other words.'
            )}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
              {t('Xong', 'Done')}
            </button>
            <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
              {t('Bài khác', 'Another passage')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
