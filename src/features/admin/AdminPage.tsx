import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/store/authStore'
import { api, ApiError, type AdminProvider } from '@/lib/api'

export default function AdminPage() {
  const me = useAuth((s) => s.user)
  const [tab, setTab] = useState<'users' | 'ai'>('users')

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
        <p className="mt-1 text-slate-500">Quản lý tài khoản và cấu hình trợ lý AI cho cả hệ thống.</p>
      </header>
      <div className="flex gap-2">
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
          Tài khoản
        </TabBtn>
        <TabBtn active={tab === 'ai'} onClick={() => setTab('ai')}>
          Trợ lý AI (key server)
        </TabBtn>
      </div>
      {tab === 'users' ? <UsersTab meId={me.id} /> : <ProvidersTab />}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
    >
      {children}
    </button>
  )
}

function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  useEffect(() => {
    let alive = true
    loader()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Lỗi tải dữ liệu'))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])
  return { data, error, reload: () => setReloadKey((k) => k + 1) }
}

function UsersTab({ meId }: { meId: number }) {
  const { data, error, reload } = useAsync(() => api.adminUsers())
  const users = data?.users ?? []

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      reload()
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
                <p className="font-medium">{u.name || '—'} {u.id === meId && <span className="text-xs text-slate-400">(bạn)</span>}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </td>
              <td className="p-3">
                <span className={`chip ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  {u.role === 'admin' ? 'Admin' : 'Học viên'}
                </span>
              </td>
              <td className="p-3">
                <span className={`chip ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                  {u.status === 'active' ? 'Hoạt động' : 'Đã khoá'}
                </span>
              </td>
              <td className="p-3">
                {u.id === meId ? (
                  <span className="block text-right text-xs text-slate-400">—</span>
                ) : (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button className="btn-ghost !px-2 text-xs" onClick={() => act(() => api.adminPatchUser(u.id, { role: u.role === 'admin' ? 'student' : 'admin' }))}>
                      {u.role === 'admin' ? '↓ Học viên' : '↑ Admin'}
                    </button>
                    <button className="btn-ghost !px-2 text-xs" onClick={() => act(() => api.adminPatchUser(u.id, { status: u.status === 'active' ? 'locked' : 'active' }))}>
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
                        if (confirm(`Xoá tài khoản ${u.email}? Không thể hoàn tác.`)) act(() => api.adminDeleteUser(u.id))
                      }}
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

function ProvidersTab() {
  const { data, error, reload } = useAsync(() => api.adminProviders())
  const providers: AdminProvider[] = data?.providers ?? []
  const [form, setForm] = useState({ label: '', model: 'o4-mini', apiKey: '', baseUrl: 'https://api.openai.com/v1' })

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      reload()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Thao tác thất bại')
    }
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        🔒 Key ở đây lưu trên <b>server</b> — học viên gọi trợ lý qua <code>/api/ai/chat</code>, không bao giờ thấy key.
      </p>
      {error && <p className="text-rose-500">{error}</p>}

      <div className="space-y-2">
        {providers.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.label} <span className="text-xs text-slate-400">· {p.model}</span></p>
              <p className="truncate font-mono text-xs text-slate-400">{p.baseUrl} · key: ••••{p.apiKey.slice(-4)}</p>
            </div>
            <button className={`chip ${p.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`} onClick={() => act(() => api.adminPatchProvider(p.id, { isActive: !p.isActive }))}>
              {p.isActive ? 'Đang bật' : 'Đang tắt'}
            </button>
            <button className="btn-ghost !px-2 text-rose-500" onClick={() => confirm(`Xoá provider "${p.label}"?`) && act(() => api.adminDeleteProvider(p.id))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {providers.length === 0 && <p className="text-sm text-slate-400">Chưa có provider. Thêm bên dưới để bật trợ lý AI.</p>}
      </div>

      <div className="card space-y-3 p-4">
        <p className="flex items-center gap-2 font-semibold"><Plus className="h-4 w-4" /> Thêm provider</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Tên (vd: GPT lớp 10A)" className={inp} />
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="model (o4-mini)" className={inp} />
          <input type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="sk-… (API key)" autoComplete="off" className={`${inp} sm:col-span-2`} />
          <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="Base URL" className={`${inp} sm:col-span-2`} />
        </div>
        <button
          className="btn-primary"
          disabled={!form.label.trim() || !form.apiKey.trim()}
          onClick={() =>
            act(async () => {
              await api.adminAddProvider(form)
              setForm({ label: '', model: 'o4-mini', apiKey: '', baseUrl: 'https://api.openai.com/v1' })
            })
          }
        >
          <KeyRound className="h-4 w-4" /> Lưu provider
        </button>
      </div>
    </div>
  )
}

const inp = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900'
