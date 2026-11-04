import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Headphones, BookOpenText } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { MINI_TEST_ID } from '@/lib/toeicMiniTest'
import { phaseOf } from '@/lib/srs'
import { TOEIC_PARTS, TOEIC_THEMES, themeWords } from '@/lib/toeic'
import { useT } from '@/lib/i18n'
import DeckBoard, { type Deck } from '@/components/DeckBoard'
import ProgressRing from '@/components/ProgressRing'
import AttemptTrail from '@/components/AttemptTrail'
import {
  PART5_KINDS,
  part5Round,
  retryRound,
  weakestKind,
  type Part5Question,
} from '@/lib/toeicPart5'
import { useRetry } from '@/store/retryStore'
import Part5Round from './Part5Round'
import { part2Round, type Part2Question } from '@/lib/toeicPart2'
import Part2Round from './Part2Round'
import { part1Round, type Part1Question } from '@/lib/toeicPart1'
import { pickSet, shuffleSet, type ReadingSet, type ShuffledQuestion } from '@/lib/toeicReading'
import ReadingRound from './ReadingRound'
import { pickTalk, type TalkSet } from '@/lib/toeicTalks'
import TalkRound from './TalkRound'
import MiniTest from './MiniTest'
import FormRound from './FormRound'
import { formRound, type FormQuestion } from '@/lib/wordFormDrill'
import FamilyRound from './FamilyRound'
import { familyRound, type WordFamily } from '@/lib/wordFamilies'

// "Luyện thi TOEIC" (docs/design/toeic.md): the workplace vocabulary by theme,
// and what each of the seven parts of the Listening & Reading test asks.

/** The parts that can be practised here, with their button. */
const PRACTICE_LABEL: Partial<Record<number, [string, string]>> = {
  1: ['Luyện Part 1 (6 câu)', 'Practise Part 1 (6 questions)'],
  2: ['Luyện Part 2 (10 câu)', 'Practise Part 2 (10 questions)'],
  3: ['Luyện Part 3 (một đoạn hội thoại)', 'Practise Part 3 (one conversation)'],
  4: ['Luyện Part 4 (một bài nói)', 'Practise Part 4 (one talk)'],
  5: ['Luyện Part 5 (10 câu)', 'Practise Part 5 (10 questions)'],
  6: ['Luyện Part 6 (một đoạn văn)', 'Practise Part 6 (one text)'],
  7: ['Luyện Part 7 (một bài đọc)', 'Practise Part 7 (one set)'],
}

export default function Toeic() {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const best = useExam((s) => s.records[MINI_TEST_ID])
  const missedPart5 = useRetry((s) => s.part5.length)
  const weakest = weakestKind(useRetry((s) => s.kinds))
  // The part being practised; n remounts the round on "play again".
  const [mini, setMini] = useState(false)
  const [forms, setForms] = useState<{ n: number; questions: FormQuestion[] } | null>(null)
  const startForms = () =>
    setForms((f) => ({ n: (f?.n ?? 0) + 1, questions: formRound(pack.words) }))
  const [families, setFamilies] = useState<{ n: number; families: WordFamily[] } | null>(null)
  const startFamilies = () => setFamilies((f) => ({ n: (f?.n ?? 0) + 1, families: familyRound() }))
  const [round, setRound] = useState<
    | { part: 1; n: number; questions: Part1Question[] }
    | { part: 2; n: number; questions: Part2Question[] }
    | { part: 5; n: number; questions: Part5Question[] }
    | { part: 3 | 4; n: number; set: TalkSet; questions: ShuffledQuestion[] }
    | { part: 6 | 7; n: number; set: ReadingSet; questions: ShuffledQuestion[] }
    | null
  >(null)
  const start = (part: 1 | 2 | 3 | 4 | 5 | 6 | 7) =>
    setRound((r) => {
      const n = (r?.n ?? 0) + 1
      if (part === 1) return { part, n, questions: part1Round() }
      if (part === 2) return { part, n, questions: part2Round() }
      if (part === 5) return { part, n, questions: part5Round(pack.words) }
      // Another text than the one just done.
      const last = r && 'set' in r ? r.set.id : undefined
      if (part === 3 || part === 4) return { part, n, ...shuffleSet(pickTalk(part, last)) }
      return { part, n, ...shuffleSet(pickSet(part, last)) }
    })

  /** The Part 5 questions missed before, as a round of their own. */
  const startRetry = () =>
    setRound((r) => ({
      part: 5,
      n: (r?.n ?? 0) + 1,
      questions: retryRound(useRetry.getState().part5),
    }))

  const decks = useMemo<Deck[]>(
    () =>
      TOEIC_THEMES.map((theme) => ({
        id: theme.id,
        emoji: theme.emoji,
        title: theme.title,
        words: themeWords(theme, pack.words),
      })),
    [pack.words]
  )
  const all = decks.flatMap((d) => d.words)
  const learned = all.filter((w) => cards[w.id]).length
  const mastered = all.filter((w) => phaseOf(cards[w.id]) === 'mastered').length

  if (round?.part === 1 || round?.part === 2)
    return (
      <Part2Round
        key={round.n}
        questions={round.questions}
        onAgain={() => start(round.part)}
        onExit={() => setRound(null)}
      />
    )
  if (mini) return <MiniTest words={pack.words} onExit={() => setMini(false)} />
  if (forms)
    return (
      <FormRound
        key={forms.n}
        questions={forms.questions}
        onAgain={startForms}
        onExit={() => setForms(null)}
      />
    )
  if (families)
    return (
      <FamilyRound
        key={families.n}
        families={families.families}
        onAgain={startFamilies}
        onExit={() => setFamilies(null)}
      />
    )
  if (round?.part === 3 || round?.part === 4)
    return (
      <TalkRound
        key={round.n}
        set={round.set}
        questions={round.questions}
        onAgain={() => start(round.part)}
        onExit={() => setRound(null)}
      />
    )
  if (round?.part === 6 || round?.part === 7)
    return (
      <ReadingRound
        key={round.n}
        set={round.set}
        questions={round.questions}
        onAgain={() => start(round.part)}
        onExit={() => setRound(null)}
      />
    )
  if (round?.part === 5)
    return (
      <Part5Round
        key={round.n}
        questions={round.questions}
        onAgain={() => start(5)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <DeckBoard
      decks={decks}
      backLabel={['Chọn chủ đề khác', 'Pick another theme']}
      before={
        <>
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-aurora">{t('Luyện thi TOEIC', 'TOEIC practice')}</span>{' '}
              <span aria-hidden="true">💼</span>
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {t(
                'Đề TOEIC Listening & Reading xoay quanh công việc: đặt hàng, tuyển dụng, họp hành, đi công tác. Học từ theo đúng những tình huống đó, rồi làm quen từng Part của đề.',
                'The TOEIC Listening & Reading test is built around work: orders, hiring, meetings, business trips. Learn the words of those situations, then get to know each part of the test.'
              )}
            </p>
          </header>

          <section className="card space-y-4 p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={all.length ? mastered / all.length : 0} size={64}>
                <span className="text-sm font-bold">
                  {all.length ? Math.round((100 * mastered) / all.length) : 0}%
                </span>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {t(
                    `${mastered}/${all.length} từ TOEIC đã thành thạo`,
                    `${mastered}/${all.length} TOEIC words mastered`
                  )}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(`Đã học ${learned} từ.`, `${learned} started.`)}{' '}
                  {t(
                    'Mốc B1 theo ETS: 275 điểm Nghe và 275 điểm Đọc; B2: 400 điểm Nghe và 385 điểm Đọc.',
                    "ETS's B1 mark: 275 in Listening and 275 in Reading; B2: 400 in Listening and 385 in Reading."
                  )}
                </p>
              </div>
            </div>
            <Link to="/exam?exam=toeic" className="btn-secondary h-10 w-full text-sm sm:w-auto">
              {t('Lộ trình & kiểm tra từ vựng', 'Roadmap & vocabulary check')}{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <h2 className="text-lg font-bold">{t('Từ vựng theo chủ đề', 'Words by theme')}</h2>
        </>
      }
      after={
        <>
          <section className="card flex flex-wrap items-center gap-3 p-5">
            <span className="text-3xl" aria-hidden="true">
              ⏱️
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{t('Bài thi nhỏ', 'Mini test')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t(
                  '26 câu, khoảng 20 phút, đủ 7 Part theo tỉ lệ đề thật. Cuối bài có khoảng điểm ước lượng cho Nghe và Đọc.',
                  '26 questions, about 20 minutes, all 7 parts in the proportions of the real test, with an estimated range for Listening and Reading.'
                )}
                {best &&
                  t(
                    ` Lần tốt nhất: ${best.best}/${best.total} câu.`,
                    ` Your best: ${best.best}/${best.total}.`
                  )}
              </p>
              {best?.recent && <AttemptTrail attempts={best.recent} />}
            </div>
            <button
              type="button"
              className="btn-primary h-10 w-full text-sm sm:w-auto"
              onClick={() => setMini(true)}
            >
              {t('Làm bài thi nhỏ', 'Take the mini test')}
            </button>
          </section>
          <section aria-labelledby="toeic-parts" className="space-y-3">
            <h2 id="toeic-parts" className="text-lg font-bold">
              {t('7 Part của đề', 'The seven parts')}
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {TOEIC_PARTS.map((part) => (
                <li key={part.n} className="card space-y-2 p-4">
                  <p className="flex items-center gap-2 font-bold">
                    {part.section === 'listening' ? (
                      <Headphones
                        className="h-4 w-4 text-sky-600 dark:text-sky-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <BookOpenText
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-300"
                        aria-hidden="true"
                      />
                    )}
                    Part {part.n} · {t(...part.name)}
                    <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {t(`${part.questions} câu`, `${part.questions} questions`)}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t(...part.asks)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">💡 {t(...part.tip)}</p>
                  {PRACTICE_LABEL[part.n] && (
                    <button
                      type="button"
                      className="btn-primary h-10 w-full text-sm"
                      onClick={() => start(part.n)}
                    >
                      {t(...PRACTICE_LABEL[part.n]!)}
                    </button>
                  )}
                  {part.n === 5 && weakest && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {t(
                        `Dạng bạn hay sai nhất: ${PART5_KINDS[weakest[0]][0]} (đúng ${weakest[1]}/${weakest[2]} câu).`,
                        `Your weakest kind: ${PART5_KINDS[weakest[0]][1]} (${weakest[1]} of ${weakest[2]} right).`
                      )}
                    </p>
                  )}
                  {part.n === 5 && missedPart5 > 0 && (
                    <button
                      type="button"
                      className="btn-secondary h-10 w-full text-sm"
                      onClick={startRetry}
                    >
                      {t(
                        `Làm lại ${missedPart5} câu đã sai`,
                        `Try again: ${missedPart5} missed question${missedPart5 > 1 ? 's' : ''}`
                      )}
                    </button>
                  )}
                  {part.n === 5 && (
                    <button
                      type="button"
                      className="btn-secondary h-10 w-full text-sm"
                      onClick={startForms}
                    >
                      {t(
                        'Mẹo đuôi từ: đoán từ loại (10 câu)',
                        'Ending tip: spot the part of speech (10)'
                      )}
                    </button>
                  )}
                  {part.n === 5 && (
                    <button
                      type="button"
                      className="btn-secondary h-10 w-full text-sm"
                      onClick={startFamilies}
                    >
                      {t(
                        'Ghép họ từ: decide → decision → decisive (6 họ)',
                        'Word families: decide → decision → decisive (6)'
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      }
    />
  )
}
