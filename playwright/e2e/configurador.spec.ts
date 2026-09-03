import { test, expect } from '../support/fixtures'

test.describe('Configurador de Veículo', () => {
  test.beforeEach(async ({ app }) => {
    // Arrange
    await app.configurador.open()
  })

  test('deve atualizar a imagem no preview e manter o preço base ao trocar as cores do veículo', async ({ app }) => {
    // Arrange - Estado inicial de fábrica
    await app.configurador.validarPreco('40.000,00')
    await app.configurador.validarPreview('glacier-blue', 'aero')

    // Act - Selecionar cor Midnight Black
    await app.configurador.selecionarCor('Midnight Black')

    // Assert - Preview atualiza e preço permanece R$ 40.000,00
    await app.configurador.validarPreview('midnight-black', 'aero')
    await app.configurador.validarPreco('40.000,00')

    // Act - Selecionar cor Lunar White
    await app.configurador.selecionarCor('Lunar White')

    // Assert - Preview atualiza e preço permanece R$ 40.000,00
    await app.configurador.validarPreview('lunar-white', 'aero')
    await app.configurador.validarPreco('40.000,00')
  })

  test('deve atualizar a imagem no preview e recalcular o preço ao selecionar e desmarcar rodas esportivas', async ({ app }) => {
    // Arrange - Estado inicial com rodas Aero
    await app.configurador.validarPreco('40.000,00')
    await app.configurador.validarPreview('glacier-blue', 'aero')

    // Act - Selecionar Sport Wheels (+ R$ 2.000,00)
    await app.configurador.selecionarRoda('Sport Wheels')

    // Assert - Preview com roda sport e preço com acréscimo (R$ 42.000,00)
    await app.configurador.validarPreview('glacier-blue', 'sport')
    await app.configurador.validarPreco('42.000,00')

    // Act - Selecionar novamente Aero Wheels
    await app.configurador.selecionarRoda('Aero Wheels')

    // Assert - Retorno ao preview aero e preço decrementado para R$ 40.000,00
    await app.configurador.validarPreview('glacier-blue', 'aero')
    await app.configurador.validarPreco('40.000,00')
  })
})
