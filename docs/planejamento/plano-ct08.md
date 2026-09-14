# Planejamento de Implementação - CT08 (Financiamento com Score Baixo - Reprovado)

Este documento contém a **análise técnica do código atual** e o **plano de implementação** dos testes automatizados para o **CT08**, cobrindo os dois cenários da regra de negócio de financiamento com Score Baixo ($\le 500$):
1. **Cenário 1 (Sem Entrada):** Financiamento com Score Baixo ($\le 500$) e sem valor de entrada informado (entrada 0).
2. **Cenário 2 (Com Entrada < 50%):** Financiamento com Score Baixo ($\le 500$) e valor de entrada inferior a 50% do valor total do veículo.

---

## 🔎 Análise do Código Atual

### 1. `playwright/support/actions/checkoutActions.ts`
- **Pontos Fortes:**
  - Segue o padrão funcional orientado a Actions (`createCheckoutActions(page)`), sem acoplamento a classes e em conformidade com o `Feature Actions Prompt.md`.
  - Encapsula seletores estáveis via `getByTestId` e `getByRole`.
  - Expõe o objeto `elements.alerts` para checagem rápida de mensagens de erro.
- **Oportunidades e Diagnóstico:**
  - **Duplicação / Typo:** Existem dois métodos para preenchimento de dados do cliente: `fillCustomerlData` (com 'l' a mais, usado nas validações de campos obrigatórios) e `fillCustomerData` (com lógica de fallback para sobrenome, usado no fluxo feliz). Mantemos a assinatura intacta para não quebrar testes existentes.
  - **Ausência de método para valor de entrada:** No formulário de financiamento, o campo `#entry-value` (`data-testid="input-entry-value"`) não possui método correspondente na action. É necessário adicionar `setEntryValue(value: string | number)`.

### 2. `playwright/e2e/checkout.spec.ts`
- **Pontos Fortes:**
  - Excelente organização em blocos `test.describe` e uso rigoroso do padrão **AAA** (Arrange, Act, Assert).
  - Isolamento de banco através de `deleteOrderByEmail` no `beforeEach` e nos testes específicos.
  - Mock determinístico da Edge Function de análise de crédito via `page.route('**/functions/v1/credit-analysis', ...)`.
- **Diagnóstico para o CT08:**
  - Os testes existentes (CT05, CT06, CT07) servem como base sólida para adicionar os dois cenários do CT08 dentro do describe `'Pagamentos e Confirmação'`.
  - No CT08, o status retornado na tela de confirmação após a submissão é `'Crédito Reprovado'` (`data-testid="success-status"`).

### 3. `playwright/support/fixtures/orders.json`
- **Pontos Fortes:**
  - Centralização de massas de dados segregadas por caso de teste (`ct05`, `ct06`, `ct07`).
- **Diagnóstico para o CT08:**
  - Cadastraremos massas dedicadas com e-mails exclusivos (`ct08_sem_entrada` e `ct08_com_entrada`) para garantir independência e integridade de limpeza no banco.

---

## Proposed Changes

### Camada de Suporte e Fixtures

#### [MODIFY] [checkoutActions.ts](file:///c:/AutomatizaAI/velo/playwright/support/actions/checkoutActions.ts)
- Adicionar a action `setEntryValue`:
  ```ts
  async setEntryValue(value: string | number) {
    await page.getByTestId('input-entry-value').fill(String(value))
  }
  ```

#### [MODIFY] [orders.json](file:///c:/AutomatizaAI/velo/playwright/support/fixtures/orders.json)
- Adicionar os objetos de massa de dados para o CT08:
  ```json
  "ct08_sem_entrada": {
    "customer": {
      "name": "Bruno",
      "lastname": "Santos",
      "email": "bruno.reprovado@velo.com",
      "document": "12345678909",
      "phone": "(11) 97777-7777",
      "store": "Velô Paulista - Av. Paulista, 1000"
    }
  },
  "ct08_com_entrada": {
    "entryValue": 10000,
    "customer": {
      "name": "Fernanda",
      "lastname": "Lima",
      "email": "fernanda.reprovada@velo.com",
      "document": "98765432100",
      "phone": "(11) 96666-6666",
      "store": "Velô Paulista - Av. Paulista, 1000"
    }
  }
  ```

---

### Camada de Testes E2E

#### [MODIFY] [checkout.spec.ts](file:///c:/AutomatizaAI/velo/playwright/e2e/checkout.spec.ts)
- Adicionar os dois testes dentro do `test.describe('Pagamentos e Confirmação', ...)`:

1. **Cenário 1 - Sem Entrada:**
   ```ts
   test('deve reprovar financiamento com score baixo sem entrada (CT08)', async ({ page, app }) => {
     const order = testData.ct08_sem_entrada

     // Arrange
     await deleteOrderByEmail(order.customer.email)

     await page.route('**/functions/v1/credit-analysis', async (route) => {
       await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify({ status: 'Done', score: 450 }),
       })
     })

     await page.goto('/')
     await page.getByTestId('hero-cta-primary').click()
     await app.configurator.expectPrice('R$ 40.000,00')
     await app.configurator.finishConfigurator()

     await app.checkout.expectLoaded()
     await app.checkout.expectSummaryTotal('R$ 40.000,00')

     // Act
     await app.checkout.fillCustomerData(order.customer)
     await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
     await app.checkout.selectPaymentMethod('financiamento')
     await app.checkout.acceptTerms()
     await app.checkout.submit()

     // Assert
     await expect(page.getByTestId('success-status')).toHaveText('Crédito Reprovado')
     await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]+$/)
   })
   ```

2. **Cenário 2 - Com Entrada < 50%:**
   ```ts
   test('deve reprovar financiamento com score baixo e entrada inferior a 50% (CT08)', async ({ page, app }) => {
     const order = testData.ct08_com_entrada

     // Arrange
     await deleteOrderByEmail(order.customer.email)

     await page.route('**/functions/v1/credit-analysis', async (route) => {
       await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify({ status: 'Done', score: 450 }),
       })
     })

     await page.goto('/')
     await page.getByTestId('hero-cta-primary').click()
     await app.configurator.expectPrice('R$ 40.000,00')
     await app.configurator.finishConfigurator()

     await app.checkout.expectLoaded()
     await app.checkout.expectSummaryTotal('R$ 40.000,00')

     // Act
     await app.checkout.fillCustomerData(order.customer)
     await app.checkout.selectStore(order.customer.store || 'Velô Paulista - Av. Paulista, 1000')
     await app.checkout.selectPaymentMethod('financiamento')
     await app.checkout.setEntryValue(order.entryValue)
     await app.checkout.acceptTerms()
     await app.checkout.submit()

     // Assert
     await expect(page.getByTestId('success-status')).toHaveText('Crédito Reprovado')
     await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]+$/)
   })
   ```

---

## Verification Plan

### Automated Tests
- Execução direcionada do spec em modo visível (`--headed`):
  ```bash
  cmd.exe /c "yarn playwright test playwright/e2e/checkout.spec.ts --headed"
  ```
- Execução completa da suíte:
  ```bash
  cmd.exe /c "yarn playwright test"
  ```
