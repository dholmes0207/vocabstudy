import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { usePracticeBank } from '@/hooks/usePracticeBank'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROLEPLAY_PACKS, isRoleplayPack, type RoleScene, type RoleplayPack } from '@/lib/roleplay'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'
import RoleplayRound from './RoleplayRound'

// "Nhập vai hội thoại" (docs/design/roleplay.md): pick a scene, play your part.

export default function Roleplay() {
  const code = useSettings((s) => s.currentLang)
  if (!isRoleplayPack(code)) return <PackOnly packs={['en', 'zh']} />
  return <RoleplayView key={code} code={code} />
}

function RoleplayView({ code }: { code: RoleplayPack }) {
  const t = useT()
  useDocumentTitle(`${t('Nhập vai hội thoại', 'Role-play')} · VocaStudy`)
  const { bank, error, retry } = usePracticeBank(ROLEPLAY_PACKS[code].load)
  const [play, setPlay] = useState<{ n: number; scene: RoleScene; challenge: boolean } | null>(null)
  const [challenge, setChallenge] = useState(false)

  if (play)
    return (
      <RoleplayRound
        key={play.n}
        scene={play.scene}
        pack={code}
        challenge={play.challenge}
        onAgain={() => setPlay((p) => p && { ...p, n: p.n + 1 })}
        onExit={() => setPlay(null)}
      />
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Nhập vai hội thoại', 'Role-play')}</span>{' '}
          <span aria-hidden="true">🎭</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Bạn đóng một vai trong một tình huống thật: gọi đồ uống, hỏi đường, đi khám bệnh… Người kia nói, bạn nghe rồi nói lời của mình. Máy chấm từng câu.',
            'You play one part in a real situation: ordering a drink, asking the way, seeing a doctor… The other person speaks, you answer out loud, and each line is checked.'
          )}
        </p>
      </header>

      <label className="card flex cursor-pointer items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={challenge}
          onChange={(e) => setChallenge(e.target.checked)}
          className="h-5 w-5 accent-fuchsia-600"
        />
        <span>
          <span className="block font-bold">🔥 {t('Chế độ thử thách', 'Challenge mode')}</span>
          <span className="block text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Ẩn câu của bạn, chỉ hiện nghĩa tiếng Việt: tự nghĩ ra câu rồi nói.',
              'Your lines are hidden, only their meaning shows: work out the sentence and say it.'
            )}
          </span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="card flex flex-wrap items-center gap-3 p-4 text-sm">
          {t('Chưa tải được các cảnh.', "Couldn't load the scenes.")}
          <button type="button" className="btn-secondary h-9 text-sm" onClick={retry}>
            {t('Thử lại', 'Try again')}
          </button>
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {bank?.scenes.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setPlay({ n: 1, scene: s, challenge })}
                className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-lg"
              >
                <span className="text-3xl" aria-hidden="true">
                  {s.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    {t(...s.title)}
                    {s.tag && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-200">
                        {s.tag}
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400">
                    {t(...s.setting)}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
