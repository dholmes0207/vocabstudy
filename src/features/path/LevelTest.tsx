import { useEffect, useState } from 'react'
import { ArrowRight, Heart, Swords, Trophy } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { usePath } from '@/store/pathStore'
import { useImmersive } from '@/store/uiStore'
import { loadGrammarPack, type GrammarUnit } from '@/lib/grammar'
import { LIVES, TEST_XP, buildLevelTest, testWon, type LevelQuestion } from '@/lib/levelTest'
import type { PathLevel } from '@/lib/learningPath'
import { celebrate } from '@/lib/confetti'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import { CenterSpinner } from '@/components/DataGate'
import SpeakButton from '@/components/SpeakButton'
import { wordAudio } from '@/lib/audio'

// "Thi vượt cấp" (lib/levelTest.ts): twelve questions on one level, three
// hearts. Win and the next level opens; lose and the path says what to practise.

type Phase = 'intro' | 'play' | 'won' | 'lost'

export default function LevelTest({
  level,
  isLast,
  onExit,
}: {
  level: PathLevel
  /** No level after this one: winning gives the trophy only. */
  isLast: boolean
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const pass = usePath((s) => s.pass)
  const already = usePath((s) => (s.passed[code] ?? []).includes(level.n))

  // The level's grammar units come from the grammar pack; words alone if it fails.
  const [grammar, setGrammar] = useState<GrammarUnit[] | null>(null)
  useEffect(() => {
    let alive = true
    loadGrammarPack(code)
      .then((p) => alive && setGrammar(p.units))
      .catch(() => alive && setGrammar([]))
    return () => {
      alive = false
    }
  }, [code])

  const [phase, setPhase] = useState<Phase>('intro')
  const [questions, setQuestions] = useState<LevelQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)

  if (!grammar) return <CenterSpinner />

  const start = () => {
    setQuestions(buildLevelTest(level, pack.words, grammar))
    setIdx(0)
    setPicked(null)
    setMistakes(0)
    setPhase('play')
  }

  const q = questions[idx]
  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === q.answer
    if (soundOn) buzz(ok)
    if (!ok) setMistakes((m) => m + 1)
  }
  const next = () => {
    const lost = mistakes >= LIVES
    const last = idx + 1 >= questions.length
    if (lost) return setPhase('lost')
    if (last) {
      if (testWon(mistakes, questions.length, questions.length)) {
        pass(code, level.n)
        addPlayXp(code, TEST_XP)
        celebrate(1.6)
        return setPhase('won')
      }
      return setPhase('lost')
    }
    setIdx(idx + 1)
    setPicked(null)
  }

  const header = (
    <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      <Swords className="h-4 w-4" aria-hidden="true" />
      {t(`Thi vượt cấp ${level.n}`, `Level ${level.n} challenge`)} · {t(...level.title)}
    </p>
  )

  if (phase === 'intro')
    return (
      <div className="mx-auto max-w-lg space-y-5 animate-fade-in">
        {header}
        <div
          className={`rounded-3xl bg-gradient-to-br ${level.tone} p-6 text-center text-white shadow-lg`}
        >
          <p className="text-6xl" aria-hidden="true">
            {level.icon}
          </p>
          <h1 className="mt-3 text-2xl font-extrabold">
            {t(`Thử thách cấp ${level.n}`, `Level ${level.n} challenge`)}
          </h1>
          <p className="mt-2 text-white/90">
            {isLast
              ? t(
                  'Chứng minh bạn đã nắm cấp cao nhất của lộ trình.',
                  'Show you have mastered the top level of the path.'
                )
              : t(
                  `Thắng để mở luôn cấp ${level.n + 1}, khỏi phải làm hết các bước của cấp này.`,
                  `Win to open level ${level.n + 1} right away, without doing every step of this one.`
                )}
          </p>
          <ul className="mt-4 space-y-1 text-sm font-semibold">
            <li>
              {t(
                '12 câu từ vựng và ngữ pháp của cấp',
                '12 questions on the words and grammar of the level'
              )}
            </li>
            <li>
              {t(
                `${LIVES} tim: sai lần thứ ${LIVES} là thua`,
                `${LIVES} hearts: the ${LIVES}rd mistake ends it`
              )}
            </li>
            <li>{t(`Thắng: +${TEST_XP} XP`, `Win: +${TEST_XP} XP`)}</li>
          </ul>
        </div>
        {already && (
          <p className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            🏆{' '}
            {t(
              'Bạn đã thắng thử thách này. Làm lại cho vui!',
              'You have won this one. Play again for fun!'
            )}
          </p>
        )}
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Để sau', 'Later')}
          </button>
          <button type="button" className="btn-primary h-12 flex-1" onClick={start}>
            {t('Bắt đầu', 'Start')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )

  if (phase === 'won' || phase === 'lost') {
    const won = phase === 'won'
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center animate-fade-in">
        {header}
        <p className="text-7xl" aria-hidden="true">
          {won ? '🏆' : '💔'}
        </p>
        <h1 className="text-2xl font-extrabold">
          {won
            ? t(`Bạn đã vượt cấp ${level.n}!`, `You beat level ${level.n}!`)
            : mistakes >= LIVES
              ? t('Hết tim rồi!', 'Out of hearts!')
              : t('Chưa qua lần này', 'Not this time')}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          {won
            ? isLast
              ? t(
                  `+${TEST_XP} XP. Bạn đã chinh phục cả lộ trình!`,
                  `+${TEST_XP} XP. You conquered the whole path!`
                )
              : t(
                  `+${TEST_XP} XP. Cấp ${level.n + 1} đã mở.`,
                  `+${TEST_XP} XP. Level ${level.n + 1} is open.`
                )
            : t(
                `Bạn đã trả lời ${idx + 1 - mistakes}/${idx + 1} câu đúng. Làm thêm vài bước của cấp ${level.n} rồi thử lại nhé.`,
                `${idx + 1 - mistakes} of ${idx + 1} right. Do a few more steps of level ${level.n}, then try again.`
              )}
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
            {t('Về lộ trình', 'Back to the path')}
          </button>
          {!won && (
            <button type="button" className="btn-primary h-12 flex-1" onClick={start}>
              {t('Thử lại', 'Try again')}
            </button>
          )}
        </div>
      </div>
    )
  }

  const answered = picked !== null
  const right = answered && picked === q.answer
  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        {header}
        <span
          className="flex gap-1"
          aria-label={t(`Còn ${LIVES - mistakes} tim`, `${LIVES - mistakes} hearts left`)}
        >
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart
              key={i}
              className={`h-6 w-6 transition ${
                i < LIVES - mistakes
                  ? 'fill-rose-500 text-rose-500'
                  : 'scale-75 text-slate-300 dark:text-slate-600'
              }`}
              aria-hidden="true"
            />
          ))}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${level.tone} transition-all`}
          style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      <div className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(`Câu ${idx + 1}/${questions.length}`, `Question ${idx + 1}/${questions.length}`)} ·{' '}
          {q.kind === 'grammar' ? t('Ngữ pháp', 'Grammar') : t('Từ vựng', 'Words')}
        </p>
        <p className="flex items-center gap-3 text-xl font-bold">
          {q.sayable && q.wordId !== undefined && (
            <SpeakButton
              key={idx}
              text={q.prompt}
              lang={pack.meta.ttsLang}
              audioSrc={wordAudio(q.wordId)}
              size="sm"
              label={t('Nghe từ này', 'Hear this word')}
            />
          )}
          {q.prompt}
        </p>
        {q.hint && <p className="text-sm text-slate-500 dark:text-slate-400">{q.hint}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o, i) => {
            const state = !answered
              ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
              : i === q.answer
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                : i === picked
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'border-slate-200 opacity-60 dark:border-slate-700'
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                className={`rounded-xl border-2 p-3 text-left font-semibold transition ${state}`}
              >
                {o}
              </button>
            )
          })}
        </div>
        {answered && (
          <div
            role="status"
            className={`rounded-xl p-3 text-sm ${
              right
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
            }`}
          >
            <p className="font-bold">
              {right ? t('Chính xác!', 'Right!') : t('Chưa đúng.', 'Not quite.')}{' '}
              {!right && t(`Đáp án: ${q.options[q.answer]}`, `Answer: ${q.options[q.answer]}`)}
            </p>
            {q.explain && <p className="mt-1">{q.explain}</p>}
          </div>
        )}
      </div>
      {answered && (
        <button type="button" className="btn-primary h-12 w-full" onClick={next}>
          {mistakes >= LIVES || idx + 1 >= questions.length
            ? t('Xem kết quả', 'See the result')
            : t('Câu tiếp', 'Next')}
          {!(mistakes >= LIVES || idx + 1 >= questions.length) && (
            <ArrowRight className="h-4 w-4" />
          )}
          {(mistakes >= LIVES || idx + 1 >= questions.length) && <Trophy className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
