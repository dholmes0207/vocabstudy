import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Automatic accessibility check of the main screens (task 2.8 in docs/PLAN.md,
// docs/design/e2e.md): axe-core against WCAG 2 A and AA, plus the WCAG 2.2
// touch-target rule, on a 360 px wide phone, the narrowest one in common use.
// Serious and critical findings fail the run; the list of what was found is in
// the message, so a failure says what to fix. The page must not scroll sideways.

const SCREENS = ['/', '/home', '/learn', '/review', '/practice', '/stats', '/settings']

test.use({ viewport: { width: 360, height: 740 } })

for (const path of SCREENS) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    // A first-time visitor picks English on the landing page, then opens the screen.
    await page.goto('/')
    await page
      .getByRole('link', { name: /English/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/home/)
    if (path !== '/home') await page.goto(path)
    await expect(page.locator('main, #root').first()).toBeVisible()
    // Content fades in; checked mid-fade, text looks paler than it is. Wait for
    // every finite animation to end (the sky's endless glow never does).
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity
        )
    )

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const serious = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`)
    expect(serious, `on ${path}`).toEqual([])
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0)
  })
}
