import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Sparkles } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { summarize, nextNewWords } from '@/lib/summary'
import { buildDecks } from '@/lib/decks'
import { phaseOf } from '@/lib/srs'
import LearnSession from './LearnSession'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'
import ProgressRing from '@/components/ProgressRing'
import { Segment } from '@/components/Choice'

export default function Learn() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const progress = useStudy((s) => s.progress[code])
  const recordAnswer = useStudy((s) => s.recordAnswer)

  const [session, setSession] = useState<Word[] | null>(null)
  // Quick session length so busy learners can grab a short set without opening
  // Settings. 'all' = however many new words remain today. See F6.
  // "Học nhanh 2 phút" from the dashboard arrives with ?quick=1: five words.
  const [params] = useSearchParams()
  const [pick, setPick] = useState<number | 'all'>(() => (params.get('quick') ? 5 : 'all'))
  // With 1000 words the pack is 50 decks — dumping all of them on the page
  // overwhelms a beginner, so show the stretch they are actually on.
  const [showAllDecks, setShowAllDecks] = useState(false)

  const s = summarize(pack.words, progress, dailyNewLimit)
  const cards = progress?.cards ?? NO_CARDS
  const decks = useMemo(() => buildDecks(pack.words, cards), [pack.words, cards])

  if (session) {
    return (
      <LearnSession
        words={session}
        pool={pack.words}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(w, correct) => recordAnswer(code, w.id, correct)}
        onExit={() => setSession(null)}
        renderComplete={(total) => (
          <SessionComplete
            emoji="🌟"
            title="Học xong rồi!"
            correct={total}
            total={total}
            showScore={false}
            note={`Bạn vừa làm quen và tự nhớ lại ${total} từ. Ngày mai app sẽ hỏi lại — nhớ lại được sau một đêm mới là nhớ thật.`}
          >
            <Link to="/review" className="btn-primary">
              Ôn tập ngay
            </Link>
            <button className="btn-secondary" onClick={() => setSession(null)}>
              Học tiếp
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  const plannedCount = pick === 'all' ? s.newRemainingToday : Math.min(pick, s.newRemainingToday)

  const startDaily = () => {
    const batch = nextNewWords(pack.words, progress, plannedCount)
    if (batch.length) setSession(batch)
  }

  const firstUnfinished = Math.max(
    0,
    decks.findIndex((d) => d.mastered < d.words.length)
  )
  const DECK_WINDOW = 8
  const visibleDecks = showAllDecks
    ? decks
    : decks.slice(firstUnfinished, firstUnfinished + DECK_WINDOW)

  const startDeck = (deckWords: Word[]) => {
    // Study the deck's not-yet-mastered words (fresh + learning + review).
    const list = deckWords.filter((w) => phaseOf(cards[w.id]) !== 'mastered')
    if (list.length) setSession(list)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">Học từ mới</span> <span aria-hidden="true">📖</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Mỗi lần 5 từ: làm quen (nghe, đọc câu ví dụ, xem cụm hay đi chung) rồi tự nhớ lại ngay —
          sai thì được giải thích và làm lại.
        </p>
      </header>

      {/* Today's lesson */}
      <section className="card relative overflow-hidden p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold">Bài học hôm nay</h2>
            <p className="text-sm text-slate-400">
              Đề xuất {s.newRemainingToday} từ mới · đã học {s.newDoneToday}/{dailyNewLimit}
            </p>
          </div>
        </div>
        {s.newRemainingToday > 0 ? (
          <>
            {s.newRemainingToday > 5 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Học bao nhiêu từ?
                </p>
                <div className="grid max-w-xs grid-cols-3 gap-2">
                  <Segment active={pick === 5} onClick={() => setPick(5)}>
                    5 từ
                  </Segment>
                  <Segment
                    active={pick === 10}
                    onClick={() => setPick(10)}
                    disabled={s.newRemainingToday < 10}
                  >
                    10 từ
                  </Segment>
                  <Segment active={pick === 'all'} onClick={() => setPick('all')}>
                    Tất cả ({s.newRemainingToday})
                  </Segment>
                </div>
              </div>
            )}
            <button onClick={startDaily} className="btn-primary mt-5 h-12 w-full sm:w-auto">
              <BookOpen className="h-5 w-5" /> Bắt đầu học {plannedCount} từ
            </button>
          </>
        ) : (
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            🎯 Bạn đã hoàn thành hạn mức từ mới hôm nay. Hãy chuyển sang{' '}
            <Link to="/review" className="font-semibold underline">
              ôn tập
            </Link>{' '}
            hoặc quay lại vào ngày mai nhé!
          </p>
        )}
      </section>

      {/* Decks */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Các bộ từ ({decks.length} bộ · {pack.meta.count} từ)
          </h2>
        </div>
        {s.fresh === 0 && s.mastered === s.total ? (
          <EmptyState
            emoji="🏆"
            title="Bạn đã thành thạo toàn bộ từ!"
            description="Quá xuất sắc. Hãy ôn lại định kỳ để giữ vững."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleDecks.map((deck) => {
              const pct = deck.words.length ? deck.mastered / deck.words.length : 0
              const complete = deck.mastered === deck.words.length
              return (
                <button
                  key={deck.index}
                  onClick={() => startDeck(deck.words)}
                  disabled={complete}
                  className="card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                >
                  <ProgressRing value={pct} size={64} stroke={6}>
                    <span className="text-xs font-bold">
                      {complete ? '✓' : `${Math.round(pct * 100)}%`}
                    </span>
                  </ProgressRing>
                  <span className="text-sm font-semibold">
                    {deck.title}
                    {deck.stage > 1 && (
                      <span className="chip ml-1.5 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        B1
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {deck.mastered}/{deck.words.length} thành thạo
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {decks.length > DECK_WINDOW && !(s.fresh === 0 && s.mastered === s.total) && (
          <button
            onClick={() => setShowAllDecks((v) => !v)}
            className="btn-secondary mt-3 w-full sm:w-auto"
          >
            {showAllDecks ? 'Thu gọn' : `Xem tất cả ${decks.length} bộ`}
          </button>
        )}
      </section>
    </div>
  )
}
