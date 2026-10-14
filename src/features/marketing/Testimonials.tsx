import { useEffect, useState } from 'react'
import { Quote, Star } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { parseTestimonials, type Testimonial } from '@/lib/testimonials'

// "What learners say" (docs/design/feedback.md): only real feedback whose author
// allowed quoting and an admin chose. Renders nothing until there is some —
// never placeholders, never made-up quotes.

export default function Testimonials() {
  const t = useT()
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    let alive = true
    fetch('/api/testimonials')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => alive && setItems(parseTestimonials(json)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (items.length === 0) return null
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-center text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
        {t('Người học nói gì', 'What learners say')}
      </p>
      <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight">
        {t('Từ chính những người đang học', 'From people learning with VocaStudy')}
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <li key={`${x.name}:${x.message.slice(0, 24)}`} className="card flex flex-col p-6">
            <Quote className="h-6 w-6 text-brand-400" aria-hidden="true" />
            <blockquote className="mt-3 flex-1 whitespace-pre-line text-slate-700 dark:text-slate-200">
              {x.message}
            </blockquote>
            <div className="mt-4 flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold">{x.name}</span>
              {x.rating ? (
                <span
                  className="flex text-amber-400"
                  aria-label={t(`${x.rating} trên 5 sao`, `${x.rating} out of 5 stars`)}
                >
                  {Array.from({ length: x.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
