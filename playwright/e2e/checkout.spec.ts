import { test, expect } from '../support/fixtures'

test.describe('Checkout - Validação de Formulário', () => {
  test.beforeEach(async ({ app }) => {
    // Arrange
    await app.checkout.open()
  })

  test('deve exibir mensagens de erro sob todos os campos ao tentar confirmar com formulário vazio', async ({ app }) => {
    // Act
    await app.checkout.submitOrder()

    // Assert
    await app.checkout.expectAllRequiredFieldsErrors()
  })

  test('deve exibir erro quando nome e sobrenome tiverem apenas 1 caractere', async ({ app }) => {
    // Act
    await app.checkout.fillCustomerForm({
      name: 'A',
      surname: 'B',
    })
    await app.checkout.submitOrder()

    // Assert
    await expect(app.checkout.elements.nameAlert).toHaveText('Nome deve ter pelo menos 2 caracteres')
    await expect(app.checkout.elements.surnameAlert).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
  })

  test('deve exibir erro quando o email possuir formato inválido', async ({ app }) => {
    // Act
    await app.checkout.fillCustomerForm({
      name: 'João',
      surname: 'Silva',
      email: 'test@com',
    })
    await app.checkout.submitOrder()

    // Assert
    await expect(app.checkout.elements.emailAlert).toHaveText('Email inválido')
  })

  test('deve exibir erro quando o CPF estiver incompleto ou inválido', async ({ app }) => {
    // Act
    await app.checkout.fillCustomerForm({
      name: 'João',
      surname: 'Silva',
      email: 'joao.silva@example.com',
      cpf: '',
    })
    await app.checkout.submitOrder()

    // Assert
    await expect(app.checkout.elements.cpfAlert).toHaveText('CPF inválido')
  })

  test('deve exibir erro quando todos os campos estiverem preenchidos mas os termos não foram aceitos', async ({ app }) => {
    // Act
    await app.checkout.fillCustomerForm({
      name: 'Carlos',
      surname: 'Ferreira',
      email: 'carlos.ferreira@example.com',
      phone: '11987654321',
      cpf: '12345678901',
      store: 'Velô Paulista - Av. Paulista, 1000',
      terms: false,
    })
    await app.checkout.submitOrder()

    // Assert
    await expect(app.checkout.elements.termsAlert).toHaveText('Aceite os termos')
  })
})
