import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, CheckCheck, LogOut, Mic } from 'lucide-react'
import type { Word } from '@/types'
import { GROUP_SIZE, chunk, learnDrills } from '@/lib/practice'
import { makeQuestion } from '@/lib/quiz'
import { exampleAudio, prefetchAudio, pronounce, wordAudio } from '@/lib/audio'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useProvideContext } from '@/store/contextStore'
import { useImmersive } from '@/store/uiStore'
import QuizRunner from '@/components/QuizRunner'
import WordInsight from '@/components/WordInsight'
import MySentence from '@/components/MySentence'
import PronounceTrainer from '@/components/PronounceTrainer'
import { useT } from '@/lib/i18n'
import { KNOWN_CHECK_DAYS, phaseOf } from '@/lib/srs'

// A learning session for a beginner, in small groups:
//
//   meet 5 words (one full card each, no self-grading) → answer about those
//   same 5 (recognise, then recall in a sentence) → next group.
//
// Retrieving a word minutes after meeting it is what moves it out of "I have
// seen this" and into memory; the old flip-and-"Đã nhớ" flow asked learners to
// grade themselves seconds after reading the answer, which everybody passes.
// Every answer goes to the SRS, which is what puts the word on tomorrow's list.

interface Props {
  words: Word[]
  pool: Word[]
  ttsLang: string
  onAnswer: (word: Word, correct: boolean) => void
  /**
   * "Mình biết từ này rồi" on a meet card: the word leaves this session and the
   * caller schedules a check (studyStore.markKnown). No button without it.
   */
  onKnown?: (word: Word) => void
  onExit: () => void
  /** Rendered once every group is done: words studied, and words skipped as known. */
  renderComplete: (total: number, known: number) => React.ReactNode
}

type Phase = 'meet' | 'practice'

export default function LearnSession({
  words,
  pool,
  ttsLang,
  onAnswer,
  onKnown,
  onExit,
  renderComplete,
}: Props) {
  const groups = useMemo(() => chunk(words, GROUP_SIZE), [words])
  const byId = useMemo(() => new Map(pool.map((w) => [w.id, w] as const)), [pool])
  const [groupIdx, setGroupIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('meet')
  const [cardIdx, setCardIdx] = useState(0)
  const [known, setKnown] = useState<number[]>([])
  const t = useT()

  // Memoised: a fresh array every render would rebuild (and reshuffle) the drills.
  const group = useMemo(
    () => groups[groupIdx]?.filter((w) => !known.includes(w.id)),
    [groups, groupIdx, known]
  )

  const markKnown = (w: Word) => {
    onKnown?.(w)
    setKnown((k) => [...k, w.id])
    const left = group!.filter((x) => x.id !== w.id).length
    if (left === 0) {
      // Nothing left to meet or practise in this group.
      setGroupIdx((g) => g + 1)
      setCardIdx(0)
      setPhase('meet')
    } else if (cardIdx >= left) {
      setPhase('practice')
    }
  }

  // Built once per group, so options don't reshuffle on re-render.
  const questions = useMemo(
    () =>
      group ? learnDrills(group).map((d) => makeQuestion(byId.get(d.wordId)!, pool, d.mode)) : [],
    [group, byId, pool]
  )

  if (!group) return <>{renderComplete(words.length - known.length, known.length)}</>

  const groupLabel =
    groups.length > 1
      ? t(`Nhóm ${groupIdx + 1}/${groups.length}`, `Group ${groupIdx + 1}/${groups.length}`)
      : ''
  const isLast = groupIdx + 1 >= groups.length

  if (phase === 'meet') {
    return (
      <MeetCards
        key={groupIdx}
        group={group}
        index={cardIdx}
        ttsLang={ttsLang}
        caption={groupLabel}
        onIndex={setCardIdx}
        onDone={() => setPhase('practice')}
        onKnown={onKnown && ((w) => markKnown(w))}
        onExit={onExit}
      />
    )
  }

  return (
    <QuizRunner
      key={groupIdx}
      questions={questions}
      wordsById={byId}
      ttsLang={ttsLang}
      requeueWrong
      caption={`${t('Luyện nhớ', 'Recall practice')}${groupLabel ? ` · ${groupLabel.toLowerCase()}` : ''}`}
      onExit={onExit}
      onAnswer={(id, correct) => {
        const w = byId.get(id)
        if (w) onAnswer(w, correct)
      }}
      renderComplete={(correct, total) =>
        isLast ? (
          renderComplete(words.length - known.length, known.length)
        ) : (
          <BetweenGroups
            label={groupLabel}
            size={group.length}
            correct={correct}
            total={total}
            onNext={() => {
              setGroupIdx((g) => g + 1)
              setCardIdx(0)
              setPhase('meet')
            }}
            onExit={onExit}
          />
        )
      }
    />
  )
}

/** A breather between groups — first-try score, framed as information, not a grade. */
function BetweenGroups({
  label,
  size,
  correct,
  total,
  onNext,
  onExit,
}: {
  label: string
  size: number
  correct: number
  total: number
  onNext: () => void
  onExit: () => void
}) {
  const t = useT()
  return (
    <div className="mx-auto max-w-md animate-fade-in text-center">
      <div className="card p-8">
        <p className="text-5xl">✅</p>
        <h2 className="mt-3 text-xl font-extrabold">
          {t(`Xong ${label.toLowerCase()}!`, `${label} done!`)}
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {t('Bạn nhớ đúng ngay lần đầu', 'You got')}{' '}
          <b>
            {correct}/{total}
          </b>{' '}
          {t(
            `câu. ${size} từ vừa rồi đã vào lịch ôn — app sẽ tự hỏi lại đúng lúc bạn sắp quên.`,
            `right on the first try. These ${size} words are now scheduled — the app will ask again just before you'd forget.`
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" autoFocus onClick={onNext}>
            {t('Nhóm tiếp theo', 'Next group')} <ArrowRight className="h-4 w-4" />
          </button>
          <button className="btn-secondary" onClick={onExit}>
            {t('Để sau', 'Later')}
          </button>
        </div>
      </div>
    </div>
  )
}

function MeetCards({
  group,
  index,
  ttsLang,
  caption,
  onIndex,
  onDone,
  onKnown,
  onExit,
}: {
  group: Word[]
  index: number
  ttsLang: string
  caption: string
  onIndex: (i: number) => void
  onDone: () => void
  onKnown?: (word: Word) => void
  onExit: () => void
}) {
  useImmersive()
  const autoSpeak = useSettings((s) => s.autoSpeak)
  const lang = useSettings((s) => s.currentLang)
  const word = group[index]
  const last = index + 1 >= group.length
  const t = useT()
  // Only for a word not in the schedule yet: a deck replay also shows words
  // being reviewed, and those already get checked at the right time.
  const isNew = useStudy((s) => phaseOf(s.progress[lang]?.cards[word.id]) === 'new')

  useProvideContext(`Đang làm quen từ "${word.word}"`, {
    word: word.word,
    meaning: word.meaning,
    ipa: word.ipa,
    pos: word.pos,
    exampleEn: word.exampleEn,
  })

  useEffect(() => {
    if (autoSpeak)
      pronounce({
        audioSrc: wordAudio(word.id),
        text: word.word,
        lang: ttsLang,
        rate: useSettings.getState().ttsRate,
      })
    prefetchAudio(
      group
        .slice(index, index + 3)
        .flatMap((w) => [wordAudio(w.id), exampleAudio(w.id, w.exampleEn)])
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id])

  const forward = () => (last ? onDone() : onIndex(index + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.closest('input, textarea, select, button, a')) return
      if (e.key === 'Enter' || e.key === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault()
        forward()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        onIndex(index - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500 dark:text-slate-400"
          aria-label={t('Kết thúc phiên học', 'End lesson')}
          title={t('Kết thúc (từ đã trả lời vẫn được lưu)', 'End (answered words are saved)')}
        >
          <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
        </button>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {group.map((w, i) => (
            <span
              key={w.id}
              className={`h-2 flex-1 rounded-full ${i <= index ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {index + 1}/{group.length}
        </span>
      </div>
      <p className="-mt-2 mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {t('Làm quen', 'Meet the words')}
        {caption ? ` · ${caption.toLowerCase()}` : ''} —{' '}
        {t(
          'đọc to theo giọng mẫu, nhìn câu ví dụ, rồi bấm Tiếp.',
          'say it aloud with the model voice, read the example, then tap Next.'
        )}
      </p>

      <div className="card space-y-4 p-6">
        <WordInsight key={word.id} word={word} ttsLang={ttsLang} variant="full" />
        <MySentence key={`mine-${word.id}`} word={word} lang={lang} />
        <TrySaying key={`say-${word.id}`} word={word} ttsLang={ttsLang} />
        {onKnown && isNew && (
          <div className="border-t border-slate-100 pt-3 text-center dark:border-slate-800">
            <button
              type="button"
              onClick={() => onKnown(word)}
              className="btn-ghost h-10 gap-1.5 text-sm"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              {t('Mình biết từ này rồi', 'I already know this word')}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                `Bỏ qua trong bài này — app sẽ hỏi lại sau ${KNOWN_CHECK_DAYS} ngày để chắc chắn.`,
                `Skipped here — the app will check it again in ${KNOWN_CHECK_DAYS} days to be sure.`
              )}
            </p>
          </div>
        )}
      </div>

      <div className="session-actions flex gap-3">
        {index > 0 && (
          <button
            onClick={() => onIndex(index - 1)}
            className="btn-secondary h-14 !px-4"
            aria-label={t('Từ trước', 'Previous word')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <button onClick={forward} className="btn-primary h-14 flex-1">
          {last ? (
            <>
              <Brain className="h-5 w-5" />{' '}
              {t(`Luyện nhớ ${group.length} từ này`, `Practise these ${group.length} words`)}
            </>
          ) : (
            <>
              {t('Tiếp', 'Next')} <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * "Nói thử từ này" on a meet card (docs/design/learning-depth.md): the Speaking
 * page's trainer, opened on demand so it never takes the microphone unasked.
 * Practice only — no onAttempt, so nothing reaches the SRS.
 */
function TrySaying({ word, ttsLang }: { word: Word; ttsLang: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  if (open)
    return (
      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
        <PronounceTrainer word={word} ttsLang={ttsLang} />
      </div>
    )
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary h-10 gap-1.5 text-sm"
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
        {t('Nói thử từ này', 'Try saying it')}
      </button>
    </div>
  )
}
