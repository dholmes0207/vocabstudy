import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, KeyRound, Lock, RotateCcw, Send, User2 } from 'lucide-react'
import { useAI } from '@/store/aiStore'
import { AIError, chat } from '@/lib/ai/openai'
import { ASSISTANT_NAME } from '@/lib/ai/systemPrompt'
import { SUGGESTED_PROMPTS, preCheckInput } from '@/lib/ai/guardrail'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

const GREETING =
  'Chào bạn 👋 Mình là trợ lý học từ vựng tiếng Anh. Hỏi mình về nghĩa, cách dùng, ví dụ, cách phân biệt hay mẹo nhớ từ nhé. (Mình chỉ hỗ trợ học từ vựng tiếng Anh thôi.)'

export default function Tutor() {
  const apiKey = useAI((s) => s.apiKey)
  const model = useAI((s) => s.model)
  const baseUrl = useAI((s) => s.baseUrl)

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

  if (!apiKey) return <NotConfigured />

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
    try {
      const reply = await chat(history, { apiKey, model, baseUrl }, ac.signal)
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: reply }])
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      const msg = e instanceof AIError ? e.message : 'Có lỗi khi gọi trợ lý. Thử lại nhé.'
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: msg, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col lg:h-[calc(100dvh-6rem)]">
      {/* Header */}
      <header className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Bot className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-lg font-extrabold">
            {ASSISTANT_NAME}
            <span className="chip bg-slate-100 text-slate-500 dark:bg-slate-800">{model}</span>
          </h1>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <Lock className="h-3 w-3" /> Chỉ hỗ trợ học từ vựng tiếng Anh
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-ghost h-9 !px-3 text-sm" aria-label="Xóa hội thoại">
            <RotateCcw className="h-4 w-4" /> Xóa
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <Bubble role="assistant" content={GREETING} />
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
              <Bot className="h-4 w-4" />
            </span>
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
            </span>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Gợi ý câu hỏi</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
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
      <div className="mt-3">
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
            placeholder="Hỏi về một từ tiếng Anh… (Enter để gửi)"
            className="max-h-32 min-h-[3rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn-primary h-12 w-12 shrink-0 !px-0"
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
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
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

function NotConfigured() {
  return (
    <div className="mx-auto max-w-md py-8 text-center animate-fade-in">
      <div className="card p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Bot className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Trợ lý AI học từ vựng</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hỏi đáp về nghĩa, cách dùng, ví dụ, mẹo nhớ từ tiếng Anh. Trợ lý chỉ trả lời trong phạm vi học từ vựng.
        </p>
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-500 dark:bg-slate-800/60">
          Cần một <b>OpenAI API key</b> của riêng bạn (dùng model <code>o4-mini</code>). Key được lưu <b>trên máy bạn</b> và
          chỉ gửi tới OpenAI — không lưu ở đâu khác.
        </p>
        <Link to="/settings" className="btn-primary mt-5">
          <KeyRound className="h-4 w-4" /> Thêm API key trong Cài đặt
        </Link>
      </div>
    </div>
  )
}
