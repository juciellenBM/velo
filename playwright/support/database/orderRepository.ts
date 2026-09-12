import { OrderDetails } from '../actions/orderLockupActions'
import { db } from './database'
import { OrderTable } from './schema'
import crypto from 'crypto'


function normalizeValue(value: string): string {
  const cleanValue = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos (ex: 'À' -> 'A')
    .toLowerCase()
    .trim()

  if (cleanValue.includes('vista')) {
    return 'avista'
  }

  if (cleanValue.includes('financiamento')) {
    return 'financiamento'
  }

  return cleanValue.replace(/\s+/g, '')
}


export async function insertOrder(order: OrderDetails) {
  const data: OrderTable ={ 
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizeValue(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
 
  await db.insertInto('orders').values(data).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute()
}
