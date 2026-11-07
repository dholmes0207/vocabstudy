import { useEffect, useState } from 'react'
import { Check, Trash2, UserX } from 'lucide-react'
import { api, ApiError, type AdminUser } from '@/lib/api'
import { tx, useT } from '@/lib/i18n'

export function UsersTab({ meId }: { meId: string }) {
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
