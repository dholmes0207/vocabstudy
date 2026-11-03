import { useState } from 'react'
import { Headphones, BookOpenText } from 'lucide-react'
import type { Word } from '@/types'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { cefrFor, estimateSection, type Section } from '@/lib/toeicScore'
import { MINI_TEST_ID, miniTestPlan, sectionOf, type MiniStep } from '@/lib/toeicMiniTest'
import { pinyinXp } from '@/lib/pinyin'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'
import Part2Round from './Part2Round'
import Part5Round from './Part5Round'
import ReadingRound from './ReadingRound'
import TalkRound from './TalkRound'

// "Bài thi nhỏ" (docs/design/toeic.md, bước A7): the seven parts one after
// another (lib/toeicMiniTest.ts), then a rough range for each section on the
// 5–495 scale and the CEFR level it would reach.

export default function MiniTest({
  words,
  onExit,
}: {
  words: readonly Word[]
  onExit: () => void
}) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const record = useExam((s) => s.record)
  const best = useExam((s) => s.records[MINI_TEST_ID])
  const [plan, setPlan] = useState<MiniStep[] | null>(null)
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<{ part: number; correct: number; total: number }[]>([])
  const [xp, setXp] = useState(0)

  const begin = () => {
    setPlan(miniTestPlan(words))
    setStep(0)
    setScores([])
  }
  const done = (correct: number, total: number) => {
    const part = plan![step].part
    const next = [...scores, { part, correct, total }]
    setScores(next)
    setStep(step + 1)
    if (step + 1 === plan!.length) {
      const right = next.reduce((n, s) => n + s.correct, 0)
      const all = next.reduce((n, s) => n + s.total, 0)
      const earned = pinyinXp(right, all)
      addPlayXp(code, earned)
      setXp(earned)
      record(MINI_TEST_ID, right, all, today())
    }
  }

  if (plan && step < plan.length) {
    const s = plan[step]
    const common = { onAgain: () => {}, onExit, onDone: done }
    if (s.part === 1 || s.part === 2)
      return <Part2Round key={step} {...common} questions={s.questions} />
    if (s.part === 5) return <Part5Round key={step} {...common} questions={s.questions} />
    if (s.part === 6 || s.part === 7)
      return <ReadingRound key={step} {...common} set={s.set} questions={s.questions} />
    return <TalkRound key={step} {...common} set={s.set} questions={s.questions} />
  }

  if (plan) {
    const by = (section: Section) => {
      const rows = scores.filter((s) => sectionOf(s.part) === section)
      const correct = rows.reduce((n, s) => n + s.correct, 0)
      const total = rows.reduce((n, s) => n + s.total, 0)
      const range = estimateSection(correct, total)
      const level = cefrFor(section, Math.round((range.low + range.high) / 2))
      return { rows, correct, total, range, level }
    }
    const sections = [
      {
        id: 'listening' as const,
        name: t('Nghe', 'Listening'),
        icon: Headphones,
        ...by('listening'),
      },
      { id: 'reading' as const, name: t('Đọc', 'Reading'), icon: BookOpenText, ...by('reading') },
    ]
    return (
      <div className="mx-auto max-w-xl space-y-4 animate-fade-in">
        <h1 className="text-2xl font-extrabold">{t('Kết quả bài thi nhỏ', 'Mini test results')}</h1>
        {sections.map((sec) => (
          <section key={sec.id} className="card space-y-2 p-5">
            <p className="flex items-center gap-2 font-bold">
              <sec.icon className="h-4 w-4" aria-hidden="true" /> {sec.name}:{' '}
              {t(`đúng ${sec.correct}/${sec.total}`, `${sec.correct}/${sec.total} right`)}
            </p>
            <p className="text-lg font-extrabold text-brand-700 dark:text-brand-300">
              {t(
                `Khoảng ${sec.range.low}–${sec.range.high} điểm`,
                `About ${sec.range.low}–${sec.range.high} points`
              )}
              {sec.level && ` · ${sec.level}`}
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-300">
              {sec.rows.map((r) => (
                <li key={r.part}>
                  Part {r.part}: {r.correct}/{r.total}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Đây chỉ là ước lượng thô từ 26 câu, không phải điểm TOEIC thật: đề thật có 200 câu và được quy đổi theo cách riêng của ETS. Hãy dùng nó để biết mình đang ở khoảng nào và nên luyện thêm Part nào.',
            'This is only a rough estimate from 26 questions, not a TOEIC score: the real test has 200 questions and ETS scales them its own way. Use it to see roughly where you are and which parts need work.'
          )}
        </p>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">+{xp} XP ⭐</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="btn-primary h-11" onClick={begin}>
            {t('Làm bài khác', 'Another test')}
          </button>
          <button className="btn-secondary h-11" onClick={onExit}>
            {t('Về trang TOEIC', 'Back to TOEIC')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t('Bài thi nhỏ TOEIC', 'TOEIC mini test')}</h1>
      <div className="card space-y-3 p-5">
        <p>
          {t(
            'Khoảng 20 phút, 26 câu theo đúng tỉ lệ của đề thật:',
            'About 20 minutes, 26 questions in the proportions of the real test:'
          )}
        </p>
        <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
          <li>
            {t(
              'Nghe 13 câu: Part 1 (2), Part 2 (5), Part 3 (3), Part 4 (3)',
              'Listening, 13 questions: Part 1 (2), Part 2 (5), Part 3 (3), Part 4 (3)'
            )}
          </li>
          <li>
            {t(
              'Đọc 13 câu: Part 5 (6), Part 6 (4), Part 7 (3)',
              'Reading, 13 questions: Part 5 (6), Part 6 (4), Part 7 (3)'
            )}
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Cuối bài có khoảng điểm ước lượng cho từng phần và bậc CEFR tương ứng.',
            'At the end you get an estimated range for each section and the CEFR level it matches.'
          )}
          {best &&
            t(
              ` Lần tốt nhất: ${best.best}/${best.total} câu.`,
              ` Your best: ${best.best}/${best.total}.`
            )}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="btn-primary h-11" onClick={begin}>
            {t('Bắt đầu', 'Start')}
          </button>
          <button className="btn-secondary h-11" onClick={onExit}>
            {t('Để sau', 'Not now')}
          </button>
        </div>
      </div>
    </div>
  )
}
