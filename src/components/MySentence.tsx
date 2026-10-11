import { useState } from 'react'
import { Bot, PencilLine } from 'lucide-react'
import type { Word } from '@/types'
import { findWordInSentence } from '@/lib/wordForms'
import { useNotes, useMySentence } from '@/store/notesStore'
import { useAuth } from '@/store/authStore'
import { useContextStore } from '@/store/contextStore'
import HighlightExample from './HighlightExample'
import { useT } from '@/lib/i18n'

interface Props {
  word: Word
  lang: string
}

/**
 * "Câu của bạn": make up one sentence with the word. Optional, but the single
 * most effective thing a learner can do to keep a word — a sentence about
 * their own life is far more memorable than any example we could write.
 *
 * The only check is that the word is actually in it (any form: "went" counts
 * for "go"); grammar is left to the AI tutor, one tap away when logged in.
 */
export default function MySentence({ word, lang }: Props) {
  const saved = useMySentence(lang, word.id)
  const setSentence = useNotes((s) => s.setSentence)
  const loggedIn = useAuth((s) => Boolean(s.user))
  const ask = useContextStore((s) => s.ask)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const t = useT()

  const headword = word.word.split('/')[0].trim()

  const save = () => {
    const text = draft.trim()
    if (!text) {
      // Clearing an existing sentence and saving removes it.
      if (saved) setSentence(lang, word.id, '')
      setEditing(false)
      return
    }
    if (!findWordInSentence(word.word, text, word.posCategory)) {
      setHint(
        t(
          `Câu chưa có từ “${headword}” — thêm vào rồi lưu nhé.`,
          `Your sentence doesn't use “${headword}” yet — add it, then save.`
        )
      )
      return
    }
    setSentence(lang, word.id, text)
    setEditing(false)
    setHint(null)
  }

  const askAi = (text: string) =>
    ask(
      t(
        `Mình vừa tự đặt câu với từ "${headword}": "${text}". Câu này đã đúng và tự nhiên chưa? ` +
          'Nếu chưa, sửa giúp mình và giải thích ngắn gọn nhé.',
        `I wrote a sentence with "${headword}": "${text}". Is it correct and natural? ` +
          'If not, please fix it and explain briefly.'
      )
    )

  if (saved && !editing) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-left text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          ✍️ {t('Câu của bạn', 'Your sentence')}
        </p>
        <p className="mt-1 text-slate-700 dark:text-slate-200">
          <HighlightExample sentence={saved.text} word={word.word} pos={word.posCategory} />
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className="btn-ghost h-8 !px-2 text-xs"
            onClick={() => {
              setDraft(saved.text)
              setEditing(true)
            }}
          >
            <PencilLine className="h-3.5 w-3.5" /> {t('Sửa', 'Edit')}
          </button>
          {loggedIn && (
            <button className="btn-ghost h-8 !px-2 text-xs" onClick={() => askAi(saved.text)}>
              <Bot className="h-3.5 w-3.5" /> {t('Nhờ AI xem câu', 'Ask AI to check')}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-3.5 text-left text-sm dark:border-slate-700">
      <label
        htmlFor={`my-sentence-${word.id}`}
        className="text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        ✍️ {t(`Tự đặt 1 câu với “${headword}”`, `Write your own sentence with “${headword}”`)}{' '}
        <span className="normal-case">{t('(không bắt buộc)', '(optional)')}</span>
      </label>
      <p className="mt-0.5 text-xs text-slate-400">
        {t(
          'Câu về chính cuộc sống của bạn — cách nhớ từ lâu nhất.',
          'A sentence about your own life — the most lasting way to remember a word.'
        )}
      </p>
      <div className="mt-2 flex gap-2">
        <input
          id={`my-sentence-${word.id}`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setHint(null)
          }}
          onFocus={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save()
            }
          }}
          placeholder={t(
            `Gõ một câu tiếng Anh có từ “${headword}”…`,
            `Type an English sentence with “${headword}”…`
          )}
          maxLength={200}
          autoCapitalize="sentences"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          className="btn-secondary shrink-0"
          onClick={save}
          disabled={!draft.trim() && !saved}
        >
          {t('Lưu', 'Save')}
        </button>
        {saved && (
          <button
            className="btn-ghost shrink-0 !px-2"
            onClick={() => {
              setEditing(false)
              setHint(null)
            }}
          >
            Huỷ
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">{hint}</p>}
    </div>
  )
}
