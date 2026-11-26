import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Brain, Layers } from 'lucide-react'
import type { QuizQuestion, ReviewStyle, SRSCard, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { getDueCards, getMaintenanceCards } from '@/lib/srs'
import { summarize } from '@/lib/summary'
import { reviewSessionSize } from '@/lib/reviewSession'
import { today } from '@/lib/date'
import { makeQuestion } from '@/lib/quiz'
import { reviewModeFor } from '@/lib/practice'
import FlashcardSession from '@/components/FlashcardSession'
import QuizRunner from '@/components/QuizRunner'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'
import SessionChanges from '@/components/SessionChanges'
import { snapshotPhases } from '@/lib/sessionDelta'
import { useT } from '@/lib/i18n'
import NextOnPath from '@/features/path/NextOnPath'

export default function Review() {
  const style = useSettings((s) => s.reviewStyle)
  const setStyle = useSettings((s) => s.setReviewStyle)
  // Switching style remounts the session with a queue rebuilt from the store:
  // words already answered correctly are no longer due and drop out, missed
  // ones (due again today) stay in. A new visit (the "Review more" button)
  // remounts it too, with the next part of a big pile.
  const { key } = useLocation()
  return <ReviewRun key={`${style}:${key}`} style={style} onStyle={setStyle} />
}

function ReviewRun({ style, onStyle }: { style: ReviewStyle; onStyle: (s: ReviewStyle) => void }) {
  const navigate = useNavigate()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const reviewLimit = useSettings((s) => s.dailyReviewLimit)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  // ?limit=N caps this one session (the gentle comeback, lib/motivation.ts comebackPath).
  const [params] = useSearchParams()
  const askedLimit = Math.floor(Number(params.get('limit')))
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const t = useT()

  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w] as const)), [pack.words])

  // Read progress once (not reactively) so recording answers doesn't reshuffle
  // the queue mid-session. A big pile is split (lib/reviewSession.ts): the most
  // overdue words first, the rest in a later session. The day's few mastered
  // words (maintenance, task 4.1) come at the end, except in a session the
  // address keeps short on purpose (?limit=, the gentle comeback).
  const [{ due, waiting }] = useState(() => {
    const progress = useStudy.getState().progress[code]
    const cards = progress ? Object.values(progress.cards) : []
    const all = getDueCards(cards, today())
    const session = all.slice(0, reviewSessionSize(all.length, reviewLimit, askedLimit))
    const maintenance = askedLimit > 0 ? [] : getMaintenanceCards(cards, today())
    const list = [...session, ...maintenance]
    const due: { card: SRSCard; word: Word }[] = list.flatMap((card) => {
      const word = byId.get(card.id)
      return word ? [{ card, word }] : []
    })
    return { due, waiting: all.length - session.length }
  })

  // Stages before the first answer, for the end-of-session changes.
  const [before] = useState(() =>
    snapshotPhases(
      due.map((d) => d.word.id),
      useStudy.getState().progress[code]?.cards ?? {}
    )
  )

  // Recall mode: the question gets harder as the card matures.
  const [questions] = useState<QuizQuestion[]>(() => {
    const day = today()
    return due.map(({ card, word }) =>
      makeQuestion(word, pack.words, reviewModeFor(card, word, day))
    )
  })

  if (due.length === 0) {
    return (
      <EmptyState
        emoji="✅"
        title={t('Không có từ nào cần ôn hôm nay!', 'Nothing to review today!')}
        description={t(
          'Bạn đã ôn hết các từ đến hạn. Học thêm từ mới để lấp đầy lịch ôn của ngày mai nhé.',
          "You've reviewed every due word. Learn a few new ones to fill tomorrow's reviews."
        )}
      >
        <Link to="/learn?quick=1" className="btn-primary">
          {t('Học nhanh 5 từ', 'Quick: 5 new words')}
        </Link>
        <Link to="/games/match" className="btn-secondary">
          {t('Chơi Ghép cặp', 'Play Match')}
        </Link>
        <Link to="/listen" className="btn-secondary">
          🎧 {t('Nghe lại từ đã học', 'Listen to learned words')}
        </Link>
      </EmptyState>
    )
  }

  const newLeft = () =>
    summarize(pack.words, useStudy.getState().progress[code], dailyNewLimit).newRemainingToday

  const complete = (correct: number, total: number) => (
    <SessionComplete
      emoji="🎉"
      title={
        waiting > 0
          ? t('Xong một phần rồi!', 'One part done!')
          : t('Ôn xong hôm nay!', 'Reviews done for today!')
      }
      correct={correct}
      total={total}
    >
      <SessionChanges before={before} />
      {waiting > 0 && (
        <>
          <p className="w-full text-sm text-slate-600 dark:text-slate-300">
            {t(
              `Còn ${waiting} từ chờ ôn. Không cần ôn hết một lần: ôn tiếp bây giờ, hoặc để lúc khác.`,
              `${waiting} more words are waiting. No need to do them all at once: go on now, or come back later.`
            )}
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate('/review')}>
            {t(
              `Ôn tiếp ${reviewSessionSize(waiting, reviewLimit, 0)} từ`,
              `Review ${reviewSessionSize(waiting, reviewLimit, 0)} more`
            )}
          </button>
        </>
      )}
      {correct < total && (
        <p className="w-full text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Những từ bạn quên đã được học lại ngay trong buổi và sẽ được hỏi lại vào ngày mai.',
            'The words you forgot were relearned right away and will be asked again tomorrow.'
          )}
        </p>
      )}
      {/* Review, then five new words, then a step of the path (task 2.2). */}
      {newLeft() > 0 && waiting === 0 && (
        <Link to="/learn?quick=1" className="btn-primary">
          {t('Học 5 từ mới', 'Learn 5 new words')}
        </Link>
      )}
      <Link to="/quiz" className={newLeft() > 0 || waiting > 0 ? 'btn-secondary' : 'btn-primary'}>
        {t('Kiểm tra với quiz', 'Take a quiz')}
      </Link>
      <NextOnPath />
    </SessionComplete>
  )

  return (
    <div className="animate-fade-in">
      <header className="mx-auto mb-4 max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Ôn tập', 'Review')}</span>{' '}
          <span aria-hidden="true">🔁</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {waiting > 0
            ? t(
                `${due.length} từ quá hạn lâu nhất trước, còn ${waiting} từ để phiên sau`,
                `the ${due.length} most overdue words first, ${waiting} more for a later session`
              )
            : t(`${due.length} từ đến hạn`, `${due.length} words due`)}{' '}
          ·{' '}
          {style === 'recall'
            ? t(
                'từ càng "già" câu hỏi càng khó: chọn nghĩa → chọn từ → tự gõ ra.',
                'the older the word, the harder the question: pick the meaning → pick the word → type it.'
              )
            : t('lật thẻ và tự đánh giá thật lòng.', 'flip the card and grade yourself honestly.')}
        </p>
        <div
          className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          role="radiogroup"
          aria-label={t('Kiểu ôn tập', 'Review style')}
        >
          <StyleButton active={style === 'recall'} onClick={() => onStyle('recall')}>
            <Brain className="h-4 w-4" /> {t('Tự nhớ lại', 'Recall')}
            <span className="hidden text-xs font-normal opacity-70 sm:inline">
              {t('(khuyên dùng)', '(recommended)')}
            </span>
          </StyleButton>
          <StyleButton active={style === 'flip'} onClick={() => onStyle('flip')}>
            <Layers className="h-4 w-4" /> {t('Lật thẻ', 'Flashcards')}
          </StyleButton>
        </div>
      </header>

      {style === 'recall' ? (
        <QuizRunner
          questions={questions}
          wordsById={byId}
          ttsLang={pack.meta.ttsLang}
          requeueWrong
          onExit={() => navigate('/home')}
          onAnswer={(id, correct) => recordAnswer(code, id, correct)}
          renderComplete={(correct, total) => complete(correct, total)}
        />
      ) : (
        <FlashcardSession
          words={due.map((d) => d.word)}
          ttsLang={pack.meta.ttsLang}
          onAnswer={(w, correct) => recordAnswer(code, w.id, correct)}
          onExit={() => navigate('/home')}
          renderComplete={(correct, total) => complete(correct, total)}
        />
      )}
    </div>
  )
}

function StyleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-200'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
