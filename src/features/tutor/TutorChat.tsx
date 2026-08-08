import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, KeyRound, Send, User2 } from 'lucide-react'
import { getActiveProvider, useAI } from '@/store/aiStore'
import { useContextStore, type PageContext } from '@/store/contextStore'
import { AIError, chat } from '@/lib/ai/openai'
import { preCheckInput } from '@/lib/ai/guardrail'
import { suggestQuestions } from '@/lib/ai/suggestions'
import { levelInfo } from '@/lib/level'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

const GREETING =
  'Chào bạn 👋 Mình là trợ lý học từ vựng tiếng Anh. Hỏi mình về nghĩa, cách dùng, ví dụ, cách phân biệt hay mẹo nhớ từ nhé. (Mình chỉ hỗ trợ học từ vựng tiếng Anh.)'

function contextText(ctx: PageContext): string {
  if (ctx.word) {
    const w = ctx.word
    return (
      `Người học đang xem từ "${w.word}"${w.pos ? ` (${w.pos})` : ''} — nghĩa tiếng Việt: ${w.meaning}.` +
      (w.exampleEn ? ` Câu ví dụ trong bài: ${w.exampleEn}` : '')
    )
  }
  return `Người học đang ở màn hình: ${ctx.title}.`
}

export default function TutorChat({ level, onClose }: { level: number; onClose?: () => void }) {
  // Active provider (reactive).
  const providers = useAI((s) => s.providers)
  const selectedId = useAI((s) => s.selectedProviderId)
  const provider = providers.find((p) => p.id === selectedId) ?? providers[0] ?? null
  const configured = !!provider && provider.apiKey.length > 0

  const ctx = useContextStore()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [warn, setWarn] = useState<string | null>(null)
  const idRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])
  useEffect(() => () => abortRef.current?.abort(), [])

  if (!configured) return <NotConfigured onClose={onClose} />

  const nextId = () => ++idRef.current

  const send = async (raw: string) => {
    if (loading) return
    const text = raw.trim()
    const pc = preCheckInput(text)
    if (!pc.ok) {
      setWarn(pc.message ?? null)
      return
    }
    setWarn(null)
    const userMsg: Msg = { id: nextId(), role: 'user', content: text }
    const history = [...messages.filter((m) => !m.isError), userMsg].map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const active = getActiveProvider()!
    try {
      const reply = await chat(
        history,
        { apiKey: active.apiKey, model: active.model, baseUrl: active.baseUrl },
        { levelInstruction: levelInfo(level).aiInstruction, contextText: contextText(ctx) },
        ac.signal,
      )
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: reply }])
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      const msg = e instanceof AIError ? e.message : 'Có lỗi khi gọi trợ lý. Thử lại nhé.'
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: msg, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = suggestQuestions(ctx, level)

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4">
        <Bubble role="assistant" content={GREETING} />
        {ctx.word && messages.length === 0 && (
          <p className="text-center text-xs text-slate-400">💡 Mình biết bạn đang xem từ "{ctx.word.word}".</p>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
              <Bot className="h-4 w-4" />
            </span>
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
            </span>
          </div>
        )}
        {messages.length === 0 && !loading && (
          <div className="pt-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Gợi ý câu hỏi</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="chip border border-slate-200 px-3 py-1.5 text-left text-sm text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {warn && <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">{warn}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            rows={1}
            placeholder="Hỏi về một từ tiếng Anh…"
            className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn-primary h-11 w-11 shrink-0 !px-0"
            aria-label="Gửi"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Bubble({ role, content, isError }: { role: 'user' | 'assistant'; content: string; isError?: boolean }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser
            ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            : 'bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-300'
        }`}
      >
        {isUser ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-brand-600 text-white'
            : isError
              ? 'rounded-tl-sm bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200'
              : 'rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
        }`}
      >
        {content}
      </div>
    </div>
  )
}

function Dot({ delay = '0s' }: { delay?: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: delay }} />
}

function NotConfigured({ onClose }: { onClose?: () => void }) {
  const admin = useAI((s) => s.adminPinHash === null || s.adminUnlocked)
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Bot className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">Trợ lý AI học từ vựng</h2>
        {admin ? (
          <>
            <p className="mt-2 text-sm text-slate-500">Chưa có API key. Thêm trong Cài đặt để bật trợ lý (model o4-mini).</p>
            <Link to="/settings" onClick={onClose} className="btn-primary mt-4">
              <KeyRound className="h-4 w-4" /> Cấu hình trong Cài đặt
            </Link>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Trợ lý chưa được bật. Nhờ <b>quản trị viên</b> (giáo viên) cấu hình API key giúp bạn nhé.
          </p>
        )}
      </div>
    </div>
  )
}
