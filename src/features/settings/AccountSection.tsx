import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, KeyRound, Pencil, Trash2 } from 'lucide-react'
import { ADMIN_CANNOT_DELETE, useAuth } from '@/store/authStore'
import { useT } from '@/lib/i18n'
import { Field, NewPasswordForm, Notice, inputCls } from '@/features/auth/AuthShell'
import { DISPLAY_NAME_MAX } from '@/lib/displayName'
import { Row, Section } from './ui'

// Settings → Account: the display name, the password, and (in the danger zone)
// deleting the account (docs/design/account.md). All need a signed-in user.

/** Who is signed in, their display name, and a way to change the password. */
export function AccountSection({ onNotice }: { onNotice: (message: string) => void }) {
  const t = useT()
  const user = useAuth((s) => s.user)
  const updatePassword = useAuth((s) => s.updatePassword)
  const [changing, setChanging] = useState(false)
  if (!user) return null
  // Signed in with Google only: there is no password yet, but one can be added.
  const googleOnly = user.hasPassword === false

  return (
    <Section title={t('Tài khoản', 'Account')}>
      <Row label={t('Đang đăng nhập', 'Signed in as')} hint={user.email}>
        <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
          {user.role === 'admin' ? t('Quản trị', 'Admin') : t('Học viên', 'Learner')}
        </span>
      </Row>
      <DisplayNameRow name={user.name} onNotice={onNotice} />
      <Row
        label={t('Mật khẩu', 'Password')}
        hint={
          googleOnly
            ? t(
                'Bạn đang đăng nhập bằng Google. Tạo mật khẩu nếu muốn đăng nhập bằng email.',
                'You sign in with Google. Create a password if you also want to sign in with email.'
              )
            : t('Đổi mật khẩu dùng để đăng nhập.', 'Change the password you sign in with.')
        }
      >
        {!changing && (
          <button className="btn-secondary" onClick={() => setChanging(true)}>
            <KeyRound className="h-4 w-4" />{' '}
            {googleOnly ? t('Tạo mật khẩu', 'Create') : t('Đổi mật khẩu', 'Change')}
          </button>
        )}
      </Row>
      {changing && (
        <div className="max-w-sm space-y-2 pb-4 pt-1">
          <NewPasswordForm
            submitLabel={t('Lưu mật khẩu mới', 'Save new password')}
            onSubmit={async (password) => {
              await updatePassword(password)
              setChanging(false)
              onNotice(
                googleOnly
                  ? t(
                      'Đã tạo mật khẩu. Từ giờ bạn đăng nhập được bằng Google hoặc email.',
                      'Password created. You can now sign in with Google or with email.'
                    )
                  : t('Đã đổi mật khẩu.', 'Your password has been changed.')
              )
            }}
          />
          <button className="btn-ghost w-full text-sm" onClick={() => setChanging(false)}>
            {t('Hủy', 'Cancel')}
          </button>
        </div>
      )}
    </Section>
  )
}

/**
 * The name shown in the account menu and on the Admin page. Filled from the
 * sign-up form or from Google; this is the only place to change it later.
 */
function DisplayNameRow({ name, onNotice }: { name: string; onNotice: (m: string) => void }) {
  const t = useT()
  const updateDisplayName = useAuth((s) => s.updateDisplayName)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await updateDisplayName(draft)
      setEditing(false)
      onNotice(t('Đã đổi tên hiển thị.', 'Your display name has been changed.'))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Có lỗi xảy ra, thử lại nhé.', 'Something went wrong — please try again.')
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Row
        label={t('Tên hiển thị', 'Display name')}
        hint={name || t('Chưa đặt — đang hiện là "Người học"', 'Not set — shown as "Learner"')}
      >
        {!editing && (
          <button
            className="btn-secondary"
            onClick={() => {
              setDraft(name)
              setError(null)
              setEditing(true)
            }}
          >
            <Pencil className="h-4 w-4" /> {t('Sửa', 'Edit')}
          </button>
        )}
      </Row>
      {editing && (
        <form onSubmit={save} className="max-w-sm space-y-3 pb-4 pt-1">
          <Field label={t('Tên hiển thị', 'Display name')}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={DISPLAY_NAME_MAX}
              className={inputCls}
              placeholder={t('Nguyễn Văn A', 'Jane Doe')}
              autoComplete="name"
              autoFocus
            />
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? t('Đang lưu…', 'Saving…') : t('Lưu', 'Save')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              {t('Hủy', 'Cancel')}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

/** Danger zone row: erase the account after re-entering the password. */
export function DeleteAccountRow({ onNotice }: { onNotice: (message: string) => void }) {
  const t = useT()
  const user = useAuth((s) => s.user)
  const deleteAccount = useAuth((s) => s.deleteAccount)
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (!user) return null
  const admin = user.role === 'admin'
  // No password to re-check on a Google-only account: retyping the email is the
  // deliberate step instead.
  const googleOnly = user.hasPassword === false

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await deleteAccount(password)
      onNotice(
        t(
          'Đã xoá tài khoản và dữ liệu đồng bộ. Tiến độ trên máy này vẫn còn — đặt lại bên dưới nếu muốn xoá nốt.',
          'Your account and its synced data have been deleted. Progress on this device is still here — reset it below to remove it too.'
        )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Có lỗi xảy ra, thử lại nhé.', 'Something went wrong — please try again.')
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Row
        label={t('Xoá tài khoản', 'Delete account')}
        hint={
          admin
            ? ADMIN_CANNOT_DELETE()
            : t(
                'Xoá vĩnh viễn tài khoản và tiến độ đã đồng bộ lên máy chủ. Không thể hoàn tác.',
                'Permanently deletes your account and the progress synced to it. This cannot be undone.'
              )
        }
      >
        {!admin && !open && (
          <button
            className="btn bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {t('Xoá tài khoản', 'Delete')}
          </button>
        )}
      </Row>
      {!admin && open && (
        <form onSubmit={submit} className="max-w-sm space-y-3 pb-4 pt-1">
          {googleOnly ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                `Gõ lại email của tài khoản (${user.email}) để xác nhận.`,
                `Type this account's email (${user.email}) to confirm.`
              )}
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Nhập mật khẩu để xác nhận. Quên mật khẩu? ',
                'Enter your password to confirm. Forgot it? '
              )}
              <Link
                to="/login?forgot=1"
                className="font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                {t('Đặt lại qua email', 'Reset it by email')}
              </Link>
            </p>
          )}
          <Field label={googleOnly ? 'Email' : t('Mật khẩu', 'Password')}>
            <input
              type={googleOnly ? 'email' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              autoComplete={googleOnly ? 'off' : 'current-password'}
            />
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={busy || !password}
              className="btn bg-rose-600 text-white hover:bg-rose-700"
            >
              <AlertTriangle className="h-4 w-4" />
              {busy ? t('Đang xoá…', 'Deleting…') : t('Xoá vĩnh viễn', 'Delete permanently')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setOpen(false)
                setPassword('')
                setError(null)
              }}
            >
              {t('Hủy', 'Cancel')}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
