import { test } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { Navbar } from '../support/components/Navbar'

import { LandingPage } from '../support/pages/LandingPage'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'

test.describe('Consulta de Pedido', () => {

  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    await new LandingPage(page).goto()
    await new Navbar(page).orderLockupLink()

    orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.validateOrderNotFound()
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

   await orderLockupPage.searchOrder(order.number)
   await orderLockupPage.validateOrderDetails(order)
   await orderLockupPage.validateStatusBadge(order.status)

  })


  test('deve consultar um pedido reprovado', async ({ page }) => {
    // Test Data
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

   await orderLockupPage.searchOrder(order.number)

   await orderLockupPage.validateOrderDetails(order)
   await orderLockupPage.validateStatusBadge(order.status)
  })



   test('deve consultar um pedido em analise', async ({ page }) => {
  // Test Data
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
  await orderLockupPage.searchOrder(order.number)

  await orderLockupPage.validateOrderDetails(order)
  await orderLockupPage.validateStatusBadge(order.status)
 })

 test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

   const order = generateOrderCode()

   await orderLockupPage.searchOrder(order)
   await orderLockupPage.validateOrderNotFound()

 })

 test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ page }) => {
  const orderCode = 'XYZ-999-INVALIDO'

  await orderLockupPage.searchOrder(orderCode)
  await orderLockupPage.validateOrderNotFound()
  })
})
