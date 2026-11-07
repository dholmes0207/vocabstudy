import { expect, test, type Locator, type Page } from '@playwright/test'

// "Luyện thi TOEIC" and "Luyện thi HSK" in a real browser on the production
// build: each mini test runs through every part to its estimated score, and the
// TOEIC practice still works offline once the app has been visited.

/** Pick a language on the landing page, as a first-time visitor does. */
async function choose(page: Page, language: RegExp) {
  await page.goto('/')
  await page.getByRole('link', { name: language }).first().click()
  await expect(page).toHaveURL(/\/home/)
}

/**
 * Answer whatever is on screen until `done` shows: the first option still
 * open, or the first tile of a sentence to build, then on to the next step.
 * The answers are not checked here (the unit tests do); returns how many
 * options were picked, so a test can tell the questions really came.
 */
async function answerUntil(page: Page, done: Locator): Promise<number> {
  let picked = 0
  for (let turn = 0; turn < 300; turn++) {
    if (await done.isVisible()) return picked
    const option = page
      .locator('main button[class*="rounded-xl"][class*="border-2"]:enabled')
      .first()
    if (await option.isVisible()) {
      await option.click()
      picked++
    } else {
      // A sentence to build: tap the pool tiles in turn until one is placed.
      const tile = page.locator('main [lang="zh"] button:enabled').first()
      if (await tile.isVisible()) await tile.click()
    }
    const next = page.getByRole('button', { name: /^(Next|See results|Continue)/ }).first()
    if (await next.isVisible()) await next.click()
  }
  throw new Error('never reached the end of the test')
}

test('the TOEIC mini test runs through all seven parts to a score range', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/toeic')
  await page.getByRole('button', { name: 'Take the mini test' }).click()
  await page.getByRole('button', { name: 'Start' }).click()
  const picked = await answerUntil(page, page.getByRole('heading', { name: 'Mini test results' }))
  expect(picked).toBe(26)
  await expect(page.getByText(/^About \d+–\d+ points/)).toHaveCount(2)
  await expect(page.getByText(/Listening: \d+\/13 right/)).toBeVisible()
})

test('the HSK 1 mini test runs through listening and reading to an estimate', async ({ page }) => {
  await choose(page, /English/)
  // Opened while learning English, the page offers to switch, as a learner sees it.
  await page.goto('/hsk')
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await page.getByRole('button', { name: 'Take the mini test' }).click()
  const picked = await answerUntil(page, page.getByText(/^Estimate: about \d+\/200/))
  expect(picked).toBe(20)
})

test('TOEIC practice opens with no network once the app has been visited', async ({
  page,
  context,
}) => {
  await choose(page, /English/)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.goto('/toeic')
  await page.getByRole('button', { name: /Practise Part 7/ }).click()
  await expect(
    page
      .locator('main button')
      .filter({ hasText: /^\s*\(A\)/ })
      .first()
  ).toBeVisible()
})
