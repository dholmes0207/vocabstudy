import { Mail } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { Link } from 'react-router-dom'
import { CONTACT_EMAIL } from '@/lib/site'
import { useTargetLang } from '@/hooks/useTargetLang'

/** Small site footer: who we are and how to reach us. */
export default function SiteFooter({ className = '' }: { className?: string }) {
  const t = useT()
  const L = useTargetLang()
  return (
    <footer
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <span>© {new Date().getFullYear()} VocaStudy</span>
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <span>{t(`Học từ vựng ${L.vi} mỗi ngày`, `${L.en} vocabulary, a little every day`)}</span>
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
      >
        <Mail className="h-3.5 w-3.5" />
        {t('Liên hệ', 'Contact')}: {CONTACT_EMAIL}
      </a>
      <span className="flex basis-full justify-center gap-3 sm:basis-auto">
        {[
          ['/about', t('Giới thiệu', 'About')],
          ['/changelog', t('Có gì mới', "What's new")],
          ['/privacy', t('Bảo mật', 'Privacy')],
          ['/terms', t('Điều khoản', 'Terms')],
        ].map(([to, label]) => (
          <Link key={to} to={to} className="hover:text-brand-600 dark:hover:text-brand-300">
            {label}
          </Link>
        ))}
      </span>
    </footer>
  )
}
