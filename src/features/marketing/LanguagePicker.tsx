import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Plus } from 'lucide-react'
import type { LanguagePackMeta } from '@/types'
import { useData } from '@/store/dataStore'
import { loadManifest } from '@/lib/dataLoader'
import { CONTACT_EMAIL } from '@/lib/site'
import { useT } from '@/lib/i18n'

// "Bạn muốn học ngôn ngữ nào?" on the landing page (docs/research/2026-10-17-language-apps.md:
// Busuu, Babbel, Clozemaster and Cake all ask this first). Built from the live
// manifest, so a new pack shows up here without touching the page.

export default function LanguagePicker() {
  const t = useT()
  const languages = useLanguages()
  if (!languages?.length) return null

  return (
    <section id="languages" className="scroll-mt-20 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
          {t('Ngôn ngữ', 'Languages')}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t('Bạn muốn học ngôn ngữ nào?', 'Which language do you want to learn?')}
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {t(
            'Cùng một cách học nhẹ nhàng, giải thích bằng tiếng Việt. Chọn một ngôn ngữ để bắt đầu — đổi sang ngôn ngữ khác lúc nào cũng được, tiến độ của từng ngôn ngữ vẫn giữ nguyên.',
            'The same gentle way of learning, explained in Vietnamese. Pick a language to start — switch any time, and each language keeps its own progress.'
          )}
        </p>
      </div>
      <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {languages.map((l) => (
          <li key={l.code}>
            <Link
              to={`/home?lang=${l.code}`}
              className="card flex h-full flex-col items-center p-4 text-center transition hover:-translate-y-0.5 hover:ring-2 hover:ring-brand-300 sm:p-5"
            >
              <span aria-hidden="true" className="text-4xl">
                {l.flag}
              </span>
              <span className="mt-2 font-bold">{t(l.nativeName, l.name)}</span>
              <span className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {t(
                  `${l.count.toLocaleString('vi-VN')} từ`,
                  `${l.count.toLocaleString('en-US')} words`
                )}
              </span>
              {l.beta && (
                <span className="chip mt-2 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  beta
                </span>
              )}
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
                {t('Bắt đầu', 'Start')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
        <li>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('Ngôn ngữ tiếp theo', 'Next language'))}`}
            className="flex h-full flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center transition hover:border-brand-400 dark:border-white/15 sm:p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-2 font-bold">{t('Ngôn ngữ khác?', 'Another language?')}</span>
            <span className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {t('Cho chúng tôi biết bạn muốn học gì', 'Tell us what you want to learn')}
            </span>
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
              <Mail className="h-4 w-4" aria-hidden="true" /> {t('Gợi ý', 'Suggest')}
            </span>
          </a>
        </li>
      </ul>
    </section>
  )
}

/**
 * The shipped packs. Uses the app's manifest when it is already loaded; otherwise
 * fetches it without touching the data store, so a failed fetch on the landing
 * page never puts the app itself into its error state — the section just stays
 * hidden (the hero still links each language).
 */
function useLanguages(): LanguagePackMeta[] | null {
  const loaded = useData((s) => s.manifest?.languages ?? null)
  const [fetched, setFetched] = useState<LanguagePackMeta[] | null>(null)
  useEffect(() => {
    if (loaded) return
    let live = true
    loadManifest()
      .then((m) => live && setFetched(m.languages))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [loaded])
  return loaded ?? fetched
}
