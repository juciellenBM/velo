import fs from 'node:fs'
import path from 'node:path'

export function generateOrderCode() {
    const prefix = 'VLO'

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomPart = ''

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        randomPart += chars[randomIndex]
    }

    return `${prefix}-${randomPart}`
}

export function updateOrderFixture(fixtureKey: string, newOrderNumber: string) {
    const filePath = path.resolve(process.cwd(), 'playwright/support/fixtures/orders.json')
    const content = fs.readFileSync(filePath, 'utf-8')
    const orders = JSON.parse(content)

    if (orders[fixtureKey]) {
        orders[fixtureKey].number = newOrderNumber
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2) + '\n', 'utf-8')
    }
}