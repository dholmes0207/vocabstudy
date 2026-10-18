import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { hanVietTable, searchHanViet } from '@/lib/hanVietFamily'
import { pronounce } from '@/lib/audio'
import { useT } from '@/lib/i18n'

// "Chữ Hán qua âm Hán Việt" (docs/design/han-viet-table.md): every character
// (or Korean syllable block) that two or more words of the pack share, read the
// same Sino-Vietnamese way — one key that opens several words at once.

export default function HanVietTable() {
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const table = useMemo(() => hanVietTable(pack.words), [pack.words])
  const [query, setQuery] = useState('')
  const shown = useMemo(() => searchHanViet(table, query), [table, query])
  const zh = code === 'zh'
  const say = (text: string) => pronounce({ text, lang: pack.meta.ttsLang, rate })

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">
            {zh
              ? t('Chữ Hán qua âm Hán Việt', 'Characters by Sino-Vietnamese reading')
              : t('Gốc Hán qua âm Hán Việt', 'Sino-Korean by Sino-Vietnamese reading')}
          </span>{' '}
          <span aria-hidden="true">🀄</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {zh
            ? t(
                'Người Việt có sẵn một chìa khoá: âm Hán Việt. Biết 学 là "học" trong 学生 (học sinh) thì đoán được 学校 (học hiệu → trường học) và 学习 (học tập). Đây là những chữ xuất hiện trong ít nhất hai từ của gói.',
                'Vietnamese speakers hold a key: the Sino-Vietnamese reading. Know 学 is "học" in 学生 and you can guess 学校 and 学习. These are the characters found in at least two words of the pack.'
              )
            : t(
                'Nhiều từ tiếng Hàn gốc Hán đọc gần âm Hán Việt: 학 là "học" trong 학생 (học sinh) và 학교 (học hiệu → trường học). Đây là những âm tiết xuất hiện trong ít nhất hai từ của gói.',
                'Many Korean words come from Chinese and sound close to Sino-Vietnamese: 학 is "học" in 학생 and 학교. These are the syllables found in at least two words of the pack.'
              )}
        </p>
      </header>

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            'Tìm theo chữ hoặc âm Hán Việt (hoc, học…)',
            'Search by character or reading (hoc, học…)'
          )}
          aria-label={t('Tìm chữ', 'Search characters')}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <p className="text-sm text-slate-500" aria-live="polite">
        {query.trim()
          ? t(
              `${shown.length} kết quả`,
              shown.length === 1 ? '1 result' : `${shown.length} results`
            )
          : zh
            ? t(`${table.length} chữ`, `${table.length} characters`)
            : t(`${table.length} âm tiết`, `${table.length} syllables`)}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((e) => (
          <li key={`${e.char}|${e.hv}`} className="card p-4">
            <div className="flex items-baseline gap-3">
              <button
                type="button"
                lang={code}
                onClick={() => say(e.char)}
                className="text-4xl font-bold hover:text-brand-600"
                aria-label={t(`Nghe ${e.char}`, `Hear ${e.char}`)}
              >
                {e.char}
              </button>
              <span className="text-lg font-extrabold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                {e.hv}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {t(`${e.words.length} từ`, `${e.words.length} words`)}
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {e.words.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => say(w.word)}
                    className="text-left hover:underline"
                  >
                    <b lang={code}>{w.word}</b> <span className="text-slate-500">{w.viRead}</span> —{' '}
                    <span className="text-slate-700 dark:text-slate-200">{w.meaning}</span>
                    {w.hanViet && <span className="text-slate-400"> ({w.hanViet})</span>}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="card p-5 text-sm text-slate-500">
          {t('Không thấy chữ nào khớp.', 'No character matches.')}
        </p>
      )}
    </div>
  )
}
