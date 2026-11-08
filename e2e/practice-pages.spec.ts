import { expect, test, type Page } from '@playwright/test'

// The practice screens added with the level paths, on the production build:
// each one opens, runs a round and lands on its result (docs/design/e2e.md).

async function choose(page: Page, language: RegExp) {
  await page.goto('/')
  await page.getByRole('link', { name: language }).first().click()
  await expect(page).toHaveURL(/\/home/)
}

test('True or false? runs against the clock and keeps a score', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/games/blitz')
  await page.getByRole('button', { name: 'Go!' }).click()
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: /^Right$/ }).click()
  await expect(page.getByTitle('Score')).toBeVisible()
  await expect(page.getByTitle('Time')).toHaveText(/⏱ \d+s/)
})

test('a role-play scene reads the other side and waits for mine', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/roleplay')
  await expect(page.getByText('TOEIC').first()).toBeVisible()
  await page.getByRole('button', { name: /Ordering a coffee/ }).click()
  // The barista speaks first; then it is my turn.
  await expect(page.getByText('Hi there! What can I get you?')).toBeVisible()
  await expect(page.getByText('Your turn')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('“Cho tôi một ly latte nhé.”')).toBeVisible()
})

test('IELTS Task 1 draws the chart and checks the overview', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/ielts')
  // The essay prompts are cut with an ellipsis: they must not widen the page
  // past the phone (they once did, and mobile Chrome zoomed the page out).
  await expect(page.getByRole('button', { name: /Task 1: describe a chart/ })).toBeEnabled()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
  await page.getByRole('button', { name: /Task 1: describe a chart/ }).click()
  await expect(page.locator('figure svg[role="img"]')).toBeVisible()
  // Every chart offers overview options starting "Overall, …"; pick one.
  await page
    .getByRole('button', { name: /^Overall,/ })
    .first()
    .click()
  await page.getByRole('button', { name: /Step 2: describe the data/ }).click()
  await expect(page.getByRole('list', { name: 'Word box' })).toBeVisible()
})

test('Chinese look-alike characters and sentence patterns', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/confusables?lang=zh')
  await page.getByRole('button', { name: 'Practise this group' }).first().click()
  await page.getByRole('button', { name: '在 zài' }).click()
  await expect(page.getByText(/^(Right!|Not quite\.)$/)).toBeVisible()

  await page.goto('/patterns?lang=zh')
  await expect(page.getByText('Preposition phrase').first()).toBeVisible()
  await page.getByRole('button', { name: /Mixed round/ }).click()
  await expect(page.getByRole('list', { name: 'Sentence frame' })).toBeVisible()
})

test('Korean has its own path, from Hangul to TOPIK I', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/path?lang=ko')
  await expect(page.getByRole('link', { name: /Continue\s*The Hangul alphabet/ })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Level 3: Telling stories: past & future/ })
  ).toBeVisible()
})
