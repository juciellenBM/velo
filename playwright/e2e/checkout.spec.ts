import { test, expect } from '../support/fixtures'
import { deleteOrderByEmail } from '../support/database/orderRepository'
import testData from '../support/fixtures/orders.json' with { type: 'json' }

test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ app, page }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'jbmoraes@teste.com',
        document: '44177930838',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Juciellen',
        lastname: 'Moraes',
        email: 'jbmoraes@.com',
        document: '44177930838',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'Juciellen',
        lastname: 'Moraes',
        email: 'jbmoraes@teste.com',
        document: '44177930838',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'Juciellen',
        lastname: 'Moraes',
        email: 'jbmoraes@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamentos e Confirmação', () => {

    const order = testData.ct05

    test.beforeEach(async () => {
      // Limpa do banco de dados qualquer pedido anterior gerado para este e-mail exclusivo
      await deleteOrderByEmail(order.customer.email)
    })

    test('deve finalizar pedido à vista com sucesso (CT05)', async ({ page, app }) => {
      // Arrange - Navegação de ponta a ponta
      await page.goto('/')
      await page.getByTestId('hero-cta-primary').click()
      await app.configurator.expectPrice('R$ 40.000,00')
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal('R$ 40.000,00')

      // Act
      await app.checkout.fillCustomerData(order.customer)
      await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
      await app.checkout.selectPaymentMethod('avista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.validateSuccess({
        name: `${order.customer.name} ${order.customer.lastname || ''}`.trim(),
        email: order.customer.email,
        store: order.customer.store,
        price: 'R$ 40.000,00',
      })
    })

    test('deve aprovar automática de crédito quando o score do CPF for maior que 700 no financiamento.', async ({ page, app }) => {
      const order = testData.ct06

      // Arrange - Navegação de ponta a ponta
      await deleteOrderByEmail(order.customer.email)

      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: 850 }),
        })
      })

      await page.goto('/')
      await page.getByTestId('hero-cta-primary').click()
      await app.configurator.expectPrice('R$ 40.000,00')
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal('R$ 40.000,00')

      // Act
      await app.checkout.fillCustomerData(order.customer)
      await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
      await app.checkout.selectPaymentMethod('financiamento')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.validateSuccess({
        name: `${order.customer.name} ${order.customer.lastname || ''}`.trim(),
        email: order.customer.email,
        store: order.customer.store,
        price: 'R$ 40.800,00',
      })
    })

    test('deve destinar para análise manual quando o score do CPF for entre 501 e 700 no financiamento (CT07)', async ({ page, app }) => {
      const order = testData.ct07

      // Arrange - Navegação de ponta a ponta
      await deleteOrderByEmail(order.customer.email)

      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: 600 }),
        })
      })

      await page.goto('/')
      await page.getByTestId('hero-cta-primary').click()
      await app.configurator.expectPrice('R$ 40.000,00')
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal('R$ 40.000,00')

      // Act
      await app.checkout.fillCustomerData(order.customer)
      await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
      await app.checkout.selectPaymentMethod('financiamento')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page.getByTestId('success-status')).toHaveText('Pedido em Análise')
    })

    test('deve reprovar financiamento com score baixo sem entrada (CT08)', async ({ page, app }) => {
      const order = testData.ct08_sem_entrada

      // Arrange - Navegação de ponta a ponta
      await deleteOrderByEmail(order.customer.email)

      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: 450 }),
        })
      })

      await page.goto('/')
      await page.getByTestId('hero-cta-primary').click()
      await app.configurator.expectPrice('R$ 40.000,00')
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal('R$ 40.000,00')

      // Act
      await app.checkout.fillCustomerData(order.customer)
      await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
      await app.checkout.selectPaymentMethod('financiamento')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page.getByTestId('success-status')).toHaveText('Crédito Reprovado')
      await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]+$/)
    })

    test('deve reprovar financiamento com score baixo e entrada inferior a 50% (CT08)', async ({ page, app }) => {
      const order = testData.ct08_com_entrada

      // Arrange - Navegação de ponta a ponta
      await deleteOrderByEmail(order.customer.email)

      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: 450 }),
        })
      })

      await page.goto('/')
      await page.getByTestId('hero-cta-primary').click()
      await app.configurator.expectPrice('R$ 40.000,00')
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.expectSummaryTotal('R$ 40.000,00')

      // Act
      await app.checkout.fillCustomerData(order.customer)
      await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
      await app.checkout.selectPaymentMethod('financiamento')
      await app.checkout.setEntryValue(order.entryValue)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page.getByTestId('success-status')).toHaveText('Crédito Reprovado')
      await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]+$/)
    })
  })
})