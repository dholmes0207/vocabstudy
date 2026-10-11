import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Trash2, UserX } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { api, ApiError, type AdminUser, type AiUsageReport } from '@/lib/api'

export default function AdminPage() {
  const me = useAuth((s) => s.user)

  if (me?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="card p-8">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-3 text-lg font-bold">Chỉ dành cho quản trị viên</h1>
          <Link to="/" className="btn-primary mt-4">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">Quản trị</span> <span aria-hidden="true">🛡️</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Quản lý tài khoản người dùng. Quyền được kiểm ở server (Cloudflare Function + Supabase).
        </p>
      </header>

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        🔑 <b>API key AI</b> được đặt bằng biến môi trường <code>OPENAI_API_KEY</code> trên
        Cloudflare Pages (secret) — không nằm trong app, học viên không bao giờ thấy. Đổi key/model
        ở Cloudflare → Settings → Environment variables.
      </div>

      <AiQuotaPanel />

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
  const [report, setReport] = useState<AiUsageReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api
      .adminAiUsage()
      .then((r) => alive && setReport(r))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Lỗi tải bộ đếm AI'))
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <div className="card p-4 text-sm text-rose-600 dark:text-rose-400">
        ⚠️ Không đọc được tình trạng hạn mức AI: {error}
      </div>
    )
  }
  if (!report)
    return <div className="card p-4 text-sm text-slate-400">Đang kiểm tra hạn mức AI…</div>

  const off = report.limit === 0
  const broken = !report.reachable
  const counted = report.today.requests > 0

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">Hạn mức trợ lý AI</h2>
        <span
          className={`chip px-3 py-1 text-xs font-semibold ${
            broken
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : off
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          }`}
        >
          {broken ? '✕ Không đếm được' : off ? '○ Đã tắt hạn mức' : '✓ Đang đếm'}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {off
          ? 'AI_DAILY_LIMIT đang là 0 — học sinh hỏi không giới hạn.'
          : `Mỗi học sinh ${report.limit} lượt/ngày, mốc sang ngày theo giờ Việt Nam.`}
      </p>

      {broken ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          Hạn mức <b>đang không có tác dụng</b> — trợ lý vẫn trả lời nhưng không ai bị chặn.
          {report.error ? ` ${report.error}` : ''}
        </p>
      ) : (
        <p className="mt-3 text-sm">
          Hôm nay ({report.day}): <b>{report.today.requests}</b> lượt hỏi từ{' '}
          <b>{report.today.users}</b> học sinh.
          {!off && !counted && (
            <span className="text-slate-400">
              {' '}
              Chưa có lượt nào — hỏi thử một câu rồi tải lại trang để chắc chắn bộ đếm chạy.
            </span>
          )}
        </p>
      )}
    </div>
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
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Lỗi tải dữ liệu'))
    return () => {
      alive = false
    }
  }, [reloadKey])

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      setReloadKey((k) => k + 1)
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Thao tác thất bại')
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
          if (confirm(`Từ chối và xoá đăng ký của ${u.email}?`))
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
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">Đăng ký chờ duyệt</h2>
        <span
          className={`chip px-3 py-1 text-xs font-semibold ${users.length ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
        >
          {users.length ? `${users.length} người đang chờ` : 'Không có ai chờ'}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Tài khoản mới chỉ đăng nhập và đồng bộ được sau khi bạn duyệt. Trong lúc chờ, họ vẫn học
        được ở chế độ khách.
      </p>
      {users.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name || '—'}</p>
                <p className="truncate text-xs text-slate-400">
                  {u.email} · đăng ký {new Date(u.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-primary !px-3 !py-1.5 text-sm" onClick={() => onApprove(u)}>
                  <Check className="h-4 w-4" /> Duyệt
                </button>
                <button
                  className="btn-ghost !px-3 !py-1.5 text-sm text-rose-600"
                  onClick={() => onReject(u)}
                >
                  <UserX className="h-4 w-4" /> Từ chối
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const STATUS_CHIP: Record<AdminUser['status'], [string, string]> = {
  active: [
    'Hoạt động',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  ],
  pending: ['Chờ duyệt', 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'],
  locked: ['Đã khoá', 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'],
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
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-800">
          <tr>
            <th className="p-3">Người dùng</th>
            <th className="p-3">Vai</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <tr key={u.id} className={u.id === meId ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}>
              <td className="p-3">
                <p className="font-medium">
                  {u.name || '—'}{' '}
                  {u.id === meId && <span className="text-xs text-slate-400">(bạn)</span>}
                </p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </td>
              <td className="p-3">
                <span
                  className={`chip ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                >
                  {u.role === 'admin' ? 'Admin' : 'Học viên'}
                </span>
              </td>
              <td className="p-3">
                <span className={`chip ${(STATUS_CHIP[u.status] ?? STATUS_CHIP.locked)[1]}`}>
                  {(STATUS_CHIP[u.status] ?? STATUS_CHIP.locked)[0]}
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
                      {u.role === 'admin' ? '↓ Học viên' : '↑ Admin'}
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
                        ? 'Khoá'
                        : u.status === 'pending'
                          ? 'Duyệt'
                          : 'Mở khoá'}
                    </button>
                    <button
                      className="btn-ghost !px-2 text-xs"
                      onClick={() => {
                        const p = prompt(`Mật khẩu mới cho ${u.email} (≥6 ký tự):`)
                        if (p) act(() => api.adminResetPassword(u.id, p))
                      }}
                    >
                      Đặt lại MK
                    </button>
                    <button
                      className="btn-ghost !px-2 text-xs text-rose-500"
                      onClick={() => {
                        if (confirm(`Xoá tài khoản ${u.email}? Không thể hoàn tác.`))
                          act(() => api.adminDeleteUser(u.id))
                      }}
                      aria-label="Xoá"
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
