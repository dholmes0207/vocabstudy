import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bug, Check, MessageSquareHeart, Repeat, Star, Trash2, UserX } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import {
  api,
  ApiError,
  type AdminUser,
  type AiUsageReport,
  type ClientErrorRow,
  type FeedbackRow,
} from '@/lib/api'
import { tx, useT } from '@/lib/i18n'
import { formatDay } from '@/lib/date'
import { percent, type Rate, type RetentionReport } from '@/lib/retention'

export default function AdminPage() {
  const me = useAuth((s) => s.user)
  const t = useT()

  if (me?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="card p-8">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-3 text-lg font-bold">
            {t('Chỉ dành cho quản trị viên', 'Admins only')}
          </h1>
          <Link to="/home" className="btn-primary mt-4">
            {t('Về trang chủ', 'Back to home')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Quản trị', 'Admin')}</span>{' '}
          <span aria-hidden="true">🛡️</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Quản lý tài khoản người dùng. Quyền được kiểm ở server (Cloudflare Function + Supabase).',
            'Manage user accounts. Permissions are enforced on the server (Cloudflare Function + Supabase).'
          )}
        </p>
      </header>

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        🔑{' '}
        {t(
          'API key AI được đặt bằng biến môi trường OPENAI_API_KEY trên Cloudflare Pages (secret) — không nằm trong app, học viên không bao giờ thấy. Đổi key/model ở Cloudflare → Settings → Environment variables.',
          'The AI API key is the OPENAI_API_KEY environment variable on Cloudflare Pages (a secret) — it is not in the app and learners never see it. Change the key/model under Cloudflare → Settings → Environment variables.'
        )}
      </div>

      <RetentionPanel />

      <AiQuotaPanel />

      <FeedbackInbox />

      <RecentErrors />

      <UsersTab meId={me.id} />
    </div>
  )
}

/**
 * Is the AI daily cap actually counting?
 *
 * The cap fails open on purpose, so a missing migration or a stale PostgREST
 * schema cache leaves it silently inactive while everything still looks fine.
 * The only hard proof it works is today's request count going up.
 */
export function AiQuotaPanel() {
  const t = useT()
  const [report, setReport] = useState<AiUsageReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api
      .adminAiUsage()
      .then((r) => alive && setReport(r))
      .catch(
        (e) =>
          alive &&
          setError(
            e instanceof ApiError
              ? e.message
              : tx('Lỗi tải bộ đếm AI', "Couldn't load the AI counter")
          )
      )
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <div className="card p-4 text-sm text-rose-600 dark:text-rose-400">
        ⚠️ {t('Không đọc được tình trạng hạn mức AI:', "Couldn't read the AI quota status:")}{' '}
        {error}
      </div>
    )
  }
  if (!report)
    return (
      <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">
        {t('Đang kiểm tra hạn mức AI…', 'Checking the AI quota…')}
      </div>
    )

  const off = report.limit === 0
  const broken = !report.reachable
  const counted = report.today.requests > 0

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{t('Hạn mức trợ lý AI', 'AI tutor quota')}</h2>
        <span
          className={`chip px-3 py-1 text-xs font-semibold ${
            broken
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : off
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          }`}
        >
          {broken
            ? t('✕ Không đếm được', '✕ Not counting')
            : off
              ? t('○ Đã tắt hạn mức', '○ Quota off')
              : t('✓ Đang đếm', '✓ Counting')}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {off
          ? t(
              'AI_DAILY_LIMIT đang là 0 — học sinh hỏi không giới hạn.',
              'AI_DAILY_LIMIT is 0 — learners can ask without limit.'
            )
          : t(
              `Mỗi học sinh ${report.limit} lượt/ngày, mốc sang ngày theo giờ Việt Nam.`,
              `${report.limit} questions per learner per day; the day resets on Vietnam time.`
            )}
      </p>

      {broken ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {t(
            'Hạn mức đang không có tác dụng — trợ lý vẫn trả lời nhưng không ai bị chặn.',
            'The quota is not in effect — the tutor still answers, but nobody is limited.'
          )}
          {report.error ? ` ${report.error}` : ''}
        </p>
      ) : (
        <p className="mt-3 text-sm">
          {t('Hôm nay', 'Today')} ({report.day}): <b>{report.today.requests}</b>{' '}
          {t('lượt hỏi từ', 'questions from')} <b>{report.today.users}</b>{' '}
          {t('học sinh.', 'learners.')}
          {!off && !counted && (
            <span className="text-slate-500 dark:text-slate-400">
              {' '}
              {t(
                'Chưa có lượt nào — hỏi thử một câu rồi tải lại trang để chắc chắn bộ đếm chạy.',
                'No questions yet — ask one, then reload to confirm the counter works.'
              )}
            </span>
          )}
        </p>
      )}
    </div>
  )
}

/**
 * Do learners come back? (docs/design/retention.md) Counted on the server from
 * synced progress, so it only sees learners who are signed in.
 */
export function RetentionPanel() {
  const t = useT()
  const [report, setReport] = useState<RetentionReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.adminRetention().then(
      (r) => alive && setReport(r),
      (e: unknown) =>
        alive &&
        setError(
          e instanceof Error ? e.message : tx('Lỗi tải thống kê', "Couldn't load the figures")
        )
    )
    return () => {
      alive = false
    }
  }, [])

  const rate = (r: Rate) =>
    percent(r) ? (
      <>
        <b>{percent(r)}</b>{' '}
        <span className="text-slate-500 dark:text-slate-400">
          ({r.returned}/{r.eligible})
        </span>
      </>
    ) : (
      <span className="text-slate-500 dark:text-slate-400">—</span>
    )

  return (
    <section className="card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Repeat className="h-4 w-4 text-brand-500" />{' '}
        {t('Người học quay lại', 'Returning learners')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Tính từ tiến độ đồng bộ, nên chỉ gồm người đã đăng nhập. Ngày đầu là ngày đầu tiên có trả lời hay học từ mới.',
          'Counted from synced progress, so only learners who signed in. A first day is the first day with any answer or new word.'
        )}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">⚠️ {error}</p>
      ) : !report ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('Đang tính…', 'Counting…')}
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {(
              [
                [t('Người học', 'Learners'), <b key="n">{report.learners}</b>],
                [
                  t('Học hôm nay / 7 ngày', 'Active today / 7 days'),
                  <b key="a">
                    {report.activeToday} / {report.active7}
                  </b>,
                ],
                [t('Quay lại hôm sau', 'Back the next day'), rate(report.nextDay)],
                [t('Quay lại trong tuần đầu', 'Back within a week'), rate(report.firstWeek)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-base">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('Tuần bắt đầu học', 'First week')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">{t('Người mới', 'New')}</th>
                  <th className="py-1.5 pr-3 font-semibold">{t('Hôm sau', 'Next day')}</th>
                  <th className="py-1.5 font-semibold">{t('Trong tuần', 'Within a week')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.cohorts.map((c) => (
                  <tr key={c.week}>
                    <td className="py-1.5 pr-3">
                      {formatDay(c.week)} – {formatDay(c.week + 6)}
                    </td>
                    <td className="py-1.5 pr-3">{c.learners}</td>
                    <td className="py-1.5 pr-3">{rate(c.nextDay)}</td>
                    <td className="py-1.5">{rate(c.firstWeek)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

/**
 * What learners wrote (docs/design/feedback.md). A message whose author allowed
 * quoting can be shown on the homepage — the only source of testimonials.
 */
function FeedbackInbox() {
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

/**
 * What is breaking in learners' browsers (docs/design/error-reports.md):
 * grouped, scrubbed reports from /api/errors, newest first.
 */
function RecentErrors() {
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

function UsersTab({ meId }: { meId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true
    api
      .adminUsers()
      .then((r) => alive && setUsers(r.users))
      .catch(
        (e) =>
          alive &&
          setError(e instanceof ApiError ? e.message : tx('Lỗi tải dữ liệu', "Couldn't load data"))
      )
    return () => {
      alive = false
    }
  }, [reloadKey])

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      setReloadKey((k) => k + 1)
    } catch (e) {
      alert(e instanceof ApiError ? e.message : tx('Thao tác thất bại', 'Action failed'))
    }
  }

  if (error) return <p className="text-rose-500">{error}</p>

  const pending = users.filter((u) => u.status === 'pending')

  return (
    <>
      <PendingSignups
        users={pending}
        onApprove={(u) => act(() => api.adminPatchUser(u.id, { status: 'active' }))}
        onReject={(u) => {
          if (
            confirm(
              tx(
                `Từ chối và xoá đăng ký của ${u.email}?`,
                `Reject and delete the sign-up from ${u.email}?`
              )
            )
          )
            act(() => api.adminDeleteUser(u.id))
        }}
      />
      <UsersTable users={users} meId={meId} act={act} />
    </>
  )
}

/** New sign-ups waiting for an admin — first on the page, so none get forgotten. */
function PendingSignups({
  users,
  onApprove,
  onReject,
}: {
  users: AdminUser[]
  onApprove: (u: AdminUser) => void
  onReject: (u: AdminUser) => void
}) {
  const t = useT()
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">{t('Danh sách chờ beta', 'Beta waitlist')}</h2>
        <span
          className={`chip px-3 py-1 text-xs font-semibold ${users.length ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
        >
          {users.length
            ? t(`${users.length} người đang chờ`, `${users.length} waiting`)
            : t('Không có ai chờ', 'Nobody waiting')}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Người đăng ký mới vào danh sách chờ; họ chỉ đăng nhập và đồng bộ được sau khi bạn duyệt. Trong lúc chờ, họ vẫn học được ở chế độ khách.',
          'New sign-ups join the waitlist; they can sign in and sync only after you approve them. Meanwhile they can still learn as guests.'
        )}
      </p>
      {users.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name || '—'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {u.email} · {t('đăng ký', 'signed up')}{' '}
                  {new Date(u.created_at).toLocaleString(t('vi-VN', 'en-GB'))}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-primary !px-3 !py-1.5 text-sm" onClick={() => onApprove(u)}>
                  <Check className="h-4 w-4" /> {t('Duyệt', 'Approve')}
                </button>
                <button
                  className="btn-ghost !px-3 !py-1.5 text-sm text-rose-600"
                  onClick={() => onReject(u)}
                >
                  <UserX className="h-4 w-4" /> {t('Từ chối', 'Reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const STATUS_CHIP: Record<AdminUser['status'], [vi: string, en: string, cls: string]> = {
  active: [
    'Hoạt động',
    'Active',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  ],
  pending: [
    'Danh sách chờ',
    'Waitlist',
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ],
  locked: ['Đã khoá', 'Locked', 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'],
}

function UsersTable({
  users,
  meId,
  act,
}: {
  users: AdminUser[]
  meId: string
  act: (fn: () => Promise<unknown>) => void
}) {
  const t = useT()
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-slate-200 text-left text-slate-500 dark:text-slate-400 dark:border-slate-800">
          <tr>
            <th className="p-3">{t('Người dùng', 'User')}</th>
            <th className="p-3">Vai</th>
            <th className="p-3">{t('Trạng thái', 'Status')}</th>
            <th className="p-3 text-right">{t('Thao tác', 'Actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <tr key={u.id} className={u.id === meId ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}>
              <td className="p-3">
                <p className="font-medium">
                  {u.name || '—'}{' '}
                  {u.id === meId && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t('(bạn)', '(you)')}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
              </td>
              <td className="p-3">
                <span
                  className={`chip ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                >
                  {u.role === 'admin' ? 'Admin' : t('Học viên', 'Learner')}
                </span>
              </td>
              <td className="p-3">
                <span className={`chip ${(STATUS_CHIP[u.status] ?? STATUS_CHIP.locked)[2]}`}>
                  {t(...pairOf(STATUS_CHIP[u.status] ?? STATUS_CHIP.locked))}
                </span>
              </td>
              <td className="p-3">
                {u.id === meId ? (
                  <span className="block text-right text-xs text-slate-500 dark:text-slate-400">
                    —
                  </span>
                ) : (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      className="btn-ghost !px-2 text-xs"
                      onClick={() =>
                        act(() =>
                          api.adminPatchUser(u.id, {
                            role: u.role === 'admin' ? 'student' : 'admin',
                          })
                        )
                      }
                    >
                      {u.role === 'admin' ? t('↓ Học viên', '↓ Learner') : '↑ Admin'}
                    </button>
                    <button
                      className="btn-ghost !px-2 text-xs"
                      onClick={() =>
                        act(() =>
                          api.adminPatchUser(u.id, {
                            status: u.status === 'active' ? 'locked' : 'active',
                          })
                        )
                      }
                    >
                      {u.status === 'active'
                        ? t('Khoá', 'Lock')
                        : u.status === 'pending'
                          ? t('Duyệt', 'Approve')
                          : t('Mở khoá', 'Unlock')}
                    </button>
                    <button
                      className="btn-ghost !px-2 text-xs"
                      onClick={() => {
                        const p = prompt(
                          t(
                            `Mật khẩu mới cho ${u.email} (≥6 ký tự):`,
                            `New password for ${u.email} (≥6 characters):`
                          )
                        )
                        if (p) act(() => api.adminResetPassword(u.id, p))
                      }}
                    >
                      {t('Đặt lại MK', 'Reset password')}
                    </button>
                    <button
                      className="btn-ghost !px-2 text-xs text-rose-500"
                      onClick={() => {
                        if (
                          confirm(
                            t(
                              `Xoá tài khoản ${u.email}? Không thể hoàn tác.`,
                              `Delete the account ${u.email}? This cannot be undone.`
                            )
                          )
                        )
                          act(() => api.adminDeleteUser(u.id))
                      }}
                      aria-label={t('Xoá', 'Delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The Vietnamese/English pair of a status chip. */
function pairOf(chip: [string, string, string]): [string, string] {
  return [chip[0], chip[1]]
}
