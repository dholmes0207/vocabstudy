import { useEffect, useState } from 'react'
import { ArrowRight, Volume2, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pronounce, stopPronounce, textAudio } from '@/lib/audio'
import {
  INFO_SETS,
  OPINIONS,
  OPINION_SECONDS,
  READ_ALOUD,
  READ_SECONDS,
  SURVEYS,
  TOEIC_SPEAKING_XP,
  type SampleAnswer as Sample,
  type ToeicSpeakingTask,
} from '@/lib/toeicSpeaking'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import AnswerRecorder from '@/features/ielts/AnswerRecorder'
import SampleAnswer from '@/features/ielts/SampleAnswer'

// "TOEIC Speaking" (docs/design/toeic-speaking.md): read a text aloud, answer
// three survey questions, give an opinion. Each step is recorded and timed as
// in the test; the questions are read out and come with a sample answer.

interface Step {
  /** What is on the screen. */
  text: string
  /** Read out as the step opens (the questions, not the text to read aloud). */
  say?: string
  seconds: number
  sample?: Sample
}

const TASKS: {
  task: ToeicSpeakingTask
  emoji: string
  title: [string, string]
  desc: [string, string]
  tip: [string, string]
}[] = [
  {
    task: 'read',
    emoji: '📢',
    title: ['Đọc to đoạn văn (Câu 1–2)', 'Read a text aloud (Questions 1–2)'],
    desc: [
      'Một thông báo hay quảng cáo ngắn: 45 giây chuẩn bị, 45 giây đọc. Chấm phát âm, ngữ điệu, trọng âm.',
      'A short announcement or advert: 45 seconds to prepare, 45 to read. Scored on pronunciation, intonation and stress.',
    ],
    tip: [
      'Ngắt hơi ở dấu phẩy, dấu chấm. Liệt kê thì lên giọng ở từng mục, xuống giọng ở mục cuối (books ↗, magazines ↗ and DVDs ↘). Nhấn vào số và tên riêng.',
      'Pause at commas and full stops. In a list, rise on each item and fall on the last (books ↗, magazines ↗ and DVDs ↘). Stress numbers and names.',
    ],
  },
  {
    task: 'respond',
    emoji: '☎️',
    title: ['Trả lời câu hỏi (Câu 5–7)', 'Respond to questions (Questions 5–7)'],
    desc: [
      'Một cuộc phỏng vấn qua điện thoại về chủ đề quen thuộc: hai câu 15 giây, một câu 30 giây.',
      'A telephone survey on an everyday topic: two answers of 15 seconds, one of 30.',
    ],
    tip: [
      'Trả lời thẳng vào câu hỏi rồi thêm một lý do. Câu 30 giây: nêu ý, giải thích, thêm ví dụ hoặc mặt ngược lại.',
      'Answer the question directly, then add a reason. For the 30-second one: an answer, a reason, then an example or the other side.',
    ],
  },
  {
    task: 'info',
    emoji: '📋',
    title: ['Trả lời dựa trên thông tin (Câu 8–10)', 'Respond using information (Questions 8–10)'],
    desc: [
      'Một lịch trình hay thông báo hiện trên màn hình, người gọi hỏi ba câu: 15, 15 rồi 30 giây.',
      'A schedule or notice on screen, and a caller with three questions: 15, 15, then 30 seconds.',
    ],
    tip: [
      'Đọc kỹ lịch trước, để ý chỗ bị huỷ, bị dời. Báo tin không như ý thì mở đầu lịch sự: I’m sorry, but… / Actually, … Câu 30 giây: liệt kê đủ các mục, nói giờ và người phụ trách.',
      'Read the schedule first and spot anything cancelled or moved. Give bad news politely: I’m sorry, but… / Actually, … For the 30-second one, list every item with its time and who leads it.',
    ],
  },
  {
    task: 'opinion',
    emoji: '💭',
    title: ['Nêu quan điểm (Câu 11)', 'Express an opinion (Question 11)'],
    desc: [
      'Chọn một phía và bảo vệ nó trong 60 giây, có lý do và ví dụ.',
      'Take a side and defend it for 60 seconds, with reasons and examples.',
    ],
    tip: [
      'Bố cục: nêu quan điểm → lý do 1 + ví dụ → lý do 2 → kết luận một câu. Dùng từ nối: First, In addition, For example, That’s why…',
      'Plan: your view → reason 1 + example → reason 2 → a one-line conclusion. Use linkers: First, In addition, For example, That’s why…',
    ],
  },
]

const pick = <T,>(arr: readonly T[], n: number): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

/** The steps of one practice round of a task, with the situation to show above them. */
function stepsFor(task: ToeicSpeakingTask): {
  intro?: string
  info?: { title: string; lines: string[] }
  steps: Step[]
} {
  if (task === 'read')
    return { steps: pick(READ_ALOUD, 2).map((r) => ({ text: r.text, seconds: READ_SECONDS })) }
  if (task === 'respond') {
    const [set] = pick(SURVEYS, 1)
    return {
      intro: set.intro,
      steps: set.questions.map((x) => ({
        text: x.q,
        say: x.q,
        seconds: x.seconds,
        sample: x.sample,
      })),
    }
  }
  if (task === 'info') {
    const [set] = pick(INFO_SETS, 1)
    return {
      intro: set.intro,
      info: { title: set.title, lines: set.lines },
      steps: set.questions.map((x) => ({
        text: x.q,
        say: x.q,
        seconds: x.seconds,
        sample: x.sample,
      })),
    }
  }
  const [o] = pick(OPINIONS, 1)
  return { steps: [{ text: o.prompt, say: o.prompt, seconds: OPINION_SECONDS, sample: o.sample }] }
}

export default function ToeicSpeaking() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en') return <PackOnly packs={['en']} />
  return <ToeicSpeakingView />
}

function ToeicSpeakingView() {
  const t = useT()
  useDocumentTitle(`TOEIC Speaking · VocaStudy`)
  const [round, setRound] = useState<{
    n: number
    task: ToeicSpeakingTask
    intro?: string
    info?: { title: string; lines: string[] }
    steps: Step[]
  } | null>(null)
  const start = (task: ToeicSpeakingTask) =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, task, ...stepsFor(task) }))

  if (round)
    return (
      <Round
        key={round.n}
        task={round.task}
        intro={round.intro}
        info={round.info}
        steps={round.steps}
        onAgain={() => start(round.task)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">TOEIC Speaking</span> 🎤
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Nhiều trường và công ty yêu cầu TOEIC 4 kỹ năng. Phần Nói thi trên máy, ghi âm từng câu. Ở đây luyện ba dạng hay gặp nhất, đúng thời gian của đề; câu hỏi được đọc lên, ghi âm xong thì nghe lại và so với câu mẫu.',
            'Many universities and employers ask for TOEIC in all four skills. The Speaking test is taken on a computer, each answer recorded. Practise its three most common tasks here, with the test’s timings: questions are read out, you record, play back and compare with a sample.'
          )}
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3">
        {TASKS.map((x) => (
          <li key={x.task} className="card flex min-w-0 flex-col gap-3 p-4">
            <p className="text-lg font-bold">
              <span aria-hidden="true">{x.emoji}</span> {t(...x.title)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(...x.desc)}</p>
            <button type="button" className="btn-primary h-11" onClick={() => start(x.task)}>
              {t('Bắt đầu', 'Start')} <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Round({
  task,
  intro,
  info: shown,
  steps,
  onAgain,
  onExit,
}: {
  task: ToeicSpeakingTask
  intro?: string
  /** The schedule Questions 8–10 are about, kept on screen. */
  info?: { title: string; lines: string[] }
  steps: Step[]
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const info = TASKS.find((x) => x.task === task)!
  const step = steps[idx]
  const play = (text: string) => pronounce({ text, audioSrc: textAudio(text), lang: ttsLang })

  // Each question is read out as it comes up, as in the test.
  useEffect(() => {
    if (!done && step?.say)
      pronounce({ text: step.say, audioSrc: textAudio(step.say), lang: ttsLang })
    return () => stopPronounce()
  }, [done, step, ttsLang])

  const next = () => {
    if (idx + 1 < steps.length) return setIdx(idx + 1)
    addPlayXp(code, TOEIC_SPEAKING_XP)
    log(code, 'toeic-speaking')
    celebrate(1)
    setDone(true)
  }

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
        {info.emoji} {t(...info.title)}
      </p>
    </div>
  )

  if (done)
    return (
      <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
        {top}
        <section className="card space-y-3 p-6 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <p className="text-xl font-bold">{t('Nói tốt lắm!', 'Well spoken!')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              `+${TOEIC_SPEAKING_XP} XP. Nghe lại bản ghi: có ngắt nghỉ đúng chỗ, có lý do cho mỗi ý chưa?`,
              `+${TOEIC_SPEAKING_XP} XP. Play your answers back: did you pause in the right places and give a reason for each point?`
            )}
          </p>
          <button type="button" className="btn-primary h-12 w-full" onClick={onAgain}>
            {t('Luyện tiếp', 'Practise again')}
          </button>
        </section>
      </div>
    )

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
      {top}
      {shown && (
        <section lang="en" className="card space-y-1 p-4 text-sm" aria-label={shown.title}>
          <p className="font-bold">{shown.title}</p>
          <ul className="space-y-0.5 text-slate-600 dark:text-slate-300">
            {shown.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      )}
      {intro && (
        <p lang="en" className="card p-4 text-sm text-slate-600 dark:text-slate-300">
          {intro}
        </p>
      )}
      <section className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(`Câu ${idx + 1}/${steps.length}`, `Question ${idx + 1}/${steps.length}`)} ·{' '}
          {t(`${step.seconds} giây`, `${step.seconds} seconds`)}
        </p>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => play(step.text)}
            className="btn-ghost h-9 w-9 shrink-0 p-0"
            aria-label={
              task === 'read'
                ? t('Nghe đọc mẫu', 'Hear it read')
                : t('Nghe lại câu hỏi', 'Hear the question again')
            }
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <p lang="en" className={task === 'read' ? 'leading-relaxed' : 'text-lg font-bold'}>
            {step.text}
          </p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">💡 {t(...info.tip)}</p>
        <AnswerRecorder key={idx} limit={step.seconds} />
        {step.sample && (
          <SampleAnswer
            key={`s${idx}`}
            sample={step.sample}
            label={['Câu trả lời mẫu', 'Sample answer']}
          />
        )}
      </section>
      <button type="button" className="btn-primary h-12 w-full" onClick={next}>
        {idx + 1 < steps.length ? t('Câu tiếp', 'Next question') : t('Xong', 'Finish')}{' '}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
