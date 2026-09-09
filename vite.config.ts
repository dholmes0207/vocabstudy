import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Relative base ('./') so the built site works whether hosted at a domain root
// (Netlify/Vercel) or a sub-path (GitHub Pages project site).
export default defineConfig({
  base: './',
  plugins: [react()],
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
