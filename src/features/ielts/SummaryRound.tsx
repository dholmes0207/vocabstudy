import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useIelts } from '@/store/ieltsStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import type { ReadingPassage } from '@/lib/ielts'
import { buzz } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import GapFill from './GapFill'
import { useGapFill } from './useGapFill'

// IELTS Reading, Summary completion: a short summary of the passage with
// gaps, and a box with more words than gaps (GapFill). Checked at once, each
// gap with where the passage says it.

const XP_PER_RIGHT = 3

export default function SummaryRound({
  passage,
  onAgain,
  onExit,
}: {
  passage: ReadingPassage
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const record = useIelts((s) => s.recordSummary)
  const log = useActivity((s) => s.log)
  const sm = passage.summary
  const total = sm.answers.length
  const gaps = useGapFill(sm)
  const { right, ready } = gaps
  const [checked, setChecked] = useState(false)

  const check = () => {
    setChecked(true)
    record(passage.id, right, total)
    addPlayXp(code, right * XP_PER_RIGHT)
    log(code, 'ielts-reading')
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
          📝 {t('Điền tóm tắt', 'Summary completion')} · {t(...passage.title)}
        </p>
      </div>

      <details className="card p-5" open={!checked}>
        <summary className="cursor-pointer font-bold">
          <span aria-hidden="true">{passage.emoji}</span> {t('Bài đọc', 'The passage')}
        </summary>
        <div className="mt-3 space-y-3" lang="en">
          {passage.passage.map((para, i) => (
            <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-200">
              {para}
            </p>
          ))}
        </div>
      </details>

      <section className="card space-y-4 border-2 border-violet-200 p-5 dark:border-violet-500/40">
        <GapFill task={sm} state={gaps} checked={checked} />
      </section>

      {!checked ? (
        <button type="button" className="btn-primary h-12 w-full" disabled={!ready} onClick={check}>
          <Check className="h-4 w-4" />{' '}
          {ready
            ? t('Kiểm tra', 'Check')
            : t(`Điền đủ ${total} chỗ trống`, `Fill all ${total} gaps`)}
        </button>
      ) : (
        <>
          <p role="status" className="card p-4 text-sm">
            <b>
              {right === total ? '🏆 ' : ''}
              {t(
                `${right}/${total} chỗ đúng · +${right * XP_PER_RIGHT} XP.`,
                `${right} of ${total} right · +${right * XP_PER_RIGHT} XP.`
              )}
            </b>{' '}
            {t(
              '💡 Mẹo: đoán loại từ cho mỗi chỗ trống trước (danh từ, tính từ, động từ…), rồi tìm chỗ trong bài nói cùng ý bằng từ khác.',
              '💡 Tip: guess the kind of word each gap needs first (noun, adjective, verb…), then find where the passage says the same thing in other words.'
            )}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
              {t('Xong', 'Done')}
            </button>
            <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
              {t('Bài khác', 'Another passage')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
