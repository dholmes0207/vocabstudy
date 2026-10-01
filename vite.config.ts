import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
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

// Relative base ('./') so the built site works whether hosted at a domain root
// (Netlify/Vercel) or a sub-path (GitHub Pages project site).
export default defineConfig({
  base: './',
  plugins: [react(), minifyPacks()],
  build: {
    // The service worker precaches every emitted chunk at install so the app
    // boots offline; this manifest is the only list that stays correct as
    // code-split routes come and go. Named without a leading dot because hosts
    // (Cloudflare Pages among them) can skip dot-directories.
    manifest: 'asset-manifest.json',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
