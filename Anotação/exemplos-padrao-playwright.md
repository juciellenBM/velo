# Exemplos padrao internos - Playwright, TypeScript e Node.js

Este arquivo serve como referencia pratica para o Codex criar ou corrigir testes mantendo o mesmo estilo do projeto.

O foco e teste caixa-preta: usar Codegen, HTML renderizado, acessibilidade, textos visiveis e evidencias da tela. Nao assumir acesso ao codigo fonte da aplicacao.

## 1. Page Object bom

Use Page Object quando a tela tiver acoes repetidas, validacoes recorrentes ou seletores que aparecem em varios testes.

Arquivo sugerido:

```txt
playwright/support/pages/ConsultaPedidoPage.ts
```

Exemplo:

```ts
import { Page, expect } from '@playwright/test'

export type StatusPedido = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export class ConsultaPedidoPage {
  constructor(private page: Page) {}

  async abrir() {
    await this.page.goto('http://localhost:5173/')
    await this.page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(this.page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
  }

  async buscarPorNumero(numero: string) {
    await this.page.getByRole('textbox', { name: 'Numero do Pedido' }).fill(numero)
    await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
  }

  resultadoDoPedido(numero: string) {
    return this.page.getByTestId(`order-result-${numero}`)
  }

  async validarStatus(numero: string, status: StatusPedido) {
    await expect(this.resultadoDoPedido(numero).getByRole('status')).toContainText(status)
  }

  async validarPedidoNaoEncontrado() {
    await expect(this.page.getByRole('heading', { name: 'Pedido nao encontrado' })).toBeVisible()
    await expect(this.page.getByText('Verifique o numero do pedido e tente novamente', { exact: true })).toBeVisible()
  }
}
```

Por que este exemplo e bom:

- Centraliza navegacao e acoes principais da tela.
- Evita repetir seletores em varios specs.
- Retorna locator quando o spec precisa fazer uma assertion especifica.
- Mantem nomes orientados ao negocio, nao ao HTML.
- Nao usa `waitForTimeout`.

## 2. Spec bom com AAA e Page Object

Arquivo sugerido:

```txt
playwright/e2e/consulta-pedido.spec.ts
```

Exemplo:

```ts
import { test, expect } from '@playwright/test'
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    const consultaPedidoPage = new ConsultaPedidoPage(page)
    await consultaPedidoPage.abrir()
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {
    const pedido = {
      numero: 'VLO-EHWTGA',
      status: 'APROVADO' as const,
      modelo: 'Velo Sprint',
      cor: 'Midnight Black',
      rodas: 'sport Wheels',
      cliente: {
        nome: 'JUCIELLEN MORAES',
        email: 'juciellen@hotmail.com',
      },
      pagamento: 'A Vista',
    }

    const consultaPedidoPage = new ConsultaPedidoPage(page)

    // Act
    await consultaPedidoPage.buscarPorNumero(pedido.numero)

    // Assert
    await expect(consultaPedidoPage.resultadoDoPedido(pedido.numero)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${pedido.numero}
      - status:
        - img
        - text: ${pedido.status}
      - img "${pedido.modelo}"
      - paragraph: Modelo
      - paragraph: ${pedido.modelo}
      - paragraph: Cor
      - paragraph: ${pedido.cor}
      - paragraph: Rodas
      - paragraph: ${pedido.rodas}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${pedido.cliente.nome}
      - paragraph: Email
      - paragraph: ${pedido.cliente.email}
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${pedido.pagamento}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `)

    await consultaPedidoPage.validarStatus(pedido.numero, pedido.status)
  })
})
```

Por que este exemplo e bom:

- `beforeEach` prepara o contexto comum.
- O teste mostra claramente dado, acao e resultado esperado.
- O Page Object executa a acao, mas o spec continua expressando a regra de negocio.
- Dados dinamicos usam regex no snapshot.
- A validacao extra de status fica encapsulada no Page Object.

## 3. Spec bom para cenario negativo

Use cenario negativo para validar mensagens, estados vazios e dados inexistentes.

```ts
import { test } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage'

test.describe('Consulta de Pedido', () => {
  test('deve exibir mensagem quando o pedido nao e encontrado', async ({ page }) => {
    // Arrange
    const consultaPedidoPage = new ConsultaPedidoPage(page)
    const numeroInexistente = generateOrderCode()

    await consultaPedidoPage.abrir()

    // Act
    await consultaPedidoPage.buscarPorNumero(numeroInexistente)

    // Assert
    await consultaPedidoPage.validarPedidoNaoEncontrado()
  })
})
```

Por que este exemplo e bom:

- Usa dado gerado para reduzir risco de conflito.
- O teste nao depende de `waitForTimeout`.
- A mensagem esperada fica em metodo reutilizavel.

## 4. Spec bom com massa de dados

Use `forEach` quando varios cenarios possuem o mesmo fluxo e mudam apenas os dados.

```ts
import { test, expect } from '@playwright/test'
import { ConsultaPedidoPage, StatusPedido } from '../support/pages/ConsultaPedidoPage'

const pedidos: Array<{
  nomeDoTeste: string
  numero: string
  status: StatusPedido
  cor: string
}> = [
  {
    nomeDoTeste: 'aprovado',
    numero: 'VLO-EHWTGA',
    status: 'APROVADO',
    cor: 'Midnight Black',
  },
  {
    nomeDoTeste: 'reprovado',
    numero: 'VLO-GOUQJH',
    status: 'REPROVADO',
    cor: 'Lunar White',
  },
  {
    nomeDoTeste: 'em analise',
    numero: 'VLO-0YFPJY',
    status: 'EM_ANALISE',
    cor: 'Midnight Black',
  },
]

test.describe('Consulta de Pedido', () => {
  for (const pedido of pedidos) {
    test(`deve consultar um pedido ${pedido.nomeDoTeste}`, async ({ page }) => {
      // Arrange
      const consultaPedidoPage = new ConsultaPedidoPage(page)
      await consultaPedidoPage.abrir()

      // Act
      await consultaPedidoPage.buscarPorNumero(pedido.numero)

      // Assert
      await expect(consultaPedidoPage.resultadoDoPedido(pedido.numero)).toContainText(pedido.numero)
      await expect(consultaPedidoPage.resultadoDoPedido(pedido.numero)).toContainText(pedido.cor)
      await consultaPedidoPage.validarStatus(pedido.numero, pedido.status)
    })
  }
})
```

Quando usar:

- Bom quando o fluxo e identico.
- Evite se cada caso tiver regras muito diferentes.
- Os dados precisam ser simples de ler.

## 5. Helper bom

Helpers devem ser pequenos, sem dependencia da tela, e realmente reutilizaveis.

Arquivo:

```txt
playwright/support/helpers.ts
```

Exemplo:

```ts
export function generateOrderCode() {
  const prefix = 'VLO'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomPart = ''

  for (let index = 0; index < 6; index++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomPart += chars[randomIndex]
  }

  return `${prefix}-${randomPart}`
}
```

Use helper para:

- Gerar dados simples.
- Normalizar strings.
- Criar valores reutilizaveis.

Nao use helper para esconder fluxo de tela complexo. Nesse caso, prefira Page Object.

## 6. Locator bom vs locator fraco

Bom:

```ts
page.getByRole('button', { name: 'Buscar Pedido' })
page.getByRole('textbox', { name: 'Numero do Pedido' })
page.getByText('Pedido nao encontrado', { exact: true })
page.getByTestId(`order-result-${numero}`)
```

Aceitavel quando necessario:

```ts
page.locator('//label[text()="Numero do Pedido"]/..//input')
```

Fraco, evitar:

```ts
page.locator('.bg-primary > div:nth-child(2) button')
page.locator('div div div button').nth(3)
page.getByText('Pedido')
```

Regras:

- `getByText('Pedido')` sem `exact` pode passar no lugar errado.
- XPath so deve entrar quando role, label, text ou test id nao resolvem.
- Se o seletor vier do Codegen, revise antes de aceitar.

## 7. Assertion boa

Prefira validar comportamento observavel.

```ts
await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
await expect(page).toHaveTitle(/Velo/)
await expect(page.getByTestId(`order-result-${numero}`)).toContainText(numero)
```

Para estrutura da tela:

```ts
await expect(page.getByTestId(`order-result-${numero}`)).toMatchAriaSnapshot(`
  - paragraph: Pedido
  - paragraph: ${numero}
  - paragraph: Data do Pedido
  - paragraph: /\\d+\\/\\d+\\/\\d+/
`)
```

Evite:

```ts
await page.waitForTimeout(10000)
await expect(page.locator('body')).toContainText('Pedido')
```

## 8. Checklist antes de finalizar um teste

Antes de concluir, verifique:

- O teste esta em `playwright/e2e`.
- A tela repetida esta representada em Page Object.
- Os seletores seguem a prioridade: role, label, placeholder, text exato, test id, CSS/XPath.
- Nao ha `waitForTimeout`.
- Dados instaveis usam regex.
- O teste tem Arrange, Act e Assert claros.
- A mudanca foi a menor possivel.
- Foi executado o spec afetado, quando o ambiente permitir.
