import { useState } from 'react'
import { ArrowRight, Volume2 } from 'lucide-react'
import type { Word } from '@/types'
import {
  orderXp,
  pickOrderRound,
  placeToken,
  shuffledOrder,
  startOrder,
  tokenize,
  type OrderState,
} from '@/lib/games'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGames } from '@/store/gamesStore'
import { useProvideContext } from '@/store/contextStore'
import { exampleAudio, pronounce } from '@/lib/audio'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import { skyCelebrate } from '@/lib/skyEvents'
import HighlightExample from '@/components/HighlightExample'
import GameShell, { GameResult } from './GameShell'
import { useT } from '@/lib/i18n'
import { useTargetLang } from '@/hooks/useTargetLang'

// "Xếp câu": rebuild an example sentence from shuffled tiles, guided by its
// Vietnamese translation. It trains what a word list never does — where words
// go in an English sentence — using the same sentences the learner met on the
// cards. A tile that does not come next shakes; nothing is lost.

const SENTENCES = 5

export default function OrderGame() {
  const [round, setRound] = useState(0)
  return <OrderRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

function fresh(w: Word): OrderState {
  const tokens = tokenize(w.exampleEn)
  return startOrder(tokens, shuffledOrder(tokens.length))
}

function OrderRound({ onAgain }: { onAgain: () => void }) {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const soundEnabled = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const finishOrder = useGames((s) => s.finishOrder)
  const best = useGames((s) => s.bestOrderMistakes)

  const [words] = useState(() =>
    pickOrderRound(pack.words, useStudy.getState().progress[code]?.cards ?? {}, SENTENCES)
  )
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<OrderState | null>(() => (words[0] ? fresh(words[0]) : null))
  const [shaking, setShaking] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [result, setResult] = useState<{ xp: number; record: boolean } | null>(null)
  const t = useT()
  const L = useTargetLang()

  const word = words[idx]
  useProvideContext(
    word ? `Trò chơi Xếp câu — câu có từ "${word.word}"` : 'Trò chơi Xếp câu',
    word ? { word: word.word, meaning: word.meaning, exampleEn: word.exampleEn } : undefined
  )

  const speak = () =>
    word &&
    pronounce({
      audioSrc: exampleAudio(word.id, word.exampleEn),
      text: word.exampleEn,
      lang: pack.meta.ttsLang,
      rate: useSettings.getState().ttsRate,
    })

  const tap = (pos: number) => {
    if (!state || state.done) return
    const { state: next, correct } = placeToken(state, pos)
    if (next === state) return // already placed
    setState(next)
    if (correct) {
      if (next.done) {
        if (soundEnabled) playCorrect()
        speak()
      }
    } else {
      setMistakes((m) => m + 1)
      setShaking(pos)
      if (soundEnabled) playWrong()
      setTimeout(() => setShaking(null), 450)
    }
  }

  const next = () => {
    if (idx + 1 < words.length) {
      setIdx(idx + 1)
      setState(fresh(words[idx + 1]))
      return
    }
    const xp = orderXp(words.length, mistakes)
    addPlayXp(code, xp)
    const record = finishOrder(mistakes)
    setResult({ xp, record })
    celebrate(record ? 1.4 : 0.9)
    skyCelebrate(record ? 1.4 : 0.9)
  }

  if (!word || !state) {
    return (
      <GameShell title={t('Xếp câu', 'Build a sentence')} stats={null}>
        <p className="card p-6 text-center text-slate-500 dark:text-slate-400">
          {t('Chưa đủ câu để chơi.', 'Not enough sentences to play yet.')}
        </p>
      </GameShell>
    )
  }

  if (result) {
    return (
      <GameShell title={t('Xếp câu', 'Build a sentence')} stats={null}>
        <GameResult
          emoji={mistakes === 0 ? '🌟' : '🎉'}
          title={t('Xếp xong cả 5 câu!', 'All 5 sentences built!')}
          lines={[
            t(`Xếp nhầm: ${mistakes} lần`, `Wrong moves: ${mistakes}`),
            best !== null
              ? t(`Kỷ lục của bạn: ${best} lần nhầm`, `Your record: ${best} wrong moves`)
              : '',
          ].filter(Boolean)}
          xp={result.xp}
          record={result.record}
          onAgain={onAgain}
        />
      </GameShell>
    )
  }

  const built = state.placed.map((p) => state.tokens[state.order[p]])

  return (
    <GameShell
      title={t('Xếp câu 🔤', 'Build a sentence 🔤')}
      stats={
        <>
          <span>
            {idx + 1}/{words.length}
          </span>
          <span className={mistakes ? 'text-rose-500' : ''}>✗ {mistakes}</span>
        </>
      }
    >
      <div className="card space-y-5 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t(`Xếp thành câu ${L.vi} có nghĩa là`, `Build the ${L.en} sentence that means`)}
          </p>
          <p className="mt-1 text-lg font-semibold">{word.exampleVi}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('Từ đang luyện:', 'Practising:')}{' '}
            <b className="text-slate-600 dark:text-slate-300">{word.word}</b> · {word.meaning}
          </p>
        </div>

        {/* The sentence so far */}
        <div
          className={`flex min-h-[3.5rem] flex-wrap content-start gap-2 rounded-xl border-2 border-dashed p-3 ${
            state.done
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              : 'border-slate-300 dark:border-slate-700'
          }`}
          aria-live="polite"
        >
          {state.done ? (
            <p className="flex w-full items-start gap-2 text-lg font-medium">
              <button
                onClick={speak}
                className="mt-0.5 rounded-full bg-brand-600 p-1.5 text-white"
                aria-label={t('Nghe cả câu', 'Hear the whole sentence')}
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <span>
                <HighlightExample
                  sentence={word.exampleEn}
                  word={word.word}
                  pos={word.posCategory}
                />
              </span>
            </p>
          ) : built.length ? (
            built.map((t, i) => (
              <span
                key={i}
                className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white animate-pop"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="self-center text-sm text-slate-500 dark:text-slate-400">
              {t('Chạm các ô bên dưới theo thứ tự…', 'Tap the tiles below in order…')}
            </span>
          )}
        </div>

        {/* Tiles */}
        {!state.done && (
          <div className="flex flex-wrap gap-2">
            {state.order.map((tokenIndex, pos) => {
              const used = state.placed.includes(pos)
              return (
                <button
                  key={pos}
                  onClick={() => tap(pos)}
                  disabled={used}
                  className={`min-h-[2.75rem] rounded-lg border-2 px-3 py-2 font-semibold transition active:scale-95 ${
                    used
                      ? 'border-transparent bg-slate-100 text-transparent dark:bg-slate-800'
                      : shaking === pos
                        ? 'animate-shake border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  {state.tokens[tokenIndex]}
                </button>
              )
            })}
          </div>
        )}

        {state.done && (
          <div className="session-actions">
            <button className="btn-primary h-12 w-full" onClick={next} autoFocus>
              {idx + 1 < words.length
                ? t('Câu tiếp theo', 'Next sentence')
                : t('Xem kết quả', 'See results')}{' '}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
