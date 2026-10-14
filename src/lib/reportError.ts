import { buildReport, signature, type ErrorReport } from './errorReport'

// Sends scrubbed error reports to /api/errors (docs/design/error-reports.md).
// Production builds only; at most a handful per page, each distinct bug once.

const RELEASE = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev'
const MAX_PER_PAGE = 5
const sent = new Set<string>()

export function reportError(error: unknown, kind: ErrorReport['kind']): void {
  if (!import.meta.env.PROD || sent.size >= MAX_PER_PAGE) return
  try {
    const report = buildReport(error, kind, location.pathname, RELEASE)
    if (!report) return
    const sig = signature(report)
    if (sent.has(sig)) return
    sent.add(sig)
    const body = JSON.stringify(report)
    const queued = navigator.sendBeacon?.(
      '/api/errors',
      new Blob([body], { type: 'application/json' })
    )
    if (!queued)
      void fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
  } catch {
    // Reporting must never become the error.
  }
}

/** Catch what nothing else catches: uncaught errors and rejected promises. */
export function installErrorReporting(): void {
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, 'error'))
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'rejection'))
}
