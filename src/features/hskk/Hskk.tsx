import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HSKK_PARTS, HSKK_ROUND, hskkRound, type HskkItem, type HskkPart } from '@/lib/hskk'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import HskkRound from './HskkRound'

// "Luyện nói HSKK sơ cấp" (docs/design/hskk.md): the three parts of the HSKK
// Elementary speaking test, each with recording and play-back.

const PARTS: { part: HskkPart; emoji: string; title: [string, string]; desc: [string, string] }[] =
  [
    {
      part: 1,
      emoji: '🔁',
      title: ['Phần 1 · Nghe rồi nhắc lại', 'Part 1 · Listen and repeat'],
      desc: [
        'Nghe một câu ngắn rồi nói lại y như vậy. Đề thật có 15 câu.',
        'Hear a short sentence and say it back exactly. The test has 15.',
      ],
    },
    {
      part: 2,
      emoji: '💬',
      title: ['Phần 2 · Nghe rồi trả lời', 'Part 2 · Listen and answer'],
      desc: [
        'Nghe câu hỏi rồi trả lời bằng một câu đầy đủ. Đề thật có 10 câu.',
        'Hear a question and answer in a full sentence. The test has 10.',
      ],
    },
    {
      part: 3,
      emoji: '🗣️',
      title: ['Phần 3 · Trả lời câu hỏi', 'Part 3 · Answer the question'],
      desc: [
        'Nói khoảng 1 phút 30 giây về một chủ đề quen thuộc. Đề thật có 2 câu.',
        'Talk for about a minute and a half on a familiar topic. The test has 2.',
      ],
    },
  ]

export default function Hskk() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'zh') return <PackOnly packs={['zh']} />
  return <HskkView />
}

function HskkView() {
  const t = useT()
  useDocumentTitle(`${t('Luyện nói HSKK', 'HSKK speaking')} · VocaStudy`)
  const [round, setRound] = useState<{ n: number; part: HskkPart; items: HskkItem[] } | null>(null)
  const start = (part: HskkPart) =>
    setRound((r) => ({ n: (r?.n ?? 0) + 1, part, items: hskkRound(part) }))

  if (round)
    return (
      <HskkRound
        key={round.n}
        part={round.part}
        items={round.items}
        onAgain={() => start(round.part)}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">
            {t('Luyện nói HSKK sơ cấp', 'HSKK Elementary speaking')}
          </span>{' '}
          <span lang="zh">口试</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'HSKK là kỳ thi nói đi kèm HSK. Bậc sơ cấp (初级, tương đương HSK 1–2) có ba phần, thi bằng cách ghi âm. Ở đây mỗi câu được đọc lên như trong phòng thi, bạn ghi âm câu trả lời rồi nghe lại, so với câu mẫu có pinyin.',
            'HSKK is the speaking test that goes with HSK. The Elementary level (初级, about HSK 1–2) has three parts, all recorded. Here each line is read out as in the exam; record your answer, play it back and compare it with a sample in pinyin.'
          )}
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3">
        {PARTS.map((p) => (
          <li key={p.part} className="card flex min-w-0 flex-col gap-3 p-4">
            <p className="text-lg font-bold">
              <span aria-hidden="true">{p.emoji}</span> {t(...p.title)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(...p.desc)}</p>
            <button type="button" className="btn-primary h-11" onClick={() => start(p.part)}>
              {t(
                `Luyện ${HSKK_ROUND[p.part]} câu (trong ${HSKK_PARTS[p.part].length})`,
                `Practise ${HSKK_ROUND[p.part]} (of ${HSKK_PARTS[p.part].length})`
              )}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
