import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap, Library, Mic, Repeat2 } from 'lucide-react'
import { useData } from '@/store/dataStore'
import { useSettings } from '@/store/settingsStore'
import { useStudy } from '@/store/studyStore'
import { summarize } from '@/lib/summary'
import { useProvideContext } from '@/store/contextStore'
import ProgressRing from '@/components/ProgressRing'
import WordOfDay from './WordOfDay'
import { levelForXp } from '@/lib/xpLevel'
import InstallPrompt from '@/components/InstallPrompt'
import SpeakButton from '@/components/SpeakButton'
import { proverbOfDay } from '@/lib/proverbs'
import { DailyGoal, FirstSteps, Journey, MySky, WelcomeBack } from './Motivation'
import { today } from '@/lib/date'
import { useTilt } from '@/hooks/useTilt'
import { useT } from '@/lib/i18n'
import { usePhrases } from '@/store/phrasesStore'
import { isKnown, phraseInPack } from '@/lib/phrases'
import { useTargetLang } from '@/hooks/useTargetLang'
import { availableIn } from '@/lib/packContent'
import GrammarReviewCard from '@/features/grammar/GrammarReviewCard'

export default function Dashboard() {
  const pack = useData((s) => s.pack)!
  const code = useSettings((s) => s.currentLang)
  const dailyNewLimit = useSettings((s) => s.dailyNewLimit)
  const dailyGoal = useSettings((s) => s.dailyGoal)
  const progress = useStudy((s) => s.progress[code])
  const stats = progress?.stats
  const t = useT()
  const L = useTargetLang()

  const s = summarize(pack.words, progress, dailyNewLimit)
  const masteredPct = s.total ? s.mastered / s.total : 0
  const learnedPct = s.total ? s.learned / s.total : 0

  useProvideContext('Trang chủ')
  const proverb = proverbOfDay(today(), pack.meta.code)

  const hour = new Date().getHours()
  const greeting =
    hour < 11
      ? t('Chào buổi sáng', 'Good morning')
      : hour < 18
        ? t('Chào buổi chiều', 'Good afternoon')
        : t('Chào buổi tối', 'Good evening')

  return (
    <div className="stagger space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            <span className="text-aurora">{greeting}!</span>{' '}
            <span className="wave" aria-hidden="true">
              👋
            </span>
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t('Học', 'Learning')} <b>{t(pack.meta.nativeName, pack.meta.name)}</b> ·{' '}
            {t('mỗi ngày một chút là đủ.', 'a little every day is enough.')}
          </p>
          {proverb && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
              <span aria-hidden>💬</span>
              <i className="font-semibold text-slate-700 dark:text-slate-200">{proverb.text}</i>
              <SpeakButton
                text={proverb.text}
                lang={pack.meta.ttsLang}
                size="sm"
                label={t('Nghe câu này', 'Listen')}
              />
              <span className="text-slate-500 dark:text-slate-400">— {proverb.vi}</span>
            </p>
          )}
        </div>
        <div className="card flex items-center gap-4 rounded-2xl px-4 py-2.5">
          <span className="text-sm" title={t('Chuỗi ngày học liên tục', 'Study streak')}>
            🔥 <b className="text-lg">{stats?.streak ?? 0}</b>{' '}
            {t('ngày', (stats?.streak ?? 0) === 1 ? 'day' : 'days')}
          </span>
          <span
            className="text-sm text-brand-600 dark:text-brand-300"
            title={t('Điểm kinh nghiệm', 'Experience points')}
          >
            ⭐ <b className="text-lg">{stats?.xp ?? 0}</b>
          </span>
          <span
            className="text-sm font-semibold text-violet-600 dark:text-violet-300"
            title={t('Cấp độ', 'Level')}
          >
            {t('Cấp', 'Level')} {levelForXp(stats?.xp ?? 0).level}
          </span>
        </div>
      </div>

      {s.learned === 0 && !stats?.lastStudyDay && <FirstSteps />}
      <WelcomeBack stats={stats} day={today()} due={s.due} />
      {stats && <Journey reviewsByDay={stats.reviewsByDay} day={today()} />}

      {/* A small goal, a streak one missed day can't break, and a sky to fill. */}
      <section className="grid gap-4 sm:grid-cols-2">
        <DailyGoal
          stats={stats}
          day={today()}
          doneToday={s.reviewsDoneToday}
          goal={dailyGoal}
          due={s.due}
        />
        <MySky learned={s.learned} mastered={s.mastered} streak={stats?.streak ?? 0} />
      </section>

      <InstallPrompt />

      {/* Today's plan */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('Kế hoạch hôm nay', "Today's plan")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            to="/review"
            icon={Repeat2}
            tone="brand"
            title={t('Ôn tập', 'Review')}
            count={s.due}
            unit={t('từ cần ôn', 'words due')}
            cta={
              s.due > 0 ? t('Ôn ngay', 'Review now') : t('Chưa có từ đến hạn', 'Nothing due yet')
            }
            disabled={s.due === 0}
            hint={t('Lặp lại ngắt quãng giúp nhớ lâu.', 'Spaced repetition makes words stick.')}
          />
          <ActionCard
            to="/learn"
            icon={BookOpen}
            tone="emerald"
            title={t('Học từ mới', 'Learn new words')}
            count={s.newRemainingToday}
            unit={t('từ mới hôm nay', 'new words today')}
            cta={
              s.newRemainingToday > 0
                ? t('Bắt đầu học', 'Start learning')
                : t('Đã đủ từ mới hôm nay', 'Done for today')
            }
            disabled={s.newRemainingToday === 0}
            hint={t(
              `Giới hạn ${dailyNewLimit} từ/ngày · đã học ${s.newDoneToday}`,
              `Limit ${dailyNewLimit} words/day · learned ${s.newDoneToday}`
            )}
          />
        </div>
      </section>

      <GrammarReviewCard />

      {/* Beyond single words: ready-made sentences for real situations, or for
          Korean and Chinese the writing and sounds themselves. */}
      {availableIn('/hangul', code) ? (
        <HangulCard />
      ) : availableIn('/pinyin', code) ? (
        <PinyinCard />
      ) : (
        availableIn('/phrases', code) && <PhrasesCard code={code} />
      )}

      {/* Progress overview */}
      <section className="grid gap-4 sm:grid-cols-[auto,1fr]">
        <div className="card flex items-center justify-center p-6">
          <ProgressRing value={masteredPct} size={150} stroke={12}>
            <div>
              <p className="text-3xl font-extrabold">{Math.round(masteredPct * 100)}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('thành thạo', 'mastered')}
              </p>
            </div>
          </ProgressRing>
        </div>
        <div className="card grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
          <Metric
            label={t('Đã học', 'Learned')}
            value={s.learned}
            total={s.total}
            tone="text-brand-600"
          />
          <Metric
            label={t('Thành thạo', 'Mastered')}
            value={s.mastered}
            total={s.total}
            tone="text-emerald-600"
          />
          <Metric
            label={t('Đang học', 'Learning')}
            value={s.learning}
            tone="text-amber-700 dark:text-amber-600"
          />
          <Metric
            label={t('Chưa học', 'Not started')}
            value={s.fresh}
            tone="text-slate-500 dark:text-slate-400"
          />
          <div className="col-span-2 sm:col-span-4">
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${learnedPct * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {t(
                `Bạn đã chạm tới ${s.learned}/${s.total} từ.`,
                `You've met ${s.learned}/${s.total} words.`
              )}
            </p>
          </div>
        </div>
      </section>

      <WordOfDay />

      {/* Play & practise */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('Chơi mà học', 'Learn through play')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickLink
            to="/games/match"
            emoji="🧩"
            title={t('Ghép cặp', 'Match')}
            desc={t(
              '6 cặp từ – nghĩa, đua với đồng hồ.',
              'Pair 6 words with meanings, beat the clock.'
            )}
          />
          <QuickLink
            to="/games/order"
            emoji="🔤"
            title={t('Xếp câu', 'Build a sentence')}
            desc={t(`Xếp mảnh thành câu ${L.vi} đúng.`, 'Put the pieces into a correct sentence.')}
          />
          <QuickLink
            to="/quiz"
            icon={GraduationCap}
            title={t('Kiểm tra nhanh', 'Quick quiz')}
            desc={t(
              '6 dạng câu hỏi: chọn nghĩa, nghe, điền câu…',
              '6 question types: meanings, listening, gaps…'
            )}
          />
          <QuickLink
            to="/speaking"
            icon={Mic}
            title={t('Luyện nói', 'Speaking')}
            desc={t(
              'Đọc vào micro, so với giọng mẫu.',
              'Speak into the mic, compare with the model.'
            )}
          />
        </div>
        <Link
          to="/browse"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          <Library className="h-4 w-4" /> {t('Tra cứu', 'Browse')} {pack.meta.count}{' '}
          {t('từ', 'words')}
        </Link>
      </section>
    </div>
  )
}

function ActionCard({
  to,
  icon: Icon,
  tone,
  title,
  count,
  unit,
  cta,
  disabled,
  hint,
}: {
  to: string
  icon: typeof BookOpen
  tone: 'brand' | 'emerald'
  title: string
  count: number
  unit: string
  cta: string
  disabled: boolean
  hint: string
}) {
  const tilt = useTilt()
  const toneCls =
    tone === 'brand' ? 'from-brand-500 to-brand-700' : 'from-emerald-500 to-emerald-700'
  const inner = (
    <div
      className={`card relative overflow-hidden p-5 ${disabled ? '' : 'tilt'}`}
      {...(disabled ? {} : tilt)}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${toneCls} opacity-10`}
      />
      {/* Dim the content, not the card: a see-through card would show the sky. */}
      <div className={disabled ? 'opacity-60' : ''}>
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${toneCls} text-white shadow`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="mt-4">
          <span className="text-4xl font-extrabold">{count}</span>{' '}
          <span className="text-slate-500 dark:text-slate-400">{unit}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        <div
          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${disabled ? 'text-slate-500' : 'text-brand-600 dark:text-brand-300'}`}
        >
          {cta} {!disabled && <ArrowRight className="h-4 w-4" />}
        </div>
      </div>
    </div>
  )
  return disabled ? <div>{inner}</div> : <Link to={to}>{inner}</Link>
}

function Metric({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total?: number
  tone: string
}) {
  return (
    <div>
      <p className={`text-2xl font-extrabold ${tone}`}>
        {value}
        {total != null && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/{total}</span>
        )}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  emoji,
  title,
  desc,
}: {
  to: string
  icon?: typeof BookOpen
  emoji?: string
  title: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {emoji ?? (Icon && <Icon className="h-6 w-6" />)}
      </span>
      <div className="min-w-0">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-300" />
    </Link>
  )
}

function PhrasesCard({ code }: { code: string }) {
  const t = useT()
  const known = usePhrases(
    (s) =>
      Object.entries(s.progress).filter(([id, r]) => phraseInPack(Number(id), code) && isKnown(r))
        .length
  )
  return (
    <Link
      to="/phrases"
      className="card group relative flex items-center gap-4 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 opacity-10" />
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl text-white shadow-md">
        💬
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-bold">
          {t('Mẫu câu giao tiếp', 'Everyday phrases')}
          <span className="chip bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            {t('Mới', 'New')}
          </span>
        </span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">
          {known > 0
            ? t(
                `Đã thuộc ${known} câu — luyện tiếp để nói trôi chảy hơn.`,
                `${known} phrases learned — keep going to speak more fluently.`
              )
            : t(
                'Câu nói dùng được ngay: chào hỏi, gọi món, hỏi đường… có giọng đọc AI chuẩn Mỹ.',
                'Sentences you can use today: greetings, ordering, directions… with natural AI voices.'
              )}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  )
}

function HangulCard() {
  const t = useT()
  return (
    <Link
      to="/hangul"
      className="card group relative flex items-center gap-4 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 opacity-10" />
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-2xl font-bold text-white shadow-md">
        한
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{t('Bảng chữ cái Hangul', 'The Hangul alphabet')}</span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Đọc được chữ Hàn là bước đầu tiên: 24 chữ cái cơ bản, nghe từng chữ và tự ghép thành tiếng.',
            'Reading Korean comes first: 24 basic letters — hear each one and build your own syllables.'
          )}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  )
}

function PinyinCard() {
  const t = useT()
  return (
    <Link
      to="/pinyin"
      className="card group relative flex items-center gap-4 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-red-400 to-amber-500 opacity-10" />
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-xl font-bold text-white shadow-md">
        mā
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{t('Pinyin & thanh điệu', 'Pinyin & tones')}</span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Nghe ra 4 thanh là nửa chặng đường: mā má mǎ mà — chạm để nghe, rồi kiểm tra nhanh.',
            'Hearing the four tones is half the battle: mā má mǎ mà — tap to listen, then a quick check.'
          )}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  )
}
