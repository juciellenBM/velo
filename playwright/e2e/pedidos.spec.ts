import { test, expect } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { OrderLockupPage } from '../support/pages/OrderLockupPage'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {

   const order = {
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
    await orderLockupPage.validateOrderDetails(order)

    // Validação do badge de status encapsulada no Page Object
    await orderLockupPage.validateStatusBadge(order.status)

  })


  test('deve consultar um pedido reprovado', async ({ page }) => {
    // Dado que o usuário está na página de consulta de pedidos
    //Test Data 
   //const order = 'VLO-EHWTGA'

   const order = {
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
     await orderLockupPage.validateOrderDetails(order)
 
     // Validação do badge de status encapsulada no Page Object
     await orderLockupPage.validateStatusBadge(order.status)
   })
    


  
   test('deve consultar um pedido em analise', async ({ page }) => {
// test data
   const order = {
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
   await orderLockupPage.validateOrderDetails(order)
 
   // Validação do badge de status encapsulada no Page Object
   await orderLockupPage.validateStatusBadge(order.status  )
 })

 test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

   const order = generateOrderCode()

   const orderLockupPage = new OrderLockupPage(page)
   await orderLockupPage.searchOrder(order)


  await orderLockupPage.validadeOrdernotfound()

 })

 test('Deve exib ir mensagem quando o o pedido em qualquer formato não é encontrado', async ({ page }) => {

  const order = generateOrderCode()

  const orderLockupPage = new OrderLockupPage(page)
  await orderLockupPage.searchOrder('ABC123')


 await orderLockupPage.validadeOrdernotfound()

})

})
