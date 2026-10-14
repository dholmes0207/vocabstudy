import { describe, expect, it } from 'vitest'
import {
  READ_KEY,
  RELEASES_SHOWN,
  buildNotifications,
  markRead,
  policyNotificationId,
  readIds,
  unreadCount,
} from './notifications'

function store(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

const release = (date: string) => ({
  date,
  title: [`Bản ${date}`, `Release ${date}`] as [string, string],
  items: [['Điều mới', 'Something new'] as [string, string]],
})
const RELEASES = ['2026-10-01', '2026-10-14', '2026-10-08', '2026-09-24', '2026-08-20'].map(release)

describe('buildNotifications', () => {
  it('lists the policy update and the latest releases, newest first', () => {
    const list = buildNotifications(RELEASES, '2026-10-14')
    expect(list[0]).toMatchObject({ id: 'policy-2026-10-14', kind: 'policy' })
    expect(list.map((n) => n.id).slice(1)).toEqual([
      'release-2026-10-14',
      'release-2026-10-08',
      'release-2026-10-01',
      'release-2026-09-24',
    ])
    expect(list).toHaveLength(RELEASES_SHOWN + 1)
    expect(list[1].links[0].to).toBe('/changelog')
  })
})

describe('read state', () => {
  const list = buildNotifications(RELEASES, '2026-10-14')

  it('starts unread, and remembers what was opened', () => {
    const s = store()
    expect(unreadCount(list, readIds(s, '2026-10-14'))).toBe(list.length)
    const read = markRead(s, ['release-2026-10-14'], list, '2026-10-14')
    expect(unreadCount(list, read)).toBe(list.length - 1)
    expect(unreadCount(list, readIds(s, '2026-10-14'))).toBe(list.length - 1)
  })

  it('honours the old policy card: dismissed there means read here', () => {
    const s = store({ 'vocab.policy.seen': '2026-10-14' })
    expect(readIds(s, '2026-10-14').has(policyNotificationId('2026-10-14'))).toBe(true)
  })

  it('forgets ids that are no longer listed, so storage stays small', () => {
    const s = store({ [READ_KEY]: JSON.stringify(['release-2020-01-01']) })
    markRead(s, [], list, '2026-10-14')
    expect(JSON.parse(s.getItem(READ_KEY)!)).toEqual([])
  })

  it('survives corrupt storage', () => {
    const s = store({ [READ_KEY]: '{oops' })
    expect(readIds(s, '2026-10-14').size).toBe(0)
  })
})
