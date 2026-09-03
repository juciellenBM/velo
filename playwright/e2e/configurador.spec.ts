import { test, expect } from '../support/fixtures'

test.describe('Configurador de Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurador.open()
  })

  test('deve atualizar a imagem no preview e manter o preço base ao trocar as cores do veículo', async ({ app }) => {
    await app.configurador.expectPrice('40.000,00')
    await app.configurador.expectCarImageSrc(/glacier-blue-aero-wheels\.png/)

    await app.configurador.selectColor('Midnight Black')
    await app.configurador.expectCarImageSrc(/midnight-black-aero-wheels\.png/)
    await app.configurador.expectPrice('40.000,00')

    await app.configurador.selectColor('Lunar White')
    await app.configurador.expectCarImageSrc(/lunar-white-aero-wheels\.png/)
    await app.configurador.expectPrice('40.000,00')
  })

  test('deve atualizar a imagem no preview e recalcular o preço ao selecionar e desmarcar rodas esportivas', async ({ app }) => {
    await app.configurador.expectPrice('40.000,00')
    await app.configurador.expectCarImageSrc(/glacier-blue-aero-wheels\.png/)

    await app.configurador.selectWheels(/Sport Wheels/i)
    await app.configurador.expectCarImageSrc(/glacier-blue-sport-wheels\.png/)
    await app.configurador.expectPrice('42.000,00')

    await app.configurador.selectWheels(/Aero Wheels/i)
    await app.configurador.expectCarImageSrc(/glacier-blue-aero-wheels\.png/)
    await app.configurador.expectPrice('40.000,00')
  })

  test('deve atualizar o preço dinâmico ao adicionar e remover opcionais e persistir no checkout', async ({ app }) => {
    await app.configurador.expectPrice('40.000,00')

    await app.configurador.checkOptional(/Precision Park/i)
    await app.configurador.expectPrice('45.500,00')

    await app.configurador.checkOptional(/Flux Capacitor/i)
    await app.configurador.expectPrice('50.500,00')

    await app.configurador.uncheckOptional(/Precision Park/i)
    await app.configurador.expectPrice('45.000,00')
    await app.configurador.uncheckOptional(/Flux Capacitor/i)
    await app.configurador.expectPrice('40.000,00')

    await app.configurador.checkOptional(/Precision Park/i)
    await app.configurador.expectPrice('45.500,00')
    await app.configurador.finishConfigurator()

    await app.checkout.validarPaginaCarregada()
    await app.checkout.validarPrecoTotal('45.500,00')
    await app.checkout.validarOpcionalNoResumo('Precision Park', '5.500,00')
  })
})
