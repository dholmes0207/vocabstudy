import { RotateCw } from 'lucide-react'
import type { Word } from '@/types'
import SpeakButton from './SpeakButton'
import PosBadge from './PosBadge'
import WordInsight from './WordInsight'
import { wordAudio } from '@/lib/audio'

interface Props {
  word: Word
  ttsLang: string
  flipped: boolean
  onFlip: () => void
}

/** A 3D flip flashcard. Front = target word; back = meaning + example. */
export default function Flashcard({ word, ttsLang, flipped, onFlip }: Props) {
  return (
    <div className="flip-scene w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Xem lại mặt trước' : 'Lật thẻ để xem nghĩa'}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onFlip()
          }
        }}
        className={`flip-card min-h-[20rem] w-full cursor-pointer sm:min-h-[24rem] ${flipped ? 'is-flipped' : ''}`}
      >
        {/* FRONT */}
        <div className="flip-face card flex min-h-[20rem] flex-col items-center justify-center gap-5 p-6 sm:min-h-[24rem]">
          <PosBadge category={word.posCategory} raw={word.pos} />
          <div className="flex items-center gap-3">
            <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {word.word}
            </h2>
          </div>
          <div className="space-y-0.5 text-center">
            {word.ipa && <p className="font-mono text-slate-400">/{word.ipa}/</p>}
            {word.viRead && (
              <p className="text-sm text-slate-400">
                cách đọc:{' '}
                <span className="font-semibold text-slate-500 dark:text-slate-300">
                  {word.viRead}
                </span>
              </p>
            )}
          </div>
          <SpeakButton text={word.word} lang={ttsLang} audioSrc={wordAudio(word.id)} size="lg" />
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-400">
            <RotateCw className="h-4 w-4" /> Bấm để xem nghĩa
          </p>
        </div>

        {/* BACK */}
        <div className="flip-face flip-back card scroll-thin flex min-h-[20rem] flex-col gap-4 overflow-y-auto p-6 sm:min-h-[24rem]">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {word.word}
            </span>
            <SpeakButton text={word.word} lang={ttsLang} audioSrc={wordAudio(word.id)} size="sm" />
          </div>
          {(word.ipa || word.viRead) && (
            <p className="text-center text-sm text-slate-400">
              {word.ipa && <span className="font-mono">/{word.ipa}/</span>}
              {word.ipa && word.viRead && <span className="mx-1.5">·</span>}
              {word.viRead && <span>{word.viRead}</span>}
            </p>
          )}
          <p className="text-center text-3xl font-extrabold text-brand-600 dark:text-brand-300">
            {word.meaning}
          </p>

          <WordInsight word={word} ttsLang={ttsLang} variant="details" className="mt-2 text-sm" />
        </div>
      </div>
    </div>
  )
}
