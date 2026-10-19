import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, LogIn, Send, User2 } from 'lucide-react'
import { useContextStore, type PageContext } from '@/store/contextStore'
import { useAuth } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'
import { preCheckInput } from '@/lib/ai/guardrail'
import { suggestQuestions } from '@/lib/ai/suggestions'
import { quotaHint } from '@/lib/quota'
import Markdown from '@/components/Markdown'
import { useT, useUiLang } from '@/lib/i18n'
import { useSettings } from '@/store/settingsStore'
import { useTargetLang } from '@/hooks/useTargetLang'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

/** The opening message, naming the language being studied (Tiếng Anh, Tiếng Hàn…). */
const greeting = (vi: string, en: string): [vi: string, en: string] => [
  `Chào bạn 👋 Mình là trợ lý học từ vựng ${vi}. Hỏi mình về nghĩa, cách dùng, ví dụ, cách phân biệt hay mẹo nhớ từ nhé. (Mình chỉ hỗ trợ học từ vựng.)`,
  `Hi 👋 I'm your ${en} vocabulary tutor. Ask me about meanings, usage, examples, differences between words or memory tricks. (I only help with vocabulary.)`,
]

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
  const user = useAuth((s) => s.user)
  const authStatus = useAuth((s) => s.status)
  const ctx = useContextStore()
  const t = useT()
  const lang = useUiLang()
  const currentLang = useSettings((s) => s.currentLang)
  const L = useTargetLang()

  const [configured, setConfigured] = useState<null | boolean>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [warn, setWarn] = useState<string | null>(null)
  // Set from the server's reply; null whenever there is no cap or the
  // counter was unreachable, in which case the learner is told nothing.
  const [quotaNote, setQuotaNote] = useState<string | null>(null)
  const idRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const nextId = () => ++idRef.current

  const send = async (raw: string) => {
    if (loading) return
    const text = raw.trim()
    const pc = preCheckInput(text, lang)
    if (!pc.ok) {
      setWarn(pc.message ?? null)
      return
    }
    setWarn(null)
    const userMsg: Msg = { id: nextId(), role: 'user', content: text }
    const history = [...messages.filter((m) => !m.isError), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { reply, remaining } = await api.aiChat({
        history,
        level,
        context: contextText(ctx),
        lang,
        target: currentLang,
      })
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: reply }])
      setQuotaNote(quotaHint(remaining, lang))
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : t(
              'Có lỗi khi gọi trợ lý. Thử lại nhé.',
              'Something went wrong with the tutor. Try again.'
            )
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', content: msg, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  // Check server AI availability once logged in.
  useEffect(() => {
    if (!user) return
    let alive = true
    api
      .aiStatus()
      .then((r) => {
        if (!alive) return
        setConfigured(r.configured)
        // Opened by a screen with a question ready (contextStore.ask)? Ask it.
        const queued = r.configured ? useContextStore.getState().takeAsk() : null
        if (queued) void send(queued)
      })
      .catch(() => alive && setConfigured(false))
    return () => {
      alive = false
    }
    // `send` is recreated every render; only a new user should re-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // A question queued by another screen (contextStore.ask) while the chat is
  // already open: send it as it arrives. One queued before the chat opened is
  // sent when the availability check comes back (see above).
  useEffect(() => {
    if (!user || configured !== true) return
    return useContextStore.subscribe((s) => {
      if (!s.pendingAsk || loading) return
      const text = useContextStore.getState().takeAsk()
      if (text) void send(text)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, configured, loading, messages])

  // A returning learner (cached) can chat while the session check finishes.
  if (authStatus === 'loading' && !user) return <Centered>{t('Đang tải…', 'Loading…')}</Centered>
  if (!user) return <LoginPrompt onClose={onClose} />
  if (configured === false) return <NotConfigured admin={user.role === 'admin'} onClose={onClose} />

  const suggestions = suggestQuestions(ctx, level, lang)

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
        <Bubble role="assistant" content={t(...greeting(L.vi, L.en))} />
        {ctx.word && messages.length === 0 && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            💡{' '}
            {t(
              `Mình biết bạn đang xem từ "${ctx.word.word}".`,
              `I can see you're looking at "${ctx.word.word}".`
            )}
          </p>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
        ))}
        {quotaNote && !loading && (
          <p className="text-center text-xs text-amber-700 dark:text-amber-400">⏳ {quotaNote}</p>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
              <Bot className="h-4 w-4" />
            </span>
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
            </span>
          </div>
        )}
        {messages.length === 0 && !loading && configured && (
          <div className="pt-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('Gợi ý câu hỏi', 'Suggested questions')}
            </p>
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

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {warn && <p className="mb-2 text-sm text-amber-700 dark:text-amber-400">{warn}</p>}
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
            placeholder={t(`Hỏi về một từ ${L.vi}…`, `Ask about a ${L.en} word…`)}
            className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn-primary h-11 w-11 shrink-0 !px-0"
            aria-label={t('Gửi', 'Send')}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Bubble({
  role,
  content,
  isError,
}: {
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full shadow-sm ${
          isUser
            ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
        }`}
      >
        {isUser ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-md bg-brand-600 text-white'
            : isError
              ? 'rounded-bl-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900/60'
              : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
        }`}
      >
        {isUser || isError ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <Markdown content={content} />
        )}
      </div>
    </div>
  )
}

function Dot({ delay = '0s' }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center p-6 text-sm text-slate-500 dark:text-slate-400">
      {children}
    </div>
  )
}

function LoginPrompt({ onClose }: { onClose?: () => void }) {
  const t = useT()
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Bot className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">
          {t('Trợ lý AI học từ vựng', 'AI vocabulary tutor')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Đăng nhập để trò chuyện với trợ lý (miễn phí, tiến độ được lưu theo tài khoản).',
            'Sign in to chat with the tutor (free; progress is saved to your account).'
          )}
        </p>
        <Link to="/login" onClick={onClose} className="btn-primary mt-4">
          <LogIn className="h-4 w-4" /> {t('Đăng nhập / Đăng ký', 'Sign in / Sign up')}
        </Link>
      </div>
    </div>
  )
}

function NotConfigured({ admin, onClose }: { admin: boolean; onClose?: () => void }) {
  const t = useT()
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Bot className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">
          {t('Trợ lý chưa sẵn sàng', 'Tutor not ready yet')}
        </h2>
        {admin ? (
          <>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Bạn cần thêm một AI provider (API key) ở trang Quản trị để bật trợ lý.',
                'Add an AI provider (API key) on the Admin page to turn the tutor on.'
              )}
            </p>
            <Link to="/admin" onClick={onClose} className="btn-primary mt-4">
              {t('Cấu hình trong Quản trị', 'Set it up in Admin')}
            </Link>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Trợ lý chưa được bật. Nhờ quản trị viên (giáo viên) cấu hình giúp bạn nhé.',
              'The tutor is not switched on yet. Ask your admin (teacher) to set it up.'
            )}
          </p>
        )}
      </div>
    </div>
  )
}
