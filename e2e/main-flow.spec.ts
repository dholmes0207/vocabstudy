import { expect, test, type Page } from '@playwright/test'

// The path every learner takes, in a real browser on the production build:
// pick a language, learn the first five words, come back days later to review
// them, keep the progress across reloads, and keep working offline.

interface PackWord {
  word: string
  meaning: string
  exampleEn: string
}

const DAY = 24 * 60 * 60 * 1000

/** headword → its word, from the pack the app itself loads. */
async function meanings(page: Page): Promise<Map<string, PackWord>> {
  const pack = (await (await page.request.get('/data/en.json')).json()) as { words: PackWord[] }
  return new Map(pack.words.map((w) => [w.word, w]))
}

/** Whether the card shows this word's example, with a gap where the word goes. */
function gapFor(card: string, w: PackWord | undefined): boolean {
  if (!w) return false
  const pieces = w.exampleEn
    .split(new RegExp(`\\b${w.word.split('/')[0].trim()}\\w*`, 'i'))
    .map((p) => p.trim())
    .filter(Boolean)
  return pieces.length > 0 && pieces.every((p) => card.includes(p))
}

/** Pick English on the landing page, as a first-time visitor does. */
async function chooseEnglish(page: Page) {
  await page.goto('/')
  await page
    .getByRole('link', { name: /English/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/home/)
}

/** Meet the five words of the quick lesson; returns them in order. */
async function meetFiveWords(page: Page): Promise<string[]> {
  await page.goto('/learn?quick=1')
  const words: string[] = []
  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`${i + 1}/5`)).toBeVisible()
    words.push((await page.locator('main h2').first().innerText()).trim())
    await page.getByRole('button', { name: /^Next$|^Practise these 5 words/ }).click()
  }
  return words
}

/**
 * Answer recall questions right until `done` shows: "pick the meaning" (the
 * meaning of the word on screen, or of the word heard), "pick the word for the
 * gap" (one of `words`), or "type it" (the word on screen).
 */
async function answerUntil(
  page: Page,
  words: string[],
  meaning: Map<string, PackWord>,
  done: RegExp
) {
  for (let turn = 0; turn < 60; turn++) {
    if (await page.getByRole('heading', { name: done }).isVisible()) return
    // The question card follows the session's Exit button; the page header
    // above it can mention words too ("the older the word…").
    const text = await page.locator('main').innerText()
    const card = text.slice(text.lastIndexOf('Exit'))
    const shown = words.find((w) => new RegExp(`\\b${w}\\b`).test(card)) ?? words[0]
    const options = page.locator('main .grid button')
    if (await options.count()) {
      const labels = (await options.allInnerTexts()).map((l) => l.trim())
      // Another lesson word can be among the options, so pick the one the card
      // asks for: its example has the gap, else its meaning is shown.
      const lesson = (l: string) => words.includes(l)
      let pick = labels.findIndex((l) => lesson(l) && gapFor(card, meaning.get(l)))
      if (pick < 0)
        pick = labels.findIndex((l) => lesson(l) && card.includes(meaning.get(l)?.meaning ?? '\0'))
      if (pick < 0) pick = labels.findIndex(lesson)
      if (pick < 0) pick = labels.indexOf(meaning.get(shown)?.meaning ?? '')
      // A listening question shows no word: the right option is the one that
      // means one of the lesson's words.
      if (pick < 0) pick = labels.findIndex((l) => words.some((w) => meaning.get(w)?.meaning === l))
      expect(pick, `no right answer among ${labels.join(' / ')}`).toBeGreaterThanOrEqual(0)
      await options.nth(pick).click()
    } else {
      const input = page.getByRole('textbox', { name: 'Your answer' })
      await input.fill(shown)
      await input.press('Enter')
    }
    const next = page.getByRole('button', { name: /^(Next|Continue|See results)/ }).first()
    if (await next.isVisible()) await next.click()
  }
  throw new Error(`never reached "${done}"`)
}

test('a new learner learns five words, keeps them across a reload, and reviews them days later', async ({
  page,
  context,
}) => {
  const meaning = await meanings(page)
  await chooseEnglish(page)

  const words = await meetFiveWords(page)
  expect(new Set(words).size).toBe(5)
  await answerUntil(page, words, meaning, /Lesson done!/)

  // Progress lives in the browser: after a reload the next lesson moves on.
  await page.reload()
  await page.goto('/learn?quick=1')
  const next = (await page.locator('main h2').first().innerText()).trim()
  expect(words).not.toContain(next)

  // Nothing is due yet today…
  await page.goto('/review')
  await expect(page.getByRole('heading', { name: 'Nothing to review today!' })).toBeVisible()

  // …but three days on, the five words come back.
  await context.clock.setFixedTime(Date.now() + 3 * DAY)
  await page.goto('/review')
  await expect(page.getByText('5 words due')).toBeVisible()
  await answerUntil(page, words, meaning, /Reviews done for today!/)
})

test('the app opens and a lesson starts with no network once it has been visited', async ({
  page,
  context,
}) => {
  await chooseEnglish(page)
  // The service worker installs on the first visit and precaches the app.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.goto('/home')
  await expect(page.getByRole('navigation').first()).toBeVisible()
  await page.goto('/learn?quick=1')
  await expect(page.getByText('1/5')).toBeVisible()
})

test('switching to Korean brings its own pages', async ({ page }) => {
  await chooseEnglish(page)
  await page.goto('/home?lang=ko')
  await expect(page.getByRole('link', { name: /Hangul/ }).first()).toBeVisible()
  await page.goto('/hangul')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hangul')
})
