import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { useLinesPlayer } from '@/hooks/useLinesPlayer'
import type { ListeningChoiceSet } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import PlayLinesButton from './PlayLinesButton'

// IELTS Listening Parts 2–3, multiple choice: read the questions first, hear a
// talk (Part 2) or a discussion (Part 3), pick A, B or C as it goes, then
// check. Each answer says which words gave it away and where the trap was.

const XP_PER_RIGHT = 2
const LETTER = ['A', 'B', 'C', 'D']

export default function ListeningChoiceRound({
  set,
  onAgain,
  onExit,
}: {
  set: ListeningChoiceSet
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [picks, setPicks] = useState<(number | null)[]>(() => set.questions.map(() => null))
  const [checked, setChecked] = useState(false)
  const { line, plays, play, stop } = useLinesPlayer(set.lines)
  const total = set.questions.length
  const right = set.questions.filter((q, i) => picks[i] === q.answer).length
  const ready = picks.every((p) => p !== null)

  const check = () => {
    stop()
    setChecked(true)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-listening')
    if (soundOn) buzz(right === total)
    if (right === total) celebrate(1.2)
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
          🎧 Part {set.part} · {t(...set.title)}
        </p>
      </div>

      {!checked && (
        <section className="card space-y-3 p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {plays === 0
              ? t(
                  'Đọc trước các câu hỏi và gạch chân từ khoá. Bài nghe sẽ nhắc cả đáp án bẫy: chờ ý cuối cùng rồi hãy chọn.',
                  'Read the questions first and spot the key words. The recording mentions the traps too: wait for the final word before you pick.'
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

      <ol className="space-y-3" lang="en">
        {set.questions.map((q, i) => {
          const ok = picks[i] === q.answer
          return (
            <li
              key={q.q}
              className={`card space-y-2 p-4 ${
                checked
                  ? ok
                    ? 'border-2 border-emerald-400 dark:border-emerald-500/60'
                    : 'border-2 border-rose-400 dark:border-rose-500/60'
                  : ''
              }`}
            >
              <p className="font-semibold" id={`lq-${i}`}>
                {i + 1}. {q.q}
              </p>
              <div role="group" aria-labelledby={`lq-${i}`} className="grid gap-2">
                {q.options.map((o, j) => {
                  const mine = picks[i] === j
                  const state = checked
                    ? j === q.answer
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
                      disabled={checked}
                      aria-pressed={mine}
                      onClick={() => setPicks((ps) => ps.map((p, k) => (k === i ? j : p)))}
                      className={`flex items-center gap-3 rounded-xl border-2 p-2 text-left transition ${state}`}
                    >
                      <b className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">
                        {LETTER[j]}
                      </b>
                      {o}
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
                  <b>
                    {ok
                      ? t('Chính xác!', 'Right!')
                      : `${t('Đáp án', 'Answer')} ${LETTER[q.answer]}.`}
                  </b>{' '}
                  {q.why}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" disabled={!ready} onClick={check}>
          <Check className="h-4 w-4" />{' '}
          {ready
            ? t('Kiểm tra', 'Check')
            : t(`Chọn đáp án cho cả ${total} câu`, `Answer all ${total} questions`)}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {right === total ? '🏆 ' : ''}
              {t(
                `${right}/${total} câu đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${total} right · +${right * XP_PER_RIGHT} XP.`
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
                  {set.part === 3 && <b>{l.speaker === 'W' ? 'Woman' : 'Man'}: </b>}
                  {l.text}
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
