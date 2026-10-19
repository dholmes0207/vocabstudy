import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Square } from 'lucide-react'
import type { GrammarExample } from '@/lib/grammar'
import {
  isRecognitionSupported,
  listenOnce,
  recognitionErrorMessage,
  type ListenHandle,
  type RecognitionFailure,
} from '@/lib/speech'
import { scoreSentence, type SentenceScore } from '@/lib/sentenceScore'
import { stopPronounce } from '@/lib/audio'
import { useT } from '@/lib/i18n'
import SpeakButton from '@/components/SpeakButton'

// "Nói thành tiếng" (docs/design/grammar.md): after reading how a pattern works,
// say a few of its examples out loud and see which words came through. Uses
// the browser's speech recognition, like the Speaking page; nothing is stored.

/** Examples to say per lesson. */
export const SPEAK_COUNT = 3

type Row =
  | { kind: 'idle' }
  | { kind: 'listening' }
  | { kind: 'scored'; result: SentenceScore }
  | { kind: 'error'; reason: RecognitionFailure }

export default function SpeakAloud({
  examples,
  lang,
}: {
  examples: GrammarExample[]
  lang: string
}) {
  const t = useT()
  const [supported] = useState(isRecognitionSupported)
  const items = examples.slice(0, SPEAK_COUNT)
  const [rows, setRows] = useState<Row[]>(() => items.map(() => ({ kind: 'idle' })))
  const handle = useRef<ListenHandle | null>(null)
  useEffect(() => () => handle.current?.abort(), [])

  const setRow = (i: number, row: Row) => setRows((rs) => rs.map((r, j) => (j === i ? row : r)))

  const start = (i: number) => {
    // One microphone at a time: a row still listening goes back to idle.
    handle.current?.abort()
    stopPronounce()
    setRows((rs) =>
      rs.map((r, j) =>
        j === i ? { kind: 'listening' } : r.kind === 'listening' ? { kind: 'idle' } : r
      )
    )
    handle.current = listenOnce({
      lang,
      onResult: (alts) =>
        setRow(i, { kind: 'scored', result: scoreSentence(items[i].en, alts, lang) }),
      onError: (reason) => setRow(i, { kind: 'error', reason }),
      onEnd: () => {
        handle.current = null
      },
    })
  }

  const done = rows.filter((r) => r.kind === 'scored' && r.result.verdict !== 'retry').length

  return (
    <section className="card p-5" aria-labelledby="speak-aloud">
      <h2 id="speak-aloud" className="font-bold">
        {t('Nói thành tiếng', 'Say it aloud')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Hiểu một câu và nói được câu đó là hai chuyện khác nhau. Nghe mẫu, rồi bấm micro và đọc to từng câu.',
          'Understanding a sentence and saying it are two different things. Hear the model, then tap the mic and read each one aloud.'
        )}
      </p>
      {!supported && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {t(
            'Trình duyệt này chưa chấm được giọng nói (thử Chrome, Edge hoặc Safari). Bạn vẫn nghe mẫu và đọc theo được.',
            'This browser cannot score speech yet (try Chrome, Edge or Safari). You can still hear the model and read along.'
          )}
        </p>
      )}

      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((ex, i) => {
          const row = rows[i]
          const listening = row.kind === 'listening'
          return (
            <li key={ex.en} className="space-y-2 py-3">
              <div className="flex items-start gap-3">
                <SpeakButton text={ex.en} lang={lang} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {row.kind === 'scored'
                      ? row.result.pieces.map((p, k) =>
                          p.missed ? (
                            <mark
                              key={k}
                              className="rounded bg-rose-100 px-0.5 text-rose-700 underline decoration-wavy dark:bg-rose-950/60 dark:text-rose-200"
                            >
                              {p.text}
                            </mark>
                          ) : (
                            <span key={k}>{p.text}</span>
                          )
                        )
                      : ex.en}
                  </p>
                  {ex.read && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{ex.read}</p>
                  )}
                  <p className="text-sm text-slate-500">{ex.vi}</p>
                </div>
                {supported && (
                  <button
                    type="button"
                    onClick={() => (listening ? handle.current?.stop() : start(i))}
                    aria-pressed={listening}
                    aria-label={
                      listening
                        ? t('Dừng nghe', 'Stop listening')
                        : t('Nói câu này', 'Say this one')
                    }
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                      listening
                        ? 'animate-pulse bg-rose-500 text-white'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300'
                    }`}
                  >
                    {listening ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}
              </div>
              <RowFeedback row={row} />
            </li>
          )
        })}
      </ul>

      {supported && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {done > 0 &&
            t(`Đã nói đạt ${done}/${items.length} câu. `, `${done} of ${items.length} said well. `)}
          {t(
            'Chấm bằng nhận dạng giọng nói của trình duyệt; app không lưu ghi âm.',
            'Scored by your browser’s speech recognition; the app keeps no recording.'
          )}{' '}
          <Link to="/privacy" className="underline">
            {t('Quyền riêng tư', 'Privacy')}
          </Link>
        </p>
      )}
    </section>
  )
}

function RowFeedback({ row }: { row: Row }) {
  const t = useT()
  if (row.kind === 'listening')
    return (
      <p className="text-sm font-medium text-rose-600 dark:text-rose-300" aria-live="polite">
        {t('Đang nghe… đọc to câu này.', 'Listening… read it aloud.')}
      </p>
    )
  if (row.kind === 'error')
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300" aria-live="polite">
        {recognitionErrorMessage(row.reason)}
      </p>
    )
  if (row.kind !== 'scored') return null
  const { score, verdict, heard } = row.result
  return (
    <div className="text-sm" aria-live="polite">
      <p
        className={`font-semibold ${
          verdict === 'great'
            ? 'text-emerald-700 dark:text-emerald-300'
            : verdict === 'good'
              ? 'text-brand-700 dark:text-brand-300'
              : 'text-amber-700 dark:text-amber-300'
        }`}
      >
        {verdict === 'great'
          ? t(`🎉 Rất tốt — ${score}%`, `🎉 Great — ${score}%`)
          : verdict === 'good'
            ? t(
                `👍 Khá tốt — ${score}%. Chỗ tô đỏ máy chưa nghe rõ.`,
                `👍 Good — ${score}%. The red parts didn’t come through.`
              )
            : t(
                `🔁 Thử lại nhé — ${score}%. Nghe mẫu rồi đọc chậm, rõ từng chữ.`,
                `🔁 Try again — ${score}%. Hear the model, then read slowly and clearly.`
              )}
      </p>
      {heard && (
        <p className="text-slate-500 dark:text-slate-400">
          {t('Máy nghe được:', 'Heard:')} “{heard}”
        </p>
      )}
    </div>
  )
}
