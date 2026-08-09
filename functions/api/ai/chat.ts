import { buildMessages, type ChatTurn } from '../../../src/lib/ai/systemPrompt'
import { levelInfo } from '../../../src/lib/level'
import { type Ctx, json, requireUser } from '../../_shared'

// POST /api/ai/chat — server-side AI proxy. The OpenAI key never leaves the
// Worker; the guardrail (system prompt) + level + page context are applied here.
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const user = await requireUser(env, request)
  if (user instanceof Response) return user

  if (!env.OPENAI_API_KEY) return json({ error: 'Trợ lý AI chưa được cấu hình. Liên hệ quản trị viên.' }, 503)

  let body: {
    history?: { role?: string; content?: string }[]
    level?: number
    context?: string
  }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Yêu cầu không hợp lệ' }, 400)
  }

  const raw = Array.isArray(body.history) ? body.history : []
  const turns: ChatTurn[] = raw
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string' && h.content.length <= 4000)
    .map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content as string }))
    .slice(-20)
  if (!turns.length) return json({ error: 'Yêu cầu không hợp lệ' }, 400)

  const level = typeof body.level === 'number' ? body.level : undefined
  const context = typeof body.context === 'string' ? body.context.slice(0, 600) : undefined
  const messages = buildMessages(turns, {
    levelInstruction: level ? levelInfo(level).aiInstruction : undefined,
    contextText: context,
  })

  const base = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = env.OPENAI_MODEL || 'o4-mini'

  let r: Response
  try {
    r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model, messages, max_completion_tokens: 2000, reasoning_effort: 'low' }),
    })
  } catch {
    return json({ error: 'Không gọi được trợ lý AI. Thử lại nhé.' }, 502)
  }

  if (!r.ok) {
    let detail = ''
    try {
      detail = ((await r.json()) as { error?: { message?: string } })?.error?.message ?? ''
    } catch {
      /* ignore */
    }
    const msg =
      r.status === 401 || r.status === 403
        ? 'Trợ lý AI đang gặp sự cố cấu hình. Liên hệ quản trị viên.'
        : r.status === 429
          ? 'Trợ lý đang quá tải, thử lại sau ít phút nhé.'
          : `Lỗi trợ lý AI${detail ? `: ${detail}` : ''}`
    return json({ error: msg }, 502)
  }

  const data = (await r.json()) as { choices?: { message?: { content?: string } }[] }
  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) return json({ error: 'Trợ lý chưa trả lời được. Thử hỏi ngắn gọn hơn nhé.' }, 502)
  return json({ reply })
}
