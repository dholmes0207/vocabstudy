import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { PosCategory, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { phaseOf } from '@/lib/srs'
import type { CardPhase } from '@/types'
import SpeakButton from '@/components/SpeakButton'
import PosBadge from '@/components/PosBadge'
import { posLabel } from '@/lib/pos'
import WordInsight from '@/components/WordInsight'
import MySentence from '@/components/MySentence'
import { wordAudio } from '@/lib/audio'
import { useProvideContext } from '@/store/contextStore'
import { useT, useUiLang } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'
import { matchesQuery } from '@/lib/search'

const PAGE_SIZE = 24

const PHASE_META: Record<CardPhase, { label: string; labelEn: string; dot: string }> = {
  new: { label: 'Chưa học', labelEn: 'Not started', dot: 'bg-slate-300 dark:bg-slate-600' },
  learning: { label: 'Đang học', labelEn: 'Learning', dot: 'bg-amber-400' },
  review: { label: 'Đang ôn', labelEn: 'Reviewing', dot: 'bg-brand-500' },
  mastered: { label: 'Thành thạo', labelEn: 'Mastered', dot: 'bg-emerald-500' },
}

export default function Browse() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards) ?? NO_CARDS

  // ?q= lets other screens (Từ của ngày) open the lookup on one word.
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [pos, setPos] = useState<PosCategory | 'all'>('all')
  const [phaseFilter, setPhaseFilter] = useState<CardPhase | 'all'>('all')
  const [page, setPage] = useState(0)
  const t = useT()
  const L = useTargetLang()
  const uiLang = useUiLang()
  const [expanded, setExpanded] = useState<number | null>(() => {
    const q = params.get('q')?.trim().toLowerCase()
    return q ? (pack.words.find((w) => w.word.toLowerCase() === q)?.id ?? null) : null
  })

  const categories = useMemo(() => {
    const set = new Set<PosCategory>()
    pack.words.forEach((w) => set.add(w.posCategory))
    return Array.from(set)
  }, [pack.words])

  const filtered = useMemo(() => {
    // The pack is stored in learning order (most common words first); a lookup
    // screen wants the alphabet instead.
    const list = pack.words.filter((w) => {
      if (pos !== 'all' && w.posCategory !== pos) return false
      if (phaseFilter !== 'all' && phaseOf(cards[w.id]) !== phaseFilter) return false
      return matchesQuery(w, query)
    })
    return list.sort((x, y) => x.word.localeCompare(y.word, 'en'))
  }, [pack.words, query, pos, phaseFilter, cards])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  // Tell the AI assistant which word (if any) is expanded.
  const focused = expanded != null ? pack.words.find((w) => w.id === expanded) : undefined
  useProvideContext(
    focused ? `Đang xem từ "${focused.word}"` : 'Tra cứu từ vựng',
    focused
      ? {
          word: focused.word,
          meaning: focused.meaning,
          ipa: focused.ipa,
          pos: focused.pos,
          exampleEn: focused.exampleEn,
        }
      : undefined
  )

  const resetPage = () => setPage(0)

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Tra cứu từ vựng', 'Dictionary')}</span>{' '}
          <span aria-hidden="true">📚</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            `${pack.meta.count} từ · tìm kiếm và lọc theo ý bạn.`,
            `${pack.meta.count} words · search and filter as you like.`
          )}{' '}
          {/* The respelling guide is written for English sounds. */}
          {pack.meta.code === 'en' && (
            <Link to="/sounds" className="font-semibold text-brand-600 dark:text-brand-300">
              {t('Đọc phiên âm thế nào? 👄', 'How to read the respelling 👄')}
            </Link>
          )}
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            resetPage()
          }}
          aria-label={t('Tìm kiếm từ vựng', 'Search words')}
          placeholder={t(
            `Tìm theo từ ${L.vi} hoặc nghĩa tiếng Việt…`,
            `Search a ${L.en} word or a Vietnamese meaning…`
          )}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={pos === 'all'}
          onClick={() => {
            setPos('all')
            resetPage()
          }}
        >
          {t('Tất cả từ loại', 'All parts of speech')}
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c}
            active={pos === c}
            onClick={() => {
              setPos(c)
              resetPage()
            }}
          >
            {posLabel(c, uiLang)}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={phaseFilter === 'all'}
          onClick={() => {
            setPhaseFilter('all')
            resetPage()
          }}
          subtle
        >
          {t('Mọi trạng thái', 'Any status')}
        </FilterChip>
        {(Object.keys(PHASE_META) as CardPhase[]).map((p) => (
          <FilterChip
            key={p}
            active={phaseFilter === p}
            onClick={() => {
              setPhaseFilter(p)
              resetPage()
            }}
            subtle
          >
            <span className={`h-2 w-2 rounded-full ${PHASE_META[p].dot}`} />
            {t(PHASE_META[p].label, PHASE_META[p].labelEn)}
          </FilterChip>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        {filtered.length} {t('kết quả', filtered.length === 1 ? 'result' : 'results')}
        {filtered.length > PAGE_SIZE ? ` · trang ${safePage + 1}/${pageCount}` : ''}
      </p>

      {/* Results */}
      {pageItems.length === 0 ? (
        <p className="py-10 text-center text-slate-400">
          {t('Không tìm thấy từ nào phù hợp.', 'No matching words.')}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pageItems.map((w) => (
            <WordRow
              key={w.id}
              word={w}
              ttsLang={pack.meta.ttsLang}
              lang={code}
              phase={phaseOf(cards[w.id])}
              expanded={expanded === w.id}
              onToggle={() => setExpanded((e) => (e === w.id ? null : w.id))}
            />
          ))}
        </ul>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            className="btn-secondary"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> {t('Trước', 'Previous')}
          </button>
          <span className="text-sm tabular-nums text-slate-500">
            {safePage + 1} / {pageCount}
          </span>
          <button
            className="btn-secondary"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            {t('Sau', 'Next')} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function WordRow({
  word,
  ttsLang,
  lang,
  phase,
  expanded,
  onToggle,
}: {
  word: Word
  ttsLang: string
  lang: string
  phase: CardPhase
  expanded: boolean
  onToggle: () => void
}) {
  const t = useT()
  return (
    <li className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Toggle button and the speak button are siblings (no nested buttons). */}
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${PHASE_META[phase].dot}`}
            title={t(PHASE_META[phase].label, PHASE_META[phase].labelEn)}
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-lg font-bold">{word.word}</span>
              <PosBadge category={word.posCategory} raw={word.pos} />
            </span>
            {(word.ipa || word.viRead) && (
              <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                {word.ipa && <span className="font-mono">/{word.ipa}/</span>}
                {word.ipa && word.viRead && <span className="mx-1">·</span>}
                {word.viRead && (
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {word.viRead}
                  </span>
                )}
              </span>
            )}
            <span className="block truncate text-sm text-slate-500">{word.meaning}</span>
          </span>
        </button>
        <SpeakButton
          text={word.word}
          lang={ttsLang}
          audioSrc={wordAudio(word.id)}
          size="sm"
          className="shrink-0"
        />
      </div>
      {expanded && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/40 animate-fade-in">
          <WordInsight word={word} ttsLang={ttsLang} variant="details" />
          <MySentence word={word} lang={lang} />
        </div>
      )}
    </li>
  )
}

function FilterChip({
  active,
  onClick,
  subtle,
  children,
}: {
  active: boolean
  onClick: () => void
  subtle?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`chip gap-1.5 border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
          : `border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 ${subtle ? '' : ''}`
      }`}
    >
      {children}
    </button>
  )
}
