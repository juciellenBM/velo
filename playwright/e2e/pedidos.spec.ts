import { test } from '@playwright/test'

import { HeaderNav } from '../support/components/HeaderNav'
import { generateOrderCode } from '../support/helpers'
import { LandingPage } from '../support/pages/LandingPage'
import { OrderDetails, OrderLockupPage } from '../support/pages/OrderLockupPage'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const headerNav = new HeaderNav(page)
    const orderLockupPage = new OrderLockupPage(page)

    // Arrange
    await landingPage.abrir()
   

    // Act
    await headerNav.irParaConsultaPedido()

    // Assert
    await orderLockupPage.validarPaginaCarregada()
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {

   const order: OrderDetails = {
    number: 'VLO-EHWTGA',
    status: 'APROVADO' as const,
    color:'Midnight Black',
    wheels:'sport Wheels',
    customer : {
      name: 'JUCIELLEN MORAES',
      email:'juciellen@hotmail.com'

    },
    payment :'À Vista'
   }

    // Act
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)

    // Assert
    await orderLockupPage.validateOrder(order)

  })


  test('deve consultar um pedido reprovado', async ({ page }) => {
    // Dado que o usuário está na página de consulta de pedidos
    //Test Data
   //const order = 'VLO-EHWTGA'

   const order: OrderDetails = {
    number: 'VLO-GOUQJH',
    status: 'REPROVADO' as const,
    color:'Lunar White',
    wheels:'sport Wheels',
    customer : {
      name: 'Karoliny Simões',
      email:'karolinysimoes@gmail.com'

    },
    payment :'À Vista'
   }

     // Act
     const orderLockupPage = new OrderLockupPage(page)
     await orderLockupPage.searchOrder(order.number)

     // Assert
        await orderLockupPage.validateOrder(order)
      })



   test('deve consultar um pedido em analise', async ({ page }) => {
// test data
   const order: OrderDetails = {
    number: 'VLO-0YFPJY',
    status: 'EM_ANALISE' as const,
    color:'Midnight Black',
    wheels:'aero Wheels',
    customer : {
      name: 'João Bobo',
      email:'joaobobo@velo.dev'

    },
    payment :'À Vista'
  }

   // Act
   const orderLockupPage = new OrderLockupPage(page)
   await orderLockupPage.searchOrder(order.number)

   // Assert
   await orderLockupPage.validateOrder(order)
 })

 test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

   const order = generateOrderCode()

   const orderLockupPage = new OrderLockupPage(page)
   await orderLockupPage.searchOrder(order)


  await orderLockupPage.validateOrderNotFound()

 })

 test('deve exibir mensagem quando o pedido hardcoded nao e encontrado', async ({ page }) => {
  const orderLockupPage = new OrderLockupPage(page)
  await orderLockupPage.searchOrder('ABC123')


 await orderLockupPage.validateOrderNotFound()

})

})
