import { Fragment } from 'react'
import { markLinkers } from '@/lib/ielts'
import { useT } from '@/lib/i18n'

// A band-7 model answer for a Task 2 question, paragraph by paragraph, with
// the linking words marked so the learner sees how the essay holds together.

const PARTS: [string, string][] = [
  ['Mở bài', 'Introduction'],
  ['Thân bài 1', 'Body 1'],
  ['Thân bài 2', 'Body 2'],
  ['Kết bài', 'Conclusion'],
]

export default function ModelEssay({ paragraphs }: { paragraphs: string[] }) {
  const t = useT()
  return (
    <section className="card space-y-3 p-5" aria-labelledby="ielts-model">
      <h2 id="ielts-model" className="font-bold">
        📝 {t('Bài mẫu band 7', 'Band 7 model answer')}
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t(
          'So với bài của bạn: mỗi đoạn làm một việc, từ nối được tô vàng. Mượn cấu trúc, đừng chép nguyên câu.',
          'Compare it with yours: each paragraph does one job, and the linking words are marked. Borrow the structure, not the sentences.'
        )}
      </p>
      {paragraphs.map((p, i) => (
        <div key={i}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t(...(PARTS[i] ?? PARTS[2]))}
          </p>
          <p lang="en" className="leading-relaxed">
            {markLinkers(p).map((part, j) =>
              part.linker ? (
                <mark
                  key={j}
                  className="rounded bg-amber-200 px-0.5 text-inherit dark:bg-amber-700/60"
                >
                  {part.text}
                </mark>
              ) : (
                <Fragment key={j}>{part.text}</Fragment>
              )
            )}
          </p>
        </div>
      ))}
    </section>
  )
}
