import { useEffect, useState } from 'react'
import type { MatchPair } from '@/lib/games'
import { matchXp, pickMatchRound } from '@/lib/games'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useGames } from '@/store/gamesStore'
import { useProvideContext } from '@/store/contextStore'
import { pronounce, wordAudio } from '@/lib/audio'
import { playCorrect, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/confetti'
import GameShell, { GameResult } from './GameShell'

// "Ghép cặp": tap an English word, then its meaning. Six pairs against the
// clock; the clock starts on the first tap. A wrong pair flashes red and counts
// a mistake — nothing else. Each correct pair is spoken aloud, so the game also
// ties the sound of a word to its meaning.

const PAIRS = 6

export default function MatchGame() {
  const [round, setRound] = useState(0)
  return <MatchRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

type Side = 'en' | 'vi'

function shuffleIds(pairs: MatchPair[]): number[] {
  const ids = pairs.map((p) => p.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

function MatchRound({ onAgain }: { onAgain: () => void }) {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const ttsLang = pack.meta.ttsLang
  const soundEnabled = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const finishMatch = useGames((s) => s.finishMatch)
  const best = useGames((s) => s.bestMatchSeconds)

  const [pairs] = useState(() =>
    pickMatchRound(pack.words, useStudy.getState().progress[code]?.cards ?? {}, PAIRS)
  )
  const [left] = useState(() => shuffleIds(pairs))
  const [right] = useState(() => shuffleIds(pairs))
  const [selected, setSelected] = useState<{ side: Side; id: number } | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [wrong, setWrong] = useState<{ en: number; vi: number } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [result, setResult] = useState<{ seconds: number; xp: number; record: boolean } | null>(
    null
  )

  useProvideContext('Trò chơi Ghép cặp')

  // Tick the clock while a round is running.
  useEffect(() => {
    if (startedAt === null || result) return
    const t = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(t)
  }, [startedAt, result])

  const byId = new Map(pairs.map((p) => [p.id, p] as const))
  const seconds = startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000))

  // `at` is the tap's event.timeStamp — the same clock as performance.now().
  const tap = (side: Side, id: number, at: number) => {
    if (result || matched.includes(id)) return
    const start = startedAt ?? at
    if (startedAt === null) {
      setStartedAt(at)
      setNow(at)
    }
    if (!selected || selected.side === side) {
      setSelected({ side, id })
      if (side === 'en') speak(id)
      return
    }
    const en = side === 'en' ? id : selected.id
    const vi = side === 'vi' ? id : selected.id
    setSelected(null)
    if (en === vi) {
      const done = [...matched, id]
      setMatched(done)
      if (soundEnabled) playCorrect()
      if (side === 'vi') speak(id)
      if (done.length === pairs.length) finish(Math.max(1, Math.round((at - start) / 1000)))
    } else {
      setMistakes((m) => m + 1)
      setWrong({ en, vi })
      if (soundEnabled) playWrong()
      setTimeout(() => setWrong(null), 500)
    }
  }

  const speak = (id: number) =>
    pronounce({
      audioSrc: wordAudio(id),
      text: byId.get(id)?.en ?? '',
      lang: ttsLang,
      rate: useSettings.getState().ttsRate,
    })

  const finish = (secs: number) => {
    const xp = matchXp(pairs.length, mistakes, secs)
    addPlayXp(code, xp)
    const record = finishMatch(secs)
    setResult({ seconds: secs, xp, record })
    celebrate(record ? 1.4 : 0.9)
  }

  if (pairs.length < 2) {
    return (
      <GameShell title="Ghép cặp" stats={null}>
        <p className="card p-6 text-center text-slate-500">Chưa đủ từ để chơi.</p>
      </GameShell>
    )
  }

  if (result) {
    return (
      <GameShell title="Ghép cặp" stats={null}>
        <GameResult
          emoji={result.record ? '🏆' : '🎉'}
          title="Ghép xong!"
          lines={[
            `Thời gian: ${result.seconds} giây`,
            `Ghép nhầm: ${mistakes} lần`,
            best !== null ? `Kỷ lục của bạn: ${best} giây` : '',
          ].filter(Boolean)}
          xp={result.xp}
          record={result.record}
          onAgain={onAgain}
        />
      </GameShell>
    )
  }

  const tile = (side: Side, id: number) => {
    const p = byId.get(id)!
    const isMatched = matched.includes(id)
    const isSelected = selected?.side === side && selected.id === id
    const isWrong = wrong !== null && wrong[side] === id
    return (
      <button
        key={`${side}-${id}`}
        onClick={(e) => tap(side, id, e.timeStamp)}
        disabled={isMatched}
        aria-pressed={isSelected}
        className={`flex min-h-[3.5rem] w-full items-center justify-center rounded-xl border-2 px-2 py-2 text-center transition active:scale-[0.97] ${
          isMatched
            ? 'scale-95 border-emerald-300 bg-emerald-50 text-emerald-700 opacity-40 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
            : isWrong
              ? 'animate-shake border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200'
              : isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-100'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
        } ${side === 'en' ? 'text-base font-bold' : 'text-sm font-medium leading-snug'}`}
      >
        {side === 'en' ? p.en : p.vi}
      </button>
    )
  }

  return (
    <GameShell
      title="Ghép cặp 🧩"
      stats={
        <>
          <span title="Thời gian">⏱ {seconds}s</span>
          <span title="Ghép nhầm" className={mistakes ? 'text-rose-500' : ''}>
            ✗ {mistakes}
          </span>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-500">
        Chạm một từ tiếng Anh rồi chạm nghĩa của nó. Đồng hồ chạy từ lần chạm đầu tiên.
        {best !== null && <span className="ml-1 font-medium">Kỷ lục: {best}s.</span>}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">{left.map((id) => tile('en', id))}</div>
        <div className="space-y-3">{right.map((id) => tile('vi', id))}</div>
      </div>
    </GameShell>
  )
}
