import { useCallback, useEffect, useState } from 'react'
import { loadToeicBank, type ToeicBank } from '@/lib/toeicBank'

/**
 * The TOEIC practice bank (lib/toeicBank.ts): null while it loads, `error` when
 * it could not be fetched; `retry` asks again.
 */
export function useToeicBank(): { bank: ToeicBank | null; error: boolean; retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ bank: ToeicBank | null; error: boolean }>({
    bank: null,
    error: false,
  })
  useEffect(() => {
    let alive = true
    loadToeicBank()
      .then((bank) => alive && setState({ bank, error: false }))
      .catch(() => alive && setState({ bank: null, error: true }))
    return () => {
      alive = false
    }
  }, [attempt])
  const retry = useCallback(() => {
    setState({ bank: null, error: false })
    setAttempt((n) => n + 1)
  }, [])
  return { ...state, retry }
}
