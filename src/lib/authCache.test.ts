import { describe, expect, it } from 'vitest'
import { parseCachedUser } from './authCache'

const good = {
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  email: 'hoc@vien.vn',
  name: 'Lan',
  role: 'student',
  status: 'active',
}

describe('parseCachedUser', () => {
  it('restores an active user', () => {
    expect(parseCachedUser(JSON.stringify(good))).toEqual(good)
  })

  it('ignores anything missing, broken or half-formed', () => {
    expect(parseCachedUser(null)).toBeNull()
    expect(parseCachedUser('{not json')).toBeNull()
    expect(parseCachedUser(JSON.stringify({ email: 'x@y.z' }))).toBeNull()
  })

  it('never shows a pending or locked account as signed in', () => {
    expect(parseCachedUser(JSON.stringify({ ...good, status: 'pending' }))).toBeNull()
    expect(parseCachedUser(JSON.stringify({ ...good, status: 'locked' }))).toBeNull()
  })

  it('downgrades an unknown role to student', () => {
    expect(parseCachedUser(JSON.stringify({ ...good, role: 'superuser' }))?.role).toBe('student')
  })
})
