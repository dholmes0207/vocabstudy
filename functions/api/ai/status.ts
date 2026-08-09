import { type Ctx, json } from '../../_shared'

// GET /api/ai/status — is the AI tutor configured on the server? (no secrets leaked)
export const onRequestGet = async ({ env }: Ctx): Promise<Response> =>
  json({ configured: Boolean(env.OPENAI_API_KEY), model: env.OPENAI_MODEL || 'o4-mini' })
