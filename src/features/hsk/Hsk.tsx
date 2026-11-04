import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { useExam } from '@/store/examStore'
import { phaseOf } from '@/lib/srs'
import { examFor } from '@/lib/exams'
import {
  HSK_LEVELS,
  HSK_SCALE,
  charQuestions,
  fillQuestions,
  judgeQuestions,
  levelWords,
  lookQuestions,
  pictureQuestions,
  seeQuestions,
  listenQuestions,
  orderQuestions,
  type HskChoice,
  type HskLevel,
  type HskOrder,
} from '@/lib/hskPractice'
import { pinyinXp } from '@/lib/pinyin'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'
import ProgressRing from '@/components/ProgressRing'
import AttemptTrail from '@/components/AttemptTrail'
import HskChoiceRound from './HskChoiceRound'
import HskOrderRound from './HskOrderRound'
import HskDialogueRound from './HskDialogueRound'
import HskAnswerRound from './HskAnswerRound'
import { answerRound, type AnswerQuestion } from '@/lib/hskAnswers'
import { dialogueRound, pictureDialogueRound, type ShuffledDialogue } from '@/lib/hskDialogues'

// "Luyện thi HSK" (docs/design/toeic.md, giai đoạn B): for HSK 1–3, the
// question types of the test cut from the level's own words, and a mini test
// with a rough score on the real scale.

const ROUND = 10

type Drill =
  | 'judge'
  | 'pick'
  | 'match'
  | 'talk'
  | 'listen'
  | 'look'
  | 'see'
  | 'answer'
  | 'fill'
  | 'order'
  | 'char'

type Run =
  | {
      kind: 'choice'
      drill: Exclude<Drill, 'order' | 'talk' | 'match' | 'answer'>
      n: number
      questions: HskChoice[]
    }
  | { kind: 'order'; n: number; questions: HskOrder[] }
  | { kind: 'talk'; drill: 'talk' | 'match'; n: number; dialogues: ShuffledDialogue[] }
  | { kind: 'answer'; n: number; questions: AnswerQuestion[] }
  | { kind: 'mini'; step: number; steps: MiniStep[]; scores: SectionScore[] }
  | null

type Section = 'listen' | 'read' | 'write'

/** A part of the mini test; HSK 3 writing has two (完成句子, then 写汉字). */
type MiniStep =
  | { section: Section; kind: 'choice'; questions: HskChoice[] }
  | { section: 'write'; kind: 'order'; questions: HskOrder[] }
  | { section: 'listen'; kind: 'talk'; dialogues: ShuffledDialogue[] }
  | { section: 'read'; kind: 'answer'; questions: AnswerQuestion[] }

/** Right answers per section, in the order of the test. */
type SectionScore = { section: Section; correct: number; total: number }

export default function Hsk() {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const record = useExam((s) => s.record)
  const [level, setLevel] = useState<HskLevel>('hsk1')
  const [run, setRun] = useState<Run>(null)
  const [result, setResult] = useState<{ scores: SectionScore[]; xp: number } | null>(null)
  const exam = examFor('zh', level)!
  const best = useExam((s) => s.records[`${level}-mini`])

  const words = useMemo(() => levelWords(level, pack.words), [level, pack.words])
  /** HSK 1–2 words: the pictures of the HSK 2 picture dialogues. */
  const lowWords = useMemo(
    () => [...levelWords('hsk1', pack.words), ...levelWords('hsk2', pack.words)],
    [pack.words]
  )
  const mastered = words.filter((w) => phaseOf(cards[w.id]) === 'mastered').length
  const name = exam.name

  const ALL_DRILLS: {
    id: Drill
    icon: string
    title: [string, string]
    desc: [string, string]
    /** Only for these levels; every level when absent. */
    levels?: HskLevel[]
    /** Questions in a round, when not ROUND. */
    count?: number
  }[] = [
    {
      id: 'match',
      icon: '🧩',
      title: ['Nghe hội thoại – chọn tranh', 'Dialogue and picture'],
      desc: [
        'Nghe một đoạn hội thoại ngắn, chọn tranh đúng trong 5 tranh: phần thứ hai bài Nghe của HSK 2.',
        'Hear a short dialogue and pick its picture among five: the second listening part of HSK 2.',
      ],
      levels: ['hsk2'],
      count: 5,
    },
    {
      id: 'talk',
      icon: '🗣️',
      title: ['Nghe hội thoại (听对话)', 'Dialogues (听对话)'],
      desc: [
        'Nghe một người nữ và một người nam nói, rồi trả lời câu hỏi: các phần nghe hội thoại của HSK 2 và HSK 3. Hai người nói bằng hai giọng khác nhau.',
        'Hear a woman and a man, then answer the question: the dialogue parts of HSK 2 and HSK 3 listening, in two different voices.',
      ],
      levels: ['hsk2', 'hsk3'],
      count: 5,
    },
    {
      id: 'judge',
      icon: '🖼️',
      title: ['Nghe – đúng hay sai (判断对错)', 'Right or wrong (判断对错)'],
      desc: [
        'Nghe một từ, nhìn tranh, chọn đúng hay sai: phần đầu bài Nghe của HSK 1 và HSK 2.',
        'Hear a word, look at the picture, say right or wrong: the first listening part of HSK 1 and HSK 2.',
      ],
    },
    {
      id: 'pick',
      icon: '🧩',
      title: ['Nghe – chọn tranh (听句子选图片)', 'Pick the picture (听句子选图片)'],
      desc: [
        'Nghe một câu bằng giọng thu sẵn, chọn đúng tranh trong 3 tranh: phần thứ hai bài Nghe của HSK 1.',
        'Hear a recorded sentence and pick its picture among three: the second listening part of HSK 1.',
      ],
    },
    {
      id: 'listen',
      icon: '🎧',
      title: ['Nghe hiểu (听力)', 'Listening (听力)'],
      desc: [
        'Nghe một câu bằng giọng thu sẵn, chọn nghĩa đúng trong 3 phương án.',
        'Hear a recorded sentence and pick what it means among three.',
      ],
    },
    {
      id: 'look',
      icon: '👀',
      title: ['Đọc – nhìn tranh (看图判断)', 'Read and look (看图判断)'],
      desc: [
        'Đọc một từ có pinyin, nhìn tranh, chọn đúng hay sai: phần đầu bài Đọc của HSK 1 và HSK 2.',
        'Read a word with its pinyin, look at the picture, say right or wrong: the first reading part of HSK 1 and HSK 2.',
      ],
    },
    {
      id: 'answer',
      icon: '💬',
      title: ['Đọc – ghép câu hỏi và trả lời', 'Question and answer'],
      desc: [
        'Đọc một câu hỏi, chọn câu trả lời phù hợp trong 4 câu: phần thứ ba bài Đọc của HSK 1, phần ghép câu của HSK 2.',
        'Read a question and pick its answer among four: the third reading part of HSK 1 and the matching part of HSK 2.',
      ],
      levels: ['hsk1', 'hsk2'],
    },
    {
      id: 'see',
      icon: '📖',
      title: ['Đọc – chọn tranh', 'Read and pick the picture'],
      desc: [
        'Đọc một câu có pinyin, chọn đúng tranh trong 3 tranh: phần thứ hai bài Đọc của HSK 1.',
        'Read a sentence with its pinyin and pick its picture among three: the second reading part of HSK 1.',
      ],
    },
    {
      id: 'fill',
      icon: '✍️',
      title: ['Chọn từ điền chỗ trống (选词填空)', 'Fill the gap (选词填空)'],
      desc: [
        `Câu ví dụ thiếu một từ, chọn trong 4 từ ${name} có kèm pinyin.`,
        `A sentence with one word missing: pick it among four ${name} words, with pinyin.`,
      ],
    },
    {
      id: 'order',
      icon: '🧱',
      title: ['Sắp xếp câu (完成句子)', 'Build the sentence (完成句子)'],
      desc: [
        'Xếp các từ thành câu đúng: phần đầu bài Viết của HSK 3, ở cấp nào cũng là cách luyện ngữ pháp tốt.',
        'Put the words in order: the first writing part of HSK 3, and good grammar practice at any level.',
      ],
    },
    {
      id: 'char',
      icon: '🖌️',
      title: ['Viết chữ Hán (写汉字)', 'Write the character (写汉字)'],
      desc: [
        'Câu thiếu một chữ, có pinyin: chọn đúng chữ trong 4 chữ cùng âm hoặc cùng bộ thủ. Phần Viết thứ hai của HSK 3.',
        'A sentence missing one character, with its pinyin: pick it among four that sound alike or share a radical. The second writing part of HSK 3.',
      ],
    },
  ]

  const DRILLS = ALL_DRILLS.filter((d) => !d.levels || d.levels.includes(level))

  const startDrill = (drill: Drill) => {
    const n = (run && 'n' in run ? run.n : 0) + 1
    if (drill === 'order')
      return setRun({ kind: 'order', n, questions: orderQuestions(level, pack.words, ROUND) })
    if (drill === 'answer') {
      // Shown for HSK 1 and 2 only (ALL_DRILLS levels).
      if (level !== 'hsk3') setRun({ kind: 'answer', n, questions: answerRound(level, ROUND) })
      return
    }
    if (drill === 'match')
      return setRun({ kind: 'talk', drill, n, dialogues: pictureDialogueRound(lowWords, 5) })
    if (drill === 'talk') {
      // Shown for HSK 2 and 3 only (ALL_DRILLS levels).
      if (level !== 'hsk1') setRun({ kind: 'talk', drill, n, dialogues: dialogueRound(level, 5) })
      return
    }
    const make = {
      judge: judgeQuestions,
      look: lookQuestions,
      pick: pictureQuestions,
      see: seeQuestions,
      listen: listenQuestions,
      char: charQuestions,
      fill: fillQuestions,
    }[drill]
    setRun({ kind: 'choice', drill, n, questions: make(level, pack.words, ROUND) })
  }

  const startMini = () => {
    setResult(null)
    // HSK 1–2 listening opens with right-or-wrong pictures; HSK 3 has none.
    const listen: MiniStep[] =
      HSK_SCALE[level].sections === 3
        ? [
            { section: 'listen', kind: 'talk', dialogues: dialogueRound('hsk3', 5) },
            { section: 'listen', kind: 'choice', questions: listenQuestions(level, pack.words, 5) },
          ]
        : level === 'hsk1'
          ? [
              {
                section: 'listen',
                kind: 'choice',
                questions: judgeQuestions(level, pack.words, 4),
              },
              {
                section: 'listen',
                kind: 'choice',
                questions: pictureQuestions(level, pack.words, 3),
              },
              {
                section: 'listen',
                kind: 'choice',
                questions: listenQuestions(level, pack.words, 3),
              },
            ]
          : [
              {
                section: 'listen',
                kind: 'choice',
                questions: judgeQuestions(level, pack.words, 3),
              },
              { section: 'listen', kind: 'talk', dialogues: pictureDialogueRound(lowWords, 2) },
              { section: 'listen', kind: 'talk', dialogues: dialogueRound('hsk2', 3) },
              {
                section: 'listen',
                kind: 'choice',
                questions: listenQuestions(level, pack.words, 2),
              },
            ]
    // Reading too: HSK 1–2 open with pictures, HSK 3 has none.
    const read: MiniStep[] =
      HSK_SCALE[level].sections === 3
        ? [{ section: 'read', kind: 'choice', questions: fillQuestions(level, pack.words, ROUND) }]
        : level === 'hsk1'
          ? [
              { section: 'read', kind: 'choice', questions: lookQuestions(level, pack.words, 4) },
              { section: 'read', kind: 'choice', questions: seeQuestions(level, pack.words, 2) },
              { section: 'read', kind: 'answer', questions: answerRound('hsk1', 2) },
              { section: 'read', kind: 'choice', questions: fillQuestions(level, pack.words, 2) },
            ]
          : [
              { section: 'read', kind: 'choice', questions: lookQuestions(level, pack.words, 4) },
              { section: 'read', kind: 'answer', questions: answerRound('hsk2', 3) },
              { section: 'read', kind: 'choice', questions: fillQuestions(level, pack.words, 3) },
            ]
    const steps: MiniStep[] = [...listen, ...read]
    // HSK 3 writing: five sentences to build, five characters to write.
    if (HSK_SCALE[level].sections === 3)
      steps.push(
        { section: 'write', kind: 'order', questions: orderQuestions(level, pack.words, 5) },
        { section: 'write', kind: 'choice', questions: charQuestions(level, pack.words, 5) }
      )
    setRun({ kind: 'mini', step: 0, steps, scores: [] })
  }

  const exit = () => setRun(null)
  const sectionName = (s: Section) =>
    s === 'listen'
      ? t('Nghe', 'Listening')
      : s === 'read'
        ? t('Đọc', 'Reading')
        : t('Viết', 'Writing')

  if (run?.kind === 'mini') {
    const s = run.steps[run.step]
    const done = (correct: number, total: number) => {
      // Parts of one section add up: the two writing parts make one writing score.
      const prev = run.scores.find((x) => x.section === s.section)
      const scores = prev
        ? run.scores.map((x) =>
            x === prev ? { ...x, correct: x.correct + correct, total: x.total + total } : x
          )
        : [...run.scores, { section: s.section, correct, total }]
      if (run.step + 1 < run.steps.length) return setRun({ ...run, step: run.step + 1, scores })
      const right = scores.reduce((n, x) => n + x.correct, 0)
      const all = scores.reduce((n, x) => n + x.total, 0)
      const xp = pinyinXp(right, all)
      addPlayXp(code, xp)
      record(`${level}-mini`, right, all, today())
      setResult({ scores, xp })
      setRun(null)
    }
    const title = `${name} · ${sectionName(s.section)}`
    if (s.kind === 'answer')
      return (
        <HskAnswerRound
          key={run.step}
          title={title}
          questions={s.questions}
          onAgain={() => {}}
          onExit={exit}
          onDone={done}
        />
      )
    if (s.kind === 'talk')
      return (
        <HskDialogueRound
          key={run.step}
          title={title}
          dialogues={s.dialogues}
          onAgain={() => {}}
          onExit={exit}
          onDone={done}
        />
      )
    return s.kind === 'order' ? (
      <HskOrderRound
        key={run.step}
        title={title}
        questions={s.questions}
        onAgain={() => {}}
        onExit={exit}
        onDone={done}
      />
    ) : (
      <HskChoiceRound
        key={run.step}
        title={title}
        questions={s.questions}
        onAgain={() => {}}
        onExit={exit}
        onDone={done}
      />
    )
  }
  if (run?.kind === 'answer')
    return (
      <HskAnswerRound
        key={run.n}
        title={`${name} · ${t('Hỏi – đáp', 'Question and answer')}`}
        questions={run.questions}
        onAgain={() => startDrill('answer')}
        onExit={exit}
      />
    )
  if (run?.kind === 'talk')
    return (
      <HskDialogueRound
        key={run.n}
        title={`${name} · ${
          run.drill === 'match'
            ? t('Hội thoại – tranh', 'Dialogue and picture')
            : t('Nghe hội thoại', 'Dialogues')
        }`}
        dialogues={run.dialogues}
        onAgain={() => startDrill(run.drill)}
        onExit={exit}
      />
    )
  if (run?.kind === 'order')
    return (
      <HskOrderRound
        key={run.n}
        title={`${name} · ${t('Sắp xếp câu', 'Build the sentence')}`}
        questions={run.questions}
        onAgain={() => startDrill('order')}
        onExit={exit}
      />
    )
  if (run?.kind === 'choice')
    return (
      <HskChoiceRound
        key={run.n}
        title={`${name} · ${
          run.drill === 'listen'
            ? t('Nghe hiểu', 'Listening')
            : run.drill === 'judge'
              ? t('Đúng hay sai', 'Right or wrong')
              : run.drill === 'pick'
                ? t('Chọn tranh', 'Pick the picture')
                : run.drill === 'see'
                  ? t('Đọc – chọn tranh', 'Read and pick')
                  : run.drill === 'look'
                    ? t('Nhìn tranh', 'Read and look')
                    : run.drill === 'char'
                      ? t('Viết chữ Hán', 'Write the character')
                      : t('Điền từ', 'Fill the gap')
        }`}
        questions={run.questions}
        onAgain={() => startDrill(run.drill)}
        onExit={exit}
      />
    )

  // Each section is out of 100 on the real test; a short round can only give a rough range.
  const estimate = result?.scores.map((x) => Math.round((100 * x.correct) / x.total))
  const total = estimate?.reduce((a, b) => a + b, 0) ?? 0
  const scale = HSK_SCALE[level]

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Luyện thi HSK', 'HSK practice')}</span>{' '}
          <span aria-hidden="true">🀄</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Luyện đúng các dạng câu của đề HSK 1–3, làm từ chính từ vựng của cấp đó, rồi thử bài thi nhỏ để biết mình đang ở đâu.',
            'Practise the question types of HSK 1–3 with the words of each level, then take a mini test to see where you stand.'
          )}
        </p>
        <div
          role="tablist"
          className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          {HSK_LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              role="tab"
              aria-selected={lv === level}
              onClick={() => {
                setLevel(lv)
                setResult(null)
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                lv === level
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {examFor('zh', lv)!.name}
            </button>
          ))}
        </div>
      </header>

      <section className="card space-y-4 p-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={words.length ? mastered / words.length : 0} size={64}>
            <span className="text-sm font-bold">
              {words.length ? Math.round((100 * mastered) / words.length) : 0}%
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {t(
                `${mastered}/${words.length} từ ${name} đã thành thạo`,
                `${mastered}/${words.length} ${name} words mastered`
              )}
            </p>
            <ul className="text-sm text-slate-500 dark:text-slate-400">
              {exam.facts.slice(0, 2).map((f, i) => (
                <li key={i}>{t(...f)}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link to={`/exam?exam=${level}`} className="btn-secondary h-10 w-full text-sm sm:w-auto">
          {t(`Lộ trình ${name} & học từ`, `${name} roadmap & words`)}{' '}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="space-y-3" aria-labelledby="hsk-drills">
        <h2 id="hsk-drills" className="text-lg font-bold">
          {t('Luyện theo dạng câu', 'Practise by question type')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {DRILLS.map((d) => (
            <li key={d.id} className="card flex flex-col gap-2 p-4">
              <p className="font-bold">
                <span aria-hidden="true">{d.icon}</span> {t(...d.title)}
              </p>
              <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">{t(...d.desc)}</p>
              <button
                type="button"
                className="btn-primary h-10 text-sm"
                onClick={() => startDrill(d.id)}
              >
                {t(`Luyện ${d.count ?? ROUND} câu`, `Practise ${d.count ?? ROUND} questions`)}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3 p-5" aria-labelledby="hsk-mini">
        <h2 id="hsk-mini" className="font-bold">
          ⏱️ {t(`Bài thi nhỏ ${name}`, `${name} mini test`)}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {scale.sections === 3
            ? t(
                '10 câu nghe, 10 câu đọc và 10 câu viết (5 câu sắp xếp, 5 câu viết chữ), như ba phần của đề HSK 3.',
                '10 listening, 10 reading and 10 writing questions (5 sentences to build, 5 characters), like the three parts of HSK 3.'
              )
            : t(
                `10 câu nghe và 10 câu đọc, mỗi phần mở đầu bằng các câu theo tranh, như hai phần của đề ${name}.`,
                `10 listening and 10 reading questions, each part opening with pictures, like the two parts of ${name}.`
              )}
          {best &&
            t(
              ` Lần tốt nhất: ${best.best}/${best.total} câu.`,
              ` Your best: ${best.best}/${best.total}.`
            )}
        </p>
        {best?.recent && <AttemptTrail attempts={best.recent} />}
        {result && estimate && (
          <div
            className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
            aria-live="polite"
          >
            {result.scores.map((x, i) => (
              <p key={x.section}>
                {sectionName(x.section)}: {x.correct}/{x.total} →{' '}
                {t(`khoảng ${estimate[i]}/100`, `about ${estimate[i]}/100`)}
              </p>
            ))}
            <p className="font-bold text-brand-700 dark:text-brand-300">
              {t(
                `Ước lượng: khoảng ${total}/${scale.sections * 100} điểm (đạt từ ${scale.pass}).`,
                `Estimate: about ${total}/${scale.sections * 100} (pass from ${scale.pass}).`
              )}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {t(
                'Đây chỉ là ước lượng thô từ một bài ngắn, không phải điểm HSK thật. +',
                'Only a rough estimate from a short test, not an HSK score. +'
              )}
              {result.xp} XP
            </p>
          </div>
        )}
        <button
          type="button"
          className="btn-primary h-10 w-full text-sm sm:w-auto"
          onClick={startMini}
        >
          {result ? t('Làm bài khác', 'Another test') : t('Làm bài thi nhỏ', 'Take the mini test')}
        </button>
      </section>
    </div>
  )
}
