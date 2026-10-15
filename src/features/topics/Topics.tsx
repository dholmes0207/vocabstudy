import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, RotateCcw } from 'lucide-react'
import type { QuizQuestion, Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { phaseOf } from '@/lib/srs'
import { generateQuiz } from '@/lib/quiz'
import { loadTopics, type Topic } from '@/lib/topics'
import { useT } from '@/lib/i18n'
import LearnSession from '@/features/learn/LearnSession'
import QuizRunner from '@/components/QuizRunner'
import SessionComplete from '@/components/SessionComplete'
import ProgressRing from '@/components/ProgressRing'

// /topics — learn by situation: work, health, home… (docs/design/topics.md).
// Every deck points at words already in the pack, so progress is shared with
// the rest of the app: a word learned here is learned everywhere.

export default function Topics() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards ?? NO_CARDS)
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const t = useT()
  const [topics, setTopics] = useState<Topic[] | null>(null)
  const [session, setSession] = useState<
    | { kind: 'learn'; topic: Topic; words: Word[] }
    | { kind: 'review'; topic: Topic; questions: QuizQuestion[] }
    | null
  >(null)

  useEffect(() => {
    let alive = true
    void loadTopics(code).then((list) => alive && setTopics(list))
    return () => {
      alive = false
    }
  }, [code])

  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])
  const decks = useMemo(
    () =>
      (topics ?? []).map((topic) => {
        const words = topic.wordIds.map((id) => byId.get(id)).filter((w): w is Word => !!w)
        const mastered = words.filter((w) => phaseOf(cards[w.id]) === 'mastered').length
        const learned = words.filter((w) => cards[w.id]).length
        return { topic, words, mastered, learned }
      }),
    [topics, byId, cards]
  )

  if (session?.kind === 'review') {
    const { topic } = session
    return (
      <QuizRunner
        questions={session.questions}
        wordsById={byId}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(id, correct) => recordAnswer(code, id, correct)}
        onExit={() => setSession(null)}
        renderComplete={(correct, total) => (
          <SessionComplete
            emoji={topic.emoji}
            title={t(`Ôn xong "${topic.title[0]}"`, `"${topic.title[1]}" reviewed`)}
            correct={correct}
            total={total}
          >
            {correct < total && (
              <p className="w-full text-sm text-slate-500">
                {t(
                  'Những từ bạn quên đã được đưa vào lịch ôn để hỏi lại sớm.',
                  'The words you missed are back in your reviews and will come up again soon.'
                )}
              </p>
            )}
            <button className="btn-primary" onClick={() => setSession(null)}>
              {t('Chọn chủ đề khác', 'Pick another topic')}
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
        onExit={() => setSession(null)}
        renderComplete={(total) => (
          <SessionComplete
            emoji={session.topic.emoji}
            title={t('Xong một chặng!', 'Nice work!')}
            correct={total}
            total={total}
            showScore={false}
            note={t(
              `Bạn vừa học ${total} từ chủ đề "${session.topic.title[0]}". Ngày mai app sẽ hỏi lại để bạn nhớ lâu.`,
              `You just learned ${total} words about "${session.topic.title[1]}". Tomorrow the app will ask again so they stick.`
            )}
          >
            <button className="btn-primary" onClick={() => setSession(null)}>
              {t('Chọn chủ đề khác', 'Pick another topic')}
            </button>
          </SessionComplete>
        )}
      />
    )
  }

  const start = (topic: Topic, words: Word[]) => {
    // The deck's not-yet-mastered words, a handful at a time.
    const list = words.filter((w) => phaseOf(cards[w.id]) !== 'mastered').slice(0, 10)
    if (list.length) setSession({ kind: 'learn', topic, words: list })
  }

  const review = (topic: Topic, words: Word[]) => {
    // A quick recall check on the deck's words you have already met.
    const met = words.filter((w) => cards[w.id])
    const questions = generateQuiz({ words: met, pool: pack.words, limit: 10 })
    if (questions.length) setSession({ kind: 'review', topic, questions })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Học theo chủ đề', 'Learn by topic')}</span>{' '}
          <span aria-hidden="true">🗂️</span>
        </h1>
        <p className="mt-1 text-slate-500">
          {t(
            'Từ vựng gom theo tình huống: ăn uống, đi lại, sức khoẻ… "Học" lấy tối đa 10 từ chưa thành thạo, "Ôn" hỏi nhanh những từ bạn đã gặp trong bộ. Tiến độ dùng chung với cả app.',
            'Words grouped by situation: food, getting around, health… "Learn" takes up to 10 words you have not mastered, "Review" quizzes the ones you have already met. Progress is shared with the whole app.'
          )}
        </p>
      </header>

      {topics === null && <p className="text-slate-400">{t('Đang tải…', 'Loading…')}</p>}
      {topics !== null && decks.length === 0 && (
        <p className="card p-6 text-slate-500">
          {t('Ngôn ngữ này chưa có bộ chủ đề. ', 'This language has no topic decks yet. ')}
          <Link to="/learn" className="font-medium text-brand-600 dark:text-brand-300">
            {t('Học theo bộ từ', 'Learn by word set')}
          </Link>
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map(({ topic, words, mastered, learned }) => {
          const done = words.length > 0 && mastered === words.length
          return (
            <li key={topic.id} className="card flex min-w-0 flex-col gap-3 p-4">
              <div className="flex items-center gap-4">
                <ProgressRing value={words.length ? mastered / words.length : 0} size={56}>
                  <span className="text-2xl" aria-hidden="true">
                    {topic.emoji}
                  </span>
                </ProgressRing>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{t(...topic.title)}</span>
                  <span className="text-sm text-slate-500">
                    {done
                      ? t('Đã thành thạo cả bộ 🎉', 'All mastered 🎉')
                      : t(
                          `${mastered}/${words.length} thành thạo`,
                          `${mastered}/${words.length} mastered`
                        )}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => start(topic, words)}
                  disabled={done}
                  className="btn-primary h-10 text-sm disabled:opacity-50"
                >
                  <BookOpen className="h-4 w-4" /> {t('Học', 'Learn')}
                </button>
                <button
                  type="button"
                  onClick={() => review(topic, words)}
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
    </div>
  )
}
