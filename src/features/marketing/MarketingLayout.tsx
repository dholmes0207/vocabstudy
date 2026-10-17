import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Mail, Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import UiLangToggle from '@/components/UiLangToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { CONTACT_EMAIL } from '@/lib/site'
import { openFeedback } from '@/store/feedbackStore'
import { useT } from '@/lib/i18n'
import { hasUsedApp } from '@/lib/entry'

// Chrome for the public pages — landing, about, privacy, terms
// (docs/design/landing.md). Separate from the app shell: no study nav, a clear
// "start" button, and a full footer with the company and legal links.

export default function MarketingLayout() {
  const t = useT()
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  // The site opens on its introduction for everyone; someone who has studied
  // here gets "continue" rather than "start" (Home.tsx).
  const [returning] = useState(() => hasUsedApp(localStorage))
  const startLabel = returning
    ? t('Tiếp tục học', 'Continue learning')
    : t('Học miễn phí', 'Start free')

  // A new page starts at the top (or at its #section); the mobile menu closes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false)
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: 0 })
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname, hash])

  const links = [
    { to: '/#features', label: t('Tính năng', 'Features') },
    { to: '/#how', label: t('Cách học', 'How it works') },
    { to: '/#faq', label: t('Hỏi đáp', 'FAQ') },
    { to: '/about', label: t('Về chúng tôi', 'About') },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" aria-label="VocaStudy">
            <Logo />
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <UiLangToggle />
            <span className="hidden sm:block">
              <ThemeToggle />
            </span>
            <Link to="/login" className="btn-ghost hidden h-10 sm:inline-flex">
              {t('Đăng nhập', 'Sign in')}
            </Link>
            <Link to="/home" className="btn-primary hidden h-10 sm:inline-flex">
              {startLabel}
            </Link>
            <button
              className="btn-ghost h-10 w-10 !px-0 md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={t('Mở menu', 'Open menu')}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-slate-200/70 px-4 py-3 animate-fade-in dark:border-white/10 md:hidden">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn-secondary">
                {t('Đăng nhập', 'Sign in')}
              </Link>
              <Link to="/home" className="btn-primary">
                {startLabel}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <MarketingFooter />
    </div>
  )
}

function MarketingFooter() {
  const t = useT()
  const cols = [
    {
      title: t('Sản phẩm', 'Product'),
      links: [
        { to: '/home', label: t('Vào học', 'Open the app') },
        { to: '/phrases', label: t('Mẫu câu giao tiếp', 'Everyday phrases') },
        { to: '/changelog', label: t('Có gì mới', "What's new") },
        { to: '/browse', label: t('Tra cứu từ', 'Dictionary') },
        { to: '/#faq', label: t('Hỏi đáp', 'FAQ') },
      ],
    },
    {
      title: t('Về VocaStudy', 'Company'),
      links: [
        { to: '/about', label: t('Về chúng tôi', 'About us') },
        { to: `mailto:${CONTACT_EMAIL}`, label: t('Liên hệ', 'Contact') },
        // Not a page: opens the in-app feedback form.
        { to: '#feedback', label: t('Góp ý', 'Send feedback') },
      ],
    },
    {
      title: t('Pháp lý', 'Legal'),
      links: [
        { to: '/privacy', label: t('Chính sách bảo mật', 'Privacy policy') },
        { to: '/terms', label: t('Điều khoản sử dụng', 'Terms of use') },
      ],
    },
  ]
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Học ngoại ngữ mỗi ngày một chút, giải thích bằng tiếng Việt — dành cho người Việt, kể cả người bắt đầu từ con số 0.',
              'Learn languages a little every day, explained in Vietnamese — made for Vietnamese speakers, including complete beginners.'
            )}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
          >
            <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
          </a>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.to}>
                  {l.to === '#feedback' ? (
                    <button
                      type="button"
                      onClick={openFeedback}
                      className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                    >
                      {l.label}
                    </button>
                  ) : l.to.startsWith('mailto:') ? (
                    <a
                      href={l.to}
                      className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <NavLink
                      to={l.to}
                      className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                    >
                      {l.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200/70 dark:border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400">
          © {new Date().getFullYear()} VocaStudy. {t('Bảo lưu mọi quyền.', 'All rights reserved.')}
        </p>
      </div>
    </footer>
  )
}
