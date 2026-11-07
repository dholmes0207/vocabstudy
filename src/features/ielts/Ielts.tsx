import { useState } from 'react'
import { ArrowRight, BookOpenText, Mic } from 'lucide-react'
import { useIelts } from '@/store/ieltsStore'
import { usePracticeBank } from '@/hooks/usePracticeBank'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  IELTS_FORMAT,
  loadIeltsBank,
  pickOther,
  pickPassage,
  readingRound,
  type ReadingPassage,
} from '@/lib/ielts'
import { useT } from '@/lib/i18n'
import TfngRound from './TfngRound'
import SpeakingRound, { type SpeakingTask } from './SpeakingRound'

// "Luyện IELTS" (docs/design/ielts.md): what the test is made of, and practice
// for the skills one by one, starting with the Reading question Vietnamese
// learners trip on most: True / False / Not Given.

export default function Ielts() {
  const t = useT()
  useDocumentTitle(`${t('Luyện IELTS', 'IELTS practice')} · VocaStudy`)
  const { bank, error, retry } = usePracticeBank(loadIeltsBank)
  const done = useIelts((s) => s.reading)
  const [round, setRound] = useState<{ n: number; passage: ReadingPassage } | null>(null)
  const [speaking, setSpeaking] = useState<{ n: number; task: SpeakingTask } | null>(null)
  const speak = (part: 1 | 2) => {
    if (!bank) return
    setSpeaking((r) => {
      const last = r?.task.part === 1 ? r.task.topic.id : r?.task.card.id
      const task: SpeakingTask =
        part === 1
          ? { part, topic: pickOther(bank.speaking.part1, last) }
          : { part, card: pickOther(bank.speaking.part2, last) }
      return { n: (r?.n ?? 0) + 1, task }
    })
  }

  const start = (passage?: ReadingPassage) => {
    if (!bank) return
    setRound((r) => ({
      n: (r?.n ?? 0) + 1,
      passage: readingRound(
        passage ?? pickPassage(bank.reading, (id) => !!done[id], r?.passage.id)
      ),
    }))
  }

  if (speaking)
    return (
      <SpeakingRound
        key={speaking.n}
        task={speaking.task}
        onAgain={() => speak(speaking.task.part)}
        onExit={() => setSpeaking(null)}
      />
    )
  if (round)
    return (
      <TfngRound
        key={round.n}
        passage={round.passage}
        onAgain={() => start()}
        onExit={() => setRound(null)}
      />
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Luyện IELTS', 'IELTS practice')}</span>{' '}
          <span aria-hidden="true">🎓</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'IELTS chấm 4 kỹ năng, mỗi kỹ năng một band từ thấp tới 9, lấy cả nửa band (6.5, 7.0…). Luyện từng dạng câu một, bắt đầu từ phần Đọc.',
            'IELTS scores four skills, each on a band up to 9 in half bands (6.5, 7.0…). Practise one question type at a time, starting with Reading.'
          )}
        </p>
      </header>

      <section aria-labelledby="ielts-format" className="space-y-3">
        <h2 id="ielts-format" className="text-lg font-bold">
          {t('Đề thi gồm gì', 'What the test is made of')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {IELTS_FORMAT.map((s) => (
            <li key={s.skill[1]} className="card p-4">
              <p className="flex items-center gap-2 font-bold">
                <span aria-hidden="true">{s.icon}</span> {t(...s.skill)}
                <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t(...s.time)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(...s.what)}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'Thông tin kiểm tra ngày 08/11/2026 từ trang của British Council và IDP. Xem lại trên ielts.org trước khi đăng ký thi. Bài luyện ở đây do VocaStudy tự viết, không phải đề thật.',
            'Checked on 08/11/2026 against British Council and IDP pages. Confirm on ielts.org before you register. The practice here is written by VocaStudy, not real past papers.'
          )}
        </p>
      </section>

      <section aria-labelledby="ielts-tfng" className="card space-y-4 p-5">
        <h2 id="ielts-tfng" className="flex items-center gap-2 text-lg font-bold">
          <BookOpenText
            className="h-5 w-5 text-emerald-600 dark:text-emerald-300"
            aria-hidden="true"
          />
          {t('Đọc: True / False / Not Given', 'Reading: True / False / Not Given')}
        </h2>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <p className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <b>TRUE</b>:{' '}
            {t(
              'bài nói đúng điều đó, có thể bằng từ khác.',
              'the passage says it, maybe in other words.'
            )}
          </p>
          <p className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
            <b>FALSE</b>: {t('bài nói ngược lại.', 'the passage says the opposite.')}
          </p>
          <p className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40">
            <b>NOT GIVEN</b>:{' '}
            {t(
              'bài không nói tới. Đừng dùng hiểu biết của bạn!',
              'the passage does not say. Don’t use what you know!'
            )}
          </p>
        </div>
        {error ? (
          <p role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            {t('Chưa tải được bài đọc.', "Couldn't load the passages.")}
            <button type="button" className="btn-secondary h-9 text-sm" onClick={retry}>
              {t('Thử lại', 'Try again')}
            </button>
          </p>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary h-11 w-full sm:w-auto"
              disabled={!bank}
              onClick={() => start()}
            >
              {t('Làm một bài đọc', 'Read a passage')} <ArrowRight className="h-4 w-4" />
            </button>
            {bank && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {bank.reading.map((p) => {
                  const rec = done[p.id]
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => start(p)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-brand-400 dark:border-slate-700"
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {p.emoji}
                        </span>
                        <span className="min-w-0 flex-1 font-semibold">{t(...p.title)}</span>
                        {rec && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            ✓ {rec.best}/{rec.total}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="ielts-speaking" className="card space-y-4 p-5">
        <h2 id="ielts-speaking" className="flex items-center gap-2 text-lg font-bold">
          <Mic className="h-5 w-5 text-rose-600 dark:text-rose-300" aria-hidden="true" />
          {t('Nói: Part 1, 2 và 3', 'Speaking: Parts 1, 2 and 3')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'Giám khảo đọc câu hỏi, bạn ghi âm câu trả lời rồi nghe lại. Không ai chấm, chỉ có bạn và micro: cứ nói thoải mái.',
            'The examiner reads each question; you record your answer and listen back. Nobody grades it, just you and the mic: speak freely.'
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!bank}
            onClick={() => speak(1)}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-rose-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              💬
            </span>
            <span className="mt-1 block font-bold">
              {t('Part 1: hỏi nhanh', 'Part 1: quick questions')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                '4 câu về một chủ đề quen thuộc: quê hương, sở thích, công nghệ…',
                '4 questions on a familiar topic: hometown, hobbies, technology…'
              )}
            </span>
          </button>
          <button
            type="button"
            disabled={!bank}
            onClick={() => speak(2)}
            className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-fuchsia-400 disabled:opacity-60 dark:border-slate-700"
          >
            <span className="block text-2xl" aria-hidden="true">
              🎯
            </span>
            <span className="mt-1 block font-bold">
              {t('Part 2 & 3: nói 2 phút', 'Parts 2 & 3: the long turn')}
            </span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Thẻ chủ đề, 1 phút chuẩn bị có gợi ý bố cục, 2 phút nói, rồi 3 câu thảo luận.',
                'A task card, a minute to prepare with a plan, two minutes to talk, then three discussion questions.'
              )}
            </span>
          </button>
        </div>
      </section>

      <section className="card p-5 text-sm text-slate-600 dark:text-slate-300">
        <p className="font-bold">{t('Đang viết tiếp', 'Coming next')}</p>
        <p className="mt-1">
          {t(
            'Khung bài Writing Task 1 và Task 2, nghe điền thông tin.',
            'Writing Task 1 and Task 2 frames, and listening form completion.'
          )}
        </p>
      </section>
    </div>
  )
}
