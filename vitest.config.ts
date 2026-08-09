import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Tests cover the pure logic in src/lib only — no DOM, so no jsdom needed.
export default defineConfig({
  resolve: {
    alias: {
      // `fileURLToPath` rather than `__dirname`: this file is ESM and Vite's
      // native config loader does not shim CommonJS globals.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
