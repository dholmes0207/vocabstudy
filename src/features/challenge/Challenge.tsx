import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useChallenge } from '@/store/challengeStore'
import { CHALLENGE_SIZE, challengeQuestions, currentStreak } from '@/lib/dailyChallenge'
import { today } from '@/lib/date'
import { useT } from '@/lib/i18n'
import QuizRunner from '@/components/QuizRunner'
import SessionComplete from '@/components/SessionComplete'

// /challenge — "Thử thách hôm nay" (lib/dailyChallenge.ts): five questions,
// the same for everyone today. Answers count for the review schedule like any
// quiz; the result and the streak of days are kept per language.

export default function Challenge() {
  const t = useT()
  const navigate = useNavigate()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const finish = useChallenge((s) => s.finish)
  const day = today()
  const questions = useMemo(
    () => challengeQuestions(pack.words, code, day),
    [pack.words, code, day]
  )
  const wordsById = useMemo(() => new Map(pack.words.map((w) => [w.id, w])), [pack.words])

  return (
    <QuizRunner
      questions={questions}
      wordsById={wordsById}
      ttsLang={pack.meta.ttsLang}
      onAnswer={(id, correct) => recordAnswer(code, id, correct)}
      onExit={() => navigate('/')}
      caption={t('Thử thách hôm nay', "Today's challenge")}
      renderComplete={(correct, total) => (
        <ChallengeDone
          correct={correct}
          total={total}
          onRecord={() => finish(code, day, correct, total)}
        />
      )}
    />
  )
}

function ChallengeDone({
  correct,
  total,
  onRecord,
}: {
  correct: number
  total: number
  onRecord: () => void
}) {
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  // Recorded as the result shows. Recording the same day twice keeps the better
  // score and the same streak, so a second run of the effect changes nothing.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once per result
  useEffect(onRecord, [])
  const streak = useChallenge((s) => currentStreak(s.records[code], today()))
  return (
    <SessionComplete
      emoji="🎯"
      title={t('Xong thử thách hôm nay!', "Today's challenge done!")}
      correct={correct}
      total={total}
    >
      <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
        {t(
          `Chuỗi thử thách: ${streak} ngày liên tiếp 🔥 Ngày mai có ${CHALLENGE_SIZE} câu mới.`,
          `Challenge streak: ${streak} day${streak === 1 ? '' : 's'} in a row 🔥 ${CHALLENGE_SIZE} new questions tomorrow.`
        )}
      </p>
      <Link to="/" className="btn-primary">
        {t('Về trang chủ', 'Back home')}
      </Link>
    </SessionComplete>
  )
}
