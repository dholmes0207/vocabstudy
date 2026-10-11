import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

/**
 * How many sign-ups wait for approval — admins only, so the avatar can show a
 * dot instead of the queue quietly growing. Refetched whenever `refreshKey`
 * changes (e.g. each time the menu opens). Failures just show no badge.
 */
export function usePendingSignups(enabled: boolean, refreshKey: unknown): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    api
      .adminUsers()
      .then((r) => {
        if (alive) setCount(r.users.filter((u) => u.status === 'pending').length)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [enabled, refreshKey])

  return enabled ? count : 0
}
