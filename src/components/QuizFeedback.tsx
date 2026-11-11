import type { QuizMode, Word } from '@/types'
import { exampleAudio } from '@/lib/audio'
import { useT, useUiLang } from '@/lib/i18n'
import HighlightExample from './HighlightExample'
import SpeakButton from './SpeakButton'

// The small pieces QuizRunner shows around a question: what a wrong pick
// really means, the word back in its sentence after a right answer, and the
// letter skeleton of a spelling question.

/** "What you picked is actually…" — turns a miss into a lesson on look-alikes. */
export function Contrast({ mode, chosen }: { mode: QuizMode; chosen: Word }) {
  const lang = useUiLang()
  const pickedMeaning = mode === 'en-to-vi' || mode === 'listen'
  return (
    <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
      {lang === 'en' ? (
        pickedMeaning ? (
          <>
            You picked <b>“{chosen.meaning}”</b> — that is the meaning of <b>{chosen.word}</b>.
          </>
        ) : (
          <>
            You picked <b>{chosen.word}</b> — it means <b>“{chosen.meaning}”</b>.
          </>
        )
      ) : pickedMeaning ? (
        <>
          Bạn chọn <b>“{chosen.meaning}”</b> — đó là nghĩa của từ <b>{chosen.word}</b>.
        </>
      ) : (
        <>
          Bạn chọn <b>{chosen.word}</b> — từ đó nghĩa là <b>“{chosen.meaning}”</b>.
        </>
      )}
    </p>
  )
}

/** After a right answer: one line that puts the word back in its sentence. */
export function CorrectEcho({
  word,
  ttsLang,
  showSentence,
}: {
  word: Word
  ttsLang: string
  showSentence: boolean
}) {
  const t = useT()
  return (
    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
      <p>
        {word.emoji && <span aria-hidden>{word.emoji} </span>}
        <b>{word.word}</b>
        {word.viRead && (
          <span className="text-slate-500 dark:text-slate-400"> ({word.viRead})</span>
        )}{' '}
        — {word.meaning}
      </p>
      {showSentence && word.exampleEn && (
        <p className="flex items-start gap-2">
          <SpeakButton
            text={word.exampleEn}
            lang={ttsLang}
            audioSrc={exampleAudio(word.id, word.exampleEn)}
            size="sm"
            label={t('Nghe câu ví dụ', 'Hear the example')}
            className="shrink-0"
          />
          <span className="pt-1">
            <HighlightExample sentence={word.exampleEn} word={word.word} pos={word.posCategory} />
            <span className="block italic text-slate-500 dark:text-slate-400">
              {word.exampleVi}
            </span>
          </span>
        </p>
      )}
    </div>
  )
}

/** The abi__ty skeleton row: revealed letters shown, hidden ones as blanks. */
export function Skeleton({
  cells,
  hiddenPositions,
  hintCount,
  revealed,
  answer,
}: {
  cells: { ch: string; isLetter: boolean; revealed: boolean }[]
  hiddenPositions: number[]
  hintCount: number
  revealed: boolean
  answer: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {cells.map((cell, i) => {
        if (!cell.isLetter) {
          return (
            <span key={i} className="px-1 text-2xl font-bold text-slate-500 dark:text-slate-400">
              {cell.ch === ' ' ? ' ' : cell.ch}
            </span>
          )
        }
        const hiddenRank = hiddenPositions.indexOf(i)
        const show = cell.revealed || (hiddenRank >= 0 && hiddenRank < hintCount) || revealed
        return (
          <span
            key={i}
            className={`grid h-11 w-9 place-items-center rounded-lg border-2 text-xl font-bold uppercase ${
              cell.revealed
                ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : show
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                  : 'border-dashed border-slate-300 text-transparent dark:border-slate-600'
            }`}
          >
            {show ? (revealed && !cell.revealed ? (answer[i] ?? cell.ch) : cell.ch) : '_'}
          </span>
        )
      })}
    </div>
  )
}
