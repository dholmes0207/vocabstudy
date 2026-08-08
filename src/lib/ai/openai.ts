import { buildMessages, type BuildOptions, type ChatTurn } from './systemPrompt'

// ============================================================================
// OpenAI Chat Completions client for the o4-mini study assistant.
// Runs client-side with the user's own key ("bring your own key"). Errors are
// mapped to friendly Vietnamese messages and never leak the key (GR-5).
// ============================================================================

export interface AIConfig {
  apiKey: string
  /** Model id, e.g. "o4-mini". */
  model: string
  /** API base, e.g. "https://api.openai.com/v1" (configurable for a proxy). */
  baseUrl: string
}

export class AIError extends Error {}

function mapError(status: number, detail: string): string {
  switch (status) {
    case 401:
      return 'API key không hợp lệ hoặc đã hết hạn. Kiểm tra lại key trong Cài đặt nhé.'
    case 403:
      return 'Key không có quyền dùng model này. Hãy kiểm tra tài khoản OpenAI của bạn.'
    case 404:
      return 'Không tìm thấy model. Kiểm tra tên model trong Cài đặt (mặc định: o4-mini).'
    case 429:
      return 'Đã vượt hạn mức hoặc gọi quá nhanh. Đợi một lát rồi thử lại nhé.'
    case 400:
      return detail ? `Yêu cầu không hợp lệ: ${detail}` : 'Yêu cầu không hợp lệ.'
    default:
      if (status >= 500) return 'Máy chủ OpenAI đang gặp sự cố. Thử lại sau ít phút nhé.'
      return detail || 'Có lỗi khi gọi trợ lý AI. Thử lại nhé.'
  }
}

/** Send the conversation to the model and return the assistant's reply text. */
export async function chat(
  history: ChatTurn[],
  cfg: AIConfig,
  opts: BuildOptions = {},
  signal?: AbortSignal,
): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: buildMessages(history, opts),
        // o4-mini is a reasoning model: use max_completion_tokens (not max_tokens),
        // keep effort low for fast, cheap tutor answers, and omit temperature.
        max_completion_tokens: 2000,
        reasoning_effort: 'low',
      }),
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new AIError('Không kết nối được tới OpenAI. Kiểm tra mạng (hoặc CORS/proxy) rồi thử lại.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error?.message ?? ''
    } catch {
      /* ignore parse errors */
    }
    throw new AIError(mapError(res.status, detail))
  }

  const data = await res.json()
  const content: string | undefined = data?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new AIError('Trợ lý chưa trả lời được (có thể do giới hạn token). Thử hỏi ngắn gọn hơn nhé.')
  return content
}
