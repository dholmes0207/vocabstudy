import { useEffect, useState } from 'react'
import { Bug } from 'lucide-react'
import { api, type ClientErrorRow } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'

/**
 * What is breaking in learners' browsers (docs/design/error-reports.md):
 * grouped, scrubbed reports from /api/errors, newest first.
 */
export function RecentErrors() {
  const t = useT()
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'failed'; message: string }
    | { kind: 'ready'; enabled: boolean; errors: ClientErrorRow[] }
  >({ kind: 'loading' })
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.adminErrors().then(
      (r) => alive && setState({ kind: 'ready', enabled: r.enabled, errors: r.errors }),
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

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold">
          <Bug className="h-4 w-4 text-rose-500" />{' '}
          {t('Lỗi gần đây (30 ngày)', 'Recent errors (30 days)')}
        </h2>
        {state.kind === 'ready' && state.enabled && (
          <span
            className={`chip px-3 py-1 text-xs font-semibold ${state.errors.length ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
          >
            {state.errors.length
              ? t(`${state.errors.length} loại lỗi`, `${state.errors.length} distinct errors`)
              : t('✓ Không có lỗi', '✓ No errors')}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Trình duyệt của học viên tự gửi mô tả lỗi đã lược bỏ thông tin cá nhân. Lỗi giống nhau được gộp lại và đếm số lần.',
          'Learners’ browsers send a scrubbed description of each error — nothing personal. Repeats of the same bug are grouped and counted.'
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
            'Chưa bật: hãy chạy lại supabase/schema.sql trong Supabase SQL editor. Trong lúc chờ, lỗi vẫn được ghi trong nhật ký Cloudflare Pages Functions (dòng [client-error]).',
            'Not set up yet: re-run supabase/schema.sql in the Supabase SQL editor. Meanwhile, errors still appear in the Cloudflare Pages Functions log ([client-error] lines).'
          )}
        </p>
      )}
      {state.kind === 'ready' && state.enabled && state.errors.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {state.errors.map((e) => (
            <li key={e.signature} className="py-2.5">
              <button
                type="button"
                onClick={() => setOpen((o) => (o === e.signature ? null : e.signature))}
                aria-expanded={open === e.signature}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className="chip shrink-0 bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  ×{e.count}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-mono text-xs">{e.message}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {e.path} · {e.release} ·{' '}
                    {new Date(e.last_seen).toLocaleString(t('vi-VN', 'en-GB'))}
                  </span>
                </span>
              </button>
              {open === e.signature && e.stack && (
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-slate-100 p-3 text-[11px] leading-snug dark:bg-slate-900">
                  {e.stack}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
