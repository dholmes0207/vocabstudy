import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenText,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Headphones,
  Languages,
  MessagesSquare,
  Mic,
  Trophy,
  Volume2,
} from 'lucide-react'
import { useT } from '@/lib/i18n'
import { hasUsedApp } from '@/lib/entry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import Testimonials from './Testimonials'
import LanguagePicker from './LanguagePicker'

// The public home page (docs/design/landing.md): what VocaStudy is — one place
// for Vietnamese speakers to learn many languages — who it is for, and one
// obvious way to start. Every number here is true of the product
// as shipped — no invented users, ratings or testimonials.

export default function Landing() {
  const t = useT()
  useDocumentTitle(
    t(
      'VocaStudy — Học ngoại ngữ mỗi ngày: tiếng Anh, tiếng Hàn, tiếng Trung',
      'VocaStudy — Learn languages every day: English, Korean, Chinese'
    )
  )

  return (
    <div className="overflow-x-clip">
      <Hero />
      <LanguagePicker />
      <Stats />
      <Features />
      <HowItWorks />
      <ForVietnamese />
      <Testimonials />
      <Faq />
      <section className="px-4 pb-20 pt-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-700 px-6 py-14 text-center text-white shadow-xl">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('Bắt đầu với 5 từ đầu tiên', 'Start with your first 5 words')}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-indigo-100">
            {t(
              'Chỉ mất 2 phút. Không cần thẻ thanh toán, không cần tài khoản để học thử.',
              'It takes 2 minutes. No card, and no account needed to try it.'
            )}
          </p>
          <Link
            to="/learn?quick=1"
            className="relative mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-brand-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {t('Học ngay — miễn phí', 'Start now — it’s free')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function Hero() {
  const t = useT()
  const [returning] = useState(() => hasUsedApp(localStorage))
  return (
    <section className="px-4 pb-16 pt-12 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr,1fr]">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('Miễn phí · Dành cho người Việt', 'Free · Made for Vietnamese learners')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t('Tự tin nói ngoại ngữ,', 'Speak a new language with confidence,')}{' '}
            <span className="text-aurora">{t('mỗi ngày một chút.', 'a little every day.')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            {t(
              'Tiếng Anh, tiếng Hàn, tiếng Trung — và sẽ còn thêm ngôn ngữ mới. Cùng một cách học nhẹ nhàng: nghĩa và cách đọc giải thích bằng tiếng Việt, lặp lại ngắt quãng để nhớ lâu, mỗi ngày chỉ vài phút.',
              'English, Korean, Chinese — with more languages to come. One gentle way to learn them all: meanings and pronunciation explained in Vietnamese, spaced repetition that makes words stick, a few minutes a day.'
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/home" className="btn-primary h-12 px-6 text-base">
              {returning
                ? t('Tiếp tục học', 'Continue learning')
                : t('Bắt đầu học miễn phí', 'Start learning free')}{' '}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/#how" className="btn-secondary h-12 px-6 text-base">
              {t('Xem cách học', 'See how it works')}
            </Link>
          </div>
          {/* Every pack, with its word count, is in LanguagePicker right below. */}
          <Link
            to="/#languages"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t('Chọn ngôn ngữ bạn muốn học', 'Choose the language you want to learn')}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {[
              t('Không cần tài khoản để thử', 'No account needed to try'),
              t('Học được cả khi mất mạng', 'Works offline'),
              t('Giao diện Việt & Anh', 'Vietnamese & English interface'),
            ].map((x) => (
              <li key={x} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}

/** A glimpse of the app, drawn in HTML so it is sharp on every screen and in both themes. */
function HeroPreview() {
  const t = useT()
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-400/30 via-violet-400/20 to-fuchsia-400/20 blur-2xl" />
      <div className="relative space-y-4">
        <div className="card rotate-[-1.5deg] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              verb
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('Từ của ngày', 'Word of the day')}
            </span>
          </div>
          <p className="mt-4 text-4xl font-extrabold tracking-tight">improve</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            /ɪmˈpruv/ · {t('đọc gần giống', 'reads like')} <b>im-PRUUV</b>
          </p>
          <p className="mt-3 text-xl font-bold text-brand-600 dark:text-brand-300">cải thiện</p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
            I want to <b className="text-brand-600 dark:text-brand-300">improve</b> my English.
            <span className="block italic text-slate-500 dark:text-slate-400">
              Tôi muốn cải thiện tiếng Anh.
            </span>
          </p>
        </div>
        <div className="card ml-auto w-[88%] rotate-[1.5deg] p-5 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            💬 {t('Mẫu câu giao tiếp', 'Everyday phrases')}
          </p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
              <Volume2 className="h-4 w-4" />
            </span>
            Could you say that again?
          </p>
          <p className="mt-1 pl-10 text-slate-500 dark:text-slate-400">Bạn nói lại được không?</p>
        </div>
        <div className="flex gap-3">
          <div className="card flex items-center gap-2 px-4 py-3 text-sm font-semibold shadow-lg">
            🔥 7 {t('ngày liên tiếp', 'day streak')}
          </div>
          <div className="card flex items-center gap-2 px-4 py-3 text-sm font-semibold shadow-lg">
            🎁 {t('Quà hôm nay:', "Today's gift:")} 🐼 panda
          </div>
        </div>
      </div>
    </div>
  )
}

function Stats() {
  const t = useT()
  const items = [
    ['3', '3', t('ngôn ngữ, và sẽ còn thêm', 'languages, with more to come')],
    ['4.800+', '4,800+', t('từ vựng có nghĩa tiếng Việt', 'words with Vietnamese meanings')],
    ['28', '28', t('truyện ngắn chạm là ra nghĩa', 'short stories, tap for meanings')],
    ['0đ', '$0', t('học hoàn toàn miễn phí', 'completely free')],
  ] as const
  return (
    <section className="px-4">
      <div className="card mx-auto grid max-w-6xl grid-cols-2 divide-slate-200/70 py-6 dark:divide-white/10 sm:grid-cols-4 sm:divide-x">
        {items.map(([vi, en, label]) => (
          <div key={label} className="px-4 py-3 text-center">
            <p className="text-3xl font-extrabold tracking-tight text-aurora">{t(vi, en)}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
        {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

function Features() {
  const t = useT()
  const items = [
    {
      icon: Brain,
      tone: 'from-brand-500 to-indigo-600',
      title: t('Nhớ lâu, không học vẹt', 'Remember, don’t cram'),
      desc: t(
        'Lặp lại ngắt quãng hỏi lại đúng lúc bạn sắp quên. Tự nhớ lại thay vì đọc đi đọc lại.',
        'Spaced repetition asks again right before you would forget. You recall, instead of re-reading.'
      ),
    },
    {
      icon: MessagesSquare,
      tone: 'from-sky-500 to-cyan-600',
      title: t('Mẫu câu dùng ngay', 'Phrases you can use today'),
      desc: t(
        '100 câu theo tình huống: chào hỏi, gọi món, hỏi đường, công sở… nghe, hiểu, xếp câu.',
        '100 phrases for real situations: greetings, ordering, directions, work… hear, understand, build.'
      ),
    },
    {
      icon: Mic,
      tone: 'from-rose-500 to-pink-600',
      title: t('Luyện phát âm cho người Việt', 'Pronunciation for Vietnamese speakers'),
      desc: t(
        'Đọc vào micro để được chấm điểm. Bài riêng cho âm khó: th, âm cuối, ship/sheep.',
        'Speak into the mic and get a score. Lessons on the hard sounds: th, final sounds, ship/sheep.'
      ),
    },
    {
      icon: Headphones,
      tone: 'from-emerald-500 to-teal-600',
      title: t('Nghe thụ động', 'Hands-free listening'),
      desc: t(
        'Bận tay, đang trên xe? Bấm một lần rồi nghe: từ, nghĩa, câu ví dụ — điều khiển từ màn hình khoá.',
        'Hands busy, on the bus? Tap once and listen: word, meaning, example — controlled from the lock screen.'
      ),
    },
    {
      icon: Bot,
      tone: 'from-violet-500 to-purple-600',
      title: t('Trợ lý AI', 'AI tutor'),
      desc: t(
        'Hỏi nghĩa, cách dùng, cách phân biệt từ dễ nhầm — giải thích theo đúng trình độ của bạn.',
        'Ask about meanings, usage and confusing pairs — explained at your level.'
      ),
    },
    {
      icon: BookOpenText,
      tone: 'from-orange-400 to-rose-500',
      title: t('Đọc truyện, ngữ pháp, chủ đề', 'Stories, grammar, topics'),
      desc: t(
        'Tiếng Anh: 14 truyện ngắn chạm vào từ là ra nghĩa, 12 bài ngữ pháp giải thích bằng tiếng Việt, 19 bộ từ theo tình huống.',
        'English: 14 short stories where any word is a tap away from its meaning, 12 grammar lessons explained in Vietnamese, 19 topic decks.'
      ),
    },
    {
      icon: Languages,
      tone: 'from-fuchsia-500 to-rose-600',
      title: t('Thêm tiếng Hàn, tiếng Trung (beta)', 'Korean and Chinese too (beta)'),
      desc: t(
        'Tiếng Hàn: bảng chữ Hangul, 192 từ sơ cấp có cách đọc kiểu Việt, 12 bộ chủ đề, 11 bài ngữ pháp và 8 truyện ngắn. Tiếng Trung: 234 từ (đủ 150 từ HSK 1) có pinyin và âm Hán Việt, bài pinyin & thanh điệu, 13 bộ chủ đề, 11 bài ngữ pháp và 6 truyện ngắn. Đọc bằng giọng của trình duyệt.',
        'Korean: the Hangul alphabet, 192 beginner words with Vietnamese-style readings, 12 topic decks, 11 grammar lessons and 8 short stories. Chinese: 234 words (all 150 of HSK 1) with pinyin and Sino-Vietnamese readings, a pinyin & tones guide, 13 topic decks, 11 grammar lessons and 6 short stories. Read aloud by your browser.'
      ),
    },
    {
      icon: Trophy,
      tone: 'from-amber-500 to-orange-600',
      title: t('Vui để quay lại mỗi ngày', 'Fun to come back to'),
      desc: t(
        'Trò chơi, chuỗi ngày có khiên bảo vệ, quà nhãn dán khi đạt mục tiêu nhỏ, huy hiệu và cấp độ.',
        'Games, a streak with shields, a sticker gift for reaching your small goal, badges and levels.'
      ),
    },
  ]
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20">
      <SectionTitle
        kicker={t('Tính năng', 'Features')}
        title={t(
          'Mọi thứ để học — và để không bỏ cuộc',
          'Everything you need — to learn and to keep going'
        )}
      />
      <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <div key={f.title} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-md`}
            >
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const t = useT()
  const steps = [
    [
      t('Học 5 từ trong 2 phút', 'Learn 5 words in 2 minutes'),
      t(
        'Nghe giọng mẫu, xem câu ví dụ, rồi tự nhớ lại ngay. Sai thì được giải thích và làm lại.',
        'Hear the model voice, see an example, then recall it right away. Mistakes get explained and retried.'
      ),
    ],
    [
      t('Ôn đúng lúc sắp quên', 'Review just before you forget'),
      t(
        'App tự xếp lịch ôn. Mỗi lần nhớ lại đúng, khoảng cách tới lần sau dài thêm.',
        'The app schedules your reviews. Every right answer stretches the gap to the next one.'
      ),
    ],
    [
      t('Dùng từ trong câu thật', 'Use them in real sentences'),
      t(
        'Luyện mẫu câu theo tình huống, tự đặt câu, luyện nói — từ vựng trở thành lời nói.',
        'Practise phrases for real situations, write your own sentences, speak — words become speech.'
      ),
    ],
  ]
  return (
    <section id="how" className="scroll-mt-20 px-4 py-20">
      <SectionTitle
        kicker={t('Cách học', 'How it works')}
        title={t('Ba bước, mỗi ngày vài phút', 'Three steps, a few minutes a day')}
        sub={t(
          'Không cần biết gì trước. Mục tiêu nhỏ 10 câu mỗi ngày — lỡ một ngày cũng không mất chuỗi.',
          'No prior knowledge needed. A small goal of 10 answers a day — missing one day won’t break your streak.'
        )}
      />
      <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {steps.map(([title, desc], i) => (
          <li key={title} className="card relative p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 font-extrabold text-white shadow-md">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-bold">{title}</h3>
            <p className="mt-1.5 text-slate-500 dark:text-slate-400">{desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ForVietnamese() {
  const t = useT()
  const points = [
    t(
      'Cách đọc gần đúng bằng chữ Việt — "improve" đọc "im-PRUUV", âm dài viết đôi (sheep SHIIP, ship SHIP), "안녕하세요" đọc "an-nyơng-ha-xê-yô". Từ tiếng Trung có thêm âm Hán Việt.',
      'A Vietnamese-letter respelling — "improve" reads "im-PRUUV", long sounds doubled (sheep SHIIP, ship SHIP), "안녕하세요" reads "an-nyơng-ha-xê-yô". Chinese words also show their Sino-Vietnamese reading.'
    ),
    t(
      'Nghĩa và câu dịch bằng tiếng Việt tự nhiên.',
      'Meanings and example translations in natural Vietnamese.'
    ),
    t(
      'Bài riêng cho những âm người Việt hay sai, kèm trò "thử tai".',
      'Lessons on the sounds Vietnamese speakers find hardest, with an ear test.'
    ),
    t(
      'Lời động viên thay cho lời chê — sai là một phần của nhớ.',
      'Encouragement instead of criticism — mistakes are part of remembering.'
    ),
  ]
  return (
    <section className="px-4 py-12">
      <div className="card mx-auto grid max-w-6xl items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
            {t('Dành cho người Việt', 'Made for Vietnamese learners')}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            {t('Mất gốc cũng bắt đầu được', 'Start even from zero')}
          </h2>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-slate-600 dark:text-slate-300">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
          {[
            ['think', '/θɪŋk/', 'THINGK', 'nghĩ'],
            ['sheep', '/ʃip/', 'SHIIP', 'con cừu'],
            ['computer', '/kəmˈpjutər/', 'kơm-PYUU-tơ', 'máy tính'],
            ['rice', '/raɪs/', 'RAIS', 'gạo, cơm'],
          ].map(([w, ipa, vi, m]) => (
            <div key={w} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xl font-extrabold">{w}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {ipa} · <b>{vi}</b>
              </p>
              <p className="mt-1 font-semibold text-brand-600 dark:text-brand-300">{m}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const t = useT()
  const qa = [
    [
      t('VocaStudy có miễn phí không?', 'Is VocaStudy free?'),
      t(
        'Có. Mọi bài học, trò chơi và giọng đọc đều miễn phí.',
        'Yes. Every lesson, game and recording is free.'
      ),
    ],
    [
      t('Có cần tạo tài khoản không?', 'Do I need an account?'),
      t(
        'Không bắt buộc. Bạn học ngay được, tiến độ lưu trên máy. Tài khoản giúp đồng bộ giữa các thiết bị và mở trợ lý AI — tài khoản đang trong giai đoạn beta: đăng ký để vào danh sách chờ.',
        'No. You can start right away and your progress is saved on your device. An account syncs it across devices and unlocks the AI tutor — accounts are in beta: sign up to join the waitlist.'
      ),
    ],
    [
      t('Mỗi ngày cần học bao lâu?', 'How much time does it take?'),
      t(
        'Chỉ vài phút. Mục tiêu nhỏ mặc định là 10 câu trả lời — khoảng 3–5 phút.',
        'A few minutes. The default small goal is 10 answers — about 3–5 minutes.'
      ),
    ],
    [
      t(
        'Mình bắt đầu từ con số 0, có học được không?',
        'I am a complete beginner — is this for me?'
      ),
      t(
        'Được. Tiếng Anh bắt đầu từ 1.000 từ cơ bản nhất, có cách đọc bằng chữ Việt. Tiếng Hàn có bài bảng chữ Hangul, tiếng Trung có bài pinyin và thanh điệu để bắt đầu. Mọi lời giải thích đều bằng tiếng Việt dễ hiểu.',
        'Yes. English starts with the 1,000 most basic words, with Vietnamese respellings. Korean has a Hangul alphabet lesson and Chinese a pinyin & tones lesson to start with. Every explanation is in plain Vietnamese.'
      ),
    ],
    [
      t('Dùng trên điện thoại được không?', 'Does it work on my phone?'),
      t(
        'Được, và có thể cài lên màn hình chính như một ứng dụng. Bài đã mở vẫn học được khi mất mạng.',
        'Yes, and you can add it to your home screen like an app. Lessons you have opened work offline.'
      ),
    ],
    [
      t('Dữ liệu của mình có an toàn không?', 'Is my data safe?'),
      t(
        'Chúng tôi chỉ lưu những gì cần để bạn học, không bán dữ liệu và không chạy quảng cáo. Xem Chính sách bảo mật để biết chi tiết.',
        'We only keep what is needed for your learning, never sell data and run no ads. See the Privacy policy for details.'
      ),
    ],
  ]
  return (
    <section id="faq" className="scroll-mt-20 px-4 py-20">
      <SectionTitle
        kicker={t('Hỏi đáp', 'FAQ')}
        title={t('Câu hỏi thường gặp', 'Frequently asked questions')}
      />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {qa.map(([q, a]) => (
          <details key={q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold">
              {q}
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400 transition group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-slate-600 dark:text-slate-300">{a}</p>
          </details>
        ))}
        <p className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('Còn câu hỏi khác?', 'Another question?')}{' '}
          <Link to="/privacy" className="font-semibold text-brand-600 dark:text-brand-300">
            {t('Chính sách bảo mật', 'Privacy policy')}
          </Link>{' '}
          ·{' '}
          <a
            href="mailto:contact@vocastudy.app"
            className="font-semibold text-brand-600 dark:text-brand-300"
          >
            contact@vocastudy.app
          </a>
        </p>
      </div>
    </section>
  )
}
