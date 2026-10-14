import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bug, Check, Trash2, UserX } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { api, ApiError, type AdminUser, type AiUsageReport, type ClientErrorRow } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'

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
        <p className="mt-1 text-slate-500">
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

      <AiQuotaPanel />

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
      <div className="card p-4 text-sm text-slate-400">
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

      <p className="mt-2 text-sm text-slate-500">
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
            <span className="text-slate-400">
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
      <p className="mt-1 text-sm text-slate-500">
        {t(
          'Trình duyệt của học viên tự gửi mô tả lỗi đã lược bỏ thông tin cá nhân. Lỗi giống nhau được gộp lại và đếm số lần.',
          'Learners’ browsers send a scrubbed description of each error — nothing personal. Repeats of the same bug are grouped and counted.'
        )}
      </p>
      {state.kind === 'loading' && (
        <p className="mt-3 text-sm text-slate-400">{t('Đang tải…', 'Loading…')}</p>
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
                  <span className="text-xs text-slate-400">
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
      <p className="mt-1 text-sm text-slate-500">
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
                <p className="truncate text-xs text-slate-400">
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
        <thead className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-800">
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
                    <span className="text-xs text-slate-400">{t('(bạn)', '(you)')}</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{u.email}</p>
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
                  <span className="block text-right text-xs text-slate-400">—</span>
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
