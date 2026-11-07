import { useCallback, useEffect, useState } from 'react'

/**
 * An exam practice bank (lib/practiceBank.ts), e.g. loadToeicBank: null while
 * it loads, `error` when it could not be fetched; `retry` asks again.
 */
export function usePracticeBank<T>(load: () => Promise<T>): {
  bank: T | null
  error: boolean
  retry: () => void
} {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ bank: T | null; error: boolean }>({
    bank: null,
    error: false,
  })
  useEffect(() => {
    let alive = true
    load()
      .then((bank) => alive && setState({ bank, error: false }))
      .catch(() => alive && setState({ bank: null, error: true }))
    return () => {
      alive = false
    }
  }, [load, attempt])
  const retry = useCallback(() => {
    setState({ bank: null, error: false })
    setAttempt((n) => n + 1)
  }, [])
  return { ...state, retry }
}
