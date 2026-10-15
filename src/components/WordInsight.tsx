import { Lightbulb, Link2, Sprout } from 'lucide-react'
import type { Word } from '@/types'
import SpeakButton from './SpeakButton'
import PosBadge from './PosBadge'
import HighlightExample from './HighlightExample'
import { exampleAudio, wordAudio } from '@/lib/audio'
import { useSettings } from '@/store/settingsStore'
import { useMySentence } from '@/store/notesStore'
import { useT } from '@/lib/i18n'
import { useReadingLabel } from '@/hooks/useReadingLabel'

interface Props {
  word: Word
  ttsLang: string
  /**
   * `full` — the card a learner meets a word on: everything, word first.
   * `compact` — feedback after an answer: a headline, the sentence and the tip.
   * `details` — everything below the headline, for places that already show
   *   the word (a lookup row, the back of a flashcard).
   */
  variant?: 'full' | 'compact' | 'details'
  className?: string
}

/**
 * Everything that makes a word understood rather than memorised: how it
 * sounds, what it means, a real sentence, the words it keeps company with,
 * its family, and one memory hook. Sections with no data are simply left out,
 * so a pack without the depth fields still renders cleanly.
 */
export default function WordInsight({ word, ttsLang, variant = 'full', className = '' }: Props) {
  const full = variant === 'full'
  const deep = variant !== 'compact'
  const lang = useSettings((s) => s.currentLang)
  const mine = useMySentence(lang, word.id)
  const t = useT()
  const readLabel = useReadingLabel('đọc gần giống', 'reads like')
  return (
    <div className={`space-y-4 ${className}`}>
      {variant === 'details' ? null : full ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <PosBadge category={word.posCategory} raw={word.pos} />
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {word.emoji && (
              <span className="text-4xl" aria-hidden>
                {word.emoji}
              </span>
            )}
            <h2 className="break-words text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {word.word}
            </h2>
            <SpeakButton text={word.word} lang={ttsLang} audioSrc={wordAudio(word.id)} size="md" />
          </div>
          {(word.ipa || word.viRead) && (
            <p className="text-sm text-slate-400">
              {word.ipa && <span className="font-mono">/{word.ipa}/</span>}
              {word.ipa && word.viRead && <span className="mx-1.5">·</span>}
              {word.viRead && (
                <>
                  {readLabel}{' '}
                  <b className="font-semibold text-slate-600 dark:text-slate-300">{word.viRead}</b>
                </>
              )}
            </p>
          )}
          <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-300 sm:text-3xl">
            {word.meaning}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {word.emoji && <span aria-hidden>{word.emoji}</span>}
          <span className="text-lg font-bold">{word.word}</span>
          <SpeakButton text={word.word} lang={ttsLang} audioSrc={wordAudio(word.id)} size="sm" />
          {word.viRead && <span className="text-sm text-slate-400">({word.viRead})</span>}
          <span className="text-slate-400">—</span>
          <span className="font-semibold text-brand-700 dark:text-brand-300">{word.meaning}</span>
        </div>
      )}

      {word.exampleEn && (
        <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/60">
          <div className="flex items-start gap-2">
            <SpeakButton
              text={word.exampleEn}
              lang={ttsLang}
              audioSrc={exampleAudio(word.id, word.exampleEn)}
              size="sm"
              label={t('Nghe câu ví dụ', 'Hear the example')}
              className="mt-0.5 shrink-0"
            />
            <p className="text-slate-700 dark:text-slate-200">
              <HighlightExample sentence={word.exampleEn} word={word.word} pos={word.posCategory} />
            </p>
          </div>
          <p className="pl-10 text-sm italic text-slate-500 dark:text-slate-400">
            {word.exampleVi}
          </p>
        </div>
      )}

      {deep && word.collocations && word.collocations.length > 0 && (
        <Section icon={Link2} title={t('Hay đi chung với', 'Common phrases')}>
          <ul className="space-y-1.5">
            {word.collocations.map((c) => (
              <li key={c.en} className="flex items-center gap-2">
                <SpeakButton
                  text={c.en}
                  lang={ttsLang}
                  size="sm"
                  label={t(`Nghe "${c.en}"`, `Hear "${c.en}"`)}
                  className="shrink-0"
                />
                <span>
                  <b className="font-semibold text-slate-800 dark:text-slate-100">{c.en}</b>
                  <span className="text-slate-500 dark:text-slate-400"> — {c.vi}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {deep && word.family && word.family.length > 0 && (
        <Section icon={Sprout} title={t('Cùng họ với', 'Word family')}>
          <ul className="flex flex-wrap gap-2">
            {word.family.map((f) => (
              <li
                key={f.word}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm dark:border-slate-700"
              >
                <b className="font-semibold">{f.word}</b>
                <span className="text-slate-500 dark:text-slate-400"> · {f.vi}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {variant === 'compact' && mine && (
        <p className="rounded-xl bg-emerald-50/60 px-3.5 py-2.5 text-left text-sm text-slate-700 dark:bg-emerald-950/30 dark:text-slate-200">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            ✍️ {t('Câu của bạn:', 'Your sentence:')}{' '}
          </span>
          <HighlightExample sentence={mine.text} word={word.word} pos={word.posCategory} />
        </p>
      )}

      {word.tip && (
        <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-left text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{word.tip}</p>
        </div>
      )}
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lightbulb
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="text-left">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {title}
      </h3>
      {children}
    </section>
  )
}
