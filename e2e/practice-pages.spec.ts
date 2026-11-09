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

test('English phrasal verbs, by their particle', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/phrasal-verbs')
  await page.getByRole('button', { name: 'Practise "off"' }).click()
  await page.getByRole('button', { name: 'off', exact: true }).click()
  await expect(page.getByText('Right!')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
})

test('English easily confused words share the look-alikes page', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/confusables')
  await expect(page.getByRole('heading', { name: /Easily confused words/ })).toBeVisible()
  await page.getByRole('button', { name: 'Practise this group' }).first().click()
  await page.getByRole('button', { name: 'make', exact: true }).click()
  await expect(page.getByText(/^(Right!|Not quite\.)$/)).toBeVisible()
})

test('English idioms: what the words say and what they mean', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/idioms')
  await expect(page.getByText('Word for word: một miếng bánh')).toBeVisible()
  await page.getByRole('button', { name: /Try 10 questions/ }).click()
  await page.getByText('What does this idiom mean?').waitFor()
  await page.locator('.card button').first().click()
  await expect(page.getByText(/^(Right!|Not quite\.)$/)).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
})

test('TOEIC Speaking times each answer', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/toeic-speaking')
  await page
    .getByRole('button', { name: /^Start/ })
    .nth(1)
    .click()
  await expect(page.getByText(/15 seconds/)).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
})

test('TOEIC Writing: reply to an email', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/toeic-writing')
  await page
    .getByRole('button', { name: /Write a reply/ })
    .first()
    .click()
  await page.getByLabel('Your reply').fill('Dear Ms. Park, will the pool be free?')
  await expect(page.getByText(/Asks at least 2 questions \(1\)/)).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
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
  // The chart's hidden data table must not widen the page either (it did for
  // the six-month chart before sr-only moved to a wrapper).
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)
  // Every chart offers overview options starting "Overall, …"; pick one.
  await page
    .getByRole('button', { name: /^Overall,/ })
    .first()
    .click()
  await page.getByRole('button', { name: /Step 2: describe the data/ }).click()
  await expect(page.getByRole('list', { name: 'Word box' })).toBeVisible()
})

test('Chinese look-alike characters, idioms, slang and sentence patterns', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/confusables?lang=zh')
  await page.getByRole('button', { name: 'Practise this group' }).first().click()
  await page.getByRole('button', { name: '在 zài' }).click()
  await expect(page.getByText(/^(Right!|Not quite\.)$/)).toBeVisible()

  await page.goto('/chengyu?lang=zh')
  await expect(page.getByText('bán tín bán nghi', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Try 10 questions/ }).click()
  await page.getByText('What does this idiom mean?').waitFor()
  await page.locator('.card button').first().click()
  await expect(page.getByText(/^(Right!|Not quite\.)$/)).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)

  await page.goto('/slang?lang=zh')
  await expect(page.getByText('nội quyển', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Try 10 questions/ }).click()
  await page.getByText('What does this word mean?').waitFor()

  await page.goto('/han-viet-traps?lang=zh')
  await page.getByRole('button', { name: /Try 10 questions/ }).click()
  await page.locator('.card button').first().click()
  await expect(page.getByText(/(dodged the trap|Caught by the trap|Not quite)/)).toBeVisible()

  await page.goto('/pinyin?lang=zh')
  await page.getByRole('button', { name: /Tone changes/ }).click()
  await expect(page.getByText('How is this word said aloud?')).toBeVisible()

  await page.goto('/hskk?lang=zh')
  await page
    .getByRole('button', { name: /^Practise/ })
    .first()
    .click()
  await expect(page.getByRole('button', { name: /Show the text/ })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0)

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
