import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { loadTopics, type Topic } from '@/lib/topics'
import { useT } from '@/lib/i18n'
import DeckBoard, { type Deck } from '@/components/DeckBoard'

// /topics — learn by situation: work, health, home… (docs/design/topics.md).
// Every deck points at words already in the pack, so progress is shared with
// the rest of the app: a word learned here is learned everywhere.

export default function Topics() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const t = useT()
  const [topics, setTopics] = useState<Topic[] | null>(null)

  useEffect(() => {
    let alive = true
    void loadTopics(code).then((list) => alive && setTopics(list))
    return () => {
      alive = false
    }
  }, [code])

  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])
  const decks = useMemo<Deck[]>(
    () =>
      (topics ?? []).map((topic) => ({
        id: topic.id,
        emoji: topic.emoji,
        title: topic.title,
        words: topic.wordIds.map((id) => byId.get(id)).filter((w): w is Word => !!w),
      })),
    [topics, byId]
  )

  return (
    <DeckBoard
      decks={decks}
      backLabel={['Chọn chủ đề khác', 'Pick another topic']}
      before={
        <>
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-aurora">{t('Học theo chủ đề', 'Learn by topic')}</span>{' '}
              <span aria-hidden="true">🗂️</span>
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {t(
                'Từ vựng gom theo tình huống: ăn uống, đi lại, sức khoẻ… "Học" lấy tối đa 10 từ chưa thành thạo, "Ôn" hỏi nhanh những từ bạn đã gặp trong bộ. Tiến độ dùng chung với cả app.',
                'Words grouped by situation: food, getting around, health… "Learn" takes up to 10 words you have not mastered, "Review" quizzes the ones you have already met. Progress is shared with the whole app.'
              )}
            </p>
          </header>
          {topics === null && (
            <p className="text-slate-500 dark:text-slate-400">{t('Đang tải…', 'Loading…')}</p>
          )}
          {topics !== null && decks.length === 0 && (
            <p className="card p-6 text-slate-500 dark:text-slate-400">
              {t('Ngôn ngữ này chưa có bộ chủ đề. ', 'This language has no topic decks yet. ')}
              <Link to="/learn" className="font-medium text-brand-600 dark:text-brand-300">
                {t('Học theo bộ từ', 'Learn by word set')}
              </Link>
            </p>
          )}
        </>
      }
    />
  )
}
