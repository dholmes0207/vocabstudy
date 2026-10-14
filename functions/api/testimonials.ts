import { type Ctx, adminRest, json } from '../_shared'

// GET /api/testimonials — what real learners said, for the homepage
// (docs/design/feedback.md). Only messages whose author allowed quoting AND an
// admin featured. Empty list when there are none (the section then hides).

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  let items: unknown = []
  try {
    const r = await adminRest(
      ctx.env,
      '/feedback?select=name,message,rating&featured=eq.true&allow_quote=eq.true&order=created_at.desc&limit=6'
    )
    if (r.ok) items = await r.json()
  } catch {
    // Database unreachable: show nothing rather than an error on the homepage.
  }
  const res = json({ testimonials: items })
  res.headers.set('Cache-Control', 'public, max-age=300')
  return res
}
