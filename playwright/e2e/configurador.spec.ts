import { test, expect } from '@playwright/test'
import { ConfiguradorPage } from '../support/pages/ConfiguradorPage'

test.describe('Configurador de Veículo', () => {
  let configuradorPage: ConfiguradorPage

  test.beforeEach(async ({ page }) => {
    // Arrange
    configuradorPage = new ConfiguradorPage(page)
    await configuradorPage.open()
  })

  test('deve atualizar a imagem no preview e manter o preço base ao trocar as cores do veículo', async () => {
    // Arrange - Estado inicial de fábrica
    await configuradorPage.validarPreco('40.000,00')
    await configuradorPage.validarPreview('glacier-blue', 'aero')

    // Act - Selecionar cor Midnight Black
    await configuradorPage.selecionarCor('Midnight Black')

    // Assert - Preview atualiza e preço permanece R$ 40.000,00
    await configuradorPage.validarPreview('midnight-black', 'aero')
    await configuradorPage.validarPreco('40.000,00')

    // Act - Selecionar cor Lunar White
    await configuradorPage.selecionarCor('Lunar White')

    // Assert - Preview atualiza e preço permanece R$ 40.000,00
    await configuradorPage.validarPreview('lunar-white', 'aero')
    await configuradorPage.validarPreco('40.000,00')
  })

  test('deve atualizar a imagem no preview e recalcular o preço ao selecionar e desmarcar rodas esportivas', async () => {
    // Arrange - Estado inicial com rodas Aero
    await configuradorPage.validarPreco('40.000,00')
    await configuradorPage.validarPreview('glacier-blue', 'aero')

    // Act - Selecionar Sport Wheels (+ R$ 2.000,00)
    await configuradorPage.selecionarRoda('Sport Wheels')

    // Assert - Preview com roda sport e preço com acréscimo (R$ 42.000,00)
    await configuradorPage.validarPreview('glacier-blue', 'sport')
    await configuradorPage.validarPreco('42.000,00')

    // Act - Selecionar novamente Aero Wheels
    await configuradorPage.selecionarRoda('Aero Wheels')

    // Assert - Retorno ao preview aero e preço decrementado para R$ 40.000,00
    await configuradorPage.validarPreview('glacier-blue', 'aero')
    await configuradorPage.validarPreco('40.000,00')
  })
})
