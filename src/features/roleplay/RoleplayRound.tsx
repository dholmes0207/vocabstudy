import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Square, Volume2, X } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import {
  ROLEPLAY_PACKS,
  sceneStars,
  sceneXp,
  type RoleLine,
  type RoleScene,
  type RoleplayPack,
} from '@/lib/roleplay'
import { pronounce, stopPronounce, textAudio } from '@/lib/audio'
import {
  isRecognitionSupported,
  listenOnce,
  recognitionErrorMessage,
  type ListenHandle,
  type RecognitionFailure,
} from '@/lib/speech'
import { scoreSentence, type SentenceScore } from '@/lib/sentenceScore'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'

// One scene, line by line as a chat. The other person's lines are read aloud
// and the next line follows; on yours, hear the model if you like, tap the mic
// and say it. Missed words are marked; try again or go on.

const GAP_MS = 400
const GENDER = { W: 'female', M: 'male' } as const

type Mine =
  | { kind: 'idle' }
  | { kind: 'listening' }
  | { kind: 'scored'; result: SentenceScore }
  | { kind: 'error'; reason: RecognitionFailure }

export default function RoleplayRound({
  scene,
  pack,
  challenge,
  onAgain,
  onExit,
}: {
  scene: RoleScene
  pack: RoleplayPack
  challenge: boolean
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const code = useSettings((s) => s.currentLang)
  const rate = useSettings((s) => s.ttsRate)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const lang = ROLEPLAY_PACKS[pack].speech
  const [supported] = useState(isRecognitionSupported)
  const [idx, setIdx] = useState(0)
  const [mine, setMine] = useState<Mine>({ kind: 'idle' })
  const [scores, setScores] = useState<number[]>([])
  const handle = useRef<ListenHandle | null>(null)
  const paid = useRef(false)
  const done = idx >= scene.lines.length
  const line: RoleLine | undefined = scene.lines[idx]

  const say = (l: RoleLine, onEnd?: () => void) =>
    pronounce({ audioSrc: textAudio(l.text, GENDER[l.voice]), text: l.text, lang, rate, onEnd })

  // Their lines are read aloud, then the scene moves on.
  useEffect(() => {
    if (!line || line.who !== 'them') return
    let live = true
    let timer: number | undefined
    say(line, () => {
      if (live) timer = window.setTimeout(() => setIdx((i) => i + 1), GAP_MS)
    })
    return () => {
      live = false
      window.clearTimeout(timer)
      stopPronounce()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  useEffect(() => () => handle.current?.abort(), [])

  const stars = sceneStars(scores)
  useEffect(() => {
    if (!done || paid.current) return
    paid.current = true
    addPlayXp(code, sceneXp(stars))
    log(code, 'roleplay')
    if (stars === 3) celebrate(1.2)
  }, [done, stars, code, addPlayXp, log])

  const listen = () => {
    if (!line) return
    stopPronounce()
    setMine({ kind: 'listening' })
    handle.current = listenOnce({
      lang,
      accept: (heard) => scoreSentence(line.text, heard, lang).score === 100,
      onResult: (alts) => setMine({ kind: 'scored', result: scoreSentence(line.text, alts, lang) }),
      onError: (reason) => setMine({ kind: 'error', reason }),
      onEnd: () => {
        handle.current = null
      },
    })
  }
  const next = () => {
    if (mine.kind === 'scored') setScores((s) => [...s, mine.result.score])
    setMine({ kind: 'idle' })
    setIdx((i) => i + 1)
  }

  const shown = scene.lines.slice(
    0,
    Math.min(idx + (line?.who === 'them' ? 1 : 0), scene.lines.length)
  )

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="btn-ghost h-9 w-9 p-0"
          aria-label={t('Thoát', 'Exit')}
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          🎭 {t(...scene.title)}
          {challenge && ` · 🔥 ${t('Thử thách', 'Challenge')}`}
        </p>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(...scene.setting)}{' '}
        {t(`Bạn nói với: ${scene.them[0]}.`, `You are talking to: ${scene.them[1]}.`)}
      </p>

      <ol className="space-y-2" aria-label={t('Cuộc hội thoại', 'The conversation')}>
        {shown.map((l, i) => (
          <li key={i} className={`flex ${l.who === 'you' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                l.who === 'you'
                  ? 'rounded-br-sm bg-brand-600 text-white'
                  : 'rounded-bl-sm bg-white shadow dark:bg-slate-800'
              }`}
            >
              <p className="font-semibold" lang={pack}>
                {l.text}
              </p>
              {l.read && <p className="text-xs opacity-80">{l.read}</p>}
              <p className="text-xs opacity-70">{l.vi}</p>
              {l.who === 'them' && (
                <button
                  type="button"
                  onClick={() => say(l)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300"
                  aria-label={t('Nghe lại', 'Hear it again')}
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {line?.who === 'you' && (
        <section className="card space-y-3 border-2 border-brand-200 p-4 dark:border-brand-500/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {t('Đến lượt bạn', 'Your turn')}
          </p>
          <p className="text-slate-600 dark:text-slate-300">“{line.vi}”</p>
          {mine.kind === 'scored' ? (
            <p className="text-lg font-bold" lang={pack}>
              {mine.result.pieces.map((p, k) =>
                p.missed ? (
                  <mark
                    key={k}
                    className="rounded bg-rose-100 px-0.5 text-rose-700 underline decoration-wavy dark:bg-rose-950/60 dark:text-rose-200"
                  >
                    {p.text}
                  </mark>
                ) : (
                  <span key={k}>{p.text}</span>
                )
              )}
            </p>
          ) : (
            !challenge && (
              <p className="text-lg font-bold" lang={pack}>
                {line.text}
              </p>
            )
          )}
          {line.read && (!challenge || mine.kind === 'scored') && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{line.read}</p>
          )}
          {mine.kind === 'scored' && (
            <p role="status" className="text-sm font-semibold">
              {mine.result.verdict === 'great'
                ? t(`Tuyệt! ${mine.result.score}%`, `Great! ${mine.result.score}%`)
                : mine.result.verdict === 'good'
                  ? t(`Khá tốt: ${mine.result.score}%`, `Good: ${mine.result.score}%`)
                  : t(
                      `${mine.result.score}%: chữ gạch đỏ chưa nghe rõ, thử lại nhé.`,
                      `${mine.result.score}%: the words in red didn't come through; try again.`
                    )}
            </p>
          )}
          {mine.kind === 'error' && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {recognitionErrorMessage(mine.reason)}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => say(line)}
              className="btn-secondary h-11"
              aria-label={t('Nghe câu mẫu', 'Hear the model')}
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </button>
            {supported && (
              <button
                type="button"
                onClick={() => (mine.kind === 'listening' ? handle.current?.stop() : listen())}
                aria-pressed={mine.kind === 'listening'}
                className={`btn-primary h-11 flex-1 ${mine.kind === 'listening' ? 'animate-pulse' : ''}`}
              >
                {mine.kind === 'listening' ? (
                  <>
                    <Square className="h-4 w-4" /> {t('Đang nghe…', 'Listening…')}
                  </>
                ) : mine.kind === 'scored' ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> {t('Nói lại', 'Say it again')}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" /> {t('Nói', 'Speak')}
                  </>
                )}
              </button>
            )}
            {(mine.kind === 'scored' || !supported) && (
              <button type="button" onClick={next} className="btn-secondary h-11 flex-1">
                {supported ? t('Tiếp', 'Next') : t('Đã đọc to, tiếp', 'Said it, next')}
              </button>
            )}
          </div>
          {!supported && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'Trình duyệt này chưa chấm được giọng nói (thử Chrome, Edge hoặc Safari). Bạn vẫn nghe mẫu và đọc theo được.',
                'This browser cannot score speech yet (try Chrome, Edge or Safari). You can still hear the model and read along.'
              )}
            </p>
          )}
        </section>
      )}

      {done && (
        <section role="status" className="card space-y-3 p-5 text-center">
          <p className="text-4xl" aria-label={t(`${stars} sao`, `${stars} stars`)}>
            {'⭐'.repeat(stars)}
            <span className="opacity-20">{'⭐'.repeat(3 - stars)}</span>
          </p>
          <p className="font-bold">
            {scores.length
              ? t(
                  `Trung bình ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}% · +${sceneXp(stars)} XP`,
                  `Average ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}% · +${sceneXp(stars)} XP`
                )
              : `+${sceneXp(stars)} XP`}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary h-12 flex-1" onClick={onExit}>
              {t('Cảnh khác', 'Another scene')}
            </button>
            <button type="button" className="btn-primary h-12 flex-1" onClick={onAgain}>
              {t('Diễn lại', 'Play it again')}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
