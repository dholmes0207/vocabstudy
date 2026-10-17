import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, BookmarkCheck, Gauge, Sparkles } from 'lucide-react'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { summarize, nextNewWords } from '@/lib/summary'
import { DECK_SIZE, buildDecks } from '@/lib/decks'
import { phaseOf } from '@/lib/srs'
import { pendingSaved } from '@/lib/savedWords'
import { useSavedIds, useSavedWords } from '@/store/savedWordsStore'
import { usePlacement } from '@/store/placementStore'
import { useTargetLang } from '@/hooks/useTargetLang'
import LearnSession from './LearnSession'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'
import ProgressRing from '@/components/ProgressRing'
import { Segment } from '@/components/Choice'
import { useT } from '@/lib/i18n'

/** The placement check is offered until this many words have been started. */
const PLACEMENT_OFFER_BELOW = 30
/** Saved words per session, and how many are named on the card. */
const SAVED_BATCH = 10
const SAVED_SHOWN = 12

export default function Learn() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const progress = useStudy((s) => s.progress[code])
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const t = useT()
  const lang = useTargetLang()
  // Placement check (docs/design/placement.md): where new words start.
  const placement = usePlacement((s) => s.results[code])
  const startAt = placement?.start ?? 0

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

  // "Lưu để học" (docs/design/saved-words.md): words saved while reading, learned
  // before the suggested ones. Once a word has a card it leaves the list.
  const savedIds = useSavedIds(code)
  const removeSaved = useSavedWords((st) => st.remove)
  const saved = useMemo(
    () => pendingSaved(savedIds, pack.words, cards),
    [savedIds, pack.words, cards]
  )
  useEffect(() => {
    const started = savedIds.filter((id) => phaseOf(cards[id]) !== 'new')
    if (started.length) removeSaved(code, started)
  }, [savedIds, cards, code, removeSaved])

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
            title={t('Học xong rồi!', 'Lesson done!')}
            correct={total}
            total={total}
            showScore={false}
            note={t(
              `Bạn vừa làm quen và tự nhớ lại ${total} từ — thêm ${total} ngôi sao trên bầu trời của bạn ✨. Ngày mai app sẽ hỏi lại — nhớ lại được sau một đêm mới là nhớ thật.`,
              `You just met and recalled ${total} words — ${total} more stars in your sky ✨. Tomorrow the app will ask again — remembering after a night is what makes it stick.`
            )}
          >
            <Link to="/review" className="btn-primary">
              {t('Ôn tập ngay', 'Review now')}
            </Link>
            <button className="btn-secondary" onClick={() => setSession(null)}>
              {t('Học tiếp', 'Keep learning')}
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  const plannedCount = pick === 'all' ? s.newRemainingToday : Math.min(pick, s.newRemainingToday)

  const startDaily = () => {
    const batch = nextNewWords(pack.words, progress, plannedCount, startAt)
    if (batch.length) setSession(batch)
  }

  // Open the deck list where the learner is: the first unfinished deck at or
  // after the placement start, else the first unfinished one.
  const unfinished = (d: (typeof decks)[number]) => d.mastered < d.words.length
  const fromStart = decks.findIndex((d) => unfinished(d) && (d.index + 1) * DECK_SIZE > startAt)
  const firstUnfinished = Math.max(0, fromStart >= 0 ? fromStart : decks.findIndex(unfinished))
  const startedCount = Object.keys(cards).length
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
          <span className="text-aurora">{t('Học từ mới', 'Learn new words')}</span>{' '}
          <span aria-hidden="true">📖</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            'Mỗi lần 5 từ: làm quen (nghe, đọc câu ví dụ, xem cụm hay đi chung) rồi tự nhớ lại ngay — sai thì được giải thích và làm lại.',
            'Five words at a time: meet them (listen, read an example, see common phrases), then recall them right away — mistakes get explained and retried.'
          )}
        </p>
      </header>

      {saved.length > 0 && (
        <section className="card p-6" aria-labelledby="saved-words-title">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow">
              <BookmarkCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="saved-words-title" className="text-lg font-bold">
                {t(`Từ bạn đã lưu (${saved.length})`, `Words you saved (${saved.length})`)}
              </h2>
              <p className="text-sm text-slate-400">
                {t(
                  'Những từ bạn bấm "Lưu để học" khi đọc truyện.',
                  'Words you tapped "Save to learn" on while reading.'
                )}
              </p>
            </div>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {saved.slice(0, SAVED_SHOWN).map((w) => (
              <li
                key={w.id}
                className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {w.word}
              </li>
            ))}
            {saved.length > SAVED_SHOWN && (
              <li className="chip text-slate-400">+{saved.length - SAVED_SHOWN}</li>
            )}
          </ul>
          <button
            onClick={() => setSession(saved.slice(0, SAVED_BATCH))}
            className="btn-primary mt-5 h-12 w-full sm:w-auto"
          >
            <BookOpen className="h-5 w-5" />{' '}
            {t(
              `Học ${Math.min(saved.length, SAVED_BATCH)} từ đã lưu`,
              saved.length === 1
                ? 'Learn 1 saved word'
                : `Learn ${Math.min(saved.length, SAVED_BATCH)} saved words`
            )}
          </button>
        </section>
      )}

      {!placement && startedCount < PLACEMENT_OFFER_BELOW && (
        <section className="card flex flex-wrap items-center gap-4 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow">
            <Gauge className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold">
              {t(`Đã biết một ít ${lang.vi} rồi?`, `Already know some ${lang.en}?`)}
            </h2>
            <p className="text-sm text-slate-500">
              {t(
                'Kiểm tra trình độ khoảng 3 phút để bài học bắt đầu đúng chỗ.',
                'Take a 3-minute placement check so lessons start at the right place.'
              )}
            </p>
          </div>
          <Link to="/placement" className="btn-secondary h-11 w-full sm:w-auto">
            {t('Kiểm tra trình độ', 'Placement check')}
          </Link>
        </section>
      )}

      {/* Today's lesson */}
      <section className="card relative overflow-hidden p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold">{t('Bài học hôm nay', "Today's lesson")}</h2>
            <p className="text-sm text-slate-400">
              {t(
                `Đề xuất ${s.newRemainingToday} từ mới · đã học ${s.newDoneToday}/${dailyNewLimit}`,
                `${s.newRemainingToday} new words suggested · ${s.newDoneToday}/${dailyNewLimit} learned`
              )}
            </p>
          </div>
        </div>
        {s.newRemainingToday > 0 ? (
          <>
            {s.newRemainingToday > 5 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('Học bao nhiêu từ?', 'How many words?')}
                </p>
                <div className="grid max-w-xs grid-cols-3 gap-2">
                  <Segment active={pick === 5} onClick={() => setPick(5)}>
                    {t('5 từ', '5 words')}
                  </Segment>
                  <Segment
                    active={pick === 10}
                    onClick={() => setPick(10)}
                    disabled={s.newRemainingToday < 10}
                  >
                    {t('10 từ', '10 words')}
                  </Segment>
                  <Segment active={pick === 'all'} onClick={() => setPick('all')}>
                    {t('Tất cả', 'All')} ({s.newRemainingToday})
                  </Segment>
                </div>
              </div>
            )}
            <button onClick={startDaily} className="btn-primary mt-5 h-12 w-full sm:w-auto">
              <BookOpen className="h-5 w-5" />{' '}
              {t(`Bắt đầu học ${plannedCount} từ`, `Learn ${plannedCount} words`)}
            </button>
            {placement && (
              <p className="mt-3 text-sm text-slate-500">
                🧭{' '}
                {t(
                  `Theo bài kiểm tra trình độ, từ mới bắt đầu từ từ thứ ${placement.start + 1}.`,
                  `From your placement check, new words start at word ${placement.start + 1}.`
                )}{' '}
                <Link to="/placement" className="font-semibold text-brand-600 dark:text-brand-300">
                  {t('Làm lại', 'Retake')}
                </Link>
              </p>
            )}
          </>
        ) : (
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            🎯{' '}
            {t(
              'Bạn đã hoàn thành hạn mức từ mới hôm nay. Hãy chuyển sang',
              "You've reached today's new-word limit. Switch to"
            )}{' '}
            <Link to="/review" className="font-semibold underline">
              {t('ôn tập', 'review')}
            </Link>{' '}
            {t('hoặc quay lại vào ngày mai nhé!', 'or come back tomorrow!')}
          </p>
        )}
      </section>

      {/* Decks */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {t(
              `Các bộ từ (${decks.length} bộ · ${pack.meta.count} từ)`,
              `Word sets (${decks.length} sets · ${pack.meta.count} words)`
            )}
          </h2>
        </div>
        {s.fresh === 0 && s.mastered === s.total ? (
          <EmptyState
            emoji="🏆"
            title={t('Bạn đã thành thạo toàn bộ từ!', "You've mastered every word!")}
            description={t(
              'Quá xuất sắc. Hãy ôn lại định kỳ để giữ vững.',
              'Outstanding. Keep reviewing now and then to hold on to them.'
            )}
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
                    {t(deck.title, deck.title.replace('Bộ', 'Set'))}
                    {deck.stage > 1 && (
                      <span className="chip ml-1.5 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        B1
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {deck.mastered}/{deck.words.length} {t('thành thạo', 'mastered')}
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
            {showAllDecks
              ? t('Thu gọn', 'Show less')
              : t(`Xem tất cả ${decks.length} bộ`, `Show all ${decks.length} sets`)}
          </button>
        )}
      </section>
    </div>
  )
}
