import { useState } from 'react'
import { Check, Snail, Volume2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { useActivity } from '@/store/activityStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pronounce, textAudio } from '@/lib/audio'
import { SLOW_RATE, TWISTERS, TWISTER_XP, type TongueTwister } from '@/lib/tongueTwisters'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import AnswerRecorder from '@/features/ielts/AnswerRecorder'

// "Câu nói líu lưỡi" (docs/design/tongue-twisters.md): hear a tongue twister
// slowly, then at speed, record yourself saying it and play it back.

export default function TongueTwisters() {
  const code = useSettings((s) => s.currentLang)
  if (code !== 'en' && code !== 'zh') return <PackOnly packs={['en', 'zh']} />
  return <TwistersView code={code} />
}

function TwistersView({ code }: { code: 'en' | 'zh' }) {
  const t = useT()
  useDocumentTitle(`${t('Câu nói líu lưỡi', 'Tongue twisters')} · VocaStudy`)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const log = useActivity((s) => s.log)
  // The twisters recorded on this visit: XP once each.
  const [practised, setPractised] = useState<Set<string>>(() => new Set())
  const recorded = (text: string) => {
    if (practised.has(text)) return
    setPractised((p) => new Set(p).add(text))
    addPlayXp(code, TWISTER_XP)
    log(code, 'twister')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Câu nói líu lưỡi', 'Tongue twisters')}</span>{' '}
          <span lang={code}>{code === 'zh' ? '绕口令' : '👅'}</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Mỗi câu nhắm vào một cặp âm người Việt hay vấp. Nghe chậm trước, nói chậm cho đúng, rồi tăng tốc. Ghi âm và nghe lại để tự sửa.',
            'Each one targets sounds Vietnamese speakers often trip on. Hear it slowly, say it slowly and correctly, then speed up. Record yourself and listen back.'
          )}
        </p>
        {practised.size > 0 && (
          <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {t(
              `Đã luyện ${practised.size}/${TWISTERS[code].length} câu · +${practised.size * TWISTER_XP} XP`,
              `${practised.size} of ${TWISTERS[code].length} practised · +${practised.size * TWISTER_XP} XP`
            )}
          </p>
        )}
      </header>
      <ul className="grid grid-cols-1 gap-3">
        {TWISTERS[code].map((x) => (
          <Twister
            key={x.text}
            item={x}
            code={code}
            done={practised.has(x.text)}
            onRecorded={() => recorded(x.text)}
          />
        ))}
      </ul>
    </div>
  )
}

function Twister({
  item,
  code,
  done,
  onRecorded,
}: {
  item: TongueTwister
  code: 'en' | 'zh'
  done: boolean
  onRecorded: () => void
}) {
  const t = useT()
  const ttsLang = useData((s) => s.pack!.meta.ttsLang)
  const play = (rate = 1) =>
    pronounce({ text: item.text, audioSrc: textAudio(item.text), lang: ttsLang, rate })
  return (
    <li className="card min-w-0 space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p lang={code} className={`font-bold ${code === 'zh' ? 'text-2xl' : 'text-xl'}`}>
          {item.text}
        </p>
        {done && (
          <Check
            className="h-5 w-5 shrink-0 text-emerald-600"
            aria-label={t('Đã luyện', 'Practised')}
          />
        )}
      </div>
      {item.reading && <p className="text-sm text-slate-600 dark:text-slate-300">{item.reading}</p>}
      <p className="text-sm text-slate-500 dark:text-slate-400">{item.vi}</p>
      <p className="text-sm">🎯 {t(...item.focus)}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary h-10 text-sm"
          onClick={() => play(SLOW_RATE)}
        >
          <Snail className="h-4 w-4" /> {t('Nghe chậm', 'Slowly')}
        </button>
        <button type="button" className="btn-secondary h-10 text-sm" onClick={() => play()}>
          <Volume2 className="h-4 w-4" /> {t('Nghe tốc độ thường', 'At speed')}
        </button>
      </div>
      <AnswerRecorder onRecorded={onRecorded} />
    </li>
  )
}
