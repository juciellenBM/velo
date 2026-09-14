import { Page, expect } from '@playwright/test'

export function createHeroActions(page: Page) {
  const ctaPrimary = page.getByTestId('hero-cta-primary')

  return {
    elements: {
      ctaPrimary,
    },

    async open() {
      await page.goto('/')
      await expect(ctaPrimary).toBeVisible()
    },

    async startConfiguration() {
      await ctaPrimary.click()
    },
  }
}
