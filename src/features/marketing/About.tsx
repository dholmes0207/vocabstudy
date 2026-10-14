import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Lock, Mail, Sprout, TrendingUp } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { CONTACT_EMAIL } from '@/lib/site'
import { useT } from '@/lib/i18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// "Về chúng tôi": why VocaStudy exists and what it stands for. Facts only —
// no invented team, funding or user numbers.

export default function About() {
  const t = useT()
  useDocumentTitle(`${t('Về chúng tôi', 'About us')} · VocaStudy`)

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
          {t('Giúp người Việt', 'Helping Vietnamese learners')}{' '}
          <span className="text-aurora">{t('dám nói tiếng Anh', 'speak English')}</span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
          {t(
            'VocaStudy bắt đầu từ một câu hỏi: vì sao rất nhiều người học tiếng Anh nhiều năm mà vẫn ngại nói? Thường không phải vì thiếu cố gắng, mà vì cách học dễ nản — học nhiều quên nhanh, sợ sai, và không biết bắt đầu lại từ đâu.',
            'VocaStudy started with a question: why do so many people study English for years and still feel unable to speak? Usually not for lack of effort, but because the usual way of learning is discouraging — you learn a lot, forget it fast, fear mistakes, and don’t know where to restart.'
          )}
        </p>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          {t(
            'Vì vậy chúng tôi làm một ứng dụng thật nhẹ nhàng: mỗi ngày vài phút, có giọng đọc AI chuẩn Mỹ, cách đọc bằng chữ Việt, mẫu câu dùng được ngay — và luôn động viên thay vì chê trách.',
            'So we built something gentle: a few minutes a day, natural AI voices, Vietnamese-letter respellings, phrases you can use right away — and encouragement instead of blame.'
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
