import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { usePracticeBank } from '@/hooks/usePracticeBank'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROLES, loadPatterns, patternRound, type PatternItem } from '@/lib/patterns'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import PatternRound from './PatternRound'

// "Cấu trúc câu" (docs/design/sentence-patterns.md): each sentence shape as a
// row of coloured role blocks with why it goes that way, and practice that has
// the learner build sentences on that frame.

export default function Patterns() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en') return <PackOnly packs={['en']} />
  return <PatternsView />
}

function PatternsView() {
  const t = useT()
  useDocumentTitle(`${t('Cấu trúc câu', 'Sentence patterns')} · VocaStudy`)
  const { bank, error, retry } = usePracticeBank(loadPatterns)
  const [round, setRound] = useState<{ n: number; only?: string; items: PatternItem[] } | null>(
    null
  )
  const start = (only?: string) => {
    if (bank)
      setRound((r) => ({ n: (r?.n ?? 0) + 1, only, items: patternRound(bank.patterns, only) }))
  }

  if (round)
    return (
      <PatternRound
        key={round.n}
        items={round.items}
        onAgain={() => start(round.only)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Cấu trúc câu', 'Sentence patterns')}</span>{' '}
          <span aria-hidden="true">🧱</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Câu tiếng Anh được lắp từ các khối: chủ ngữ, động từ, tân ngữ, nơi chốn, thời gian… Học khung của từng kiểu câu rồi tự xếp khối, nhìn màu là nhớ trật tự.',
            'English sentences are built from blocks: subject, verb, object, place, time… Learn the frame of each kind of sentence, then build it yourself; the colours make the order stick.'
          )}
        </p>
      </header>

      <ul className="flex flex-wrap gap-2" aria-label={t('Các khối', 'The blocks')}>
        {Object.values(ROLES).map((r) => (
          <li
            key={r.name[1]}
            className={`rounded-lg px-2 py-1 text-xs font-bold text-white ${r.tone}`}
          >
            {t(...r.name)}
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="card flex flex-wrap items-center gap-3 p-4 text-sm">
          {t('Chưa tải được bài học.', "Couldn't load the lessons.")}
          <button type="button" className="btn-secondary h-9 text-sm" onClick={retry}>
            {t('Thử lại', 'Try again')}
          </button>
        </p>
      ) : (
        <>
          <button
            type="button"
            className="btn-primary h-12 w-full sm:w-auto"
            disabled={!bank}
            onClick={() => start()}
          >
            {t('Trộn đủ kiểu câu: 6 câu', 'Mixed round: 6 sentences')}{' '}
            <ArrowRight className="h-4 w-4" />
          </button>
          <ol className="grid gap-3 sm:grid-cols-2">
            {bank?.patterns.map((p, i) => (
              <li key={p.id} className="card flex flex-col gap-3 p-4">
                <p className="font-bold">
                  <span aria-hidden="true">{p.emoji}</span> {i + 1}. {t(...p.title)}
                </p>
                <p className="flex flex-wrap gap-1" aria-hidden="true">
                  {p.formula.map((r, j) => (
                    <span
                      key={j}
                      className={`rounded-md px-2 py-0.5 text-xs font-bold text-white ${ROLES[r].tone}`}
                    >
                      {t(...ROLES[r].name)}
                    </span>
                  ))}
                </p>
                <ul className="flex-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {p.explain.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-secondary h-10 text-sm"
                  onClick={() => start(p.id)}
                >
                  {t('Luyện kiểu câu này', 'Practise this pattern')}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
