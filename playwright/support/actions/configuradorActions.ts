import { Page, expect } from '@playwright/test'

export type CorVeiculo = 'Glacier Blue' | 'Midnight Black' | 'Lunar White'
export type RodaVeiculo = 'Aero Wheels' | 'Sport Wheels'

export function createConfiguradorActions(page: Page) {
  const elements = {
    title: page.getByRole('heading', { name: 'Velô Sprint' }),
    carImage: page.getByTestId('car-exterior-image'),
    totalPrice: page.getByTestId('total-price'),
    colorGlacierBlue: page.getByRole('button', { name: 'Glacier Blue' }),
    colorMidnightBlack: page.getByRole('button', { name: 'Midnight Black' }),
    colorLunarWhite: page.getByRole('button', { name: 'Lunar White' }),
    wheelAero: page.getByRole('button', { name: /Aero Wheels/i }),
    wheelSport: page.getByRole('button', { name: /Sport Wheels/i }),
  }

  return {
    elements,

    async open() {
      await page.goto('/configure')
      await expect(elements.title).toBeVisible()
      await expect(elements.carImage).toBeVisible()
    },

    async selecionarCor(cor: CorVeiculo) {
      await page.getByRole('button', { name: cor }).click()
    },

    async selecionarRoda(roda: RodaVeiculo) {
      const rodaButton = roda === 'Sport Wheels' ? elements.wheelSport : elements.wheelAero
      await rodaButton.click()
    },

    async validarPreco(valorEsperado: string) {
      await expect(elements.totalPrice).toContainText(valorEsperado)
    },

    async validarPreview(corSlug: string, rodaSlug: string) {
      await expect(elements.carImage).toHaveAttribute(
        'alt',
        new RegExp(`${corSlug}.*${rodaSlug}`, 'i')
      )
      await expect(elements.carImage).toHaveAttribute(
        'src',
        new RegExp(`${corSlug}-${rodaSlug}-wheels\\.png`)
      )
    },
  }
}
