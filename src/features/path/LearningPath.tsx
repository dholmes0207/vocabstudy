import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Lock, Sparkles } from 'lucide-react'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { usePlacement } from '@/store/placementStore'
import { usePath } from '@/store/pathStore'
import { usePathContext } from '@/hooks/usePathContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  CLEAR_AT,
  LEVEL_XP,
  currentLevel,
  levelForPlacement,
  nextStep,
  pathFor,
  pathState,
  type LevelState,
  type PathLevel,
} from '@/lib/learningPath'
import { celebrate } from '@/lib/confetti'
import { useT } from '@/lib/i18n'
import PackOnly from '@/components/PackOnly'

// "Lộ trình theo cấp" (docs/design/learning-path.md): the levels as a trail to
// climb, the next thing to do always one tap away, and each level showing what
// it is made of and how far along it is.

const pct = (r: number) => Math.round(r * 100)

export default function LearningPath() {
  const code = useSettings((s) => s.currentLang)
  const levels = pathFor(code)
  if (!levels) return <PackOnly packs={['en']} />
  return <PathView code={code} levels={levels} />
}

function PathView({ code, levels }: { code: string; levels: PathLevel[] }) {
  const t = useT()
  useDocumentTitle(`${t('Lộ trình theo cấp', 'Level path')} · VocaStudy`)
  const ctx = usePathContext(code)
  const placedAt = usePlacement((s) => s.results[code]?.start ?? 0)
  const openTo = levelForPlacement(levels, placedAt)
  const states = useMemo(() => pathState(levels, ctx, openTo), [levels, ctx, openTo])
  const current = currentLevel(states)
  const step = current && nextStep(current)
  const overall = states.reduce((n, s) => n + s.ratio, 0) / states.length

  // A level just cleared: confetti, a line on top and its XP, once.
  const celebrated = usePath((s) => s.celebrated[code] ?? 0)
  const markCelebrated = usePath((s) => s.celebrate)
  const addPlayXp = useStudy((s) => s.addPlayXp)
  const cleared = states.filter((s) => s.unlocked && s.ratio >= CLEAR_AT).map((s) => s.level.n)
  const top = cleared.length ? Math.max(...cleared) : 0
  // What had been celebrated when the page opened: the banner stays for this visit.
  const [seenAtOpen] = useState(celebrated)
  const levelUp = top > seenAtOpen ? top : null
  useEffect(() => {
    if (top <= celebrated) return
    markCelebrated(code, top)
    addPlayXp(code, LEVEL_XP)
    celebrate(1.4)
  }, [top, celebrated, code, markCelebrated, addPlayXp])

  const [open, setOpen] = useState<number | null>(null)
  const shown = open ?? current?.level.n ?? 1

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-aurora">{t('Lộ trình theo cấp', 'Level path')}</span>{' '}
          <span aria-hidden="true">🗺️</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t(
            'Từng cấp một: từ vựng, rồi các thì, cấu trúc câu, nghe – nói, tới luyện thi TOEIC và IELTS. Mọi bài bạn đã làm ở bất cứ đâu trong app đều được tính.',
            'One level at a time: words, then tenses, sentence building, listening and speaking, up to TOEIC and IELTS. Everything you do anywhere in the app counts.'
          )}
        </p>
      </header>

      {levelUp && (
        <p
          role="status"
          className="card flex items-center gap-3 border-2 border-amber-300 bg-amber-50 p-4 font-semibold text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t(
            `Lên cấp! Bạn đã qua cấp ${levelUp} · +${LEVEL_XP} XP`,
            `Level up! You cleared level ${levelUp} · +${LEVEL_XP} XP`
          )}
        </p>
      )}

      {current && (
        <section
          aria-label={t('Bước tiếp theo', 'Next step')}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${current.level.tone} p-5 text-white shadow-lg`}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {t(
              `Cấp ${current.level.n} · ${current.level.cefr}`,
              `Level ${current.level.n} · ${current.level.cefr}`
            )}
          </p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
            <span aria-hidden="true">{current.level.icon}</span> {t(...current.level.title)}
          </p>
          <Bar ratio={current.ratio} light />
          <p className="mt-1 text-sm text-white/90">
            {t(
              `Đã xong ${pct(current.ratio)}% cấp này`,
              `${pct(current.ratio)}% of this level done`
            )}{' '}
            · {t(`cả lộ trình ${pct(overall)}%`, `whole path ${pct(overall)}%`)}
          </p>
          {step ? (
            <Link
              to={step.step.to}
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 text-slate-900 shadow transition hover:bg-white"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {step.step.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase text-slate-500">
                    {t('Làm tiếp', 'Continue')}
                  </span>
                  <span className="block truncate font-bold">{t(...step.step.title)}</span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-4 rounded-2xl bg-white/20 p-3 font-semibold">
              {t(
                'Bạn đã xong mọi bước đang có. Bài mới sắp tới!',
                'You finished every step there is. More is coming!'
              )}
            </p>
          )}
        </section>
      )}

      <ol className="relative space-y-4" aria-label={t('Các cấp', 'Levels')}>
        {/* The trail between the medals. */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-7 top-6 w-1 rounded-full bg-gradient-to-b from-emerald-300 via-amber-300 to-fuchsia-400 opacity-40"
        />
        {states.map((s) => (
          <LevelRow
            key={s.level.n}
            state={s}
            current={s.level.n === current?.level.n}
            expanded={s.level.n === shown}
            onToggle={() => setOpen(s.level.n === shown ? 0 : s.level.n)}
          />
        ))}
      </ol>
    </div>
  )
}

function LevelRow({
  state,
  current,
  expanded,
  onToggle,
}: {
  state: LevelState
  current: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const t = useT()
  const { level, unlocked, ratio, complete } = state
  return (
    <li className="relative pl-16">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1 grid h-14 w-14 place-items-center rounded-full text-2xl shadow-md ring-4 ${
          current ? 'ring-amber-300 dark:ring-amber-400' : 'ring-white dark:ring-slate-900'
        } ${unlocked ? `bg-gradient-to-br ${level.tone}` : 'bg-slate-200 grayscale dark:bg-slate-700'}`}
      >
        {unlocked ? level.icon : <Lock className="h-6 w-6 text-slate-500" />}
        {complete && (
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900">
            <Check className="h-4 w-4" />
          </span>
        )}
      </span>
      <div className={`card p-4 ${unlocked ? '' : 'opacity-70'}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-start gap-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-bold">
                {t(`Cấp ${level.n}: ${level.title[0]}`, `Level ${level.n}: ${level.title[1]}`)}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {level.cefr}
              </span>
              {level.soon && (
                <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-200">
                  {t('Đang mở rộng', 'Growing')}
                </span>
              )}
            </span>
            <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
              {t(...level.tagline)}
            </span>
            <Bar ratio={ratio} />
            <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {unlocked
                ? t(
                    `${pct(ratio)}% · qua cấp ở ${pct(CLEAR_AT)}%`,
                    `${pct(ratio)}% · cleared at ${pct(CLEAR_AT)}%`
                  )
                : t(
                    `Mở khi cấp ${level.n - 1} đạt ${pct(CLEAR_AT)}%`,
                    `Opens when level ${level.n - 1} reaches ${pct(CLEAR_AT)}%`
                  )}
            </span>
          </span>
          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <ul className="mt-4 space-y-2">
            {state.steps.map(({ step, value, done }) => {
              const body = (
                <>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${
                      done ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    aria-hidden="true"
                  >
                    {done ? '✅' : step.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t(...step.title)}</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">
                      {t(...step.desc)}
                    </span>
                    <Bar ratio={value / step.goal} thin />
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {value}/{step.goal} {t(...step.unit)}
                    </span>
                  </span>
                </>
              )
              return (
                <li key={step.id}>
                  {unlocked ? (
                    <Link
                      to={step.to}
                      className="flex items-start gap-3 rounded-2xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 p-2">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </li>
  )
}

function Bar({ ratio, light, thin }: { ratio: number; light?: boolean; thin?: boolean }) {
  return (
    <span
      className={`mt-2 block overflow-hidden rounded-full ${thin ? 'h-1.5' : 'h-2.5'} ${
        light ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      <span
        className={`block h-full rounded-full transition-all duration-700 ${
          light ? 'bg-white' : 'bg-gradient-to-r from-emerald-400 to-sky-500'
        }`}
        style={{ width: `${Math.round(Math.min(1, ratio) * 100)}%` }}
      />
    </span>
  )
}
