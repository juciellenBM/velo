import { Page, expect } from '@playwright/test'

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export class OrderLockupPage {
    constructor(private page: Page) { }

    async searchOrder(order: string) {
        await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
    }

    async validateStatusBadge(status: OrderStatus) {
        const statusClass = {
            APROVADO: {
                background: 'bg-green-100',
                text: 'text-green-700',
                icon: 'lucide-circle-check-big'
            },
            REPROVADO: {
                background: 'bg-red-100',
                text: 'text-red-700',
                icon: 'lucide-circle-x'
            },
            EM_ANALISE: {
                background: 'bg-amber-100',
                text: 'text-amber-700',
                icon: 'lucide-clock'
            }
        } as const
        const { background, text, icon } = statusClass[status]
        const statusBadge = this.page.getByRole('status').filter({ hasText: status })
    
        await expect(statusBadge).toHaveClass(new RegExp(background))
        await expect(statusBadge).toHaveClass(new RegExp(text))
        await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(icon))
    
    }
}
