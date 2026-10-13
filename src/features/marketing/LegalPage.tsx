import { useT, useUiLang } from '@/lib/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatLongDate } from '@/lib/formatDate'
import { PRIVACY, TERMS, type LegalDoc } from './legal'

// Renders the privacy policy or the terms (content in ./legal.ts).

function LegalDocument({ doc }: { doc: LegalDoc }) {
  const t = useT()
  const lang = useUiLang()
  useDocumentTitle(`${t(...doc.title)} · VocaStudy`)
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
        {t('Cập nhật', 'Last updated')}: {formatLongDate(doc.updated, lang)}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{t(...doc.title)}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t(...doc.intro)}</p>

      <div className="card mt-10 space-y-8 p-6 sm:p-10">
        {doc.sections.map((s) => (
          <section key={s.title[1]}>
            <h2 className="text-xl font-bold">{t(...s.title)}</h2>
            {s.items && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600 marker:text-brand-400 dark:text-slate-300">
                {s.items.map((it) => (
                  <li key={it[1]}>{t(...it)}</li>
                ))}
              </ul>
            )}
            {s.paras?.map((p) => (
              <p key={p[1]} className="mt-3 text-slate-600 dark:text-slate-300">
                {t(...p)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}

export function Privacy() {
  return <LegalDocument doc={PRIVACY} />
}

export function Terms() {
  return <LegalDocument doc={TERMS} />
}
