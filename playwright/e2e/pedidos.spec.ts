import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLockupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepository'


test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-S3RC01',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'JUCIELLEN MORAES',
        email: 'juciellen@hotmail.com',
        document: '017.119.171-41',
        phone: '(64) 99251-6810'
      },
      payment: 'À Vista',
      total_price: '52500'
    }

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-S3RC02',
      status: 'REPROVADO',
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: {
        name: 'Karoliny Simões',
        email: 'karolinysimoes@gmail.com',
        document: '946.637.180-00',
        phone: '(64) 99215-0899'
      },
      payment: 'À Vista',
      total_price: '52500'
    }

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-S3RC03',
      status: 'EM_ANALISE',
      color: 'Midnight Black',
      wheels: 'aero Wheels',
      customer: {
        name: 'João Bobo',
        email: 'joaobobo@velo.dev',
        document: '561.309.830-18',
        phone: '(64) 99999-9999'
      },
      payment: 'À Vista',
      total_price: '40000'
    }

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

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

  test('Deve nabter o botão de busca desabilitado com o campo vazio ou apenas espaços', async ({ app }) => {
    const button = app.orderLockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLockup.elements.oderInput.fill('     ')
    await expect(button).toBeDisabled()
  })
})
