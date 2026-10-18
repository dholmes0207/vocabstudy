import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import type { Config as TailwindConfig } from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import { readdir, readFile, writeFile } from 'node:fs/promises'

// public/data/*.json stays pretty-printed in the repo (readable diffs for the
// word scripts); the copy we ship is minified. A third smaller to download and,
// more importantly on phones, to JSON.parse before the app can start.
function minifyPacks(): Plugin {
  let dataDir = ''
  return {
    name: 'minify-language-packs',
    apply: 'build',
    configResolved(config) {
      dataDir = path.resolve(config.root, config.build.outDir, 'data')
    },
    async closeBundle() {
      let files: string[]
      try {
        files = await readdir(dataDir)
      } catch {
        return
      }
      for (const name of files.filter((f) => f.endsWith('.json'))) {
        const file = path.join(dataDir, name)
        await writeFile(file, JSON.stringify(JSON.parse(await readFile(file, 'utf8'))))
      }
    },
  }
}

// Tailwind's config lives here with the rest of the build setup, handed straight
// to its PostCSS plugin. Content paths resolve from the repo root.
const tailwind: TailwindConfig = {
  darkMode: 'class',
  // Touch screens keep a :hover state after a tap, leaving cards "lifted" as if
  // selected. Only apply hover styles where a real pointer can hover.
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a2ff',
          500: '#337dff',
          600: '#1b5ef5',
          700: '#1449e1',
          800: '#173db6',
          900: '#19388f',
          950: '#142457',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        'flip-in': {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        'chat-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        // 'backwards', not 'both': a transform left on a page wrapper after the
        // animation would make it the containing block for every position:fixed
        // child (popovers, sheets) and pin them to the page instead of the screen.
        'fade-in': 'fade-in 0.35s ease-out backwards',
        pop: 'pop 0.25s ease-out',
        'flip-in': 'flip-in 0.3s ease-out both',
        'chat-in': 'chat-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}

// Root base: the app uses clean paths (vocastudy.app/phrases/food), so every
// asset must resolve from the domain root, not from the current page's folder.
// Cloudflare Pages serves index.html for unknown paths (no top-level 404.html).
export default defineConfig({
  base: '/',
  plugins: [react(), minifyPacks()],
  // Which build an error report came from: Cloudflare Pages sets the commit.
  define: {
    __BUILD_ID__: JSON.stringify((process.env.CF_PAGES_COMMIT_SHA ?? 'local').slice(0, 7)),
  },
  build: {
    // The service worker precaches every emitted chunk at install so the app
    // boots offline; this manifest is the only list that stays correct as
    // code-split routes come and go. Named without a leading dot because hosts
    // (Cloudflare Pages among them) can skip dot-directories.
    manifest: 'asset-manifest.json',
  },
  css: {
    postcss: {
      plugins: [tailwindcss(tailwind), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Most tests cover pure logic and run in Node. Component tests opt into a DOM
  // per file with a `@vitest-environment jsdom` docblock, so the fast majority
  // never pays for jsdom startup.
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
