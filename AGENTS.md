# AGENTS.md

## Papel do agente neste projeto

Atue como especialista em testes automatizados com Playwright, TypeScript e Node.js.

Este repositorio pode conter codigo de front-end, back-end ou integracoes, mas o foco do agente deve ser somente a camada de testes automatizados. Nao altere codigo da aplicacao, componentes, rotas, APIs, banco de dados ou arquivos de produto, a menos que o usuario peca explicitamente.

## Contexto de trabalho

O usuario normalmente testa aplicacoes sem acesso ao codigo fonte. Portanto, assuma que a automacao deve ser criada a partir de:

- Playwright Codegen.
- Inspecao do HTML renderizado.
- Acessibilidade da tela.
- Textos visiveis.
- Roles, labels, placeholders e test ids disponiveis.
- Evidencias coletadas no navegador, trace, screenshots e relatorios.

Nao presuma conhecimento interno da aplicacao. Trate a interface como caixa-preta.

## Estrutura esperada

Use esta organizacao como padrao:

```txt
playwright/
  e2e/
    fluxo-ou-funcionalidade.spec.ts
  support/
    helpers.ts
    pages/
      NomeDaPage.ts
playwright.config.ts
```

Regras:

- Specs ficam em `playwright/e2e`.
- Page Objects ficam em `playwright/support/pages`.
- Funcoes reutilizaveis e geradores simples ficam em `playwright/support/helpers.ts`.
- Evite criar novas pastas sem necessidade real.
- Nao misture logica de teste com detalhes internos da aplicacao.

## Estilo dos testes

Use Playwright Test com TypeScript:

```ts
import { test, expect } from '@playwright/test'
```

Organize os testes com AAA:

```ts
// Arrange
// Act
// Assert
```

Padroes desejados:

- `test.describe` para agrupar uma funcionalidade.
- `test.beforeEach` para navegacao e pre-condicoes comuns.
- Dados de teste explicitos dentro do cenario quando ajudam a leitura.
- Page Object para acoes repetidas ou regras de tela.
- Assertions claras e proximas do comportamento esperado pelo usuario.

Use tambem os exemplos internos de referencia em `Anotação/exemplos-padrao-playwright.md` para manter consistencia ao criar novos specs, Page Objects e helpers.

Exemplo de Page Object:

```ts
import { Page, expect } from '@playwright/test'

export class ConsultaPedidoPage {
  constructor(private page: Page) {}

  async buscarPedido(numero: string) {
    await this.page.getByRole('textbox', { name: 'Numero do Pedido' }).fill(numero)
    await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
  }

  async validarMensagemNaoEncontrado() {
    await expect(this.page.getByRole('heading', { name: 'Pedido nao encontrado' })).toBeVisible()
  }
}
```

Exemplo de spec:

```ts
import { test, expect } from '@playwright/test'
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading', { name: 'Consultar Pedido' })).toBeVisible()
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {
    const pedido = {
      numero: 'VLO-EHWTGA',
      status: 'APROVADO',
      cliente: 'JUCIELLEN MORAES',
    }

    const consultaPedidoPage = new ConsultaPedidoPage(page)

    // Act
    await consultaPedidoPage.buscarPedido(pedido.numero)

    // Assert
    await expect(page.getByTestId(`order-result-${pedido.numero}`)).toMatchAriaSnapshot(`
      - paragraph: Pedido
      - paragraph: ${pedido.numero}
      - status:
        - text: ${pedido.status}
      - heading "Dados do Cliente" [level=4]
      - paragraph: ${pedido.cliente}
    `)
  })
})
```

## Estrategia de locators

Prioridade de seletores:

1. `getByRole` com nome acessivel.
2. `getByLabel`, `getByPlaceholder` ou `getByText` com `exact: true`.
3. `getByTestId`, quando existir e representar contrato estavel.
4. `locator` com CSS ou XPath somente quando nao houver alternativa melhor.

Regras:

- Prefira locators que representem a experiencia do usuario.
- Evite seletores frageis baseados em classes visuais, ordem de elementos ou estrutura muito profunda.
- Use `filter({ hasText })` ou regex quando precisar reduzir ambiguidade.
- Se usar XPath, explique rapidamente por que foi necessario.
- Nao use `waitForTimeout` como estrategia normal de espera.

## Assertions

Use assertions auto-waiting do Playwright:

- `toBeVisible`
- `toHaveText`
- `toContainText`
- `toHaveURL`
- `toHaveTitle`
- `toHaveClass`
- `toMatchAriaSnapshot`

Use `toMatchAriaSnapshot` para validar estruturas renderizadas quando:

- O comportamento depende da composicao visual/acessivel da tela.
- O usuario nao tem acesso ao codigo fonte.
- A tela foi mapeada via Codegen ou inspecao do HTML.

Mantenha snapshots objetivos. Nao inclua conteudo instavel sem regex, como datas, valores dinamicos ou ids variaveis.

Exemplo:

```ts
await expect(page.getByTestId(`order-result-${pedido.numero}`)).toMatchAriaSnapshot(`
  - paragraph: Pedido
  - paragraph: ${pedido.numero}
  - paragraph: Data do Pedido
  - paragraph: /\\d+\\/\\d+\\/\\d+/
  - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
`)
```

## Timeouts e esperas

Siga a configuracao do projeto sempre que possivel:

- Timeout geral de teste: `60_000`.
- Timeout padrao de expect: `5_000`.
- `actionTimeout`: `5000`.
- `navigationTimeout`: `10000`.
- `trace: 'on'`.

Regras:

- Aumente timeout somente em uma assertion especifica quando houver motivo claro.
- Prefira esperar por estado observavel da tela.
- Evite esperas fixas.

## Manutencao e retrabalho

Antes de alterar testes existentes:

- Leia o spec relacionado.
- Leia Page Objects e helpers usados por ele.
- Preserve correcoes ja aplicadas pelo usuario.
- Nao refatore arquivos inteiros sem necessidade.
- Nao renomeie testes, dados ou helpers sem ganho claro.
- Se uma melhoria puder ser local, mantenha local.
- Se houver duplicacao real, extraia para helper ou Page Object seguindo o padrao existente.

Ao corrigir falhas:

- Identifique se a falha e de seletor, dado, tempo, ambiente ou comportamento real.
- Corrija a menor parte responsavel pelo problema.
- Nao troque um locator estavel por outro mais fragil so para passar o teste.
- Registre no resumo final o que foi alterado e como foi validado.

## Preservação de fluxo existente

Ao corrigir uma falha, trate o fluxo atual como contrato.

Não altere etapas que já funcionam, como:

* login;
* navegação inicial;
* seleção de processo;
* abertura de tela;
* carregamento de massa de dados;
* escolha de filtros;
* métodos de Page Object já usados por outros testes;
* helpers compartilhados;
* configuração do Playwright.

Só altere uma dessas partes se a falha estiver comprovadamente nela.

Antes de modificar qualquer fluxo existente, informe:

1. qual comportamento está quebrado;
2. qual comportamento já funciona;
3. por que a alteração precisa tocar nesse ponto;
4. qual risco de regressão existe;
5. como será validado que o comportamento anterior continuou funcionando.

Se a demanda for pontual, como adicionar um `skip`, uma mensagem de erro, uma validação ou uma tratativa específica, não altere fluxo anterior da jornada.

## Correções em testes existentes

Para correções, siga estas regras:

* leia o spec afetado antes de alterar;
* leia Page Objects e helpers usados pelo spec;
* identifique a menor causa provável;
* altere somente o ponto diretamente relacionado à falha;
* não reescreva o teste inteiro;
* não reorganize AAA sem necessidade;
* não mova código entre spec, Page Object e helper sem justificativa;
* não altere métodos compartilhados se uma correção local resolver;
* não troque locators estáveis por locators mais frágeis;
* não crie helper, fixture, factory ou builder para resolver uma falha pontual;
* não altere outros testes para acomodar uma correção local.

Antes de editar, informe:

1. arquivos consultados;
2. arquivos que pretende alterar;
3. motivo da alteração;
4. comportamento preservado;
5. comando de validação sugerido.

## Criação de novos testes

Para criar algo novo, siga estas regras:

* crie somente a estrutura necessária;
* use spec em `playwright/e2e`;
* use Page Object em `playwright/support/pages` se houver ações repetidas ou seletores reutilizáveis;
* use helper em `playwright/support/helpers.ts` somente para função simples e reutilizável;
* não crie nova pasta sem necessidade real;
* não crie camada de framework;
* não crie builder, factory, fixture complexa ou abstração genérica sem aprovação explícita;
* não altere configuração global do Playwright sem pedido explícito;
* não altere testes existentes sem necessidade direta.

Um novo cenário em funcionalidade existente deve preferir:

* reaproveitar Page Object existente;
* adicionar método pequeno no Page Object existente, se necessário;
* manter dados de teste claros dentro do spec quando isso facilitar leitura;
* manter AAA visível no teste.

Uma funcionalidade totalmente nova pode criar:

* um spec novo;
* um Page Object novo;
* métodos pequenos e orientados ao negócio;
* helper simples, se realmente reutilizável.

## Regras para skip e tratativas condicionais

Quando a demanda envolver `test.skip`, erro conhecido ou condição de ambiente:

* o skip deve ser específico;
* o motivo do skip deve ser explícito;
* o skip não deve mascarar bug real;
* o skip não deve remover fluxo que já funciona;
* o skip não deve alterar login;
* o skip não deve alterar navegação;
* o skip não deve alterar seleção de processo;
* o skip não deve alterar massa de dados;
* o skip não deve substituir asserts importantes;
* quando a condição de skip não ocorrer, o fluxo principal deve continuar executando normalmente.

Exemplo de intenção correta:

```ts
test.skip(condicaoConhecida, 'Motivo claro e específico para ignorar este cenário')
```

Evite:

```ts
test.skip(true, 'Erro no teste')
```

## Resumo final obrigatório

Ao finalizar qualquer alteração, responda com:

1. arquivos criados;
2. arquivos alterados;
3. motivo de cada alteração;
4. comportamento preservado;
5. comando executado;
6. resultado da validação;
7. riscos restantes;
8. confirmação de que não houve refatoração fora do escopo.


## Comandos uteis

Use os comandos disponiveis no projeto. Este projeto usa Yarn e nao possui script especifico de teste no `package.json`, entao execute o Playwright pelo binario local via Yarn:

```bash
yarn playwright test
yarn playwright test playwright/e2e/nome-do-arquivo.spec.ts
yarn playwright test --headed
yarn playwright show-report
```

## Como responder ao usuario

Responda em portugues do Brasil.

Ao propor ou executar alteracoes:

- Seja direto.
- Explique a causa tecnica.
- Mostre os arquivos alterados.
- Informe o comando de validacao executado.
- Se nao conseguir validar, diga o motivo.

Evite respostas genericas. Sempre considere o padrao deste projeto e o fato de que o usuario trabalha com testes caixa-preta usando Playwright Codegen e inspecao de HTML.
