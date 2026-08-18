import { test, expect } from '@playwright/test'

test.describe('Configurador de Veículo', () => {
  test('CT01 - deve navegar da landing page para o configurador ao clicar no CTA principal', async ({ page }) => {
    // Arrange
    await page.goto('/')
    await expect(page.getByTestId('landing-page')).toBeVisible()

    // Act
    const ctaButton = page.getByRole('link', { name: /configure agora/i })
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()

    // Assert
    await expect(page).toHaveURL('/configure')
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
    await expect(page.getByTestId('car-exterior-image')).toBeVisible()
    await expect(page.getByTestId('color-option-glacier-blue')).toBeVisible()
    await expect(page.getByTestId('wheel-option-aero')).toBeVisible()
    await expect(page.getByTestId('total-price')).toHaveText('R$ 40.000,00')
  })
})
