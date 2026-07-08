import { test, expect } from '@playwright/test'

import { LandingPage } from '../support/pages/LandingPage'

test(' a webapp deve estar online', async ({ page }) => {
  const landingPage = new LandingPage(page)

  await landingPage.abrir()

  await expect(page).toHaveTitle(/Velô by Papito/)
})
