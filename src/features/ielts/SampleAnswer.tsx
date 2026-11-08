import { useState } from 'react'
import { Lightbulb, Volume2 } from 'lucide-react'
import { pronounce, textAudio } from '@/lib/audio'
import { useT } from '@/lib/i18n'

/**
 * A model answer to a Speaking Part 1 question, kept folded so the learner
 * answers first. Opening it shows the answer with its key phrase marked, and
 * it can be heard aloud for shadowing.
 */
export default function SampleAnswer({ sample }: { sample: { a: string; key: string } }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <button
        type="button"
        className="btn-ghost w-full justify-center text-sm"
        onClick={() => setOpen(true)}
      >
        <Lightbulb className="h-4 w-4" /> {t('Xem câu trả lời mẫu', 'See a sample answer')}
      </button>
    )
  const at = sample.a.indexOf(sample.key)
  return (
    <div className="space-y-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          {t('Câu trả lời mẫu (band 7)', 'Sample answer (band 7)')}
        </p>
        <button
          type="button"
          onClick={() =>
            pronounce({ text: sample.a, audioSrc: textAudio(sample.a), lang: 'en-US' })
          }
          className="btn-ghost h-8 w-8 shrink-0 p-0"
          aria-label={t('Nghe câu trả lời mẫu', 'Hear the sample answer')}
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm leading-relaxed" lang="en">
        {sample.a.slice(0, at)}
        <mark className="rounded bg-amber-200 px-0.5 font-semibold text-inherit dark:bg-amber-700/60">
          {sample.key}
        </mark>
        {sample.a.slice(at + sample.key.length)}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {t(
          'Nghe rồi nói theo, sau đó thử lại câu của bạn với cụm được tô.',
          'Listen and repeat, then try your own answer using the marked phrase.'
        )}
      </p>
    </div>
  )
}
