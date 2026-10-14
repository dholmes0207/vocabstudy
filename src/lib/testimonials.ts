// Parsing what /api/testimonials returns (docs/design/feedback.md).

export interface Testimonial {
  name: string
  message: string
  rating: number | null
}

/** The list from /api/testimonials, or [] for anything unexpected. */
export function parseTestimonials(json: unknown): Testimonial[] {
  const list = (json as { testimonials?: unknown } | null)?.testimonials
  if (!Array.isArray(list)) return []
  return list
    .filter(
      (x): x is Testimonial =>
        !!x &&
        typeof (x as Testimonial).name === 'string' &&
        (x as Testimonial).name.trim() !== '' &&
        typeof (x as Testimonial).message === 'string'
    )
    .slice(0, 6)
}
