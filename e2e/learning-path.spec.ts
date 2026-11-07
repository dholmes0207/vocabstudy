import { expect, test, type Page } from '@playwright/test'

// "Lộ trình theo cấp" in a real browser on the production build: a new learner
// lands on level 1 with its next step one tap away, can play a level challenge
// to the end, and the Chinese pack has its own path.

async function choose(page: Page, language: RegExp) {
  await page.goto('/')
  await page.getByRole('link', { name: language }).first().click()
  await expect(page).toHaveURL(/\/home/)
}

test('a new learner starts the path on level 1 and plays its challenge to the end', async ({
  page,
}) => {
  await choose(page, /English/)
  // The way in from the home screen.
  await page.getByRole('link', { name: /Level path · Level 1\/6/ }).click()
  await expect(page).toHaveURL(/\/path/)
  await expect(page.getByRole('link', { name: /Continue\s*Words 1–150/ })).toBeVisible()
  await expect(page.getByText(/^Opens when level \d reaches 80%$/)).toHaveCount(5)

  await page.getByRole('button', { name: /Level challenge: 12 questions/ }).click()
  await page.getByRole('button', { name: /^Start/ }).click()
  // Answer the first option every time: the test ends, won or lost, with a result.
  const result = page.getByRole('heading', {
    name: /You beat level 1!|Out of hearts!|Not this time/,
  })
  for (let i = 0; i < 12 && !(await result.isVisible()); i++) {
    await page.locator('main button.rounded-xl.border-2:enabled').first().click()
    await page.getByRole('button', { name: /^(Next|See the result)/ }).click()
  }
  await expect(result).toBeVisible()
  await page.getByRole('button', { name: 'Back to the path' }).click()
  await expect(page.getByRole('heading', { name: /Level path/ })).toBeVisible()
})

test('Chinese has its own path, from pinyin to HSK 3', async ({ page }) => {
  await choose(page, /English/)
  await page.goto('/path?lang=zh')
  await expect(page.getByRole('link', { name: /Continue\s*Pinyin & tones/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Level 4: HSK 3/ })).toBeVisible()
})
