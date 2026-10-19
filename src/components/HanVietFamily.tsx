import { Puzzle } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { familiesOf } from '@/lib/hanVietFamily'
import { useT } from '@/lib/i18n'

/**
 * "Cùng chữ Hán Việt": the pack's other words that share a character with this
 * one, read the same way (lib/hanVietFamily.ts). Nothing for a word without a
 * Hán Việt reading or without relatives in the pack.
 */
export default function HanVietFamily({ word }: { word: Word }) {
  const t = useT()
  const words = useData((s) => s.pack?.words)
  const families = words ? familiesOf(word, words) : []
  if (!families.length) return null
  return (
    <div className="text-left">
      <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Puzzle className="h-3.5 w-3.5" aria-hidden="true" />
        {t('Cùng chữ Hán Việt', 'Same Sino-Vietnamese character')}
      </h3>
      <ul className="space-y-2">
        {families.map((f) => (
          <li key={f.char} className="flex items-start gap-3">
            <span className="grid h-10 min-w-[2.5rem] shrink-0 place-items-center rounded-lg bg-brand-50 px-1.5 text-center leading-tight dark:bg-brand-950">
              <span className="text-lg font-bold">{f.char}</span>
              <span className="text-[10px] font-semibold uppercase text-brand-700 dark:text-brand-300">
                {f.hv}
              </span>
            </span>
            <ul className="flex min-w-0 flex-wrap gap-1.5">
              {f.others.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-slate-200 px-2 py-0.5 text-sm dark:border-slate-700"
                >
                  <b className="font-semibold">{o.word}</b>{' '}
                  <span className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    {o.hanViet}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400"> · {o.meaning}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
