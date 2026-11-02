import { useMemo, useState } from 'react'
import { ArrowRight, LogOut, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useImmersive } from '@/store/uiStore'
import { usePackSay, usePrefetchPackSay } from '@/hooks/usePackSay'
import { buzz } from '@/lib/sound'
import { useT } from '@/lib/i18n'
import {
  COMPOUND_VOWELS,
  CONSONANTS,
  FINAL_SOUNDS,
  SOUND_CHANGES,
  TENSE,
  VOWELS,
  compose,
  hangulQuiz,
  hangulXp,
  readSyllable,
  type HangulQuestion,
  type Jamo,
} from '@/lib/hangul'
import SessionComplete from '@/components/SessionComplete'

// "Bảng chữ cái Hangul" (docs/design/hangul.md): the letters a Korean beginner
// needs before any word — hear each one, build blocks, then a quick check.

const QUIZ_SIZE = 10

// Letters, blocks and words in the voices recorded for the Korean pack.
const useSay = usePackSay

export default function Hangul() {
  const t = useT()
  const words = useData((s) => s.pack?.words)
  const [quiz, setQuiz] = useState<{ n: number; questions: HangulQuestion[] } | null>(null)
  const start = () =>
    setQuiz((q) => ({
      n: (q?.n ?? 0) + 1,
      questions: hangulQuiz(QUIZ_SIZE, Math.random, words ?? []),
    }))

  if (quiz)
    return (
      <Quiz key={quiz.n} questions={quiz.questions} onExit={() => setQuiz(null)} onAgain={start} />
    )

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Bảng chữ cái Hangul', 'The Hangul alphabet')}</span>{' '}
          <span aria-hidden="true">🔤</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Hangul có 14 phụ âm và 10 nguyên âm cơ bản. Chạm vào một chữ để nghe và xem ví dụ. Cách đọc ghi theo kiểu tiếng Việt cho dễ nhớ; tai nghe vẫn là chuẩn nhất.',
            'Hangul has 14 consonants and 10 basic vowels. Tap a letter to hear it and see an example. Readings are spelled the Vietnamese way to help you remember; your ear is still the best guide.'
          )}
        </p>
        <button className="btn-primary mt-4 h-11" onClick={start}>
          {t(`Kiểm tra nhanh (${QUIZ_SIZE} câu)`, `Quick check (${QUIZ_SIZE} questions)`)}
        </button>
      </header>

      <BlockIntro />

      <LetterGroup
        title={t('Nguyên âm cơ bản', 'Basic vowels')}
        note={t(
          'Viết một mình thì thêm ㅇ (câm) phía trước: ㅏ → 아.',
          'On its own a vowel takes a silent ㅇ in front: ㅏ → 아.'
        )}
        letters={VOWELS}
      />
      <LetterGroup
        title={t('Phụ âm cơ bản', 'Basic consonants')}
        note={t(
          'Phát âm mẫu ghép với ㅏ: ㄱ → 가, ㄴ → 나…',
          'Each one is played with ㅏ: ㄱ → 가, ㄴ → 나…'
        )}
        letters={CONSONANTS}
      />

      <Builder />

      <LetterGroup
        title={t('Phụ âm căng', 'Tense consonants')}
        note={t(
          'Chữ đôi đọc căng cổ, gọn và không bật hơi.',
          'Doubled letters are said tight and short, with no puff of air.'
        )}
        letters={TENSE}
      />
      <LetterGroup
        title={t('Nguyên âm ghép', 'Combined vowels')}
        note={t(
          'Ghép từ các nguyên âm cơ bản: ㅗ + ㅏ = ㅘ.',
          'Built from the basic vowels: ㅗ + ㅏ = ㅘ.'
        )}
        letters={COMPOUND_VOWELS}
      />

      <FinalSounds />
      <SoundChanges />
    </div>
  )
}

function BlockIntro() {
  const t = useT()
  const say = useSay()
  const blocks: { syl: string; parts: string[] }[] = [
    { syl: '한', parts: ['ㅎ', 'ㅏ', 'ㄴ'] },
    { syl: '국', parts: ['ㄱ', 'ㅜ', 'ㄱ'] },
  ]
  usePrefetchPackSay(blocks.map((b) => b.syl))
  return (
    <section className="card p-5">
      <h2 className="font-bold">{t('Mỗi chữ là một khối', 'Every syllable is a block')}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Phụ âm đầu + nguyên âm, có khi thêm phụ âm cuối (받침) ở dưới. Đọc từ trái sang phải, từ trên xuống dưới.',
          'First consonant + vowel, sometimes a final consonant (받침) underneath. Read left to right, top to bottom.'
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {blocks.map((b) => (
          <button
            key={b.syl}
            type="button"
            onClick={() => say(b.syl)}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-brand-50 dark:bg-slate-800/60 dark:hover:bg-brand-950"
          >
            <span className="text-4xl font-bold">{b.syl}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              = {b.parts.join(' + ')}
              <br />
              <b className="text-slate-700 dark:text-slate-200">"{readSyllable(b.syl)}"</b>
            </span>
            <Volume2 className="h-4 w-4 text-brand-500" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  )
}

function LetterGroup({ title, note, letters }: { title: string; note: string; letters: Jamo[] }) {
  const t = useT()
  const say = useSay()
  usePrefetchPackSay(letters.map((j) => j.sample))
  const words = useData((s) => s.pack?.words)
  const meaningOf = useMemo(() => new Map((words ?? []).map((w) => [w.word, w.meaning])), [words])
  const [picked, setPicked] = useState<Jamo | null>(null)

  return (
    <section>
      <h2 className="font-bold">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{note}</p>
      <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
        {letters.map((j) => (
          <li key={j.ch} className="min-w-0">
            <button
              type="button"
              onClick={() => {
                setPicked(j)
                say(j.sample)
              }}
              aria-pressed={picked === j}
              className={`card flex w-full flex-col items-center px-1 py-3 transition hover:-translate-y-0.5 ${
                picked === j ? 'ring-2 ring-brand-400' : ''
              }`}
            >
              <span className="text-3xl font-bold leading-none">{j.ch}</span>
              <span className="mt-1.5 max-w-full truncate text-xs font-semibold text-brand-600 dark:text-brand-300">
                {j.vi}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {picked && (
        <div className="card mt-2 flex items-start gap-3 p-4 animate-fade-in" aria-live="polite">
          <button
            type="button"
            onClick={() => say(picked.sample)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"
            aria-label={t(`Nghe ${picked.sample}`, `Play ${picked.sample}`)}
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-sm">
            <p>
              <b className="text-lg">{picked.ch}</b>
              {picked.name && (
                <span className="text-slate-500 dark:text-slate-400"> · {picked.name}</span>
              )}{' '}
              · {t('đọc', 'sounds like')} <b>{picked.vi}</b> · {t('mẫu', 'sample')}{' '}
              <b>{picked.sample}</b> ({readSyllable(picked.sample)})
            </p>
            {picked.tip && (
              <p className="mt-1 text-slate-500 dark:text-slate-400">💡 {t(...picked.tip)}</p>
            )}
            {picked.word && (
              <button
                type="button"
                onClick={() => say(picked.word!)}
                className="mt-1 font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                {t('Ví dụ', 'Example')}: {picked.word}
                {meaningOf.get(picked.word) && ` — ${meaningOf.get(picked.word)}`} 🔊
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

const BUILD_INITIALS = [...CONSONANTS, ...TENSE].map((j) => j.ch)
const BUILD_MEDIALS = [...VOWELS, ...COMPOUND_VOWELS].map((j) => j.ch)
const BUILD_FINALS = ['', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ']

function Builder() {
  const t = useT()
  const say = useSay()
  const [initial, setInitial] = useState('ㅎ')
  const [medial, setMedial] = useState('ㅏ')
  const [final, setFinal] = useState('ㄴ')
  const syllable = compose(initial, medial, final)!

  const row = (label: string, options: string[], value: string, set: (v: string) => void) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o || 'none'}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => {
              set(o)
              const next = compose(
                options === BUILD_INITIALS ? o : initial,
                options === BUILD_MEDIALS ? o : medial,
                options === BUILD_FINALS ? o : final
              )
              if (next) say(next)
            }}
            className={`h-10 min-w-10 rounded-xl px-2 text-lg font-semibold transition ${
              value === o
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            {o || <span className="text-sm">{t('không', 'none')}</span>}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">{t('Tự ghép chữ', 'Build a block')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Chọn phụ âm đầu, nguyên âm và (nếu muốn) phụ âm cuối.',
              'Pick a first consonant, a vowel and, if you like, a final one.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => say(syllable)}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 px-5 py-3 text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
          aria-label={t(`Nghe ${syllable}`, `Play ${syllable}`)}
        >
          <span className="text-5xl font-bold leading-none">{syllable}</span>
          <span className="text-left">
            <span className="block text-lg font-semibold">"{readSyllable(syllable)}"</span>
            <Volume2 className="h-5 w-5 opacity-80" aria-hidden="true" />
          </span>
        </button>
      </div>
      {row(t('Phụ âm đầu', 'First consonant'), BUILD_INITIALS, initial, setInitial)}
      {row(t('Nguyên âm', 'Vowel'), BUILD_MEDIALS, medial, setMedial)}
      {row(t('Phụ âm cuối', 'Final consonant'), BUILD_FINALS, final, setFinal)}
    </section>
  )
}

function FinalSounds() {
  const t = useT()
  const say = useSay()
  usePrefetchPackSay(FINAL_SOUNDS.map((f) => f.word))
  return (
    <section>
      <h2 className="font-bold">{t('Phụ âm cuối (받침)', 'Final consonants (받침)')}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Ở cuối khối, mọi phụ âm chỉ còn 7 âm. Âm tắc (c, t, p) đọc ngắn, dứt khoát — nên cách đọc có dấu sắc.',
          'At the end of a block every consonant falls into 7 sounds. The stops (k, t, p) are short and clipped.'
        )}
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FINAL_SOUNDS.map((f) => (
          <li key={f.sound} className="min-w-0">
            <button
              type="button"
              onClick={() => say(f.word)}
              className="card flex w-full items-center gap-3 p-3 text-left transition hover:-translate-y-0.5"
            >
              <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                -{f.sound}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold">{f.letters}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {f.word} → {f.read}
                </span>
              </span>
              <Volume2 className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** "Biến âm": why the readings are not block by block (docs/design/hangul.md). */
function SoundChanges() {
  const t = useT()
  const say = useSay()
  usePrefetchPackSay(SOUND_CHANGES.flatMap((c) => c.examples.map((ex) => ex.word)))
  return (
    <section>
      <h2 className="font-bold">{t('Biến âm khi đọc liền', 'Sound changes in a word')}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t(
          'Viết từng khối nhưng đọc liền cả từ, nên một số âm đổi đi. Đây là lý do cách đọc trên thẻ từ không giống ghép từng khối. Chạm một từ để nghe.',
          'Words are written block by block but said in one breath, so some sounds change. That is why the card readings are not block by block. Tap a word to hear it.'
        )}
      </p>
      <div className="mt-3 space-y-3">
        {SOUND_CHANGES.map((c) => (
          <div key={c.id} className="card p-4">
            <h3 className="font-semibold">{t(...c.name)}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(...c.rule)}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {c.examples.map((ex) => (
                <li key={ex.word}>
                  <button
                    type="button"
                    onClick={() => say(ex.word)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm transition hover:border-brand-400 dark:border-slate-700"
                  >
                    <b lang="ko">{ex.word}</b>
                    {ex.said !== ex.word && (
                      <span lang="ko" className="text-slate-500 dark:text-slate-400">
                        [{ex.said}]
                      </span>
                    )}
                    <span className="text-brand-700 dark:text-brand-300">{ex.read}</span>
                    <Volume2 className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Quiz({
  questions,
  onExit,
  onAgain,
}: {
  questions: HangulQuestion[]
  onExit: () => void
  onAgain: () => void
}) {
  useImmersive()
  const t = useT()
  const say = useSay()
  const code = useSettings((s) => s.currentLang)
  const soundOn = useSettings((s) => s.soundEnabled)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState<{ xp: number } | null>(null)
  const q = questions[idx]
  usePrefetchPackSay(questions.map((qn) => qn.say))

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === q.answer
    if (ok) setCorrect((c) => c + 1)
    if (soundOn) buzz(ok)
    say(q.say)
  }

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
      setPicked(null)
      return
    }
    const xp = hangulXp(correct, questions.length)
    addPlayXp(code, xp)
    setFinished({ xp })
  }

  if (finished)
    return (
      <SessionComplete
        emoji="🔤"
        title={t('Xong bài kiểm tra Hangul!', 'Hangul check done!')}
        correct={correct}
        total={questions.length}
      >
        <p className="w-full text-sm font-semibold text-brand-600 dark:text-brand-300">
          +{finished.xp} XP ⭐
        </p>
        <button className="btn-primary" onClick={onAgain}>
          {t('Làm lượt mới', 'Another round')}
        </button>
        <button className="btn-secondary" onClick={onExit}>
          {t('Xem lại bảng chữ', 'Back to the letters')}
        </button>
      </SessionComplete>
    )

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onExit}
          className="btn-ghost h-8 shrink-0 gap-1 !px-2 text-xs text-slate-500 dark:text-slate-400"
          aria-label={t('Kết thúc phiên', 'End session')}
        >
          <LogOut className="h-4 w-4" /> {t('Thoát', 'Exit')}
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card space-y-5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {q.kind === 'letter'
            ? t('Chữ này đọc là gì?', 'How does this letter sound?')
            : q.kind === 'syllable'
              ? t('Khối này đọc là gì?', 'How do you read this block?')
              : t('Từ này đọc là gì?', 'How do you read this word?')}
        </p>
        <p className={`font-bold ${q.kind === 'word' ? 'text-5xl' : 'text-7xl'}`}>{q.prompt}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, i) => {
            const tone =
              picked === null
                ? 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                : i === q.answer
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                  : i === picked
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    : 'border-slate-200 opacity-50 dark:border-slate-700'
            return (
              <button
                key={opt}
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`rounded-xl border-2 px-3 py-3 text-lg font-semibold transition ${tone}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
        {picked !== null && q.note && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {q.prompt} = <b className="text-slate-700 dark:text-slate-200">{q.note}</b>
          </p>
        )}
        {picked !== null && (
          <button
            type="button"
            onClick={() => say(q.say)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300"
          >
            <Volume2 className="h-4 w-4" /> {t(`Nghe lại ${q.say}`, `Hear ${q.say} again`)}
          </button>
        )}
      </div>

      {picked !== null && (
        <div className="session-actions mt-4">
          <button onClick={next} className="btn-primary h-12 w-full">
            {idx + 1 < questions.length
              ? t('Câu tiếp theo', 'Next')
              : t('Xem kết quả', 'See results')}{' '}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
