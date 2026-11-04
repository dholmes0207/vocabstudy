import { useMemo, useState } from 'react'
import { BookOpen, RotateCcw } from 'lucide-react'
import type { QuizQuestion, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { phaseOf } from '@/lib/srs'
import { deckTier, isUpgrade, nextTier, TIER_INFO, TIERS, type BadgeTier } from '@/lib/deckBadges'
import { generateQuiz } from '@/lib/quiz'
import { useT } from '@/lib/i18n'
import LearnSession from '@/features/learn/LearnSession'
import QuizRunner from '@/components/QuizRunner'
import SessionComplete from '@/components/SessionComplete'
import ProgressRing from '@/components/ProgressRing'

// A grid of word decks, each with "Learn" (up to 10 words not yet mastered)
// and "Review" (a quick quiz on the words already met): the topic decks
// (docs/design/topics.md) and the TOEIC themes (docs/design/toeic.md). The
// words are the pack's own, so progress is shared with the rest of the app.

type Pair = [vi: string, en: string]

export interface Deck {
  id: string
  emoji: string
  title: Pair
  words: Word[]
}

/**
 * The whole page around the decks: `before` and `after` frame the grid, and a
 * started lesson or review takes the page over until it ends.
 */
export default function DeckBoard({
  decks,
  backLabel,
  before,
  after,
}: {
  decks: Deck[]
  /** The button that ends a session, e.g. "Pick another topic". */
  backLabel: Pair
  before?: React.ReactNode
  after?: React.ReactNode
}) {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const markKnown = useStudy((s) => s.markKnown)
  const t = useT()
  const [session, setSession] = useState<
    | { kind: 'learn'; deck: Deck; tier: BadgeTier | null; words: Word[] }
    | { kind: 'review'; deck: Deck; tier: BadgeTier | null; questions: QuizQuestion[] }
    | null
  >(null)

  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])
  const rows = useMemo(
    () =>
      decks.map((deck) => ({
        deck,
        mastered: deck.words.filter((w) => phaseOf(cards[w.id]) === 'mastered').length,
        learned: deck.words.filter((w) => cards[w.id]).length,
        tier: deckTier(deck.words, cards),
        next: nextTier(deck.words, cards),
      })),
    [decks, cards]
  )

  /** "Bronze medal: Hiring!" when the session just ended earned the deck a new medal. */
  const medalNote = (deck: Deck, before: BadgeTier | null) => {
    const now = deckTier(deck.words, cards)
    if (!now || !isUpgrade(before, now)) return null
    const info = TIER_INFO[now]
    return (
      <p className="w-full rounded-xl bg-amber-50 p-3 font-semibold text-amber-800 animate-pop dark:bg-amber-950/50 dark:text-amber-200">
        {info.medal}{' '}
        {t(
          `Huy hiệu ${info.name[0]}: "${deck.title[0]}"!`,
          `${info.name[1]} medal: "${deck.title[1]}"!`
        )}
      </p>
    )
  }

  if (session?.kind === 'review') {
    const { deck } = session
    return (
      <QuizRunner
        questions={session.questions}
        wordsById={byId}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(id, correct) => recordAnswer(code, id, correct)}
        onExit={() => setSession(null)}
        renderComplete={(correct, total) => (
          <SessionComplete
            emoji={deck.emoji}
            title={t(`Ôn xong "${deck.title[0]}"`, `"${deck.title[1]}" reviewed`)}
            correct={correct}
            total={total}
          >
            {medalNote(deck, session.tier)}
            {correct < total && (
              <p className="w-full text-sm text-slate-500 dark:text-slate-400">
                {t(
                  'Những từ bạn quên đã được đưa vào lịch ôn để hỏi lại sớm.',
                  'The words you missed are back in your reviews and will come up again soon.'
                )}
              </p>
            )}
            <button className="btn-primary" onClick={() => setSession(null)}>
              {t(...backLabel)}
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  if (session) {
    return (
      <LearnSession
        words={session.words}
        pool={pack.words}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(w, correct) => recordAnswer(code, w.id, correct)}
        onKnown={(w) => markKnown(code, w.id)}
        onExit={() => setSession(null)}
        renderComplete={(total) => (
          <SessionComplete
            emoji={session.deck.emoji}
            title={t('Xong một chặng!', 'Nice work!')}
            correct={total}
            total={total}
            showScore={false}
            note={t(
              `Bạn vừa học ${total} từ chủ đề "${session.deck.title[0]}". Ngày mai app sẽ hỏi lại để bạn nhớ lâu.`,
              `You just learned ${total} words about "${session.deck.title[1]}". Tomorrow the app will ask again so they stick.`
            )}
          >
            {medalNote(session.deck, session.tier)}
            <button className="btn-primary" onClick={() => setSession(null)}>
              {t(...backLabel)}
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  const start = (deck: Deck) => {
    // The deck's not-yet-mastered words, a handful at a time.
    const list = deck.words.filter((w) => phaseOf(cards[w.id]) !== 'mastered').slice(0, 10)
    if (list.length)
      setSession({ kind: 'learn', deck, tier: deckTier(deck.words, cards), words: list })
  }

  const review = (deck: Deck) => {
    // A quick recall check on the deck's words you have already met.
    const met = deck.words.filter((w) => cards[w.id])
    const questions = generateQuiz({ words: met, pool: pack.words, limit: 10 })
    if (questions.length)
      setSession({ kind: 'review', deck, tier: deckTier(deck.words, cards), questions })
  }

  const earned = TIERS.map((tier) => ({
    tier,
    count: rows.filter((r) => r.tier && TIERS.indexOf(r.tier) >= TIERS.indexOf(tier)).length,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {before}
      <details className="card p-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          {t('Huy hiệu', 'Medals')}:{' '}
          {earned.map(({ tier, count }) => (
            <span key={tier} className="ml-2 whitespace-nowrap">
              <span aria-hidden="true">{TIER_INFO[tier].medal}</span>{' '}
              {t(`${count} ${TIER_INFO[tier].name[0]}`, `${count} ${TIER_INFO[tier].name[1]}`)}
            </span>
          ))}
        </summary>
        <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
          {TIERS.map((tier) => (
            <p key={tier}>
              <span aria-hidden="true">{TIER_INFO[tier].medal}</span>{' '}
              <b>{t(...TIER_INFO[tier].name)}</b>: {t(...TIER_INFO[tier].rule)}
            </p>
          ))}
        </div>
      </details>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ deck, mastered, learned, tier, next }) => {
          const { words } = deck
          const done = words.length > 0 && mastered === words.length
          return (
            <li key={deck.id} className="card flex min-w-0 flex-col gap-3 p-4">
              <div className="flex items-center gap-4">
                <ProgressRing value={words.length ? mastered / words.length : 0} size={56}>
                  <span className="text-2xl" aria-hidden="true">
                    {deck.emoji}
                  </span>
                </ProgressRing>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    {t(...deck.title)}
                    {tier && (
                      <span
                        className="ml-1"
                        title={t(
                          `Huy hiệu ${TIER_INFO[tier].name[0]}`,
                          `${TIER_INFO[tier].name[1]} medal`
                        )}
                      >
                        {TIER_INFO[tier].medal}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {done
                      ? t('Đã thành thạo cả bộ 🎉', 'All mastered 🎉')
                      : t(
                          `${mastered}/${words.length} thành thạo`,
                          `${mastered}/${words.length} mastered`
                        )}
                  </span>
                  {next && (
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        `${TIER_INFO[next.tier].medal} còn ${next.left} từ`,
                        `${TIER_INFO[next.tier].medal} ${next.left} more`
                      )}
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => start(deck)}
                  disabled={done}
                  className="btn-primary h-10 text-sm disabled:opacity-50"
                >
                  <BookOpen className="h-4 w-4" /> {t('Học', 'Learn')}
                </button>
                <button
                  type="button"
                  onClick={() => review(deck)}
                  disabled={learned === 0}
                  title={
                    learned === 0
                      ? t('Học vài từ của bộ này trước đã', 'Learn a few words of this deck first')
                      : undefined
                  }
                  className="btn-secondary h-10 text-sm disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" /> {t(`Ôn (${learned})`, `Review (${learned})`)}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {after}
    </div>
  )
}
