# 📊 Análise do Projeto de Testes Automatizados (Playwright)

A estrutura geral do projeto está **bem organizada**, com uma separação clara entre:
- **e2e** (cenários de teste)
- **support** (helpers reutilizáveis)

O uso do padrão **AAA (Arrange, Act, Assert)** está correto e consistente 👍  
Dito isso, há **oportunidades claras de melhoria**, principalmente na **fase Act**, que hoje está bastante **repetitiva**.

---

## 🔎 Diagnóstico Geral (foco na fase *Act*)

### Padrão atual observado
Em praticamente todos os testes, a fase **Act** repete exatamente os mesmos passos:

```ts
await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
await page.getByRole('button', { name: 'Buscar Pedido' }).click()
````

Isso acontece em:

* Pedido aprovado
* Pedido reprovado
* Pedido em análise
* Pedido inexistente

📌 **Problemas gerados por isso**

* Duplicação de código
* Maior custo de manutenção (se o seletor mudar, vários testes quebram)
* Testes mais longos e menos legíveis
* A intenção do teste fica “escondida” nos detalhes técnicos

---

## 🎯 Objetivo das melhorias propostas

* **Centralizar a lógica da fase Act**
* Tornar os testes mais **expressivos**
* Facilitar manutenção e evolução
* Reaproveitar comportamento sem tocar nos dados de teste (`order`)

---

## ✅ Proposta 1 — Criar um *step helper* para a fase Act

Como você **já possui** um diretório `support/helpers.ts`, ele é o local ideal para isso.

### Exemplo de helper reutilizável

```ts
// support/helpers.ts
import { Page } from '@playwright/test'

export async function consultarPedido(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}
```

---

### Uso no teste

```ts
// Act
await consultarPedido(page, order.number)
```

📈 **Ganhos imediatos**

* Código da fase Act fica com **1 linha**
* Mudança de seletor impacta **um único lugar**
* Leitura do teste fica muito mais clara

---

## ✅ Proposta 2 — Semântica melhor: helpers orientados ao negócio

Você pode ir além do técnico e dar **significado de negócio** ao step.

### Exemplo

```ts
export async function buscarPedidoPorNumero(page: Page, numero: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(numero)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}
```

No teste:

```ts
// Act
await buscarPedidoPorNumero(page, order.number)
```

💡 Isso aproxima o teste da **linguagem do usuário** e não da implementação.

---

## ✅ Proposta 3 — Evolução natural: Page Object (opcional)

Se esse fluxo crescer (ex: filtros, múltiplas ações), o próximo passo natural é um **Page Object**.

### Exemplo de `ConsultaPedidoPage`

```ts
export class ConsultaPedidoPage {
  constructor(private page: Page) {}

  async buscarPedido(numero: string) {
    await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(numero)
    await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
  }
}
```

Uso no teste:

```ts
const consultaPedido = new ConsultaPedidoPage(page)

// Act
await consultaPedido.buscarPedido(order.number)
```

📌 Essa abordagem escala melhor quando:

* Há muitos testes usando a mesma tela
* A tela começa a ter mais comportamentos

---

## 🧠 Observação importante sobre o Arrange

Você já usa `beforeEach` muito bem para:

* Navegação
* Validação de contexto inicial

Isso **combina perfeitamente** com a extração da fase Act, deixando o teste assim:

```ts
// Arrange (beforeEach)
// Act
await buscarPedidoPorNumero(page, order.number)
// Assert
...
```

O fluxo fica limpo, previsível e didático.

---

## 🏁 Conclusão

### O que está bom ✅

* Estrutura do projeto
* Uso correto de AAA
* Testes legíveis e bem descritos
* Assertivas robustas

### O que melhorar 🚀

* **Reúso na fase Act**
* Centralização de seletores
* Semântica orientada ao negócio

### Melhor próximo passo

👉 Criar **helpers de ação** (`consultarPedido`, `buscarPedidoPorNumero`)
👉 Evoluir para **Page Object** se a tela crescer

Se quiser, no próximo passo posso:

* Refatorar **todo o arquivo `pedidos.spec.ts`**
* Propor um **padrão definitivo de helpers**
* Analisar também o `online.spec.ts`

Só me dizer 😉