import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useT, useUiLang } from '@/lib/i18n'
import { formatLongDate } from '@/lib/formatDate'
import { openFeedback } from '@/store/feedbackStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { RELEASES } from './releases'

// /changelog — what has shipped, newest first (content in ./releases.ts).

export default function Changelog() {
  const t = useT()
  const lang = useUiLang()
  useDocumentTitle(`${t('Có gì mới', "What's new")} · VocaStudy`)
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
        {t('Nhật ký cập nhật', 'Changelog')}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
        {t('Có gì mới', "What's new")}
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
        {t(
          'Những thay đổi bạn sẽ thấy trong VocaStudy, mới nhất ở trên cùng.',
          'The changes you will notice in VocaStudy, newest first.'
        )}
      </p>

      <ol className="mt-10 space-y-6 border-l-2 border-brand-200 pl-6 dark:border-brand-900">
        {RELEASES.map((r) => (
          <li key={r.date} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[31px] top-6 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-950"
            />
            <section className="card p-6">
              <time dateTime={r.date} className="text-sm font-semibold text-slate-400">
                {formatLongDate(r.date, lang)}
              </time>
              <h2 className="mt-1 text-xl font-bold">{t(...r.title)}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600 marker:text-brand-400 dark:text-slate-300">
                {r.items.map((it) => (
                  <li key={it[1]}>{t(...it)}</li>
                ))}
              </ul>
            </section>
          </li>
        ))}
      </ol>

      <div className="card mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-slate-600 dark:text-slate-300">
          {t('Muốn VocaStudy có thêm gì?', 'What should VocaStudy do next?')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openFeedback} className="btn-secondary">
            <Mail className="h-4 w-4" /> {t('Góp ý', 'Send feedback')}
          </button>
          <Link to="/home" className="btn-primary">
            {t('Vào học', 'Open the app')}
          </Link>
        </div>
      </div>
    </article>
  )
}
