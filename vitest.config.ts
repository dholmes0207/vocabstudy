import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Most tests cover pure logic and run in Node. Component tests opt into a DOM
// per file with a `@vitest-environment jsdom` docblock, so the fast majority
// never pays for jsdom startup.
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
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
