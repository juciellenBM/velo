import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  const elements = {
    heading: page.getByRole('heading', { name: 'Finalizar Pedido' }),
    summaryTotalPrice: page.getByTestId('summary-total-price'),
    submitButton: page.getByTestId('checkout-submit'),
  }

  return {
    elements,

    async validarPaginaCarregada() {
      await expect(page).toHaveURL(/\/order/)
      await expect(elements.heading).toBeVisible()
    },

    async validarPrecoTotal(valorEsperado: string) {
      await expect(elements.summaryTotalPrice).toContainText(valorEsperado)
    },

    async validarOpcionalNoResumo(nomeOpcional: string, valorEsperado?: string) {
      const item = page.locator('li').filter({ hasText: nomeOpcional })
      await expect(item).toBeVisible()
      if (valorEsperado) {
        await expect(item).toContainText(valorEsperado)
      }
    },
  }
}
