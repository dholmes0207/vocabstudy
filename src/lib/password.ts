// Rules for choosing a new password (sign-up, reset, Settings). Supabase
// enforces the same minimum server-side; checking here gives a clear message
// before the round-trip.

export const MIN_PASSWORD = 6

/** Why a new password cannot be used yet, or null when it can. */
export function passwordProblem(
  password: string,
  confirm: string,
  t: (vi: string, en: string) => string
): string | null {
  if (password.length < MIN_PASSWORD)
    return t(
      `Mật khẩu cần tối thiểu ${MIN_PASSWORD} ký tự.`,
      `The password needs at least ${MIN_PASSWORD} characters.`
    )
  if (password !== confirm) return t('Hai mật khẩu chưa khớp.', 'The two passwords do not match.')
  return null
}
