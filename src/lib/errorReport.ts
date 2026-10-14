// First-party error reports (docs/design/error-reports.md): when the app breaks
// in someone's browser, a short, scrubbed description goes to /api/errors so it
// can be fixed before anyone has to write in. No account, email, learning
// content or query string ever leaves the browser this way.
//
// The pure parts (scrubbing, the shape check, the grouping signature) are shared
// by the browser and the Pages Function so both apply exactly the same rules.

export interface ErrorReport {
  /** The error message, scrubbed and cut to 300 characters. */
  message: string
  /** The stack trace, scrubbed and cut to 2000 characters. */
  stack: string
  /** The page path only — never the query string or fragment. */
  path: string
  /** Which build was running (short commit). */
  release: string
  /** Where it was caught: a render crash, an uncaught error, a rejected promise. */
  kind: 'render' | 'error' | 'rejection'
}

const MAX_MESSAGE = 300
const MAX_STACK = 2000

/**
 * Remove anything that could identify a person or leak a secret: emails,
 * tokens, query strings and fragments in URLs, long digit runs.
 */
export function scrub(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '<token>')
    .replace(/\b(sb_[a-z]+_)[\w-]+/gi, '$1<key>')
    .replace(/(https?:\/\/[^\s?#)]+)[?#][^\s):]*/g, '$1') // keeps a stack's :line:col
    .replace(/\d{6,}/g, '<n>')
}

/** Errors that are not ours to fix: extensions, cross-origin noise, benign browser quirks. */
export function isNoise(message: string, stack = ''): boolean {
  return (
    /^Script error\.?$/i.test(message) ||
    /ResizeObserver loop/i.test(message) ||
    /AbortError|The user aborted a request/i.test(message) ||
    /(chrome|moz|safari(-web)?)-extension:\/\//i.test(stack + message)
  )
}

/** A clean report for this error, or null when it should not be sent. */
export function buildReport(
  error: unknown,
  kind: ErrorReport['kind'],
  path: string,
  release: string
): ErrorReport | null {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? 'Unknown error')
  const stack = error instanceof Error ? (error.stack ?? '') : ''
  if (isNoise(message, stack)) return null
  return {
    message: scrub(message).slice(0, MAX_MESSAGE),
    stack: scrub(stack).slice(0, MAX_STACK),
    path: path.split(/[?#]/)[0].slice(0, 200) || '/',
    release: release.slice(0, 40),
    kind,
  }
}

/**
 * The same report, re-checked on the server — never trust what a browser
 * sends. Returns null for anything that is not a well-formed report.
 */
export function sanitizeReport(raw: unknown): ErrorReport | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const kind = r.kind
  if (kind !== 'render' && kind !== 'error' && kind !== 'rejection') return null
  if (typeof r.message !== 'string' || !r.message.trim()) return null
  const str = (v: unknown, max: number) => (typeof v === 'string' ? scrub(v).slice(0, max) : '')
  return {
    message: str(r.message, MAX_MESSAGE),
    stack: str(r.stack, MAX_STACK),
    path: str(r.path, 200).split(/[?#]/)[0] || '/',
    release: str(r.release, 40),
    kind,
  }
}

/**
 * Groups repeats of the same bug: the message plus the first frame of the
 * stack, with line/column numbers kept (they pin the bug) but query strings
 * already gone. A short FNV-1a hash — not for security, just a stable key.
 */
export function signature(report: ErrorReport): string {
  const firstFrame = report.stack.split('\n').find((l) => /\bat\b|@/.test(l)) ?? ''
  const key = `${report.message}|${firstFrame.trim()}`
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
