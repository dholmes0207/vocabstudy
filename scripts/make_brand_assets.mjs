#!/usr/bin/env node
// Draws the VocaStudy brand files from one geometry (the same as
// src/components/Logo.tsx): favicon.svg, the PWA/iOS icons and the 1200×630
// link-preview image. Re-run after changing the mark.
//
// Usage (the renderer is not a project dependency):
//   npm i --no-save @resvg/resvg-js && node scripts/make_brand_assets.mjs
import { writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const BLUE = '#337dff'
const VIOLET = '#7c3aed'
const SPARK = '#fde68a'

/** The mark's inner shapes on a 64-unit grid (bubble, V-tick, spark). */
const inner = (id) => `
  <path d="M17 15h30a7 7 0 0 1 7 7v15a7 7 0 0 1-7 7H31l-10 8.5V44h-4a7 7 0 0 1-7-7V22a7 7 0 0 1 7-7z" fill="#fff"/>
  <path d="M22.5 23.5 32 36l9.5-12.5" fill="none" stroke="url(#${id})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M51.5 4.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" fill="${SPARK}"/>`

const grad = (id) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>`

/** Rounded mark with a transparent corner (favicon, "any" icons). */
const roundedMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${grad('g')}</defs><rect width="64" height="64" rx="16" fill="url(#g)"/>${inner('g')}</svg>`

/** Full-bleed square with the shapes scaled into the safe zone (maskable, iOS). */
const fullBleed = (scale) => {
  const off = (64 - 64 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${grad('g')}</defs><rect width="64" height="64" fill="url(#g)"/><g transform="translate(${off} ${off}) scale(${scale})">${inner('g')}</g></svg>`
}

function png(svg, size, file) {
  const out = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans' },
  })
    .render()
    .asPng()
  writeFileSync(file, out)
  console.log(`${file} (${size}px, ${out.length} bytes)`)
}

writeFileSync('public/favicon.svg', roundedMark + '\n')
console.log('public/favicon.svg')
png(roundedMark, 192, 'public/icons/icon-192.png')
png(roundedMark, 512, 'public/icons/icon-512.png')
png(fullBleed(0.78), 512, 'public/icons/maskable-512.png')
png(fullBleed(0.86), 180, 'public/icons/apple-touch-icon.png')

// Link preview (Zalo, Messenger, Facebook, X): night sky, mark, name, promise.
const stars = Array.from({ length: 70 }, (_, i) => {
  const x = (i * 157.3) % 1200
  const y = (i * 89.7 + (i % 7) * 31) % 630
  const r = 0.6 + ((i * 37) % 10) / 8
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(0.25 + ((i * 13) % 10) / 16).toFixed(2)}"/>`
}).join('')

const chipWidth = (label) => label.length * 15 + 40

/** Pills laid out left to right from x = 82, 26 px apart. */
const chips = (labels) => {
  let x = 82
  return labels
    .map((label) => {
      const g = `<g transform="translate(${x} 470)"><rect width="${chipWidth(label)}" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.25"/><text x="20" y="34" font-family="Noto Sans" font-weight="600" font-size="24" fill="#e0e7ff">${label}</text></g>`
      x += chipWidth(label) + 26
      return g
    })
    .join('')
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#020617"/><stop offset="0.55" stop-color="#1e1b4b"/><stop offset="1" stop-color="#312e81"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.6"><stop offset="0" stop-color="#7c3aed" stop-opacity="0.55"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <linearGradient id="word" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8ec4ff"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient>
    ${grad('m')}
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${stars}
  <g transform="translate(80 92) scale(2.1)"><rect width="64" height="64" rx="16" fill="url(#m)"/>${inner('m')}</g>
  <text x="240" y="178" font-family="Noto Sans" font-weight="900" font-size="88" fill="#ffffff">Voca<tspan fill="url(#word)">Study</tspan></text>
  <text x="82" y="318" font-family="Noto Sans" font-weight="800" font-size="56" fill="#ffffff">Speak a new language,</text>
  <text x="82" y="386" font-family="Noto Sans" font-weight="800" font-size="56" fill="url(#word)">with confidence, every day.</text>
  <text x="82" y="438" font-family="Noto Sans" font-weight="600" font-size="28" fill="#c7d2fe">Tự tin nói ngoại ngữ — mỗi ngày một chút.</text>
  ${chips(['English', 'Korean', 'Chinese', '4,700+ words', 'Free'])}
  <text x="1118" y="590" text-anchor="end" font-family="Noto Sans" font-weight="700" font-size="26" fill="#a5b4fc">vocastudy.app</text>
</svg>`

png(og, 1200, 'public/og-image.png')
