import { useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import type { Task1Chart as Chart } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import Task1Chart from './Task1Chart'
import GapFill from './GapFill'
import { useGapFill } from './useGapFill'

// IELTS Writing Task 1, step by step on one chart: first pick the overview
// sentence (the trend, no numbers), then complete a model report with the
// words for describing data. Each answer says why.

const XP_PER_RIGHT = 2

export default function Task1Round({
  chart,
  onAgain,
  onExit,
}: {
  chart: Chart
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [overview, setOverview] = useState<number | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const gaps = useGapFill(chart.report)
  const [checked, setChecked] = useState(false)
  const o = chart.overview
  const total = chart.report.answers.length + 1
  const right = gaps.right + (overview === o.answer ? 1 : 0)

  const pickOverview = (i: number) => {
    if (overview !== null) return
    setOverview(i)
    if (soundOn) buzz(i === o.answer)
  }
  const check = () => {
    setChecked(true)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-writing')
    if (soundOn) buzz(right === total)
    if (right === total) celebrate(1.2)
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
          📈 {t('Viết Task 1', 'Writing Task 1')} · {t(...chart.title)}
        </p>
      </div>

      <section className="card space-y-3 p-5">
        <p className="font-semibold" lang="en">
          {chart.question}
        </p>
        <Task1Chart chart={chart} />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('Số liệu minh hoạ, dùng để luyện cách viết.', 'Illustrative figures, for practice.')}
        </p>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">
          {t('Bước 1: chọn câu tổng quan (overview)', 'Step 1: pick the overview')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'Giám khảo tìm một câu tổng quan nói xu hướng chính, không có số. Thiếu câu này khó vượt band 5 tiêu chí Task Achievement.',
            'Examiners look for an overview: the main trends, no numbers. Without one, Task Achievement rarely goes above band 5.'
          )}
        </p>
        <div className="grid gap-2" lang="en">
          {o.options.map((opt, i) => {
            const state =
              overview === null
                ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                : i === o.answer
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                  : i === overview
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'border-slate-200 opacity-60 dark:border-slate-700'
            return (
              <button
                key={opt}
                type="button"
                disabled={overview !== null}
                onClick={() => pickOverview(i)}
                className={`rounded-xl border-2 p-3 text-left transition ${state}`}
              >
                {opt}
                {overview !== null && (i === o.answer || i === overview) && (
                  <span lang="vi" className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                    {o.why[i]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {overview !== null && step === 1 && (
          <button type="button" className="btn-primary h-12 w-full" onClick={() => setStep(2)}>
            {t('Bước 2: tả số liệu', 'Step 2: describe the data')}{' '}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </section>

      {step === 2 && (
        <section className="card space-y-4 border-2 border-violet-200 p-5 dark:border-violet-500/40">
          <h2 className="font-bold">
            {t('Bước 2: hoàn thành đoạn tả chi tiết', 'Step 2: complete the details paragraph')}
          </h2>
          <GapFill task={chart.report} state={gaps} checked={checked} />
        </section>
      )}

      {step === 2 &&
        (!checked ? (
          <button
            type="button"
            className="btn-primary h-12 w-full"
            disabled={!gaps.ready}
            onClick={check}
          >
            <Check className="h-4 w-4" />{' '}
            {gaps.ready
              ? t('Kiểm tra', 'Check')
              : t(
                  `Điền đủ ${chart.report.answers.length} chỗ trống`,
                  `Fill all ${chart.report.answers.length} gaps`
                )}
          </button>
        ) : (
          <>
            <p role="status" className="card p-4 text-sm">
              <b>
                {right === total ? '🏆 ' : ''}
                {t(
                  `${right}/${total} đúng · +${right * XP_PER_RIGHT} XP.`,
                  `${right} of ${total} right · +${right * XP_PER_RIGHT} XP.`
                )}
              </b>{' '}
              {t(
                '💡 Bố cục Task 1: một câu viết lại đề, một câu tổng quan, rồi hai đoạn chi tiết so sánh số liệu. Ít nhất 150 từ, khoảng 20 phút.',
                '💡 Task 1 plan: paraphrase the question, write an overview, then two paragraphs comparing the figures. At least 150 words, about 20 minutes.'
              )}
            </p>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
                {t('Xong', 'Done')}
              </button>
              <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
                {t('Biểu đồ khác', 'Another chart')}
              </button>
            </div>
          </>
        ))}
    </div>
  )
}
