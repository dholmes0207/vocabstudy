import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  HSKK_LEVELS,
  HSKK_TITLES,
  hskkRound,
  type HskkItem,
  type HskkLevel,
  type HskkPart,
} from '@/lib/hskk'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import HskkRound from './HskkRound'

// "Luyện nói HSKK" (docs/design/hskk.md): the three parts of the HSKK speaking
// test at Elementary and Intermediate level, each with recording and play-back.

const EMOJI: Record<HskkLevel, Record<HskkPart, string>> = {
  elementary: { 1: '🔁', 2: '💬', 3: '🗣️' },
  intermediate: { 1: '🔁', 2: '🖼️', 3: '🗣️' },
}

const DESC: Record<HskkLevel, Record<HskkPart, [string, string]>> = {
  elementary: {
    1: [
      'Nghe một câu ngắn rồi nói lại y như vậy. Đề thật có 15 câu.',
      'Hear a short sentence and say it back exactly. The test has 15.',
    ],
    2: [
      'Nghe câu hỏi rồi trả lời bằng một câu đầy đủ. Đề thật có 10 câu.',
      'Hear a question and answer in a full sentence. The test has 10.',
    ],
    3: [
      'Nói khoảng 1 phút 30 giây về một chủ đề quen thuộc. Đề thật có 2 câu.',
      'Talk for about a minute and a half on a familiar topic. The test has 2.',
    ],
  },
  intermediate: {
    1: [
      'Nghe một câu dài hơn (có 如果…就, 虽然…但是, câu 把…) rồi nói lại. Đề thật có 10 câu.',
      'Hear a longer sentence (with 如果…就, 虽然…但是, 把…) and say it back. The test has 10.',
    ],
    2: [
      'Nhìn tranh, nói khoảng 2 phút: ai, ở đâu, làm gì, cảm nghĩ. Đề thật có 2 tranh.',
      'Look at a picture and talk for about two minutes: who, where, what, how you feel. The test has 2.',
    ],
    3: [
      'Trả lời một câu hỏi trong 2 phút, có lý do và ví dụ. Đề thật có 2 câu.',
      'Answer a question for two minutes, with reasons and examples. The test has 2.',
    ],
  },
}

const LEVELS: { level: HskkLevel; label: [string, string] }[] = [
  { level: 'elementary', label: ['Sơ cấp 初级 (HSK 1–2)', 'Elementary 初级 (HSK 1–2)'] },
  { level: 'intermediate', label: ['Trung cấp 中级 (HSK 3–4)', 'Intermediate 中级 (HSK 3–4)'] },
]

export default function Hskk() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'zh') return <PackOnly packs={['zh']} />
  return <HskkView />
}

function HskkView() {
  const t = useT()
  useDocumentTitle(`${t('Luyện nói HSKK', 'HSKK speaking')} · VocaStudy`)
  const [level, setLevel] = useState<HskkLevel>('elementary')
  const [round, setRound] = useState<{ n: number; part: HskkPart; items: HskkItem[] } | null>(null)
  const start = (part: HskkPart) =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, part, items: hskkRound(part, Math.random, level) }))
  const info = HSKK_LEVELS[level]

  if (round)
    return (
      <HskkRound
        key={round.n}
        part={round.part}
        level={level}
        items={round.items}
        onAgain={() => start(round.part)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Luyện nói HSKK', 'HSKK speaking')}</span>{' '}
          <span lang="zh">口试</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'HSKK là kỳ thi nói đi kèm HSK, thi bằng cách ghi âm. Bậc sơ cấp (初级) ứng với HSK 1–2, trung cấp (中级) với HSK 3–4; mỗi bậc có ba phần. Ở đây câu hỏi được đọc lên như trong phòng thi, bạn ghi âm câu trả lời rồi nghe lại, so với câu mẫu có pinyin.',
            'HSKK is the speaking test that goes with HSK, all recorded. Elementary (初级) matches HSK 1–2, Intermediate (中级) HSK 3–4; each has three parts. Here questions are read out as in the exam; record your answer, play it back and compare it with a sample in pinyin.'
          )}
        </p>
      </header>
      <div role="tablist" className="grid grid-cols-2 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.level}
            type="button"
            role="tab"
            aria-selected={level === l.level}
            onClick={() => setLevel(l.level)}
            className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              level === l.level
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {t(...l.label)}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-3">
        {([1, 2, 3] as const).map((part) => (
          <li key={part} className="card flex min-w-0 flex-col gap-3 p-4">
            <p className="text-lg font-bold">
              <span aria-hidden="true">{EMOJI[level][part]}</span> {t(...HSKK_TITLES[level][part])}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(...DESC[level][part])}</p>
            <button type="button" className="btn-primary h-11" onClick={() => start(part)}>
              {t(
                `Luyện ${info.round[part]} câu (trong ${info.parts[part].length})`,
                `Practise ${info.round[part]} (of ${info.parts[part].length})`
              )}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
