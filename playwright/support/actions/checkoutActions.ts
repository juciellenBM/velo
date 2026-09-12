import { Page, expect } from '@playwright/test'

export type CustomerFormData = {
  name?: string
  surname?: string
  email?: string
  phone?: string
  cpf?: string
  store?: string
  terms?: boolean
}

export function createCheckoutActions(page: Page) {
  const elements = {
    heading: page.getByRole('heading', { name: 'Finalizar Pedido' }),
    summaryTotalPrice: page.getByTestId('summary-total-price'),
    nameInput: page.getByRole('textbox', { name: 'Nome', exact: true }),
    surnameInput: page.getByRole('textbox', { name: 'Sobrenome', exact: true }),
    emailInput: page.getByRole('textbox', { name: 'Email', exact: true }),
    phoneInput: page.getByRole('textbox', { name: 'Telefone', exact: true }),
    cpfInput: page.getByRole('textbox', { name: 'CPF', exact: true }),
    storeTrigger: page.getByRole('combobox', { name: 'Loja para Retirada' }),
    termsCheckbox: page.getByRole('checkbox', { name: /Li e aceito os Termos/i }),
    submitButton: page.getByRole('button', { name: 'Confirmar Pedido' }),
    // Locators XPath ancorados aos labels dos respectivos campos
    nameAlert: page.locator('//label[text()="Nome"]/..//p'),
    surnameAlert: page.locator('//label[text()="Sobrenome"]/..//p'),
    emailAlert: page.locator('//label[text()="Email"]/..//p'),
    phoneAlert: page.locator('//label[text()="Telefone"]/..//p'),
    cpfAlert: page.locator('//label[text()="CPF"]/..//p'),
    storeAlert: page.locator('//label[text()="Loja para Retirada"]/..//p'),
    termsAlert: page.locator('//label[@for="terms"]/following-sibling::p'),
  }

  return {
    elements,

    async open() {
      await page.goto('/order')
      await expect(elements.heading).toBeVisible()
    },

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

    async fillCustomerForm(data: CustomerFormData) {
      if (data.name !== undefined) {
        await elements.nameInput.fill(data.name)
      }
      if (data.surname !== undefined) {
        await elements.surnameInput.fill(data.surname)
      }
      if (data.email !== undefined) {
        await elements.emailInput.fill(data.email)
      }
      if (data.phone !== undefined) {
        await elements.phoneInput.fill(data.phone)
      }
      if (data.cpf !== undefined) {
        await elements.cpfInput.fill(data.cpf)
      }
      if (data.store) {
        await this.selectStore(data.store)
      }
      if (data.terms) {
        await elements.termsCheckbox.check()
      }
    },

    async selectStore(storeName: string) {
      await elements.storeTrigger.click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async submitOrder() {
      await elements.submitButton.click()
    },

    async expectValidationError(message: string | RegExp) {
      const errorPattern = typeof message === 'string' ? new RegExp(`^${message}$`) : message
      const errorElement = page.getByRole('paragraph').filter({ hasText: errorPattern })
      await expect(errorElement).toBeVisible()
    },

    async expectAllRequiredFieldsErrors() {
      await expect(elements.nameAlert).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(elements.surnameAlert).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(elements.emailAlert).toHaveText('Email inválido')
      await expect(elements.phoneAlert).toHaveText('Telefone inválido')
      await expect(elements.cpfAlert).toHaveText('CPF inválido')
      await expect(elements.storeAlert).toHaveText('Selecione uma loja')
      await expect(elements.termsAlert).toHaveText('Aceite os termos')
    },
  }
}

