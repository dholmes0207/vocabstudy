import { useState } from 'react'
import { ArrowRight, BookOpenText, Headphones, Mic, PenLine } from 'lucide-react'
import { useIelts } from '@/store/ieltsStore'
import { usePracticeBank } from '@/hooks/usePracticeBank'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  IELTS_FORMAT,
  drillRound,
  loadIeltsBank,
  pickOther,
  pickPassage,
  readingRound,
  type EssayPrompt,
  type ListeningChoiceSet,
  type ListeningSet,
  type OpinionPassage,
  type ReadingPassage,
  type Task1Chart,
  type WritingDrill,
} from '@/lib/ielts'
import { useT } from '@/lib/i18n'
import TfngRound from './TfngRound'
import HeadingsRound from './HeadingsRound'
import MatchingRound from './MatchingRound'
import CompletionRound from './CompletionRound'
import ChooseTwoRound from './ChooseTwoRound'
import SummaryRound from './SummaryRound'
import SpeakingRound, { type SpeakingTask } from './SpeakingRound'
import WritingDrillRound from './WritingDrillRound'
import EssayPractice from './EssayPractice'
import Task1Round from './Task1Round'
import ListeningRound from './ListeningRound'
import ListeningChoiceRound from './ListeningChoiceRound'

// "Luyện IELTS" (docs/design/ielts.md): what the test is made of, and practice
// for the skills one by one, starting with the Reading question Vietnamese
// learners trip on most: True / False / Not Given, then Matching headings and
// Summary completion, Matching information, Sentence completion and Choose TWO.

type MatchKind = 'headings' | 'summary' | 'matching' | 'completion' | 'chooseTwo'

export default function Ielts() {
  const t = useT()
  useDocumentTitle(`${t('Luyện IELTS', 'IELTS practice')} · VocaStudy`)
  const { bank, error, retry } = usePracticeBank(loadIeltsBank)
  const done = useIelts((s) => s.reading)
  const headingsDone = useIelts((s) => s.headings)
  const summaryDone = useIelts((s) => s.summary)
  const matchingDone = useIelts((s) => s.matching)
  const completionDone = useIelts((s) => s.completion)
  const chooseTwoDone = useIelts((s) => s.chooseTwo)
  const [match, setMatch] = useState<{
    n: number
    kind: MatchKind
    passage: ReadingPassage
  } | null>(null)
  const startMatch = (kind: MatchKind) => {
    const done = {
      headings: headingsDone,
      summary: summaryDone,
      matching: matchingDone,
      completion: completionDone,
      chooseTwo: chooseTwoDone,
    }[kind]
    if (bank)
      setMatch((r) => ({
        n: (r?.n ?? 0) + 1,
        kind,
        passage: pickPassage(bank.reading, (id) => !!done[id], r?.passage.id),
      }))
  }
  const [round, setRound] = useState<{ n: number; passage: ReadingPassage } | null>(null)
  const opinionDone = useIelts((s) => s.opinion)
  const [opinion, setOpinion] = useState<{ n: number; passage: OpinionPassage } | null>(null)
  const startOpinion = (passage?: OpinionPassage) => {
    if (bank)
      setOpinion((r) => ({
        n: (r?.n ?? 0) + 1,
        passage: readingRound(
          passage ?? pickPassage(bank.opinion, (id) => !!opinionDone[id], r?.passage.id)
        ),
      }))
  }
  const [speaking, setSpeaking] = useState<{ n: number; task: SpeakingTask } | null>(null)
  const [drills, setDrills] = useState<{ n: number; list: WritingDrill[] } | null>(null)
  const [task1, setTask1] = useState<{ n: number; chart: Task1Chart } | null>(null)
  const startTask1 = () => {
    if (bank)
      setTask1((r) => ({ n: (r?.n ?? 0) + 1, chart: pickOther(bank.writing.task1, r?.chart.id) }))
  }
  const startDrills = () => {
    if (bank) setDrills((r) => ({ n: (r?.n ?? 0) + 1, list: drillRound(bank.writing.drills) }))
  }
  const [essay, setEssay] = useState<EssayPrompt | null>(null)
  const [listening, setListening] = useState<{ n: number; set: ListeningSet } | null>(null)
  const listen = (part: 1 | 4 = 1) => {
    if (!bank) return
    const pool = bank.listening.filter((l) => (l.part ?? 1) === part)
    setListening((r) => ({ n: (r?.n ?? 0) + 1, set: pickOther(pool, r?.set.id) }))
  }
  const [choice, setChoice] = useState<{ n: number; set: ListeningChoiceSet } | null>(null)
  const listenChoice = (part: 2 | 3) => {
    if (!bank) return
    const pool = bank.listeningChoice.filter((c) => c.part === part)
    setChoice((r) => ({ n: (r?.n ?? 0) + 1, set: pickOther(pool, r?.set.id) }))
  }
  const speak = (part: 1 | 2) => {
    if (!bank) return
    setSpeaking((r) => {
      const last = r?.task.part === 1 ? r.task.topic.id : r?.task.card.id
      const task: SpeakingTask =
        part === 1
          ? { part, topic: pickOther(bank.speaking.part1, last) }
          : { part, card: pickOther(bank.speaking.part2, last) }
      return { n: (r?.n ?? 0) + 1, task }
    })
  }

  const start = (passage?: ReadingPassage) => {
    if (!bank) return
    setRound((r) => ({
      n: (r?.n ?? 0) + 1,
      passage: readingRound(
        passage ?? pickPassage(bank.reading, (id) => !!done[id], r?.passage.id)
      ),
    }))
  }

  if (choice)
    return (
      <ListeningChoiceRound
        key={choice.n}
        set={choice.set}
        onAgain={() => listenChoice(choice.set.part)}
        onExit={() => setChoice(null)}
      />
    )
  if (listening)
    return (
      <ListeningRound
        key={listening.n}
        set={listening.set}
        onAgain={() => listen(listening.set.part ?? 1)}
        onExit={() => setListening(null)}
      />
    )
  if (task1)
    return (
      <Task1Round
        key={task1.n}
        chart={task1.chart}
        onAgain={startTask1}
        onExit={() => setTask1(null)}
      />
    )
  if (drills)
    return (
      <WritingDrillRound
        key={drills.n}
        drills={drills.list}
        onAgain={startDrills}
        onExit={() => setDrills(null)}
      />
    )
  const essayType = essay && bank?.writing.types.find((w) => w.id === essay.type)
  if (essay && essayType)
    return <EssayPractice prompt={essay} type={essayType} onExit={() => setEssay(null)} />
  if (speaking)
    return (
      <SpeakingRound
        key={speaking.n}
        task={speaking.task}
        onAgain={() => speak(speaking.task.part)}
        onExit={() => setSpeaking(null)}
      />
    )
  if (match) {
    const Round = {
      headings: HeadingsRound,
      summary: SummaryRound,
      matching: MatchingRound,
      completion: CompletionRound,
      chooseTwo: ChooseTwoRound,
    }[match.kind]
    return (
      <Round
        key={match.n}
        passage={match.passage}
        onAgain={() => startMatch(match.kind)}
        onExit={() => setMatch(null)}
      />
    )
  }
  if (opinion)
    return (
      <TfngRound
        key={opinion.n}
        scale="ynng"
        passage={opinion.passage}
        onAgain={() => startOpinion()}
        onExit={() => setOpinion(null)}
      />
    )
  if (round)
    return (
      <TfngRound
        key={round.n}
        passage={round.passage}
        onAgain={() => start()}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Luyện IELTS', 'IELTS practice')}</span>{' '}
          <span aria-hidden="true">🎓</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'IELTS chấm 4 kỹ năng, mỗi kỹ năng một band từ thấp tới 9, lấy cả nửa band (6.5, 7.0…). Luyện từng dạng câu một, bắt đầu từ phần Đọc.',
            'IELTS scores four skills, each on a band up to 9 in half bands (6.5, 7.0…). Practise one question type at a time, starting with Reading.'
          )}
        </p>
      </header>

      <section aria-labelledby="ielts-format" className="space-y-3">
        <h2 id="ielts-format" className="text-lg font-bold">
          {t('Đề thi gồm gì', 'What the test is made of')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {IELTS_FORMAT.map((s) => (
            <li key={s.skill[1]} className="card p-4">
              <p className="flex items-center gap-2 font-bold">
                <span aria-hidden="true">{s.icon}</span> {t(...s.skill)}
                <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t(...s.time)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(...s.what)}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'Thông tin kiểm tra ngày 08/11/2026 từ trang của British Council và IDP. Xem lại trên ielts.org trước khi đăng ký thi. Bài luyện ở đây do VocaStudy tự viết, không phải đề thật.',
            'Checked on 08/11/2026 against British Council and IDP pages. Confirm on ielts.org before you register. The practice here is written by VocaStudy, not real past papers.'
          )}
        </p>
      </section>

      <section aria-labelledby="ielts-tfng" className="card space-y-4 p-5">
        <h2 id="ielts-tfng" className="flex items-center gap-2 text-lg font-bold">
          <BookOpenText
            className="h-5 w-5 text-emerald-600 dark:text-emerald-300"
            aria-hidden="true"
          />
          {t('Đọc: True / False / Not Given', 'Reading: True / False / Not Given')}
        </h2>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <p className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <b>TRUE</b>:{' '}
            {t(
              'bài nói đúng điều đó, có thể bằng từ khác.',
              'the passage says it, maybe in other words.'
            )}
          </p>
          <p className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
            <b>FALSE</b>: {t('bài nói ngược lại.', 'the passage says the opposite.')}
          </p>
          <p className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40">
            <b>NOT GIVEN</b>:{' '}
            {t(
              'bài không nói tới. Đừng dùng hiểu biết của bạn!',
              'the passage does not say. Don’t use what you know!'
            )}
          </p>
        </div>
        {error ? (
          <p role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            {t('Chưa tải được bài đọc.', "Couldn't load the passages.")}
            <button type="button" className="btn-secondary h-9 text-sm" onClick={retry}>
              {t('Thử lại', 'Try again')}
            </button>
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => start()}
              >
                {t('Làm một bài đọc', 'Read a passage')} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn-secondary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => startMatch('headings')}
              >
                🧩 {t('Nối tiêu đề (Matching headings)', 'Matching headings')}
              </button>
              <button
                type="button"
                className="btn-secondary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => startMatch('summary')}
              >
                📝 {t('Điền tóm tắt (Summary completion)', 'Summary completion')}
              </button>
              <button
                type="button"
                className="btn-secondary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => startMatch('matching')}
              >
                🔎 {t('Tìm thông tin (Matching information)', 'Matching information')}
              </button>
              <button
                type="button"
                className="btn-secondary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => startMatch('completion')}
              >
                ✍️ {t('Điền câu (Sentence completion)', 'Sentence completion')}
              </button>
              <button
                type="button"
                className="btn-secondary h-11 w-full sm:w-auto"
                disabled={!bank}
                onClick={() => startMatch('chooseTwo')}
              >
                ✌️ {t('Chọn hai đáp án (Choose TWO)', 'Choose TWO')}
              </button>
            </div>
            {bank && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {bank.reading.map((p) => {
                  const rec = done[p.id]
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => start(p)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-brand-400 dark:border-slate-700"
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {p.emoji}
                        </span>
                        <span className="min-w-0 flex-1 font-semibold">
                          {t(...p.title)}
                          {p.passage.length >= 5 && (
                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                              {t(
                                `Bài dài · ${p.passage.length} đoạn`,
                                `Long · ${p.passage.length} paragraphs`
                              )}
                            </span>
                          )}
                        </span>
                        {rec && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            ✓ {rec.best}/{rec.total}
                          </span>
                        )}
                        {headingsDone[p.id] && (
                          <span
                            className="text-xs font-bold text-sky-700 dark:text-sky-300"
                            title={t('Nối tiêu đề', 'Matching headings')}
                          >
                            🧩 {headingsDone[p.id].best}/{headingsDone[p.id].total}
                          </span>
                        )}
                        {summaryDone[p.id] && (
                          <span
                            className="text-xs font-bold text-violet-700 dark:text-violet-300"
                            title={t('Điền tóm tắt', 'Summary completion')}
                          >
                            📝 {summaryDone[p.id].best}/{summaryDone[p.id].total}
                          </span>
                        )}
                        {matchingDone[p.id] && (
                          <span
                            className="text-xs font-bold text-amber-700 dark:text-amber-300"
                            title={t('Tìm thông tin', 'Matching information')}
                          >
                            🔎 {matchingDone[p.id].best}/{matchingDone[p.id].total}
                          </span>
                        )}
                        {completionDone[p.id] && (
                          <span
                            className="text-xs font-bold text-teal-700 dark:text-teal-300"
                            title={t('Điền câu', 'Sentence completion')}
                          >
                            ✍️ {completionDone[p.id].best}/{completionDone[p.id].total}
                          </span>
                        )}
                        {chooseTwoDone[p.id] && (
                          <span
                            className="text-xs font-bold text-sky-700 dark:text-sky-300"
                            title={t('Chọn hai đáp án', 'Choose TWO')}
                          >
                            ✌️ {chooseTwoDone[p.id].best}/{chooseTwoDone[p.id].total}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="ielts-ynng" className="card space-y-4 p-5">
        <h2 id="ielts-ynng" className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden="true">💬</span>
          {t('Đọc: Yes / No / Not Given', 'Reading: Yes / No / Not Given')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'Trông giống True / False / Not Given nhưng hỏi khác: không hỏi sự thật mà hỏi ý kiến của tác giả. Bài đọc dạng này là bài nghị luận, tác giả nêu quan điểm (I believe, in my view, strikes me as…).',
            'It looks like True / False / Not Given but asks something else: not the facts but the writer’s views. These passages argue a case, and the writer gives an opinion (I believe, in my view, strikes me as…).'
          )}
        </p>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <p className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <b>YES</b>: {t('tác giả nghĩ đúng như vậy.', 'the writer thinks so.')}
          </p>
          <p className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
            <b>NO</b>: {t('tác giả nghĩ ngược lại.', 'the writer thinks the opposite.')}
          </p>
          <p className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40">
            <b>NOT GIVEN</b>:{' '}
            {t('tác giả không nêu ý kiến về điều đó.', 'the writer gives no view on it.')}
          </p>
        </div>
        {!error && (
          <>
            <button
              type="button"
              className="btn-primary h-11 w-full sm:w-auto"
              disabled={!bank}
              onClick={() => startOpinion()}
            >
              {t('Làm một bài nghị luận', 'Read an opinion passage')}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
            {bank && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {bank.opinion.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => startOpinion(p)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-brand-400 dark:border-slate-700"
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {p.emoji}
                      </span>
                      <span className="min-w-0 flex-1 font-semibold">{t(...p.title)}</span>
                      {opinionDone[p.id] && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ {opinionDone[p.id].best}/{opinionDone[p.id].total}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="ielts-speaking" className="card space-y-4 p-5">
        <h2 id="ielts-speaking" className="flex items-center gap-2 text-lg font-bold">
          <Mic className="h-5 w-5 text-rose-600 dark:text-rose-300" aria-hidden="true" />
          {t('Nói: Part 1, 2 và 3', 'Speaking: Parts 1, 2 and 3')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'Giám khảo đọc câu hỏi, bạn ghi âm câu trả lời rồi nghe lại. Không ai chấm, chỉ có bạn và micro: cứ nói thoải mái.',
            'The examiner reads each question; you record your answer and listen back. Nobody grades it, just you and the mic: speak freely.'
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!bank}
            onClick={() => speak(1)}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-rose-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              💬
            </span>
            <span className="mt-1 block font-bold">
              {t('Part 1: hỏi nhanh', 'Part 1: quick questions')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                '4 câu về một chủ đề quen thuộc: quê hương, sở thích, công nghệ…',
                '4 questions on a familiar topic: hometown, hobbies, technology…'
              )}
            </span>
          </button>
          <button
            type="button"
            disabled={!bank}
            onClick={() => speak(2)}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-fuchsia-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              🎯
            </span>
            <span className="mt-1 block font-bold">
              {t('Part 2 & 3: nói 2 phút', 'Parts 2 & 3: the long turn')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Thẻ chủ đề, 1 phút chuẩn bị có gợi ý bố cục, 2 phút nói, rồi 3 câu thảo luận.',
                'A task card, a minute to prepare with a plan, two minutes to talk, then three discussion questions.'
              )}
            </span>
          </button>
        </div>
      </section>

      <section aria-labelledby="ielts-writing" className="card space-y-4 p-5">
        <h2 id="ielts-writing" className="flex items-center gap-2 text-lg font-bold">
          <PenLine className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          {t('Viết: Task 2 và ngôn ngữ học thuật', 'Writing: Task 2 and academic language')}
        </h2>
        {bank && (
          <div className="grid gap-2 sm:grid-cols-2">
            {bank.writing.types.map((w) => (
              <details
                key={w.id}
                className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700"
              >
                <summary className="cursor-pointer font-semibold">
                  <span aria-hidden="true">{w.emoji}</span> {t(...w.title)}
                </summary>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" lang="en">
                  {t('Nhận ra qua câu: ', 'Spot it by: ')}
                  {w.signal}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {w.plan.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        )}
        {/* grid-cols-1 is minmax(0, 1fr): the essay prompts below are cut with
            an ellipsis, and an implicit column would grow to their full
            length and push the page wider than a phone. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!bank}
            onClick={startTask1}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-sky-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              📈
            </span>
            <span className="mt-1 block font-bold">
              {t('Task 1: tả biểu đồ', 'Task 1: describe a chart')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Chọn câu tổng quan, rồi điền từ tả xu hướng: rose sharply, peak, overtaking…',
                'Pick the overview, then fill in the trend words: rose sharply, peak, overtaking…'
              )}
            </span>
          </button>
          <button
            type="button"
            disabled={!bank}
            onClick={startDrills}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-amber-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              🔗
            </span>
            <span className="mt-1 block font-bold">
              {t('10 câu từ nối & văn phong', '10 on linking & style')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                'However hay Moreover? Rose hay raised? Viết sao cho trang trọng?',
                'However or moreover? Rose or raised? How to sound formal?'
              )}
            </span>
          </button>
          {bank && (
            <div className="min-w-0 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
              <p className="text-2xl" aria-hidden="true">
                📝
              </p>
              <p className="mt-1 font-bold">
                {t('Viết thử một bài Task 2', 'Write a Task 2 essay')}
              </p>
              <ul className="mt-2 space-y-1">
                {bank.writing.prompts.map((pr) => (
                  <li key={pr.id}>
                    <button
                      type="button"
                      onClick={() => setEssay(pr)}
                      lang="en"
                      className="w-full truncate rounded-lg px-2 py-1 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {pr.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="ielts-listening" className="card space-y-4 p-5">
        <h2 id="ielts-listening" className="flex items-center gap-2 text-lg font-bold">
          <Headphones className="h-5 w-5 text-sky-600 dark:text-sky-300" aria-hidden="true" />
          {t('Nghe: Part 1, 2, 3 và 4', 'Listening: Parts 1, 2, 3 and 4')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'Như Part 1 của đề: nghe một cuộc gọi đặt phòng, đăng ký, thuê đồ rồi điền tên, số, ngày giờ. Tên riêng được đánh vần, số điện thoại đọc từng số.',
            'Like Part 1 of the test: a call to book, sign up or hire something, then names, numbers, dates and times. Names are spelled out; phone numbers read digit by digit.'
          )}
        </p>
        <button
          type="button"
          className="btn-primary h-11 w-full sm:w-auto"
          disabled={!bank}
          onClick={() => listen(1)}
        >
          {t('Part 1: nghe một cuộc gọi', 'Part 1: hear a call')} <ArrowRight className="h-4 w-4" />
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              [
                2,
                '🎙️',
                ['Part 2: một người nói', 'Part 2: one speaker'],
                [
                  'Giới thiệu bảo tàng, thư viện… Chọn A, B hay C.',
                  'A museum or library talk. Choose A, B or C.',
                ],
              ],
              [
                3,
                '🗣️',
                ['Part 3: hai bạn bàn bạc', 'Part 3: a discussion'],
                [
                  'Hai sinh viên bàn bài tập: ý bị bác là bẫy.',
                  'Two students plan their work: ideas they drop are traps.',
                ],
              ],
              [
                4,
                '🎓',
                ['Part 4: bài giảng', 'Part 4: a lecture'],
                [
                  'Một bài giảng ngắn, điền ghi chú, mỗi chỗ một từ.',
                  'A short lecture: complete the notes, one word per gap.',
                ],
              ],
            ] as const
          ).map(([part, icon, title, desc]) => (
            <button
              key={part}
              type="button"
              disabled={!bank}
              onClick={() => (part === 4 ? listen(4) : listenChoice(part))}
              className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-sky-400 disabled:opacity-60 dark:border-slate-700"
            >
              <span className="block text-2xl" aria-hidden="true">
                {icon}
              </span>
              <span className="mt-1 block font-bold">{t(title[0], title[1])}</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">
                {t(desc[0], desc[1])}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
