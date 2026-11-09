import { useMemo, useState } from 'react'
import { ArrowRight, Check, Mail, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  EMAIL_MIN_WORDS,
  EMAIL_TASKS,
  EMAIL_XP,
  checkEmail,
  type EmailTask,
} from '@/lib/toeicWriting'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'

// "TOEIC Writing: trả lời email" (docs/design/toeic-writing.md): read an
// email, reply doing what the directions ask, watch a checklist fill, then
// compare with a model reply.

export default function ToeicWriting() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en') return <PackOnly packs={['en']} />
  return <ToeicWritingView />
}

function ToeicWritingView() {
  const t = useT()
  useDocumentTitle('TOEIC Writing · VocaStudy')
  const [task, setTask] = useState<EmailTask | null>(null)
  if (task) return <EmailRound key={task.id} task={task} onExit={() => setTask(null)} />

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">TOEIC Writing</span> ✉️
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Câu 6–7 của đề Viết TOEIC: đọc một email rồi trả lời trong 10 phút, làm đúng điều đề yêu cầu (hỏi 2 câu, đưa 1 đề xuất…). Thiếu một ý là mất điểm, nên đọc kỹ phần hướng dẫn. Viết xong so với bài mẫu.',
            'Questions 6–7 of the TOEIC Writing test: read an email and reply within 10 minutes, doing exactly what the directions ask (two questions, one suggestion…). Missing a point costs marks, so read the directions closely. Then compare with a model reply.'
          )}
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3">
        {EMAIL_TASKS.map((x) => (
          <li key={x.id} className="card flex min-w-0 flex-col gap-2 p-4">
            <p className="flex items-center gap-2 font-bold" lang="en">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {x.subject}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400" lang="en">
              {x.from}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">🎯 {t(...x.asks)}</p>
            <button type="button" className="btn-primary h-11" onClick={() => setTask(x)}>
              {t('Viết thư trả lời', 'Write a reply')} <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmailRound({ task, onExit }: { task: EmailTask; onExit: () => void }) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [reply, setReply] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const c = useMemo(() => checkEmail(reply), [reply])
  const checks: { ok: boolean; label: [string, string] }[] = [
    { ok: c.greeting, label: ['Mở đầu bằng lời chào (Dear…)', 'Opens with a greeting (Dear…)'] },
    {
      ok: c.questions >= task.questions,
      label: [
        `Có ít nhất ${task.questions} câu hỏi (${c.questions})`,
        `Asks at least ${task.questions} question${task.questions > 1 ? 's' : ''} (${c.questions})`,
      ],
    },
    {
      ok: c.words >= EMAIL_MIN_WORDS,
      label: [
        `Ít nhất ${EMAIL_MIN_WORDS} từ (${c.words})`,
        `At least ${EMAIL_MIN_WORDS} words (${c.words})`,
      ],
    },
    { ok: c.closing, label: ['Kết thư (Best regards…)', 'Signs off (Best regards…)'] },
  ]
  const ready = c.words >= EMAIL_MIN_WORDS

  const submit = () => {
    addPlayXp(code, EMAIL_XP)
    log(code, 'toeic-writing')
    if (checks.every((x) => x.ok)) celebrate(1.2)
    setSubmitted(true)
    setShowModel(true)
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
          ✉️ TOEIC Writing · {t('Trả lời email', 'Respond to an email')}
        </p>
      </div>

      <section className="card space-y-2 p-5" lang="en">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          From: {task.from} · Subject: {task.subject}
        </p>
        <p className="leading-relaxed">{task.body}</p>
      </section>
      <p className="card p-4 text-sm font-semibold" lang="en">
        📋 {task.directions}
      </p>

      <label className="sr-only" htmlFor="toeic-email">
        {t('Thư trả lời của bạn', 'Your reply')}
      </label>
      <textarea
        id="toeic-email"
        lang="en"
        value={reply}
        onChange={(e) => {
          setReply(e.target.value)
          setSubmitted(false)
        }}
        rows={10}
        placeholder="Dear …,"
        className="w-full rounded-2xl border border-slate-200 p-4 leading-relaxed dark:border-slate-700 dark:bg-slate-900"
      />

      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((x) => (
          <li
            key={x.label[1]}
            className={`flex items-center gap-2 rounded-xl p-2 text-sm ${
              x.ok
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
            }`}
          >
            <Check className={`h-4 w-4 shrink-0 ${x.ok ? '' : 'opacity-20'}`} aria-hidden="true" />
            {t(...x.label)}
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        🎯 {t('Đề yêu cầu:', 'The task:')} {t(...task.asks)}
      </p>

      {submitted ? (
        <p role="status" className="card p-4 text-sm font-semibold">
          {checks.every((x) => x.ok)
            ? t(
                `Thư đủ ý! +${EMAIL_XP} XP. Đọc lại xem đã làm đúng từng yêu cầu của đề chưa.`,
                `Nicely done! +${EMAIL_XP} XP. Read it again: does it do every point the directions ask?`
              )
            : t(
                `+${EMAIL_XP} XP. Còn vài ô chưa đạt ở trên: sửa thêm rồi so với bài mẫu.`,
                `+${EMAIL_XP} XP. A few boxes are still open: revise, then compare with the model.`
              )}
        </p>
      ) : (
        <button
          type="button"
          className="btn-primary h-12 w-full"
          disabled={!ready}
          onClick={submit}
        >
          {ready
            ? t('Nộp thư', 'Send the reply')
            : t(
                `Còn ${EMAIL_MIN_WORDS - c.words} từ nữa`,
                `${EMAIL_MIN_WORDS - c.words} more words to go`
              )}
        </button>
      )}

      {showModel ? (
        <section className="card space-y-2 p-5">
          <h2 className="font-bold">📝 {t('Thư mẫu', 'Model reply')}</h2>
          <p lang="en" className="whitespace-pre-wrap leading-relaxed">
            {task.model}
          </p>
        </section>
      ) : (
        <button
          type="button"
          className="btn-ghost w-full justify-center text-sm"
          onClick={() => setShowModel(true)}
        >
          {t('Xem thư mẫu (nên tự viết trước)', 'See the model reply (try writing first)')}
        </button>
      )}
    </div>
  )
}
