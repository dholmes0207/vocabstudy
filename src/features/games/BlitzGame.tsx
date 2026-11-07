import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import {
  BLITZ_PENALTY,
  BLITZ_SECONDS,
  blitzMultiplier,
  blitzXp,
  pickBlitzDeck,
  type BlitzCard,
} from '@/lib/games'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGames } from '@/store/gamesStore'
import { useProvideContext } from '@/store/contextStore'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import GameShell, { GameResult } from './GameShell'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'

// "Đúng hay sai?": a word and a meaning, is it the right pair? As many as you
// can in 60 seconds. Five right in a row lifts the multiplier (up to ×4); a
// wrong answer resets it and takes 3 seconds off. ← / → (or F / J) answer from
// the keyboard.

export default function BlitzGame() {
  const [round, setRound] = useState(0)
  return <BlitzRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

type Phase = 'ready' | 'play' | 'done'

function BlitzRound({ onAgain }: { onAgain: () => void }) {
  const t = useT()
  const L = useTargetLang()
  useProvideContext('Trò chơi Đúng hay sai')
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const soundEnabled = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const finishBlitz = useGames((s) => s.finishBlitz)
  const best = useGames((s) => s.bestBlitz)
  const [deck] = useState<BlitzCard[]>(() =>
    pickBlitzDeck(pack.words, useStudy.getState().progress[code]?.cards ?? {})
  )

  const [phase, setPhase] = useState<Phase>('ready')
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [left, setLeft] = useState(BLITZ_SECONDS)
  const [result, setResult] = useState<{ xp: number; record: boolean } | null>(null)
  const endAt = useRef(0)
  const scoreRef = useRef(0)

  const finish = () => {
    setPhase('done')
    const final = scoreRef.current
    const xp = blitzXp(final)
    addPlayXp(code, xp)
    const record = finishBlitz(final)
    setResult({ xp, record })
    if (record) celebrate(1.3)
  }

  // The clock: a deadline, so a penalty just moves it.
  useEffect(() => {
    if (phase !== 'play') return
    const tick = setInterval(() => {
      const ms = endAt.current - performance.now()
      setLeft(Math.max(0, Math.ceil(ms / 1000)))
      if (ms <= 0) {
        clearInterval(tick)
        finish()
      }
    }, 100)
    return () => clearInterval(tick)
    // finish reads refs and stable store setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const start = () => {
    endAt.current = performance.now() + BLITZ_SECONDS * 1000
    setLeft(BLITZ_SECONDS)
    setPhase('play')
  }

  const card = deck[idx % Math.max(1, deck.length)]
  const answer = (said: boolean) => {
    if (phase !== 'play' || !card) return
    if (said === card.truth) {
      const gain = 10 * blitzMultiplier(combo)
      scoreRef.current += gain
      setScore(scoreRef.current)
      setCombo((c) => c + 1)
      setRight((n) => n + 1)
      setFlash('ok')
      if (soundEnabled) playCorrect()
    } else {
      endAt.current -= BLITZ_PENALTY * 1000
      setCombo(0)
      setWrong((n) => n + 1)
      setFlash('bad')
      if (soundEnabled) playWrong()
    }
    setIdx((i) => i + 1)
    setTimeout(() => setFlash(null), 250)
  }

  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'f') answer(false)
      if (e.key === 'ArrowRight' || e.key === 'j') answer(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const title = t('Đúng hay sai? ⚡', 'True or false? ⚡')

  if (deck.length < 2)
    return (
      <GameShell title={title} stats={null}>
        <p className="card p-6 text-center text-slate-500 dark:text-slate-400">
          {t('Chưa đủ từ để chơi.', 'Not enough words to play yet.')}
        </p>
      </GameShell>
    )

  if (phase === 'done' && result)
    return (
      <GameShell title={title} stats={null}>
        <GameResult
          emoji={result.record ? '🏆' : '⚡'}
          title={t(`${score} điểm!`, `${score} points!`)}
          lines={[
            t(`Đúng ${right} · sai ${wrong}`, `${right} right · ${wrong} wrong`),
            best !== null ? t(`Kỷ lục của bạn: ${best} điểm`, `Your record: ${best} points`) : '',
          ].filter(Boolean)}
          xp={result.xp}
          record={result.record}
          onAgain={onAgain}
        />
      </GameShell>
    )

  if (phase === 'ready')
    return (
      <GameShell title={title} stats={null}>
        <div className="card space-y-4 p-6 text-center">
          <p className="text-5xl" aria-hidden="true">
            ⚡
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            {t(
              `Mỗi thẻ có một từ ${L.vi} và một nghĩa. Đúng cặp thì bấm ✓, sai thì bấm ✗. ${BLITZ_SECONDS} giây, đúng 5 câu liền thì điểm nhân đôi, sai mất ${BLITZ_PENALTY} giây.`,
              `Each card shows a ${L.en} word and a meaning. Right pair: ✓. Wrong pair: ✗. ${BLITZ_SECONDS} seconds; five in a row doubles your points, a miss costs ${BLITZ_PENALTY} seconds.`
            )}
          </p>
          {best !== null && (
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              🏆 {t(`Kỷ lục: ${best} điểm`, `Record: ${best} points`)}
            </p>
          )}
          <button type="button" className="btn-primary h-12 w-full" onClick={start} autoFocus>
            {t('Bắt đầu!', 'Go!')}
          </button>
        </div>
      </GameShell>
    )

  const mult = blitzMultiplier(combo)
  return (
    <GameShell
      title={title}
      stats={
        <>
          <span title={t('Thời gian', 'Time')} className={left <= 10 ? 'text-rose-500' : ''}>
            ⏱ {left}s
          </span>
          <span title={t('Điểm', 'Score')}>⭐ {score}</span>
        </>
      }
    >
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            left <= 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
          }`}
          style={{ width: `${(left / BLITZ_SECONDS) * 100}%` }}
        />
      </div>
      <p className="mb-2 h-6 text-center text-sm font-bold text-orange-600 dark:text-orange-300">
        {combo >= 3 && (
          <span className="animate-pop inline-block">
            🔥 {t(`${combo} câu liền`, `${combo} in a row`)}
            {mult > 1 && ` · ×${mult}`}
          </span>
        )}
      </p>
      <div
        role="group"
        aria-label={t('Thẻ hiện tại', 'Current card')}
        className={`card flex min-h-[12rem] flex-col items-center justify-center gap-2 p-6 text-center transition ${
          flash === 'ok'
            ? 'ring-4 ring-emerald-400'
            : flash === 'bad'
              ? 'animate-shake ring-4 ring-rose-400'
              : ''
        }`}
      >
        <p className="text-3xl font-extrabold" lang={pack.meta.ttsLang}>
          {card.word}
        </p>
        {card.reading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.reading}</p>
        )}
        <p className="mt-2 text-xl font-semibold text-brand-700 dark:text-brand-300">
          {card.meaning}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-lg font-bold text-white shadow active:scale-95"
        >
          <X className="h-6 w-6" /> {t('Sai', 'Wrong')}
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow active:scale-95"
        >
          <Check className="h-6 w-6" /> {t('Đúng', 'Right')}
        </button>
      </div>
      <p className="mt-3 hidden text-center text-xs text-slate-400 sm:block">
        {t('Phím ← sai · → đúng', 'Keys: ← wrong · → right')}
      </p>
    </GameShell>
  )
}
