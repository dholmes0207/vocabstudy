import { useEffect, useRef } from 'react'
import { useSettings } from '@/store/settingsStore'
import { useActivity, type ActivityKind } from '@/store/activityStore'

/**
 * Counts one finished session of `kind` for the current pack when `done` turns
 * true (store/activityStore.ts, read by the learning path). A session that is
 * restarted and finished again counts again.
 */
export function useLogActivity(kind: ActivityKind, done: boolean): void {
  const code = useSettings((s) => s.currentLang)
  const log = useActivity((s) => s.log)
  const logged = useRef(false)
  useEffect(() => {
    if (!done) {
      logged.current = false
      return
    }
    if (logged.current) return
    logged.current = true
    log(code, kind)
  }, [done, code, kind, log])
}
