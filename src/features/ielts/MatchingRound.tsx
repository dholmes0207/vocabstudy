import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import type { ReadingPassage } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// IELTS Reading, Matching information: statements that each describe
// something in one paragraph ("a reason why…", "a comparison of…"); pick the
// paragraph letter for each. A letter may be used more than once, as in the
// test. Checked all at once.

const XP_PER_RIGHT = 3
const letter = (i: number) => String.fromCharCode(65 + i)

export default function MatchingRound({
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
  const record = useIelts((s) => s.recordMatching)
  const log = useActivity((s) => s.log)
  const items = passage.matching
  const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null))
  const [checked, setChecked] = useState(false)
  const right = items.filter((m, i) => picks[i] === m.para).length
  const ready = picks.every((p) => p !== null)

  const check = () => {
    setChecked(true)
    record(passage.id, right, items.length)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-reading')
    if (soundOn) buzz(right === items.length)
    if (right === items.length) celebrate(1.2)
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
          🔎 {t('Tìm thông tin', 'Matching information')} · {t(...passage.title)}
        </p>
      </div>

      <article className="space-y-3" lang="en">
        {passage.passage.map((para, i) => (
          <p key={i} className="card p-5 leading-relaxed text-slate-700 dark:text-slate-200">
            <span className="mr-1 rounded bg-slate-100 px-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800">
              {letter(i)}
            </span>
            {para}
          </p>
        ))}
      </article>

      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-bold">
          {t(
            `Đoạn nào chứa thông tin sau? Chọn chữ ${letter(0)}–${letter(passage.passage.length - 1)} (một chữ có thể dùng nhiều lần).`,
            `Which paragraph contains the following information? Choose ${letter(0)}–${letter(passage.passage.length - 1)} (you may use a letter more than once).`
          )}
        </h2>
        <ol className="space-y-4">
          {items.map((m, i) => {
            const ok = checked && picks[i] === m.para
            return (
              <li key={m.statement} className="space-y-2">
                <p lang="en">
                  <b>{i + 1}.</b> {m.statement}
                </p>
                <div
                  role="group"
                  aria-label={t(`Đoạn cho câu ${i + 1}`, `Paragraph for statement ${i + 1}`)}
                  className="flex flex-wrap gap-2"
                >
                  {passage.passage.map((_, j) => {
                    const mine = picks[i] === j
                    const state = checked
                      ? j === m.para
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : mine
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'border-slate-200 opacity-40 dark:border-slate-700'
                      : mine
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                    return (
                      <button
                        key={j}
                        type="button"
                        disabled={checked}
                        aria-pressed={mine}
                        onClick={() => setPicks((ps) => ps.map((p, k) => (k === i ? j : p)))}
                        className={`h-10 w-10 rounded-xl border-2 font-mono font-bold transition ${state}`}
                      >
                        {letter(j)}
                      </button>
                    )
                  })}
                  {checked && (
                    <span
                      className={`self-center text-sm font-semibold ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}
                    >
                      {ok ? '✓' : t(`Đáp án: ${letter(m.para)}`, `Answer: ${letter(m.para)}`)}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" disabled={!ready} onClick={check}>
          <Check className="h-4 w-4" />{' '}
          {ready
            ? t('Kiểm tra', 'Check')
            : t(`Chọn đoạn cho cả ${items.length} câu`, `Pick a paragraph for all ${items.length}`)}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {right === items.length ? '🏆 ' : ''}
              {t(
                `${right}/${items.length} câu đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${items.length} right · +${right * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            {t(
              '💡 Mẹo: câu hỏi diễn đạt lại ý của đoạn ("a reason why", "a comparison of"), hiếm khi lặp nguyên từ. Gạch chân từ khoá rồi tìm từ đồng nghĩa trong bài.',
              '💡 Tip: the statements paraphrase the paragraph ("a reason why", "a comparison of") and rarely repeat its words. Underline the key words and look for synonyms.'
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
