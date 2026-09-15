import { test, expect } from '../support/fixtures'

test('webapp deve estar online', async ({ page }) => {
  await page.goto('https://velo-juciellenbm.vercel.app')

  await expect(page).toHaveTitle(/Velô by Papito/)
})
