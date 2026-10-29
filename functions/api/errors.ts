import { sanitizeReport, signature } from '../../src/lib/errorReport'
import { type Ctx, adminRest } from '../_shared'

// POST /api/errors — a scrubbed error report from a learner's browser
// (docs/design/error-reports.md). Always logged to the Pages Functions log;
// also grouped into public.client_errors for the Admin page once that table
// exists (supabase/schema.sql). Answers 204 either way: a report must never
// turn into a second error on the page.

const MAX_BODY = 8192

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  // Reports only come from our own pages; anything else is noise or abuse.
  const origin = ctx.request.headers.get('Origin')
  // Compared as text: browsers can send "Origin: null", and new URL('null') throws.
  if (origin && origin !== new URL(ctx.request.url).origin)
    return new Response(null, { status: 403 })

  const text = await ctx.request.text()
  if (text.length > MAX_BODY) return new Response(null, { status: 413 })
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  const report = sanitizeReport(raw)
  if (!report) return new Response(null, { status: 400 })

  const sig = signature(report)
  console.error(
    `[client-error] ${sig} ${report.kind} ${report.path} ${report.release} ${report.message}`
  )
  try {
    const r = await adminRest(ctx.env, '/rpc/report_client_error', {
      method: 'POST',
      body: JSON.stringify({
        p_signature: sig,
        p_message: report.message,
        p_stack: report.stack,
        p_path: report.path,
        p_release: report.release,
        p_kind: report.kind,
      }),
    })
    // 404 = the table/function is not created yet; the log line above still has it.
    if (!r.ok && r.status !== 404) console.warn(`[client-error] could not store: ${r.status}`)
  } catch {
    // Database unreachable: the log line is enough.
  }
  return new Response(null, { status: 204 })
}
