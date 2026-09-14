import { Page } from '@playwright/test'

export function createMockApi(page: Page) {
  return {
    async mockCreditAnalysis(score: number, status: string = 'Done') {
      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status, score }),
        })
      })
    },
  }
}
