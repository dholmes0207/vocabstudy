import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Relative base ('./') so the built site works whether hosted at a domain root
// (Netlify/Vercel) or a sub-path (GitHub Pages project site).
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // In dev, proxy API calls to the Express backend so the browser sees a
    // single origin (HttpOnly auth cookies just work).
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
