import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')

  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-lastname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-document'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }

  return {

    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerlData(data: {
      name: string
      lastname: string
      email: string
      phone: string
      document: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-surname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-cpf').fill(data.document)
    },

    async fillCustomerData(data: {
      name: string
      lastname?: string
      email: string
      phone: string
      document: string
    }) {
      const [firstName, ...rest] = data.name.includes(' ') && !data.lastname
        ? data.name.split(' ')
        : [data.name, data.lastname || '']
      const surname = data.lastname || rest.join(' ')

      await page.getByTestId('checkout-name').fill(firstName)
      await page.getByTestId('checkout-surname').fill(surname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-cpf').fill(data.document)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethod(method: 'avista' | 'financiamento' = 'avista') {
      await page.getByTestId(`payment-${method}`).click()
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async validateSuccess(expected?: {
      name?: string
      email?: string
      store?: string
      price?: string
    }) {
      await expect(page.getByTestId('success-status')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('success-status')).toHaveText('Pedido Aprovado!')
      await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]+$/)

      if (expected?.name) {
        await expect(page.getByText(expected.name)).toBeVisible()
      }
      if (expected?.email) {
        await expect(page.getByText(expected.email)).toBeVisible()
      }
      if (expected?.store) {
        await expect(page.getByText(expected.store)).toBeVisible()
      }
      if (expected?.price) {
        await expect(page.getByText(expected.price)).toBeVisible()
      }
    },

    async getGeneratedOrderNumber(): Promise<string> {
      const orderIdElement = page.getByTestId('order-id')
      await expect(orderIdElement).toBeVisible()
      return (await orderIdElement.innerText()).trim()
    },
  }
}