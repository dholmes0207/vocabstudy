import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import {
  TASK2_WORDS,
  informalBits,
  linkersUsed,
  paragraphCount,
  wordCount,
  type EssayPrompt,
  type EssayType,
} from '@/lib/ielts'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import ModelEssay from './ModelEssay'

// "Viết thử Task 2": one question, the plan of its essay type beside the box,
// a word count that fills towards 250, and a checklist the page ticks as the
// essay grows: length, paragraphs, linking words, no spoken forms. The draft
// stays on this device so the learner can come back to it.

const XP = 15
const draftKey = (id: string) => `vocab.ielts.draft.${id}`

function loadDraft(id: string): string {
  try {
    return localStorage.getItem(draftKey(id)) ?? ''
  } catch {
    return ''
  }
}

export default function EssayPractice({
  prompt,
  type,
  onExit,
}: {
  prompt: EssayPrompt
  type: EssayType
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [essay, setEssay] = useState(() => loadDraft(prompt.id))
  const [submitted, setSubmitted] = useState(false)
  // The model answer opens once the essay is handed in, or on request.
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(draftKey(prompt.id), essay)
    } catch {
      /* private mode: the draft just isn't kept */
    }
  }, [essay, prompt.id])

  const words = wordCount(essay)
  const paras = paragraphCount(essay)
  const links = useMemo(() => linkersUsed(essay), [essay])
  const informal = useMemo(() => informalBits(essay), [essay])
  const checks: { ok: boolean; label: [string, string] }[] = [
    {
      ok: words >= TASK2_WORDS,
      label: [`Ít nhất ${TASK2_WORDS} từ (${words})`, `At least ${TASK2_WORDS} words (${words})`],
    },
    {
      ok: paras >= 4,
      label: [
        `4 đoạn: mở, 2 thân, kết (${paras})`,
        `4 paragraphs: intro, 2 body, conclusion (${paras})`,
      ],
    },
    {
      ok: links.length >= 4,
      label: [
        `Ít nhất 4 từ nối khác nhau (${links.length})`,
        `At least 4 different linking words (${links.length})`,
      ],
    },
    {
      ok: informal.length === 0,
      label: ['Không viết tắt, không văn nói', 'No contractions or spoken forms'],
    },
  ]
  const ready = words >= TASK2_WORDS

  const submit = () => {
    addPlayXp(code, XP)
    log(code, 'ielts-writing')
    if (checks.every((c) => c.ok)) celebrate(1.3)
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
          ✍️ {t('Viết thử Task 2', 'Task 2 practice')} · {t(...type.title)}
        </p>
      </div>

      <section className="card space-y-2 p-5">
        <p className="font-bold" lang="en">
          {prompt.text}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            `Viết ít nhất ${TASK2_WORDS} từ. Trong phòng thi bạn có khoảng 40 phút cho bài này.`,
            `Write at least ${TASK2_WORDS} words. In the exam you have about 40 minutes for it.`
          )}
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">
            {t('Bố cục và câu mở đầu gợi ý', 'Plan and sentence starters')}
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {type.plan.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <ul className="mt-2 space-y-1" lang="en">
            {type.frames.map((f) => (
              <li key={f} className="rounded-lg bg-amber-50 px-2 py-1 dark:bg-amber-950/40">
                {f}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <label className="sr-only" htmlFor="ielts-essay">
        {t('Bài viết của bạn', 'Your essay')}
      </label>
      <textarea
        id="ielts-essay"
        lang="en"
        value={essay}
        onChange={(e) => {
          setEssay(e.target.value)
          setSubmitted(false)
        }}
        rows={14}
        placeholder={t(
          'Viết ở đây. Để một dòng trống giữa các đoạn.',
          'Write here. Leave an empty line between paragraphs.'
        )}
        className="w-full rounded-2xl border border-slate-200 p-4 leading-relaxed dark:border-slate-700 dark:bg-slate-900"
      />

      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            ready ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'
          }`}
          style={{ width: `${Math.min(100, (words / TASK2_WORDS) * 100)}%` }}
        />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li
            key={c.label[1]}
            className={`flex items-center gap-2 rounded-xl p-2 text-sm ${
              c.ok
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
            }`}
          >
            <Check className={`h-4 w-4 shrink-0 ${c.ok ? '' : 'opacity-20'}`} aria-hidden="true" />
            {t(...c.label)}
          </li>
        ))}
      </ul>
      {informal.length > 0 && (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          {t('Nên thay: ', 'Replace: ')}
          <span lang="en">{informal.join(', ')}</span>
        </p>
      )}

      {submitted ? (
        <p role="status" className="card p-4 text-sm font-semibold">
          {checks.every((c) => c.ok)
            ? t(
                `Đủ cả 4 tiêu chí! +${XP} XP. Bài được lưu trên máy này, bạn có thể sửa tiếp.`,
                `All four boxes ticked! +${XP} XP. The essay is kept on this device; keep polishing.`
              )
            : t(
                `+${XP} XP. Còn vài ô chưa đạt ở trên: sửa thêm rồi đọc lại toàn bài.`,
                `+${XP} XP. A few boxes above are still open: revise and read it through.`
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
            ? t('Nộp bài', 'Hand it in')
            : t(`Còn ${TASK2_WORDS - words} từ nữa`, `${TASK2_WORDS - words} more words to go`)}
        </button>
      )}

      {showModel ? (
        <ModelEssay paragraphs={prompt.model} />
      ) : (
        <button
          type="button"
          className="btn-ghost w-full justify-center text-sm"
          onClick={() => setShowModel(true)}
        >
          {t('Xem bài mẫu (nên tự viết trước)', 'See the model answer (try writing first)')}
        </button>
      )}
    </div>
  )
}
