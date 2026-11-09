import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { chooseTwoMarks, type ReadingPassage } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// IELTS Reading, multiple choice "Choose TWO letters, A–E": five options, two
// right, one mark per right letter. A third pick would be marked wrong on the
// answer sheet, so the round stops at two: picking another while two are
// chosen swaps out the older one.

const XP_PER_RIGHT = 3
const letter = (i: number) => String.fromCharCode(65 + i)

export default function ChooseTwoRound({
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
  const record = useIelts((s) => s.recordChooseTwo)
  const log = useActivity((s) => s.log)
  const task = passage.chooseTwo
  const [picks, setPicks] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const marks = chooseTwoMarks(task, picks)

  const toggle = (i: number) =>
    setPicks((ps) =>
      ps.includes(i) ? ps.filter((p) => p !== i) : ps.length < 2 ? [...ps, i] : [ps[1], i]
    )

  const check = () => {
    setChecked(true)
    record(passage.id, marks, 2)
    addPlayXp(code, marks * XP_PER_RIGHT)
    log(code, 'ielts-reading')
    if (soundOn) buzz(marks === 2)
    if (marks === 2) celebrate(1.2)
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
          ✌️ {t('Chọn hai đáp án', 'Choose TWO')} · {t(...passage.title)}
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

      <section className="card space-y-4 border-2 border-sky-200 p-5 dark:border-sky-500/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('Chọn HAI chữ cái, A–E.', 'Choose TWO letters, A–E.')}
        </p>
        <h2 className="font-bold" lang="en">
          {task.question}
        </h2>
        <div role="group" aria-label={t('Các phương án', 'Options')} className="space-y-2">
          {task.options.map((o, i) => {
            const mine = picks.includes(i)
            const right = task.answers.includes(i)
            const state = checked
              ? right
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                : mine
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-50 dark:border-slate-700'
              : mine
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
            return (
              <button
                key={o}
                type="button"
                lang="en"
                disabled={checked}
                aria-pressed={mine}
                onClick={() => toggle(i)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${state}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                    mine ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {letter(i)}
                </span>
                <span className="min-w-0 flex-1">{o}</span>
                {checked && right && <Check className="h-5 w-5 text-emerald-600" aria-hidden />}
                {checked && mine && !right && <X className="h-5 w-5 text-rose-600" aria-hidden />}
              </button>
            )
          })}
        </div>
        {checked && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <b>
              {t('Đáp án', 'Answer')}: {task.answers.map(letter).join(', ')}.
            </b>{' '}
            {task.why}
          </p>
        )}
      </section>

      {!checked ? (
        <button
          type="button"
          className="btn-primary h-12 w-full"
          disabled={picks.length < 2}
          onClick={check}
        >
          <Check className="h-4 w-4" />{' '}
          {picks.length < 2
            ? t(`Chọn thêm ${2 - picks.length} chữ`, `Pick ${2 - picks.length} more`)
            : t('Kiểm tra', 'Check')}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {marks === 2 ? '🏆 ' : ''}
              {t(
                `${marks}/2 điểm · +${marks * XP_PER_RIGHT} XP.`,
                `${marks} of 2 marks · +${marks * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            {t(
              '💡 Mẹo: mỗi chữ đúng là một điểm, thứ tự không quan trọng. Gạch từng phương án sau khi tìm thấy chỗ trong bài nói đúng hoặc nói ngược lại; phương án nhắc đúng từ trong bài nhưng sai ý là bẫy hay gặp.',
              '💡 Tip: each right letter is a mark, in any order. Cross out each option once you find where the passage confirms or contradicts it; an option that repeats the passage’s words with the wrong idea is a common trap.'
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
