import { useEffect, useState } from 'react'
import { MessageSquareHeart, Star } from 'lucide-react'
import { api, type FeedbackRow } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'

/**
 * What learners wrote (docs/design/feedback.md). A message whose author allowed
 * quoting can be shown on the homepage — the only source of testimonials.
 */
export function FeedbackInbox() {
  const t = useT()
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'failed'; message: string }
    | { kind: 'ready'; enabled: boolean; feedback: FeedbackRow[] }
  >({ kind: 'loading' })
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.adminFeedback().then(
      (r) => alive && setState({ kind: 'ready', enabled: r.enabled, feedback: r.feedback }),
      (e: unknown) =>
        alive &&
        setState({
          kind: 'failed',
          message: e instanceof Error ? e.message : tx('Lỗi không rõ', 'Unknown error'),
        })
    )
    return () => {
      alive = false
    }
  }, [])

  const feature = async (row: FeedbackRow) => {
    setBusy(row.id)
    try {
      await api.adminFeatureFeedback(row.id, !row.featured)
      setState((s) =>
        s.kind === 'ready'
          ? {
              ...s,
              feedback: s.feedback.map((f) =>
                f.id === row.id ? { ...f, featured: !row.featured } : f
              ),
            }
          : s
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <MessageSquareHeart className="h-4 w-4 text-brand-500" />{' '}
        {t('Góp ý của học viên', 'Learner feedback')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Chỉ góp ý mà người viết cho phép trích dẫn mới hiện được trên trang chủ — không bao giờ dùng lời tự bịa.',
          'Only feedback whose author allowed quoting can appear on the homepage — never anything made up.'
        )}
      </p>
      {state.kind === 'loading' && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('Đang tải…', 'Loading…')}
        </p>
      )}
      {state.kind === 'failed' && <p className="mt-3 text-sm text-rose-600">{state.message}</p>}
      {state.kind === 'ready' && !state.enabled && (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {t(
            'Chưa bật: hãy chạy lại supabase/schema.sql. Trong lúc chờ, form góp ý gợi ý người dùng gửi email.',
            'Not set up yet: re-run supabase/schema.sql. Meanwhile the feedback form suggests email instead.'
          )}
        </p>
      )}
      {state.kind === 'ready' && state.enabled && state.feedback.length === 0 && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('Chưa có góp ý nào.', 'No feedback yet.')}
        </p>
      )}
      {state.kind === 'ready' && state.feedback.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {state.feedback.map((f) => (
            <li key={f.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {f.name || t('Ẩn danh', 'Anonymous')}
                </span>
                {f.rating && (
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {f.rating} <Star className="h-3 w-3 fill-current" />
                  </span>
                )}
                <span>{new Date(f.created_at).toLocaleString(t('vi-VN', 'en-GB'))}</span>
                {f.page && <span>· {f.page}</span>}
                {f.allow_quote && (
                  <span className="chip bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {t('Cho phép trích dẫn', 'Quotable')}
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line text-sm">{f.message}</p>
              {f.allow_quote && (
                <button
                  type="button"
                  disabled={busy === f.id}
                  onClick={() => void feature(f)}
                  className={`mt-2 text-xs font-semibold ${f.featured ? 'text-rose-600' : 'text-brand-600 dark:text-brand-300'} hover:underline`}
                >
                  {f.featured
                    ? t('Bỏ khỏi trang chủ', 'Remove from homepage')
                    : t('Hiện trên trang chủ', 'Show on homepage')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
