import { useEffect, useState } from 'react'
import { ArrowRight, Volume2, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { pronounce, stopPronounce, textAudio } from '@/lib/audio'
import { PART2_PREP, PART2_TALK, clock, type CueCard, type Part1Topic } from '@/lib/ielts'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import AnswerRecorder from './AnswerRecorder'

// IELTS Speaking practice (docs/design/ielts.md). Part 1: the examiner asks a
// few short questions on one topic. Part 2: a task card, a minute to prepare,
// two minutes to talk, then the Part 3 discussion that follows it. Every
// question is read aloud; every answer can be recorded and heard back.

/** XP for finishing a part, whatever was said: the point is to speak. */
const XP = 10

export type SpeakingTask = { part: 1; topic: Part1Topic } | { part: 2; card: CueCard }

/** The examiner reads a question aloud (recorded voice when there is one). */
function ask(text: string, lang: string) {
  pronounce({ text, audioSrc: textAudio(text), lang })
}

export default function SpeakingRound({
  task,
  onAgain,
  onExit,
}: {
  task: SpeakingTask
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  // Part 2 runs card → prep → talk, then its Part 3 questions; Part 1 is questions only.
  const [stage, setStage] = useState<'card' | 'prep' | 'talk' | 'questions' | 'done'>(
    task.part === 1 ? 'questions' : 'card'
  )
  const questions = task.part === 1 ? task.topic.questions : task.card.part3
  const [idx, setIdx] = useState(0)
  const [notes, setNotes] = useState('')
  const [left, setLeft] = useState(PART2_PREP)

  // The preparation minute counts down, then the talk begins by itself.
  const now = stage === 'prep' && left <= 0 ? 'talk' : stage
  useEffect(() => {
    if (now !== 'prep') return
    const id = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [now])

  // Each new question is read out, as the examiner would.
  useEffect(() => {
    if (stage === 'questions' && questions[idx]) ask(questions[idx], 'en-US')
    return () => stopPronounce()
  }, [stage, idx, questions])

  const finish = () => {
    addPlayXp(code, XP)
    log(code, 'ielts-speaking')
    celebrate(1)
    setStage('done')
  }
  const nextQuestion = () => (idx + 1 < questions.length ? setIdx(idx + 1) : finish())

  const label =
    task.part === 1
      ? t(`Nói Part 1 · ${task.topic.title[0]}`, `Speaking Part 1 · ${task.topic.title[1]}`)
      : t('Nói Part 2 & 3', 'Speaking Parts 2 & 3')

  const top = (
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
        🗣️ {label}
      </p>
    </div>
  )

  if (stage === 'done')
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center animate-fade-in">
        <p className="text-6xl" aria-hidden="true">
          🎤
        </p>
        <h1 className="text-2xl font-extrabold">{t('Nói xong rồi!', 'Well spoken!')}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(
            `+${XP} XP. Nghe lại bản ghi để tự sửa: có ngập ngừng lâu không, đã nói đủ ý và cho ví dụ chưa?`,
            `+${XP} XP. Play your recordings back: any long pauses? Did you give reasons and examples?`
          )}
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Xong', 'Done')}
          </button>
          <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
            {t('Chủ đề khác', 'Another topic')}
          </button>
        </div>
      </div>
    )

  if (task.part === 2 && now !== 'questions') {
    const card = task.card
    return (
      <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
        {top}
        <section
          className="card space-y-3 border-2 border-fuchsia-200 p-5 dark:border-fuchsia-500/40"
          lang="en"
        >
          <p className="text-3xl" aria-hidden="true">
            {card.emoji}
          </p>
          <h1 className="text-xl font-extrabold">{card.cue}</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            You should say:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {card.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        {now === 'card' && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t(
                `Bạn có ${PART2_PREP} giây chuẩn bị và được ghi chú, rồi nói khoảng ${PART2_TALK / 60} phút. Cố nói đủ cả 4 ý trên thẻ.`,
                `You get ${PART2_PREP} seconds to prepare and take notes, then talk for about ${PART2_TALK / 60} minutes. Try to cover all four points.`
              )}
            </p>
            <button
              type="button"
              className="btn-primary h-12 w-full"
              onClick={() => setStage('prep')}
            >
              {t('Bắt đầu 1 phút chuẩn bị', 'Start the minute to prepare')}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {now === 'prep' && (
          <section className="card space-y-3 p-5">
            <p className="text-center text-4xl font-extrabold tabular-nums" aria-live="polite">
              {clock(left)}
            </p>
            <label className="block text-sm font-semibold" htmlFor="ielts-notes">
              {t(
                'Ghi chú nhanh (từ khoá, không viết cả câu)',
                'Quick notes (keywords, not sentences)'
              )}
            </label>
            <textarea
              id="ielts-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-900"
            />
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold">
                {t('Gợi ý bố cục và cụm từ hay', 'A plan and useful phrases')}
              </summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {card.plan.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
              <ul className="mt-2 space-y-1" lang="en">
                {card.phrases.map((p) => (
                  <li key={p} className="rounded-lg bg-fuchsia-50 px-2 py-1 dark:bg-fuchsia-950/40">
                    {p}
                  </li>
                ))}
              </ul>
            </details>
            <button
              type="button"
              className="btn-secondary h-11 w-full"
              onClick={() => setStage('talk')}
            >
              {t('Sẵn sàng, nói luôn', "I'm ready, start talking")}
            </button>
          </section>
        )}

        {now === 'talk' && (
          <section className="card space-y-3 p-5">
            {notes.trim() && (
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                {notes}
              </p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t(
                'Nói tới khi hết 2 phút. Bí ý thì nói thêm chi tiết: ở đâu, khi nào, cảm thấy thế nào.',
                'Keep going until the two minutes are up. Stuck? Add details: where, when, how it felt.'
              )}
            </p>
            <AnswerRecorder limit={PART2_TALK} autoStart />
            <button
              type="button"
              className="btn-primary h-12 w-full"
              onClick={() => {
                setIdx(0)
                setStage('questions')
              }}
            >
              {t('Sang Part 3: thảo luận', 'On to Part 3: discussion')}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
      {top}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 transition-all"
          style={{ width: `${(idx / questions.length) * 100}%` }}
        />
      </div>
      <section className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {task.part === 2 ? 'Part 3 · ' : ''}
          {t(`Câu ${idx + 1}/${questions.length}`, `Question ${idx + 1}/${questions.length}`)}
        </p>
        <p className="flex items-start gap-3 text-xl font-bold" lang="en">
          <button
            type="button"
            onClick={() => ask(questions[idx], 'en-US')}
            className="btn-ghost h-9 w-9 shrink-0 p-0"
            aria-label={t('Nghe lại câu hỏi', 'Hear the question again')}
          >
            <Volume2 className="h-5 w-5" />
          </button>
          {questions[idx]}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {task.part === 1
            ? t(
                'Trả lời 2–3 câu: trả lời thẳng, nêu lý do, thêm một ví dụ.',
                'Answer in 2–3 sentences: a direct answer, a reason, an example.'
              )
            : t(
                'Part 3 hỏi ý kiến chung: nêu quan điểm, giải thích, so sánh hai phía.',
                'Part 3 asks for opinions: give a view, explain it, compare both sides.'
              )}
        </p>
        <AnswerRecorder key={idx} />
      </section>
      <button type="button" className="btn-primary h-12 w-full" onClick={nextQuestion}>
        {idx + 1 < questions.length ? t('Câu tiếp', 'Next question') : t('Xong phần nói', 'Finish')}{' '}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
