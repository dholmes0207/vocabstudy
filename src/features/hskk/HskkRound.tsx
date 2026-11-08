import { useEffect, useState } from 'react'
import { ArrowRight, Eye, Lightbulb, Volume2, X } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useImmersive } from '@/store/uiStore'
import { pronounce, stopPronounce, textAudio } from '@/lib/audio'
import {
  HSKK_TOPIC_SECONDS,
  HSKK_XP,
  type HskkItem,
  type HskkLine,
  type HskkPart,
} from '@/lib/hskk'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import AnswerRecorder from '@/features/ielts/AnswerRecorder'

// One part of the HSKK Elementary test (docs/design/hskk.md). Parts 1 and 2
// are heard, not read: the line plays by itself and its text stays hidden
// until asked for. Part 3 shows its question and gives a minute and a half.

const TITLES: Record<HskkPart, [string, string]> = {
  1: ['Phần 1 · Nghe rồi nhắc lại', 'Part 1 · Listen and repeat'],
  2: ['Phần 2 · Nghe rồi trả lời', 'Part 2 · Listen and answer'],
  3: ['Phần 3 · Trả lời câu hỏi', 'Part 3 · Answer the question'],
}

const TIPS: Record<HskkPart, [string, string]> = {
  1: [
    'Nghe hết câu rồi mới nói. Giữ đúng thanh điệu, ngắt nghỉ như câu gốc.',
    'Hear the whole sentence before you speak. Keep its tones and pauses.',
  ],
  2: [
    'Trả lời bằng một câu đầy đủ, dùng lại từ trong câu hỏi: 你叫什么名字？→ 我叫…',
    'Answer with a full sentence that reuses the question’s words: 你叫什么名字？→ 我叫…',
  ],
  3: [
    'Nói ít nhất 5 câu: trả lời thẳng, thêm chi tiết (ai, ở đâu, khi nào), kết bằng cảm nghĩ.',
    'Say at least five sentences: answer directly, add details (who, where, when), end with how you feel.',
  ],
}

function Line({ line, big = false }: { line: HskkLine; big?: boolean }) {
  return (
    <div>
      <p lang="zh" className={`font-bold ${big ? 'text-2xl' : 'text-lg'}`}>
        {line.zh}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{line.pinyin}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{line.vi}</p>
    </div>
  )
}

export default function HskkRound({
  part,
  items,
  onAgain,
  onExit,
}: {
  part: HskkPart
  items: HskkItem[]
  onAgain: () => void
  onExit: () => void
}) {
  useImmersive()
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const code = useSettings((s) => s.currentLang)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState(part === 3)
  const [sampleShown, setSampleShown] = useState(false)
  const [done, setDone] = useState(false)
  const item = items[idx]

  const play = (text: string) => pronounce({ text, audioSrc: textAudio(text), lang: ttsLang })

  // Each line is read out as soon as it comes up, as in the test.
  useEffect(() => {
    if (!done && item) pronounce({ text: item.zh, audioSrc: textAudio(item.zh), lang: ttsLang })
    return () => stopPronounce()
  }, [done, item, ttsLang])

  const next = () => {
    if (idx + 1 < items.length) {
      setIdx(idx + 1)
      setShown(part === 3)
      setSampleShown(false)
      return
    }
    addPlayXp(code, HSKK_XP)
    log(code, 'hskk')
    celebrate(1)
    setDone(true)
  }

  const top = (
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
        🎙️ HSKK · {t(...TITLES[part])}
      </p>
    </div>
  )

  if (done)
    return (
      <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
        {top}
        <section className="card space-y-3 p-6 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <p className="text-xl font-bold">{t('Nói tốt lắm!', 'Well spoken!')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              `+${HSKK_XP} XP. Nghe lại bản ghi để sửa thanh điệu.`,
              `+${HSKK_XP} XP. Play your recordings back to fix the tones.`
            )}
          </p>
          <button type="button" className="btn-primary h-12 w-full" onClick={onAgain}>
            {t('Luyện tiếp', 'Practise again')}
          </button>
        </section>
      </div>
    )

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-fade-in">
      {top}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500 transition-all"
          style={{ width: `${(idx / items.length) * 100}%` }}
        />
      </div>
      <section className="card space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t(`Câu ${idx + 1}/${items.length}`, `Question ${idx + 1}/${items.length}`)}
        </p>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => play(item.zh)}
            className="btn-ghost h-10 w-10 shrink-0 p-0"
            aria-label={t('Nghe lại', 'Hear it again')}
          >
            <Volume2 className="h-5 w-5" />
          </button>
          {shown ? (
            <Line line={item} big />
          ) : (
            <button type="button" className="btn-ghost text-sm" onClick={() => setShown(true)}>
              <Eye className="h-4 w-4" /> {t('Hiện chữ', 'Show the text')}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t(...TIPS[part])}</p>
        <AnswerRecorder key={idx} limit={part === 3 ? HSKK_TOPIC_SECONDS : undefined} />
        {item.sample &&
          (sampleShown ? (
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  {t('Câu trả lời mẫu', 'Sample answer')}
                </p>
                <button
                  type="button"
                  onClick={() => play(item.sample!.zh)}
                  className="btn-ghost h-8 w-8 shrink-0 p-0"
                  aria-label={t('Nghe câu trả lời mẫu', 'Hear the sample answer')}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <Line line={item.sample} />
            </div>
          ) : (
            <button
              type="button"
              className="btn-ghost w-full justify-center text-sm"
              onClick={() => setSampleShown(true)}
            >
              <Lightbulb className="h-4 w-4" /> {t('Xem câu trả lời mẫu', 'See a sample answer')}
            </button>
          ))}
      </section>
      <button type="button" className="btn-primary h-12 w-full" onClick={next}>
        {idx + 1 < items.length ? t('Câu tiếp', 'Next question') : t('Xong phần này', 'Finish')}{' '}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
