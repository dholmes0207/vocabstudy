import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import {
  COMPLETION_WORDS,
  answerWords,
  blankRight,
  completionParts,
  type ReadingPassage,
} from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// IELTS Reading, Sentence completion: each sentence has one gap, filled with
// NO MORE THAN TWO WORDS taken from the passage. Typed, not picked from a box
// (unlike Summary completion), and checked all at once; an answer over the
// word limit is marked wrong, as in the test.

const XP_PER_RIGHT = 3
const letter = (i: number) => String.fromCharCode(65 + i)

export default function CompletionRound({
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
  const record = useIelts((s) => s.recordCompletion)
  const log = useActivity((s) => s.log)
  const items = passage.completion
  const [values, setValues] = useState<string[]>(() => items.map(() => ''))
  const [checked, setChecked] = useState(false)
  const ok = (i: number) =>
    answerWords(values[i]) <= COMPLETION_WORDS && blankRight(values[i], items[i])
  const right = items.filter((_, i) => ok(i)).length
  const ready = values.every((v) => v.trim())

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
          ✍️ {t('Điền câu', 'Sentence completion')} · {t(...passage.title)}
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

      <section className="card space-y-4 border-2 border-teal-200 p-5 dark:border-teal-500/40">
        <h2 className="text-sm font-bold">
          {t(
            'Hoàn thành các câu sau. Điền KHÔNG QUÁ HAI TỪ lấy từ bài đọc.',
            'Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage.'
          )}
        </h2>
        <ol className="space-y-4">
          {items.map((c, i) => {
            const [before, after] = completionParts(c.text)
            const good = checked && ok(i)
            const tooLong = answerWords(values[i]) > COMPLETION_WORDS
            return (
              <li key={c.text} className="space-y-2">
                <p lang="en" className="leading-loose">
                  <b>{i + 1}.</b> {before}
                  <input
                    value={values[i]}
                    disabled={checked}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label={t(`Chỗ trống câu ${i + 1}`, `Gap in sentence ${i + 1}`)}
                    onChange={(e) =>
                      setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    className={`mx-1 inline-block w-36 max-w-full rounded-lg border-2 px-2 py-0.5 align-baseline ${
                      !checked
                        ? tooLong
                          ? 'border-amber-500 dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-700 dark:bg-slate-900'
                        : good
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    }`}
                  />
                  {after}
                </p>
                {!checked && tooLong && (
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {t(
                      'Quá hai từ: bài thi sẽ chấm sai dù ý đúng.',
                      'Over two words: the test marks it wrong even if the idea is right.'
                    )}
                  </p>
                )}
                {checked && (
                  <p
                    className={`text-sm ${good ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}
                  >
                    <b>{good ? '✓' : t(`Đáp án: ${c.answer}`, `Answer: ${c.answer}`)}</b>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{c.why}</span>
                  </p>
                )}
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
            : t(`Điền cả ${items.length} chỗ trống`, `Fill all ${items.length} gaps`)}
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
              '💡 Mẹo: câu hỏi đi theo thứ tự của bài. Tìm từ khoá trong câu (tên, số, từ hiếm), dò tới chỗ đó rồi chép đúng từ trong bài, kể cả chính tả.',
              '💡 Tip: the sentences follow the order of the passage. Find a key word (a name, a number, a rare word), scan to that spot and copy the passage’s own words, spelling included.'
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
