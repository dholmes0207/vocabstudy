/** "13 October 2026" / "13 tháng 10, 2026" from an ISO day, without time-zone drift. */
export function formatLongDate(iso: string, lang: 'vi' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
