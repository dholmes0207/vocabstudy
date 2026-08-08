import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { PosCategory, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { phaseOf } from '@/lib/srs'
import type { CardPhase } from '@/types'
import SpeakButton from '@/components/SpeakButton'
import PosBadge, { POS_LABEL } from '@/components/PosBadge'
import HighlightExample from '@/components/HighlightExample'

const PAGE_SIZE = 24

const PHASE_META: Record<CardPhase, { label: string; dot: string }> = {
  new: { label: 'Chưa học', dot: 'bg-slate-300 dark:bg-slate-600' },
  learning: { label: 'Đang học', dot: 'bg-amber-400' },
  review: { label: 'Đang ôn', dot: 'bg-brand-500' },
  mastered: { label: 'Thành thạo', dot: 'bg-emerald-500' },
}

export default function Browse() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards) ?? {}

  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<PosCategory | 'all'>('all')
  const [phaseFilter, setPhaseFilter] = useState<CardPhase | 'all'>('all')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)

  const categories = useMemo(() => {
    const set = new Set<PosCategory>()
    pack.words.forEach((w) => set.add(w.posCategory))
    return Array.from(set)
  }, [pack.words])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pack.words.filter((w) => {
      if (pos !== 'all' && w.posCategory !== pos) return false
      if (phaseFilter !== 'all' && phaseOf(cards[w.id]) !== phaseFilter) return false
      if (q && !w.word.toLowerCase().includes(q) && !w.meaning.toLowerCase().includes(q)) return false
      return true
    })
  }, [pack.words, query, pos, phaseFilter, cards])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const resetPage = () => setPage(0)

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Tra cứu từ vựng 📚</h1>
        <p className="mt-1 text-slate-500">{pack.meta.count} từ · tìm kiếm và lọc theo ý bạn.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            resetPage()
          }}
          aria-label="Tìm kiếm từ vựng"
          placeholder="Tìm theo từ tiếng Anh hoặc nghĩa tiếng Việt…"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={pos === 'all'} onClick={() => { setPos('all'); resetPage() }}>
          Tất cả từ loại
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c} active={pos === c} onClick={() => { setPos(c); resetPage() }}>
            {POS_LABEL[c]}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={phaseFilter === 'all'} onClick={() => { setPhaseFilter('all'); resetPage() }} subtle>
          Mọi trạng thái
        </FilterChip>
        {(Object.keys(PHASE_META) as CardPhase[]).map((p) => (
          <FilterChip key={p} active={phaseFilter === p} onClick={() => { setPhaseFilter(p); resetPage() }} subtle>
            <span className={`h-2 w-2 rounded-full ${PHASE_META[p].dot}`} />
            {PHASE_META[p].label}
          </FilterChip>
        ))}
      </div>

      <p className="text-sm text-slate-400">
        {filtered.length} kết quả{filtered.length > PAGE_SIZE ? ` · trang ${safePage + 1}/${pageCount}` : ''}
      </p>

      {/* Results */}
      {pageItems.length === 0 ? (
        <p className="py-10 text-center text-slate-400">Không tìm thấy từ nào phù hợp.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {pageItems.map((w) => (
            <WordRow
              key={w.id}
              word={w}
              ttsLang={pack.meta.ttsLang}
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
          <button className="btn-secondary" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-4 w-4" /> Trước
          </button>
          <span className="text-sm tabular-nums text-slate-500">
            {safePage + 1} / {pageCount}
          </span>
          <button className="btn-secondary" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
            Sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function WordRow({
  word,
  ttsLang,
  phase,
  expanded,
  onToggle,
}: {
  word: Word
  ttsLang: string
  phase: CardPhase
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <li className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Toggle button and the speak button are siblings (no nested buttons). */}
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PHASE_META[phase].dot}`} title={PHASE_META[phase].label} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-lg font-bold">{word.word}</span>
              <PosBadge category={word.posCategory} raw={word.pos} />
            </span>
            <span className="block truncate text-sm text-slate-500">{word.meaning}</span>
          </span>
        </button>
        <SpeakButton text={word.word} lang={ttsLang} size="sm" className="shrink-0" />
      </div>
      {expanded && (
        <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/40 animate-fade-in">
          <div className="flex items-start gap-2">
            <SpeakButton text={word.exampleEn} lang={ttsLang} size="sm" className="mt-0.5 shrink-0" />
            <p className="text-slate-700 dark:text-slate-200">
              <HighlightExample sentence={word.exampleEn} word={word.word} />
            </p>
          </div>
          <p className="pl-10 italic text-slate-500">{word.exampleVi}</p>
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
