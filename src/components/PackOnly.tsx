import { Link } from 'react-router-dom'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { targetLangNames } from '@/lib/targetLang'
import { useTargetLang } from '@/hooks/useTargetLang'
import { useT } from '@/lib/i18n'

/**
 * Shown in place of a screen written for another language pack
 * (lib/packContent.ts) — an old link to /grammar while learning Korean, say.
 * One tap switches packs; progress is kept per language either way.
 */
export default function PackOnly({ packs }: { packs: readonly string[] }) {
  const t = useT()
  const current = useTargetLang()
  const manifest = useData((s) => s.manifest)
  const setCurrentLang = useSettings((s) => s.setCurrentLang)
  const langs = (manifest?.languages ?? []).filter((l) => packs.includes(l.code))
  const names = langs.map((l) => targetLangNames(l))
  const list = (key: 'vi' | 'en') => names.map((n) => n[key]).join(' / ')

  return (
    <div className="card mx-auto max-w-md p-8 text-center animate-fade-in">
      <p className="text-4xl" aria-hidden="true">
        🧭
      </p>
      <h1 className="mt-3 text-lg font-bold">
        {names.length
          ? t(`Phần này dành cho ${list('vi')}`, `This part is for ${list('en')}`)
          : t('Phần này chưa có cho ngôn ngữ bạn đang học', 'Not available for this language yet')}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          `Bạn đang học ${current.vi}. Đổi ngôn ngữ để mở phần này — tiến độ của mỗi ngôn ngữ được giữ riêng.`,
          `You are learning ${current.en}. Switch languages to open it — each language keeps its own progress.`
        )}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {langs.map((l, i) => (
          <button key={l.code} className="btn-primary" onClick={() => setCurrentLang(l.code)}>
            <span aria-hidden="true">{l.flag}</span>{' '}
            {t(`Chuyển sang ${names[i].vi}`, `Switch to ${names[i].en}`)}
          </button>
        ))}
        <Link to="/home" className="btn-secondary">
          {t('Về trang chủ', 'Back to home')}
        </Link>
      </div>
    </div>
  )
}
