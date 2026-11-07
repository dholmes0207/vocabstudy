import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { useLinesPlayer } from '@/hooks/useLinesPlayer'
import { blankRight, type ListeningSet } from '@/lib/ielts'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import PlayLinesButton from './PlayLinesButton'

// IELTS Listening Part 1, form completion: read the form first, hear the call
// (a woman's and a man's voice), fill the blanks as it goes, then check. The
// transcript shows once checked, so the learner sees where each answer was.

const XP_PER_RIGHT = 2

export default function ListeningRound({
  set,
  onAgain,
  onExit,
}: {
  set: ListeningSet
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [values, setValues] = useState<string[]>(() => set.form.fields.map(() => ''))
  const [checked, setChecked] = useState(false)
  const { line, plays, play, stop } = useLinesPlayer(set.lines)

  const right = set.form.fields.filter((f, i) => blankRight(values[i], f)).length
  const check = () => {
    stop()
    setChecked(true)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-listening')
    if (right === set.form.fields.length) celebrate(1.2)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
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
          🎧 {t('Nghe điền phiếu', 'Form completion')} · {t(...set.title)}
        </p>
      </div>

      {!checked && (
        <section className="card space-y-3 p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {plays === 0
              ? t(
                  'Đọc trước phiếu bên dưới, đoán xem mỗi ô cần chữ hay số. Rồi bấm nghe và điền dần.',
                  'Read the form below first and guess whether each blank needs a word or a number. Then listen and fill it in.'
                )
              : t(
                  'Trong phòng thi bạn chỉ được nghe một lần. Ở đây nghe lại thoải mái.',
                  'In the exam you hear it once. Here, replay as often as you like.'
                )}
          </p>
          <PlayLinesButton
            line={line}
            plays={plays}
            total={set.lines.length}
            play={play}
            stop={stop}
          />
        </section>
      )}

      <section
        className="card space-y-3 border-2 border-sky-200 p-5 dark:border-sky-500/40"
        lang="en"
      >
        <h1 className="font-extrabold">
          <span aria-hidden="true">{set.emoji}</span> {set.form.title}
        </h1>
        {set.form.fields.map((f, i) => {
          const ok = checked && blankRight(values[i], f)
          return (
            <div key={f.label} className="grid grid-cols-[1fr_1.2fr] items-center gap-3">
              <label htmlFor={`blank-${i}`} className="text-sm font-semibold">
                {i + 1}. {f.label}
              </label>
              <div>
                <input
                  id={`blank-${i}`}
                  value={values[i]}
                  disabled={checked}
                  autoComplete="off"
                  onChange={(e) =>
                    setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))
                  }
                  className={`w-full rounded-xl border-2 px-3 py-2 ${
                    !checked
                      ? 'border-slate-200 dark:border-slate-700 dark:bg-slate-900'
                      : ok
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  }`}
                />
                {checked && !ok && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {t('Đáp án', 'Answer')}: {f.answer}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" onClick={check}>
          <Check className="h-4 w-4" /> {t('Kiểm tra', 'Check')}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {t(
                `${right}/${set.form.fields.length} ô đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${set.form.fields.length} right · +${right * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            💡 {set.tip}
          </p>
          <details className="card p-4 text-sm" open>
            <summary className="cursor-pointer font-semibold">
              {t('Lời thoại', 'Transcript')}
            </summary>
            <ol className="mt-2 space-y-1" lang="en">
              {set.lines.map((l, i) => (
                <li key={i}>
                  <b>{l.speaker === 'W' ? 'Woman' : 'Man'}:</b> {l.text}
                </li>
              ))}
            </ol>
          </details>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
              {t('Xong', 'Done')}
            </button>
            <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
              {t('Bài khác', 'Another one')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
