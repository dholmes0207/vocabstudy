import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookmarkPlus, ExternalLink, Info } from 'lucide-react'
import type { QuizQuestion, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useGrammar } from '@/store/grammarStore'
import { useReading } from '@/store/readingStore'
import { useExam } from '@/store/examStore'
import { useSavedWords } from '@/store/savedWordsStore'
import { examFor, examWords, examsFor, mockQuestions, type Exam as ExamInfo } from '@/lib/exams'
import { isPassed, loadGrammarPack } from '@/lib/grammar'
import { loadReadingPack } from '@/lib/reading'
import { phaseOf } from '@/lib/srs'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'
import LearnSession from '@/features/learn/LearnSession'
import QuizRunner from '@/components/QuizRunner'
import SessionComplete from '@/components/SessionComplete'

// "Lộ trình luyện thi" (docs/design/exam-track.md): the parts of the app an
// exam needs, in order, each showing how far the learner has got — plus a
// short vocabulary check in the exam's two skills, listening and reading.

/** New exam words per learning session. */
const LEARN_BATCH = 10

type Mode = { kind: 'learn'; words: Word[] } | { kind: 'mock'; questions: QuizQuestion[] }

export default function Exam() {
  const code = useSettings((s) => s.currentLang)
  const [picked, setPicked] = useState<string | null>(null)
  const all = examsFor(code)
  const exam = examFor(code, picked)
  // Layout shows the "switch language" note for packs without an exam.
  if (!exam) return null
  return (
    <Roadmap
      key={exam.id}
      exam={exam}
      levels={
        all.length > 1 && (
          <div
            role="tablist"
            className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            {all.map((e) => (
              <button
                key={e.id}
                type="button"
                role="tab"
                aria-selected={e.id === exam.id}
                onClick={() => setPicked(e.id)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  e.id === exam.id
                    ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        )
      }
    />
  )
}

function Roadmap({ exam, levels }: { exam: ExamInfo; levels?: React.ReactNode }) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const pack = useData((s) => s.pack)!
  const cards = useStudy((s) => s.progress[code]?.cards) ?? NO_CARDS
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const markKnown = useStudy((s) => s.markKnown)
  const best = useExam((s) => s.records[exam.id])
  const totals = usePackTotals(code)
  const grammarDone = useGrammar((s) =>
    totals ? totals.unitIds.filter((id) => isPassed(s.progress[id])).length : 0
  )
  const storiesRead = useReading((s) =>
    totals ? totals.storyIds.filter((id) => (s.progress[id]?.reads ?? 0) > 0).length : 0
  )
  const [mode, setMode] = useState<Mode | null>(null)

  const words = useMemo(() => examWords(exam, pack.words), [exam, pack.words])
  const stageLabel = exam.stageLabel ?? ['từ sơ cấp', 'beginner words']
  const wordsById = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])
  const fresh = words.filter((w) => phaseOf(cards[w.id]) === 'new')
  const mastered = words.filter((w) => phaseOf(cards[w.id]) === 'mastered').length
  const learned = words.length - fresh.length

  if (mode?.kind === 'learn')
    return (
      <LearnSession
        words={mode.words}
        pool={pack.words}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(w, correct) => recordAnswer(code, w.id, correct)}
        onKnown={(w) => markKnown(code, w.id)}
        onExit={() => setMode(null)}
        renderComplete={(total) => (
          <SessionComplete
            emoji="🌟"
            title={t('Học xong rồi!', 'Lesson done!')}
            correct={total}
            total={total}
            showScore={false}
          >
            <button className="btn-primary" onClick={() => setMode(null)}>
              {t(`Về lộ trình ${exam.name}`, `Back to the ${exam.name} roadmap`)}
            </button>
          </SessionComplete>
        )}
      />
    )

  if (mode?.kind === 'mock')
    return (
      <QuizRunner
        questions={mode.questions}
        wordsById={wordsById}
        ttsLang={pack.meta.ttsLang}
        // A check, not study: many of these words may not be started yet.
        onAnswer={() => {}}
        onExit={() => setMode(null)}
        caption={t(`Kiểm tra từ vựng ${exam.name}`, `${exam.name} vocabulary check`)}
        renderComplete={(correct, total, wrongIds) => (
          <MockComplete
            exam={exam}
            correct={correct}
            total={total}
            wrong={wrongIds.map((id) => wordsById.get(id)!).filter(Boolean)}
            onBack={() => setMode(null)}
          />
        )}
      />
    )

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">
            {t(`Lộ trình luyện thi ${exam.name}`, `${exam.name} roadmap`)}
          </span>{' '}
          <span aria-hidden="true">🎯</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Những phần cần cho kỳ thi, theo thứ tự nên học, kèm chỗ bạn đã tới.',
            'What the exam needs, in the order to learn it, with how far you have got.'
          )}
        </p>
        {levels}
      </header>

      <section className="card p-5" aria-labelledby="exam-facts">
        <h2 id="exam-facts" className="flex items-center gap-2 font-bold">
          <Info className="h-4 w-4 text-brand-500" aria-hidden="true" />
          {t(`Về kỳ thi ${exam.name}`, `About ${exam.name}`)}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {exam.facts.map((f) => (
            <li key={f[0]}>{t(...f)}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {t(...exam.caveat)}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>
            {t(`Nguồn (xem ngày ${exam.checked[0]}):`, `Sources (checked ${exam.checked[1]}):`)}
          </span>
          {exam.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-300"
            >
              {s.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ))}
        </p>
      </section>

      <ol className="space-y-3">
        <Step n={1} title={t(...exam.basics.title)}>
          <p>
            {exam.basics.note
              ? t(...exam.basics.note)
              : t(
                  'Đọc được chữ và nghe ra âm trước khi học từ.',
                  'Read the script and hear the sounds before learning words.'
                )}
          </p>
          <StepLink to={exam.basics.to}>{t('Mở bài', 'Open')}</StepLink>
        </Step>

        <Step
          n={2}
          title={t('Từ vựng', 'Vocabulary')}
          progress={words.length ? learned / words.length : 0}
        >
          <p>
            {exam.wordList
              ? t(
                  `Danh sách ${exam.name} (${words.length} mục): đã học ${learned}, đã thuộc ${mastered}.`,
                  `The ${exam.name} list (${words.length} entries): ${learned} learned, ${mastered} mastered.`
                )
              : t(
                  `${words.length} ${stageLabel[0]} trong gói: đã học ${learned}, đã thuộc ${mastered}.`,
                  `${words.length} ${stageLabel[1]} in the pack: ${learned} learned, ${mastered} mastered.`
                )}
          </p>
          {fresh.length > 0 ? (
            <button
              className="btn-primary h-11"
              onClick={() => setMode({ kind: 'learn', words: fresh.slice(0, LEARN_BATCH) })}
            >
              {t(
                `Học ${Math.min(fresh.length, LEARN_BATCH)} từ tiếp theo`,
                `Learn the next ${Math.min(fresh.length, LEARN_BATCH)} words`
              )}
            </button>
          ) : (
            <StepLink to="/review">{t('Đã học hết — ôn tập', 'All learned — review')}</StepLink>
          )}
        </Step>

        <Step
          n={3}
          title={t('Ngữ pháp', 'Grammar')}
          progress={totals?.unitIds.length ? grammarDone / totals.unitIds.length : undefined}
        >
          {totals && (
            <p>
              {t(
                `Đạt từ 80% ở ${grammarDone}/${totals.unitIds.length} bài.`,
                `80% or more in ${grammarDone} of ${totals.unitIds.length} lessons.`
              )}
            </p>
          )}
          <StepLink to="/grammar">{t('Học ngữ pháp', 'Study grammar')}</StepLink>
        </Step>

        <Step
          n={4}
          title={t('Đọc hiểu', 'Reading')}
          progress={totals?.storyIds.length ? storiesRead / totals.storyIds.length : undefined}
        >
          {totals && (
            <p>
              {t(
                `Đã đọc ${storiesRead}/${totals.storyIds.length} truyện ngắn.`,
                `${storiesRead} of ${totals.storyIds.length} short stories read.`
              )}
            </p>
          )}
          <StepLink to="/reading">{t('Đọc truyện', 'Read stories')}</StepLink>
        </Step>

        <Step n={5} title={t('Nghe', 'Listening')}>
          <p>
            {t(
              'Nghe câu rồi gõ lại: luyện tai cho phần nghe của đề.',
              'Hear a sentence, type it back: ear training for the listening part.'
            )}
          </p>
          <StepLink to="/dictation">{t('Nghe – chép', 'Dictation')}</StepLink>
        </Step>

        <Step n={6} title={t('Kiểm tra từ vựng', 'Vocabulary check')}>
          <p>
            {exam.wordList
              ? t(
                  `20 câu lấy từ danh sách ${exam.name}: 10 câu nghe, 10 câu đọc.`,
                  `20 questions from the ${exam.name} list: 10 listening, 10 reading.`
                )
              : t(
                  `20 câu lấy từ các ${stageLabel[0]} trong gói: 10 câu nghe, 10 câu đọc.`,
                  `20 questions from the ${stageLabel[1]} in the pack: 10 listening, 10 reading.`
                )}{' '}
            {t(
              'Đây là bài kiểm tra từ vựng, không phải đề thi thật, và không đổi lịch ôn.',
              'A vocabulary check, not a real exam paper, and it leaves your reviews alone.'
            )}
          </p>
          {best && (
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {t(
                `Điểm cao nhất: ${best.best}/${best.total} (${best.tries} lần làm)`,
                `Best: ${best.best}/${best.total} (${best.tries} tries)`
              )}
            </p>
          )}
          <button
            className="btn-secondary h-11"
            onClick={() => setMode({ kind: 'mock', questions: mockQuestions(words) })}
          >
            {t('Làm bài kiểm tra', 'Take the check')}
          </button>
        </Step>
      </ol>
    </div>
  )
}

/** Unit and story ids of the active pack, for the grammar and reading steps. */
function usePackTotals(code: string): { unitIds: string[]; storyIds: string[] } | null {
  const [totals, setTotals] = useState<{ unitIds: string[]; storyIds: string[] } | null>(null)
  useEffect(() => {
    let live = true
    Promise.all([loadGrammarPack(code), loadReadingPack(code)])
      .then(
        ([g, r]) =>
          live &&
          setTotals({ unitIds: g.units.map((u) => u.id), storyIds: r.stories.map((s) => s.id) })
      )
      // The steps still link to both pages; only the counts are missing.
      .catch(() => {})
    return () => {
      live = false
    }
  }, [code])
  return totals
}

function Step({
  n,
  title,
  progress,
  children,
}: {
  n: number
  title: string
  progress?: number
  children: React.ReactNode
}) {
  return (
    <li className="card flex gap-4 p-5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        {progress !== undefined && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        {children}
      </div>
    </li>
  )
}

function StepLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-300"
    >
      {children} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  )
}

export function MockComplete({
  exam,
  correct,
  total,
  wrong,
  onBack,
}: {
  exam: ExamInfo
  correct: number
  total: number
  wrong: Word[]
  onBack: () => void
}) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const record = useExam((s) => s.record)
  const cards = useStudy((s) => s.progress[code]?.cards) ?? NO_CARDS
  const addSaved = useSavedWords((s) => s.add)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  // Record once, even if this screen renders again.
  const recorded = useRef(false)
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    record(exam.id, correct, total, today())
  }, [record, exam.id, correct, total])

  // Missed words not in the review schedule yet go to "Lưu để học".
  const toSave = wrong.filter((w) => phaseOf(cards[w.id]) === 'new')

  return (
    <SessionComplete
      emoji="🎯"
      title={t(`Xong bài kiểm tra ${exam.name}`, `${exam.name} check done`)}
      correct={correct}
      total={total}
    >
      {wrong.length > 0 && (
        <div className="w-full text-left">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t('Từ cần học thêm:', 'Words to work on:')}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {wrong.map((w) => (
              <li
                key={w.id}
                className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {w.word} · {w.meaning}
              </li>
            ))}
          </ul>
        </div>
      )}
      {savedCount === null ? (
        toSave.length > 0 && (
          <button
            className="btn-primary"
            onClick={() => {
              addSaved(
                code,
                toSave.map((w) => w.id)
              )
              setSavedCount(toSave.length)
            }}
          >
            <BookmarkPlus className="h-5 w-5" />
            {t(
              `Lưu ${toSave.length} từ sai để học`,
              toSave.length === 1
                ? 'Save the missed word to learn'
                : `Save ${toSave.length} missed words to learn`
            )}
          </button>
        )
      ) : (
        <Link to="/learn" className="btn-primary">
          {t(
            `Đã lưu ${savedCount} từ — học ngay`,
            savedCount === 1 ? 'Saved — learn it now' : `Saved ${savedCount} words — learn now`
          )}
        </Link>
      )}
      <button className="btn-secondary" onClick={onBack}>
        {t(`Về lộ trình ${exam.name}`, `Back to the ${exam.name} roadmap`)}
      </button>
    </SessionComplete>
  )
}
