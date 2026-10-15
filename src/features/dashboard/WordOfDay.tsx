import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { NO_CARDS, useStudy } from '@/store/studyStore'
import { wordOfDay } from '@/lib/games'
import { today } from '@/lib/date'
import { wordAudio } from '@/lib/audio'
import SpeakButton from '@/components/SpeakButton'
import { useT } from '@/lib/i18n'
import { useReadingLabel } from '@/hooks/useReadingLabel'

/**
 * "Từ của ngày": one word worth a second look — something already met but not
 * yet mastered (a new learner gets one of the first 100 words). A small daily
 * surprise on the home screen, and a nudge back into the lookup page.
 */
export default function WordOfDay() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const cards = useStudy((s) => s.progress[code]?.cards) ?? NO_CARDS
  const w = useMemo(() => wordOfDay(pack.words, cards, today()), [pack.words, cards])
  const chunk = w.collocations?.[0]
  const t = useT()
  const readLabel = useReadingLabel('đọc:', 'reads like:')

  return (
    <section className="card relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 opacity-20" />
      {/* A few stars twinkling over the corner — today's word "shines". */}
      <span aria-hidden className="wod-stars">
        <i>✦</i>
        <i>✦</i>
        <i>✦</i>
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
        ✨ {t('Từ của ngày', 'Word of the day')}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {w.emoji && (
          <span className="text-3xl" aria-hidden>
            {w.emoji}
          </span>
        )}
        <span className="text-2xl font-extrabold">{w.word}</span>
        <SpeakButton text={w.word} lang={pack.meta.ttsLang} audioSrc={wordAudio(w.id)} size="sm" />
        {w.viRead && (
          <span className="text-sm text-slate-400">
            {readLabel} {w.viRead}
          </span>
        )}
      </div>
      <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300">{w.meaning}</p>
      {chunk && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <b>{chunk.en}</b> — {chunk.vi}
        </p>
      )}
      {w.tip && (
        <p className="mt-2 flex gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
          <span>{w.tip}</span>
        </p>
      )}
      <Link
        to={`/browse?q=${encodeURIComponent(w.word)}`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
      >
        {t('Xem đầy đủ & tự đặt câu', 'See more & write your own sentence')}{' '}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
