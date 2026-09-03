import { Page, expect } from '@playwright/test'

export class ConfiguradorPage {
  constructor(private page: Page) {}

  get elements() {
    return {
      title: this.page.getByRole('heading', { name: 'Velô Sprint' }),
      carImage: this.page.getByTestId('car-exterior-image'),
      totalPrice: this.page.getByTestId('total-price'),
      colorGlacierBlue: this.page.getByRole('button', { name: 'Glacier Blue' }),
      colorMidnightBlack: this.page.getByRole('button', { name: 'Midnight Black' }),
      colorLunarWhite: this.page.getByRole('button', { name: 'Lunar White' }),
      wheelAero: this.page.getByRole('button', { name: /Aero Wheels/i }),
      wheelSport: this.page.getByRole('button', { name: /Sport Wheels/i }),
    }
  }

  async open() {
    await this.page.goto('/configure')
    await expect(this.elements.title).toBeVisible()
    await expect(this.elements.carImage).toBeVisible()
  }

  async selecionarCor(cor: 'Glacier Blue' | 'Midnight Black' | 'Lunar White') {
    await this.page.getByRole('button', { name: cor }).click()
  }

  async selecionarRoda(roda: 'Aero Wheels' | 'Sport Wheels') {
    const rodaButton = roda === 'Sport Wheels' ? this.elements.wheelSport : this.elements.wheelAero
    await rodaButton.click()
  }

  async validarPreco(valorEsperado: string) {
    await expect(this.elements.totalPrice).toContainText(valorEsperado)
  }

  async validarPreview(corSlug: string, rodaSlug: string) {
    await expect(this.elements.carImage).toHaveAttribute(
      'alt',
      new RegExp(`${corSlug}.*${rodaSlug}`, 'i')
    )
    await expect(this.elements.carImage).toHaveAttribute(
      'src',
      new RegExp(`${corSlug}-${rodaSlug}-wheels\\.png`)
    )
  }
}
