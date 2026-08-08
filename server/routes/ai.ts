import { Router } from 'express'
import { z } from 'zod'
import { db, publicProvider, type ProviderRow } from '../db.ts'
import { requireAuth, type AuthedRequest } from '../auth.ts'
import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL } from '../env.ts'
import { buildMessages, type ChatTurn } from '../../src/lib/ai/systemPrompt.ts'
import { levelInfo } from '../../src/lib/level.ts'

// Server-side AI proxy: the OpenAI key, guardrail, level and page-context all
// live here. Students call this endpoint; they never see a key.

const router = Router()
router.use(requireAuth)

// Simple per-user daily usage cap (in-memory; resets on restart). Roadmap:
// persist to a usage_logs table + per-class limits.
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 100
const usage = new Map<string, number>()
function usageKey(userId: number): string {
  return `${userId}:${new Date().toISOString().slice(0, 10)}`
}

/** Active providers for the student picker — label + model only, NEVER keys. */
router.get('/providers', (_req, res) => {
  const rows = db.prepare('SELECT * FROM ai_providers WHERE isActive = 1 ORDER BY createdAt ASC').all() as ProviderRow[]
  const providers = rows.map(publicProvider)
  const configured = providers.length > 0 || !!OPENAI_API_KEY
  res.json({ configured, providers })
})

function resolveProvider(providerId?: number): { apiKey: string; model: string; baseUrl: string } | null {
  if (providerId) {
    const p = db.prepare('SELECT * FROM ai_providers WHERE id = ? AND isActive = 1').get(providerId) as ProviderRow | undefined
    if (p) return { apiKey: p.apiKey, model: p.model, baseUrl: p.baseUrl }
  }
  const active = db.prepare('SELECT * FROM ai_providers WHERE isActive = 1 ORDER BY createdAt ASC LIMIT 1').get() as ProviderRow | undefined
  if (active) return { apiKey: active.apiKey, model: active.model, baseUrl: active.baseUrl }
  if (OPENAI_API_KEY) return { apiKey: OPENAI_API_KEY, model: OPENAI_MODEL, baseUrl: OPENAI_BASE_URL }
  return null
}

const chatSchema = z.object({
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(20),
  level: z.number().int().min(1).max(5).optional(),
  context: z.string().max(600).optional(),
  providerId: z.number().int().optional(),
})

router.post('/chat', async (req: AuthedRequest, res) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Yêu cầu không hợp lệ' })
    return
  }
  // Daily quota (per user).
  const k = usageKey(req.user!.id)
  const used = usage.get(k) ?? 0
  if (used >= DAILY_LIMIT) {
    res.status(429).json({ error: `Hôm nay bạn đã dùng hết ${DAILY_LIMIT} lượt hỏi AI. Mai học tiếp nhé!` })
    return
  }

  const provider = resolveProvider(parsed.data.providerId)
  if (!provider) {
    res.status(503).json({ error: 'Trợ lý AI chưa được cấu hình. Liên hệ quản trị viên.' })
    return
  }

  const { history, level, context } = parsed.data
  const messages = buildMessages(history as ChatTurn[], {
    levelInstruction: level ? levelInfo(level).aiInstruction : undefined,
    contextText: context,
  })

  try {
    const r = await fetch(`${provider.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: provider.model, messages, max_completion_tokens: 2000, reasoning_effort: 'low' }),
    })
    if (!r.ok) {
      let detail = ''
      try {
        detail = (await r.json())?.error?.message ?? ''
      } catch {
        /* ignore */
      }
      // Don't leak the key or raw upstream internals to the client.
      const msg =
        r.status === 401 || r.status === 403
          ? 'Trợ lý AI đang gặp sự cố cấu hình. Liên hệ quản trị viên.'
          : r.status === 429
            ? 'Trợ lý đang quá tải. Thử lại sau ít phút nhé.'
            : `Lỗi trợ lý AI${detail ? `: ${detail}` : ''}`
      res.status(502).json({ error: msg })
      return
    }
    const data = await r.json()
    const reply: string | undefined = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      res.status(502).json({ error: 'Trợ lý chưa trả lời được. Thử hỏi ngắn gọn hơn nhé.' })
      return
    }
    usage.set(k, used + 1)
    res.json({ reply, remaining: DAILY_LIMIT - used - 1 })
  } catch {
    res.status(502).json({ error: 'Không gọi được trợ lý AI. Thử lại nhé.' })
  }
})

export default router
