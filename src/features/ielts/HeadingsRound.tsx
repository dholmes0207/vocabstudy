import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { ROMAN, headingsRight, type ReadingPassage } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// IELTS Reading, Matching headings: a list of headings (more than there are
// paragraphs), and a heading to pick for each paragraph, as i, ii, iii… on the
// answer sheet. Checked all at once, with why each heading fits.

const XP_PER_RIGHT = 3

export default function HeadingsRound({
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
  const record = useIelts((s) => s.recordHeadings)
  const log = useActivity((s) => s.log)
  const h = passage.headings
  const total = passage.passage.length
  const [picks, setPicks] = useState<(number | null)[]>(() => passage.passage.map(() => null))
  const [checked, setChecked] = useState(false)
  const right = headingsRight(h, picks)
  const used = new Set(picks.filter((p) => p !== null))
  const ready = picks.every((p) => p !== null)

  const pick = (para: number, heading: number) => {
    if (checked) return
    // A heading goes with one paragraph: taking it frees it from another.
    setPicks((ps) =>
      ps.map((p, i) => (i === para ? (p === heading ? null : heading) : p === heading ? null : p))
    )
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
          🧩 {t('Nối tiêu đề', 'Matching headings')} · {t(...passage.title)}
        </p>
      </div>

      <section className="card space-y-2 p-5" aria-labelledby="headings-list">
        <h2 id="headings-list" className="text-sm font-bold">
          {t(
            `Danh sách tiêu đề (${h.options.length} tiêu đề, ${total} đoạn: có ${h.options.length - total} tiêu đề thừa)`,
            `List of headings (${h.options.length} headings for ${total} paragraphs: ${h.options.length - total} are extra)`
          )}
        </h2>
        <ol className="space-y-1" lang="en">
          {h.options.map((o, i) => (
            <li
              key={o}
              className={`flex gap-2 rounded-lg px-2 py-1 text-sm transition ${
                used.has(i) && !checked
                  ? 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800'
                  : ''
              }`}
            >
              <b className="w-7 shrink-0 text-right font-mono">{ROMAN[i]}</b> {o}
            </li>
          ))}
        </ol>
      </section>

      <article className="space-y-3" lang="en">
        {passage.passage.map((para, i) => {
          const p = picks[i]
          const ok = checked && p === h.answers[i]
          return (
            <section
              key={i}
              className={`card space-y-3 p-5 ${
                checked
                  ? ok
                    ? 'border-2 border-emerald-400 dark:border-emerald-500/60'
                    : 'border-2 border-rose-400 dark:border-rose-500/60'
                  : ''
              }`}
            >
              <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                <span className="mr-1 rounded bg-slate-100 px-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800">
                  {String.fromCharCode(65 + i)}
                </span>
                {para}
              </p>
              <div
                role="group"
                aria-label={t(
                  `Tiêu đề cho đoạn ${String.fromCharCode(65 + i)}`,
                  `Heading for paragraph ${String.fromCharCode(65 + i)}`
                )}
                className="flex flex-wrap gap-2"
              >
                {h.options.map((_, j) => {
                  const mine = p === j
                  const state = checked
                    ? j === h.answers[i]
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : mine
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                        : 'border-slate-200 opacity-40 dark:border-slate-700'
                    : mine
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : used.has(j)
                        ? 'border-slate-200 text-slate-400 dark:border-slate-700'
                        : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                  return (
                    <button
                      key={j}
                      type="button"
                      disabled={checked}
                      aria-pressed={mine}
                      onClick={() => pick(i, j)}
                      className={`h-10 min-w-10 rounded-xl border-2 px-2 font-mono font-bold transition ${state}`}
                    >
                      {ROMAN[j]}
                    </button>
                  )
                })}
              </div>
              {checked && (
                <p
                  lang="vi"
                  className={`rounded-xl p-3 text-sm ${
                    ok
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                      : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
                  }`}
                >
                  <b lang="en">
                    {ok ? '✓' : `${ROMAN[h.answers[i]]}.`} {h.options[h.answers[i]]}
                  </b>{' '}
                  {h.why[i]}
                </p>
              )}
            </section>
          )
        })}
      </article>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" disabled={!ready} onClick={check}>
          <Check className="h-4 w-4" />{' '}
          {ready
            ? t('Kiểm tra', 'Check')
            : t(`Chọn tiêu đề cho cả ${total} đoạn`, `Pick a heading for all ${total} paragraphs`)}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {right === total ? '🏆 ' : ''}
              {t(
                `${right}/${total} đoạn đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${total} right · +${right * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            {t(
              '💡 Mẹo: đọc câu đầu và câu cuối của đoạn để tìm ý chính. Tiêu đề bẫy thường lặp lại một chữ trong đoạn nhưng chỉ nói về một chi tiết nhỏ.',
              '💡 Tip: read the first and last sentence of a paragraph for its main idea. A trap heading often repeats a word from the paragraph but is only about a detail.'
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
