import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { api, ApiError, type AdminUser } from '@/lib/api'

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
        <h1 className="text-2xl font-extrabold tracking-tight">Quản trị 🛡️</h1>
        <p className="mt-1 text-slate-500">
          Quản lý tài khoản người dùng. Quyền được kiểm ở server (Cloudflare Function + Supabase).
        </p>
      </header>

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        🔑 <b>API key AI</b> được đặt bằng biến môi trường <code>OPENAI_API_KEY</code> trên
        Cloudflare Pages (secret) — không nằm trong app, học viên không bao giờ thấy. Đổi key/model
        ở Cloudflare → Settings → Environment variables.
      </div>

      <UsersTab meId={me.id} />
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
                <span
                  className={`chip ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}
                >
                  {u.status === 'active' ? 'Hoạt động' : 'Đã khoá'}
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
                      {u.status === 'active' ? 'Khoá' : 'Mở khoá'}
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
