import { defineConfig, devices } from '@playwright/test'

// End-to-end tests of the main learning path on the production build
// (docs/design/e2e.md). Run with `npm run e2e` after `npm run build`.

export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  // One flow at a time: each test owns its browser context, but they all share
  // the same preview server.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    cwd: '..',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
