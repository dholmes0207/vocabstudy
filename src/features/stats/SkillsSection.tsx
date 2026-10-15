import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReading } from '@/store/readingStore'
import { useGrammar } from '@/store/grammarStore'
import { usePhrases } from '@/store/phrasesStore'
import { availableIn } from '@/lib/packContent'
import { loadReadingPack } from '@/lib/reading'
import { isPassed, loadGrammarPack } from '@/lib/grammar'
import { isKnown, loadPhrasePack } from '@/lib/phrases'
import { useT } from '@/lib/i18n'

// "Ngoài từ vựng" on the stats page: how far the learner is in the other skills
// their pack has — stories read, grammar lessons passed, phrases known. Each
// count needs the pack's list (small, cached by the service worker), loaded
// only for skills this language has. Mounted with key={code}, so switching
// languages starts from a clean slate.

interface Lists {
  stories?: string[]
  units?: string[]
  phrases?: number[]
}

export default function SkillsSection({ code }: { code: string }) {
  const t = useT()
  const reading = useReading((s) => s.progress)
  const grammar = useGrammar((s) => s.progress)
  const phrases = usePhrases((s) => s.progress)
  const [lists, setLists] = useState<Lists>({})

  useEffect(() => {
    let alive = true
    const put = (patch: Lists) => alive && setLists((l) => ({ ...l, ...patch }))
    const quiet = () => {} // A skill whose list fails to load just isn't shown.
    if (availableIn('/reading', code))
      loadReadingPack(code)
        .then((p) => put({ stories: p.stories.map((s) => s.id) }))
        .catch(quiet)
    if (availableIn('/grammar', code))
      loadGrammarPack(code)
        .then((p) => put({ units: p.units.map((u) => u.id) }))
        .catch(quiet)
    if (availableIn('/phrases', code))
      loadPhrasePack(code)
        .then((p) => put({ phrases: p.topics.flatMap((tp) => tp.phrases.map((ph) => ph.id)) }))
        .catch(quiet)
    return () => {
      alive = false
    }
  }, [code])

  const tiles = [
    lists.stories && {
      to: '/reading',
      emoji: '📖',
      label: t('Truyện đã đọc', 'Stories read'),
      done: lists.stories.filter((id) => (reading[id]?.reads ?? 0) > 0).length,
      total: lists.stories.length,
    },
    lists.units && {
      to: '/grammar',
      emoji: '📐',
      label: t('Bài ngữ pháp đã qua', 'Grammar lessons passed'),
      done: lists.units.filter((id) => isPassed(grammar[id])).length,
      total: lists.units.length,
    },
    lists.phrases && {
      to: '/phrases',
      emoji: '💬',
      label: t('Mẫu câu đã thuộc', 'Phrases known'),
      done: lists.phrases.filter((id) => isKnown(phrases[id])).length,
      total: lists.phrases.length,
    },
  ].filter((x) => !!x)

  if (!tiles.length) return null

  return (
    <section className="card p-6">
      <h2 className="mb-4 font-bold">{t('Ngoài từ vựng', 'Beyond vocabulary')}</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((x) => (
          <li key={x.to} className="min-w-0">
            <Link
              to={x.to}
              className="block rounded-xl bg-slate-50 p-4 transition hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950"
            >
              <p className="text-sm text-slate-500">
                <span aria-hidden="true">{x.emoji}</span> {x.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">
                {x.done}
                <span className="text-base font-semibold text-slate-400">/{x.total}</span>
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                role="progressbar"
                aria-label={x.label}
                aria-valuenow={x.done}
                aria-valuemin={0}
                aria-valuemax={x.total}
              >
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${x.total ? (x.done / x.total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
