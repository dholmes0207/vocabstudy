import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Lock, Mail, Plus, Sprout, TrendingUp } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { CONTACT_EMAIL } from '@/lib/site'
import { useT } from '@/lib/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// "Về chúng tôi": what VocaStudy is — one place for Vietnamese speakers to learn
// many languages, of which English, Korean and Chinese are the ones shipped so
// far — and what it stands for. Facts only: no invented team, funding or user
// numbers, no named future languages. No counts either: they change with every
// content batch, and the landing page already ties its own to the data
// (landingClaims.test.ts).

export default function About() {
  const t = useT()
  useDocumentTitle(`${t('Về chúng tôi', 'About us')} · VocaStudy`)

  // One card per pack in public/data/index.json (About.test.tsx keeps them in step).
  const languages = [
    {
      code: 'en',
      flag: '🇬🇧',
      name: t('Tiếng Anh', 'English'),
      learn: t('Học tiếng Anh', 'Learn English'),
      desc: t(
        'Nhiều nội dung nhất: từ vựng từ cơ bản đến B1, mẫu câu theo tình huống, bài phát âm, ngữ pháp và truyện ngắn. Từ vựng có giọng đọc AI chuẩn Mỹ và cách đọc ghi bằng chữ Việt.',
        'The most content: words from beginner to B1, phrases for real situations, a pronunciation guide, grammar and short stories. Words come with natural American AI voices and Vietnamese-letter respellings.'
      ),
    },
    {
      code: 'ko',
      flag: '🇰🇷',
      name: t('Tiếng Hàn', 'Korean'),
      learn: t('Học tiếng Hàn', 'Learn Korean'),
      beta: true,
      desc: t(
        'Bắt đầu từ bảng chữ Hangul: nghe từng chữ, ghép thành khối, rồi tự kiểm tra. Sau đó là từ vựng sơ cấp có cách đọc kiểu Việt, ngữ pháp và truyện ngắn A1–A2.',
        'Start with the Hangul alphabet: hear each letter, build syllable blocks, then check yourself. Then beginner words with Vietnamese-style readings, grammar and A1–A2 short stories.'
      ),
    },
    {
      code: 'zh',
      flag: '🇨🇳',
      name: t('Tiếng Trung', 'Chinese'),
      learn: t('Học tiếng Trung', 'Learn Chinese'),
      beta: true,
      desc: t(
        'Người Việt có sẵn hai lợi thế: tiếng Việt cũng có thanh điệu, và rất nhiều từ có âm Hán Việt quen thuộc. Bắt đầu với pinyin và thanh điệu, rồi từ vựng đủ HSK 1, ngữ pháp và truyện ngắn có pinyin.',
        'Vietnamese speakers start with two advantages: Vietnamese has tones too, and many words have a familiar Sino-Vietnamese reading. Start with pinyin and tones, then all of HSK 1, grammar and short stories with pinyin.'
      ),
    },
  ]

  const values = [
    {
      icon: Sprout,
      title: t('Bước nhỏ, đều đặn', 'Small, steady steps'),
      desc: t(
        'Vài phút mỗi ngày hiệu quả hơn vài giờ mỗi tháng. Mọi thứ trong app được thiết kế cho những bước nhỏ.',
        'A few minutes a day beat a few hours a month. Everything in the app is built for small steps.'
      ),
    },
    {
      icon: Heart,
      title: t('Động viên, không chê trách', 'Encouragement, not blame'),
      desc: t(
        'Sai là một phần của nhớ. Lỡ một ngày cũng không mất chuỗi. Quay lại luôn được chào đón.',
        'Mistakes are part of remembering. Missing a day doesn’t break your streak. Coming back is always welcome.'
      ),
    },
    {
      icon: TrendingUp,
      title: t('Tiến bộ thật', 'Real progress'),
      desc: t(
        'Dựa trên cách trí nhớ hoạt động: tự nhớ lại và lặp lại ngắt quãng — không học vẹt.',
        'Built on how memory works: active recall and spaced repetition — not cramming.'
      ),
    },
    {
      icon: Lock,
      title: t('Tôn trọng quyền riêng tư', 'Respect for privacy'),
      desc: t(
        'Không quảng cáo, không bán dữ liệu, không theo dõi. Học được cả khi không có tài khoản.',
        'No ads, no selling data, no tracking. You can learn without an account at all.'
      ),
    },
  ]

  return (
    <div className="px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <LogoMark className="mx-auto h-16 w-16 drop-shadow-lg" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('Một nơi để người Việt', 'One place for Vietnamese speakers')}{' '}
          <span className="text-aurora">{t('học nhiều ngoại ngữ', 'to learn many languages')}</span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
          {t(
            'VocaStudy là nơi học ngoại ngữ dành cho người Việt. Dù bạn chọn ngôn ngữ nào, cách học vẫn vậy: mỗi ngày vài phút, nghĩa và cách đọc giải thích bằng tiếng Việt, ôn lại đúng lúc sắp quên.',
            'VocaStudy is a place for Vietnamese speakers to learn languages. Whichever language you pick, the way of learning stays the same: a few minutes a day, meanings and pronunciation explained in Vietnamese, reviews timed for just before you forget.'
          )}
        </p>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          {t(
            'Chúng tôi bắt đầu từ một câu hỏi: vì sao rất nhiều người học ngoại ngữ nhiều năm mà vẫn ngại nói? Thường không phải vì thiếu cố gắng, mà vì cách học dễ nản — học nhiều quên nhanh, sợ sai, và không biết bắt đầu lại từ đâu. Vì vậy VocaStudy nhẹ nhàng, và luôn động viên thay vì chê trách.',
            'We started with a question: why do so many people study a language for years and still feel unable to speak? Usually not for lack of effort, but because the usual way of learning is discouraging — you learn a lot, forget it fast, fear mistakes, and don’t know where to restart. So VocaStudy is gentle, and encourages instead of blaming.'
          )}
        </p>
      </section>

      <section className="mx-auto mt-14 max-w-5xl">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">
          {t('Một cách học, cho mọi ngôn ngữ', 'One way to learn, for every language')}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500 dark:text-slate-400">
          {t(
            'Thẻ từ ôn lại theo trí nhớ, bộ từ theo chủ đề, ngữ pháp, truyện ngắn, nghe – chép: ngôn ngữ nào cũng có. Mỗi ngôn ngữ có thêm phần riêng cho người Việt, như bảng chữ Hangul hay âm Hán Việt. Dưới đây là những ngôn ngữ đang có, và sẽ còn thêm.',
            'Flashcards reviewed on a memory schedule, topic decks, grammar, short stories, dictation: every language gets them. Each one adds its own part for Vietnamese speakers, like the Hangul alphabet or Sino-Vietnamese readings. Below are the languages available now, with more to come.'
          )}
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {languages.map((l) => (
            <li key={l.code} className="card flex flex-col p-6">
              <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                <span aria-hidden="true" className="text-2xl">
                  {l.flag}
                </span>
                {l.name}
                {l.beta && (
                  <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    beta
                  </span>
                )}
              </h3>
              <p className="mt-2 flex-1 text-slate-500 dark:text-slate-400">{l.desc}</p>
              <Link
                to={`/home?lang=${l.code}`}
                className="mt-4 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                {l.learn}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li className="flex flex-col rounded-2xl border-2 border-dashed border-slate-300 p-6 dark:border-white/15">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </span>
              {t('Ngôn ngữ tiếp theo', 'The next language')}
            </h3>
            <p className="mt-2 flex-1 text-slate-500 dark:text-slate-400">
              {t(
                'Ứng dụng được xây để thêm ngôn ngữ mới mà không phải làm lại từ đầu. Bạn muốn học ngôn ngữ nào tiếp theo? Hãy cho chúng tôi biết.',
                'The app is built so a new language can be added without starting over. Which language would you like next? Let us know.'
              )}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('Ngôn ngữ tiếp theo', 'Next language'))}`}
              className="mt-4 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t('Gợi ý một ngôn ngữ', 'Suggest a language')}
            </a>
          </li>
        </ul>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {t(
            'Tiếng Hàn và tiếng Trung đang ở bản beta: ít nội dung hơn tiếng Anh và đọc bằng giọng có sẵn của trình duyệt. Chúng tôi đang bổ sung dần.',
            'Korean and Chinese are in beta: less content than English, read aloud by your browser’s built-in voice. We are adding more over time.'
          )}
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md">
              <v.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold">{v.title}</h2>
            <p className="mt-1.5 text-slate-500 dark:text-slate-400">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="card mx-auto mt-14 max-w-3xl p-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">
          {t('Liên hệ với chúng tôi', 'Get in touch')}
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {t(
            'Góp ý, báo lỗi, hợp tác hay chỉ muốn chia sẻ hành trình học của bạn — chúng tôi đọc mọi email.',
            'Feedback, a bug, a partnership, or just your learning story — we read every email.'
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn-secondary h-11">
            <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
          </a>
          <Link to="/home" className="btn-primary h-11">
            {t('Bắt đầu học', 'Start learning')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
