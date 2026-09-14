# Planejamento de Reuso de Código com Feature Actions e Injeção de Dependência (DI)

## 1. Visão Geral e Contexto

No arquivo [`playwright/e2e/checkout.spec.ts`](../../playwright/e2e/checkout.spec.ts), identificamos execuções repetitivas antes dos cenários de teste de checkout (CT05 a CT08):
- Navegação completa da Home (`/`) até a tela de Checkout (`/order`) com a configuração padrão do veículo.
- Mapeamento inline e duplicado de mocks de rede com `page.route` para o endpoint `credit-analysis`.
- Asserções de resultado de pedido dispersas diretamente no corpo dos testes.

Este plano define a arquitetura para modularizar essas responsabilidades no padrão **Feature Actions**, utilizando o mecanismo nativo de **Injeção de Dependência (DI)** do Playwright Test (`test.extend`).

---

## 2. Arquitetura de Injeção de Dependência (DI) no Playwright

No Playwright, o Container de Injeção de Dependência é gerenciado através do método `base.extend<Fixtures>`. 
Cada teste ou hook (`beforeEach`) declara explicitamente as dependências necessárias como parâmetros desestruturados:

```ts
test('cenário', async ({ app }) => {
  // 'app' é instanciado automaticamente e injetado com o contexto isolado da 'page' atual
})
```

### Composição do Container de Dependências (`App`):
```
                       +-------------------------+
                       |  Playwright test.extend | (DI Container)
                       +------------+------------+
                                    |
                                    v
                           +-----------------+
                           |     app (DI)    |
                           +--------+--------+
                                    |
       +--------------+-------------+-------------+--------------+
       |              |                           |              |
       v              v                           v              v
+-------------+ +---------------+           +------------+ +------------+
| heroActions | | configurator  |           |  checkout  | |  mockApi   |
|   (Hero)    | |   (Actions)   |           |  (Actions) | |  (Fixtures)|
+-------------+ +---------------+           +------------+ +------------+
```

---

## 3. Estrutura de Arquivos e Mudanças Propostas

### 3.1. Novos Arquivos

#### A. `playwright/support/actions/heroActions.ts`
* **Responsabilidade**: Encapsular interações com a página inicial / Hero section.
* **Ações**:
  - `open()`: Acessa a Home (`/`) e aguarda o botão principal estar visível.
  - `startConfiguration()`: Clica no CTA principal (`hero-cta-primary`) para iniciar o fluxo do configurador.

#### B. `playwright/support/fixtures/mock.api.ts`
* **Responsabilidade**: Centralizar interceptações de rotas de API da aplicação (Supabase Edge Functions).
* **Ações**:
  - `mockCreditAnalysis(score: number, status?: string)`: Intercepta a rota `**/functions/v1/credit-analysis` e responde com o payload estruturado contendo status e score customizáveis.

---

### 3.2. Arquivos a Modificar

#### A. `playwright/support/actions/checkoutActions.ts`
* **Melhoria / Encapsulamento**:
  - Adicionar o método `expectResult(expected: ExpectedCheckoutResult)` para encapsular todas as asserções de resultado (status badge `Pedido Aprovado!`, `Pedido em Análise`, `Crédito Reprovado`, regex do código do pedido e dados de resumo do cliente).

#### B. `playwright/support/fixtures.ts`
* **Injeção de Dependência**:
  - Importar `createHeroActions` e `createMockApi`.
  - Adicionar as propriedades `hero` e `mockApi` ao tipo `App` e ao provider da fixture `app`.

#### C. `playwright/e2e/checkout.spec.ts`
* **Refatoração dos Testes**:
  - Implementar `test.beforeEach` no bloco `Pagamentos e Confirmação` para executar a jornada preparatória (Home -> Configurator -> Checkout) uma única vez por teste.
  - Substituir mocks inline por `await app.mockApi.mockCreditAnalysis(...)`.
  - Substituir asserts manuais por `await app.checkout.expectResult(...)`.

---

## 4. Detalhamento da Implementação

### 4.1. `heroActions.ts`
```ts
import { Page, expect } from '@playwright/test'

export function createHeroActions(page: Page) {
  const ctaPrimary = page.getByTestId('hero-cta-primary')

  return {
    elements: {
      ctaPrimary,
    },

    async open() {
      await page.goto('/')
      await expect(ctaPrimary).toBeVisible()
    },

    async startConfiguration() {
      await ctaPrimary.click()
    },
  }
}
```

### 4.2. `mock.api.ts`
```ts
import { Page } from '@playwright/test'

export function createMockApi(page: Page) {
  return {
    async mockCreditAnalysis(score: number, status: string = 'Done') {
      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status, score }),
        })
      })
    },
  }
}
```

### 4.3. `checkoutActions.ts` (`expectResult`)
```ts
export type ExpectedCheckoutResult = {
  status: 'Pedido Aprovado!' | 'Pedido em Análise' | 'Crédito Reprovado' | string
  orderNumberPattern?: RegExp
  customerName?: string
  customerEmail?: string
  store?: string
  totalPrice?: string
}

// Dentro de createCheckoutActions:
async expectResult(expected: ExpectedCheckoutResult) {
  const statusBadge = page.getByTestId('success-status')
  const orderId = page.getByTestId('order-id')

  await expect(statusBadge).toBeVisible({ timeout: 10_000 })
  await expect(statusBadge).toHaveText(expected.status)

  if (expected.orderNumberPattern || expected.status === 'Pedido Aprovado!' || expected.status === 'Crédito Reprovado') {
    await expect(orderId).toHaveText(expected.orderNumberPattern || /^VLO-[A-Z0-9]+$/)
  }

  if (expected.customerName) {
    await expect(page.getByText(expected.customerName)).toBeVisible()
  }
  if (expected.customerEmail) {
    await expect(page.getByText(expected.customerEmail)).toBeVisible()
  }
  if (expected.store) {
    await expect(page.getByText(expected.store)).toBeVisible()
  }
  if (expected.totalPrice) {
    await expect(page.getByText(expected.totalPrice)).toBeVisible()
  }
}
```

### 4.4. `fixtures.ts` (Container DI)
```ts
import { test as base } from '@playwright/test'

import { createHeroActions } from './actions/heroActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createMockApi } from './fixtures/mock.api'

type App = {
  hero: ReturnType<typeof createHeroActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  mockApi: ReturnType<typeof createMockApi>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      hero: createHeroActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      orderLookup: createOrderLookupActions(page),
      mockApi: createMockApi(page),
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
```

### 4.5. `checkout.spec.ts` Refatorado
```ts
test.describe('Pagamentos e Confirmação', () => {

  test.beforeEach(async ({ app }) => {
    // Arrange centralizado: navega da Home ao Checkout
    await app.hero.open()
    await app.hero.startConfiguration()
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.finishConfigurator()
    await app.checkout.expectLoaded()
    await app.checkout.expectSummaryTotal('R$ 40.000,00')
  })

  test('deve aprovar automática de crédito quando o score for > 700 (CT06)', async ({ app }) => {
    const order = testData.ct06
    await deleteOrderByEmail(order.customer.email)
    await app.mockApi.mockCreditAnalysis(850)

    // Act
    await app.checkout.fillCustomerData(order.customer)
    await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.acceptTerms()
    await app.checkout.submit()

    // Assert
    await app.checkout.expectResult({
      status: 'Pedido Aprovado!',
      customerName: `${order.customer.name} ${order.customer.lastname || ''}`.trim(),
      customerEmail: order.customer.email,
      totalPrice: 'R$ 40.800,00',
    })
  })
})
```

---

## 5. Plano de Validação e Verificação

Para garantir a ausência de regressões:

1. **Executar a suíte de testes de Checkout**:
   ```bash
   yarn playwright test playwright/e2e/checkout.spec.ts
   ```
2. **Executar a suíte completa de testes**:
   ```bash
   yarn playwright test
   ```
3. **Validar relatório e traces**:
   - Confirmar que todos os 11 cenários de checkout e os demais specs executam com sucesso.
