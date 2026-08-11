import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Word } from '@/types'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { getDueCards } from '@/lib/srs'
import { today } from '@/lib/date'
import FlashcardSession from '@/components/FlashcardSession'
import SessionComplete from '@/components/SessionComplete'
import EmptyState from '@/components/EmptyState'

export default function Review() {
  const navigate = useNavigate()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const reviewLimit = useSettings((s) => s.dailyReviewLimit)
  const recordAnswer = useStudy((s) => s.recordAnswer)
  // Read progress once (not reactively) so recording answers doesn't reshuffle
  // the queue mid-session.
  const progressAtMount = useStudy.getState().progress[code]

  const byId = useMemo(() => new Map(pack.words.map((w) => [w.id, w] as const)), [pack.words])

  const [queue] = useState<Word[]>(() => {
    const cards = progressAtMount ? Object.values(progressAtMount.cards) : []
    let due = getDueCards(cards, today())
    if (reviewLimit > 0) due = due.slice(0, reviewLimit)
    return due.map((c) => byId.get(c.id)).filter((w): w is Word => Boolean(w))
  })

  if (queue.length === 0) {
    return (
      <EmptyState
        emoji="✅"
        title="Không có từ nào cần ôn hôm nay!"
        description="Bạn đã ôn hết các từ đến hạn. Học thêm từ mới để lấp đầy lịch ôn của ngày mai nhé."
      >
        <Link to="/learn" className="btn-primary">
          Học từ mới
        </Link>
        <Link to="/quiz" className="btn-secondary">
          Làm quiz
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="animate-fade-in">
      <header className="mx-auto mb-4 max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Ôn tập 🔁</h1>
        <p className="mt-1 text-slate-500">
          {queue.length} từ đến hạn · nhớ được thì giãn lịch ra, quên thì học lại.
        </p>
      </header>
      <FlashcardSession
        words={queue}
        ttsLang={pack.meta.ttsLang}
        onAnswer={(w, correct) => recordAnswer(code, w.id, correct)}
        onExit={() => navigate('/')}
        renderComplete={(correct, total) => (
          <SessionComplete emoji="🎉" title="Ôn xong hôm nay!" correct={correct} total={total}>
            <Link to="/quiz" className="btn-primary">
              Kiểm tra với quiz
            </Link>
            <Link to="/learn" className="btn-secondary">
              Học từ mới
            </Link>
          </SessionComplete>
        )}
      />
    </div>
  )
}
