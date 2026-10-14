// The bell in the app header (docs/design/notifications.md): a short list of
// things worth knowing — a policy update, what shipped lately. Pure and tested;
// the component only renders it. Read state lives on the device.

/** A Vietnamese/English pair. */
export type Pair = [vi: string, en: string]

export interface AppNotification {
  id: string
  /** ISO day, newest first in the list. */
  date: string
  kind: 'policy' | 'release'
  title: Pair
  body: Pair[]
  links: { to: string; label: Pair }[]
}

export interface ReleaseLike {
  date: string
  title: Pair
  items: Pair[]
}

export const READ_KEY = 'vocab.notifications.read'
/** Before the bell, the policy card stored the version it was dismissed at here. */
const LEGACY_POLICY_KEY = 'vocab.policy.seen'

/** How many recent releases the bell shows (older ones live on /changelog). */
export const RELEASES_SHOWN = 4

export const policyNotificationId = (version: string) => `policy-${version}`

export function buildNotifications(
  releases: ReleaseLike[],
  policyVersion: string
): AppNotification[] {
  const policy: AppNotification = {
    id: policyNotificationId(policyVersion),
    date: policyVersion,
    kind: 'policy',
    title: [
      'Cập nhật Chính sách bảo mật và Điều khoản sử dụng',
      'Privacy policy and Terms of use updated',
    ],
    body: [
      [
        'Cập nhật theo Luật Bảo vệ dữ liệu cá nhân 2025 và Luật Trí tuệ nhân tạo 2025: nói rõ hơn về quyền của bạn, dữ liệu lưu ở nước ngoài và nội dung do AI tạo.',
        'Updated for Vietnam’s 2025 Personal Data Protection Law and AI Law: clearer about your rights, data stored abroad, and AI-generated content.',
      ],
    ],
    links: [
      { to: '/privacy', label: ['Chính sách bảo mật', 'Privacy policy'] },
      { to: '/terms', label: ['Điều khoản sử dụng', 'Terms of use'] },
    ],
  }
  const recent: AppNotification[] = [...releases]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, RELEASES_SHOWN)
    .map((r) => ({
      id: `release-${r.date}`,
      date: r.date,
      kind: 'release',
      title: r.title,
      body: r.items,
      links: [{ to: '/changelog', label: ['Xem tất cả cập nhật', 'See every update'] }],
    }))
  // Policy first on its day: it is the one people are asked to read.
  return [policy, ...recent].sort(
    (a, b) => b.date.localeCompare(a.date) || (a.kind === 'policy' ? -1 : 1)
  )
}

/** Ids already read on this device (the legacy policy card counts too). */
export function readIds(storage: Pick<Storage, 'getItem'>, policyVersion: string): Set<string> {
  const ids = new Set<string>()
  try {
    const raw = storage.getItem(READ_KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    if (Array.isArray(list)) for (const id of list) if (typeof id === 'string') ids.add(id)
    if (storage.getItem(LEGACY_POLICY_KEY) === policyVersion)
      ids.add(policyNotificationId(policyVersion))
  } catch {
    // corrupt or blocked storage: everything simply shows as unread
  }
  return ids
}

/** Remember these as read; keeps only ids still in `current` so the list never grows. */
export function markRead(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  ids: string[],
  current: AppNotification[],
  policyVersion: string
): Set<string> {
  const read = readIds(storage, policyVersion)
  for (const id of ids) read.add(id)
  const keep = current.map((n) => n.id).filter((id) => read.has(id))
  try {
    storage.setItem(READ_KEY, JSON.stringify(keep))
  } catch {
    // private mode: read state lasts for this visit only
  }
  return new Set(keep)
}

export const unreadCount = (list: AppNotification[], read: Set<string>) =>
  list.filter((n) => !read.has(n.id)).length
