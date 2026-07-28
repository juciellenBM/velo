import { test, expect } from '../support/fixtures'

import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLockupActions'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {

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

   await app.orderLockup.searchOrder(order.number)
   await app.orderLockup.validateOrderDetails(order)
   await app.orderLockup.validateStatusBadge(order.status)

  })


  test('deve consultar um pedido reprovado', async ({ app }) => {
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

   await app.orderLockup.searchOrder(order.number)

   await app.orderLockup.validateOrderDetails(order)
   await app.orderLockup.validateStatusBadge(order.status)
  })



   test('deve consultar um pedido em analise', async ({ app }) => {
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
  await app.orderLockup.searchOrder(order.number)

  await app.orderLockup.validateOrderDetails(order)
  await app.orderLockup.validateStatusBadge(order.status)
 })

 test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {

   const order = generateOrderCode()

   await app.orderLockup.searchOrder(order)
   await app.orderLockup.validateOrderNotFound()

 })

 test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
  const orderCode = 'XYZ-999-INVALIDO'

  await app.orderLockup.searchOrder(orderCode)
  await app.orderLockup.validateOrderNotFound()
  })


  test('Deve nabter o botão de busca desabilitado com o campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLockup.elements.oderInput.fill('     ')
    await expect(button).toBeDisabled()

  })
})
