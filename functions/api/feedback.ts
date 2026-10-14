import { checkFeedback } from '../../src/lib/feedback'
import { type Ctx, adminRest, getUser, json } from '../_shared'

// POST /api/feedback — the in-app "Send feedback" form (docs/design/feedback.md).
// Guests may write too; a signed-in learner's account is attached so deleting
// the account deletes their feedback (ON DELETE CASCADE).

const MAX_BODY = 4096

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  const origin = ctx.request.headers.get('Origin')
  if (origin && new URL(origin).host !== new URL(ctx.request.url).host)
    return json({ error: 'forbidden' }, 403)
  const text = await ctx.request.text()
  if (text.length > MAX_BODY) return json({ error: 'too_large' }, 413)
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return json({ error: 'bad_json' }, 400)
  }
  const checked = checkFeedback(raw)
  if (!checked.ok) return json({ error: checked.reason[0], reason: checked.reason }, 400)
  const f = checked.value
  const user = await getUser(ctx.env, ctx.request).catch(() => null)

  const r = await adminRest(ctx.env, '/rpc/submit_feedback', {
    method: 'POST',
    body: JSON.stringify({
      p_user: user?.id ?? null,
      p_name: f.name,
      p_message: f.message,
      p_rating: f.rating,
      p_allow_quote: f.allowQuote,
      p_page: f.page,
    }),
  }).catch(() => null)
  // 404: the table is not created yet (supabase/schema.sql not re-run).
  if (!r || r.status === 404) return json({ error: 'not_ready' }, 503)
  if (!r.ok) return json({ error: 'store_failed' }, 502)
  if ((await r.json()) !== true) return json({ error: 'busy' }, 429)
  console.warn(`[feedback] ${f.rating ?? '-'}★ quote=${f.allowQuote} ${f.page}`)
  return json({ ok: true })
}
