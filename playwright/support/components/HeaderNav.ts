import { Page } from '@playwright/test'

export class HeaderNav {
    constructor(private page: Page) { }

    private desktopNav() {
        return this.page.getByTestId('header-nav')
    }

    async irParaConsultaPedido() {
        await this.desktopNav().getByRole('link', { name: 'Consultar Pedido' }).click()
    }

    async irParaConfigurar() {
        await this.desktopNav().getByTestId('header-cta').getByRole('link', { name: 'Configure o Seu' }).click()
    }
}
