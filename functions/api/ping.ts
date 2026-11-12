import { epochDay } from '../../src/lib/date'
import { WindowLimiter } from '../../src/lib/rateLimit'
import { sanitizePing } from '../../src/lib/usagePing'
import { type Ctx, adminRest } from '../_shared'

// POST /api/ping — the anonymous "this device learned today" signal
// (docs/design/usage-metrics.md). Kept per device and day in
// public.usage_days once that table exists (supabase/schema.sql). The IP
// address is only used here, in memory, to slow down a flood; it is never
// logged or stored. Answers 204 either way: the browser never reads it.

const MAX_BODY = 1024

// One device sends a few signals a day at most (lib/usagePing.ts sends again
// only when the day says more), so 20 a minute per address leaves room for a
// classroom behind one IP. Per isolate; the database also caps new devices.
const perAddress = new WindowLimiter(20, 60_000)

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  // Signals only come from our own pages.
  const origin = ctx.request.headers.get('Origin')
  if (origin && origin !== new URL(ctx.request.url).origin)
    return new Response(null, { status: 403 })
  const ip = ctx.request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (!perAddress.allow(ip, Date.now())) return new Response(null, { status: 429 })

  const text = await ctx.request.text()
  if (text.length > MAX_BODY) return new Response(null, { status: 413 })
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  const ping = sanitizePing(raw, epochDay())
  if (!ping) return new Response(null, { status: 400 })

  try {
    const r = await adminRest(ctx.env, '/rpc/record_usage_day', {
      method: 'POST',
      body: JSON.stringify({
        p_device: ping.device,
        p_day: ping.day,
        p_pack: ping.pack,
        p_answers: ping.answers,
        p_new_words: ping.newWords,
        p_first_lesson: ping.firstLesson,
        p_signed_in: ping.signedIn,
        p_installed: ping.installed,
      }),
    })
    // 404 = the table/function is not created yet; nothing to do until it is.
    if (!r.ok && r.status !== 404) console.warn(`[ping] could not store: ${r.status}`)
  } catch {
    // Database unreachable: a missed signal only makes one day look quieter.
  }
  return new Response(null, { status: 204 })
}
