# Documento de Casos de Teste — Velô Sprint (Configurador de Veículo Elétrico)

**Sistema:** Velô Sprint — Configurador de Veículo Elétrico  
**Tipo de Aplicação:** SPA (Single Page Application) em React com TypeScript, Tailwind CSS e Zustand  
**Perfil do Usuário:** Cliente (Usuário Comum / Caixa-Preta)  
**Módulos Cobertos:** Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito Automática, Confirmação e Consulta de Pedidos  
**Versão do Documento:** 1.0  

---

## 1. Introdução e Análise do Sistema

O **Velô Sprint** é uma aplicação web interativa que permite ao usuário conhecer, configurar, simular financiamento, realizar o pedido de compra e consultar o histórico/status de compra de um veículo elétrico.  
Com base na análise estática de todo o código da aplicação (`src/store/configuratorStore.ts`, `src/pages/`, `src/components/`), foram identificadas as seguintes regras de negócio, contratos e comportamentos:

### 1.1. Regras de Precificação (`configuratorStore.ts`)
- **Valor Base do Veículo:** R$ 40.000,00 (`BASE_PRICE = 40000`).
- **Cores Externas (`exteriorColor`):**  
  - *Glacier Blue* (`glacier-blue`, cor padrão) — +R$ 0,00  
  - *Midnight Black* (`midnight-black`) — +R$ 0,00  
  - *Lunar White* (`lunar-white`) — +R$ 0,00  
- **Cores Internas (`interiorColor`):**  
  - *Carbon Black* (`carbon-black`, cor padrão) — +R$ 0,00  
  - *Deep Blue* (`deep-blue`) — +R$ 0,00  
- **Rodas (`wheelType`):**  
  - *Aero Wheels* (`aero`, padrão) — +R$ 0,00  
  - *Sport Wheels* (`sport`) — +R$ 2.000,00 (`SPORT_WHEELS_PRICE = 2000`)  
- **Opcionais (`optionals`):**  
  - *Precision Park* (`precision-park`) — +R$ 5.500,00 (`PRECISION_PARK_PRICE = 5500`)  
  - *Flux Capacitor* (`flux-capacitor`) — +R$ 5.000,00 (`FLUX_CAPACITOR_PRICE = 5000`)  
- **Preço Máximo Configurado:** R$ 52.500,00 (40.000 + 2.000 + 5.500 + 5.000).

### 1.2. Regras de Pagamento e Juros de Financiamento (`Order.tsx` / `configuratorStore.ts`)
- **Pagamento À Vista (`avista`):** Não exige análise de crédito e o pedido é aprovado automaticamente com o valor total configurado.
- **Pagamento Financiado (`financiamento`):**
  - Financiamento fixo em **12x** com taxa de juros compostos fixa de **2% ao mês**.
  - O valor a financiar é calculado pela diferença entre o valor total do veículo e o valor de entrada informado pelo cliente (`amountToFinance = Math.max(0, totalPrice - entryValue)`).
  - O valor da parcela de exibição no Checkout é acrescido do fator de financiamento (`installmentValue = (amountToFinance / 12) * 1.02`), totalizando `entryValue + (installmentValue * 12)`.

### 1.3. Regras de Análise de Crédito Automática (`Order.tsx`)
A análise de crédito ocorre apenas na modalidade **Financiamento**, consultando o serviço de score via CPF:
1. **Regra de Exceção por Entrada Alta (Prioridade 1):** SE Entrada &ge; 50% do valor total DO pedido E Score &lt; 700 &rarr; Status **APROVADO** (ignora o score baixo).
2. **Score Alto (Prioridade 2):** SE Score &gt; 700 &rarr; Status **APROVADO**.
3. **Score Médio (Prioridade 3):** SE Score entre 501 e 700 (inclusive) &rarr; Status **EM_ANALISE**.
4. **Score Baixo (Prioridade 4):** SE Score &le; 500 (e Entrada &lt; 50%) &rarr; Status **REPROVADO**.

### 1.4. Segurança e Privacidade na Consulta de Pedidos (`OrderLookup.tsx`)
- A consulta exige estritamente o código do pedido (`order_number`, ex.: `VLO-EHWTGA`).
- O botão de busca permanece desabilitado enquanto o campo estiver vazio ou preenchido apenas com espaços em branco.
- Pedidos inexistentes ou com formato incorreto exibem a mensagem de retorno *"Pedido não encontrado"*, protegendo a listagem indevida de pedidos de outros clientes.

---

## 2. Casos de Teste

---

### CT01 - Navegação da Landing Page para o Configurador de Veículo (Fluxo Feliz)

#### Objetivo
Validar que o usuário consegue navegar da página inicial (Landing Page) para a tela do Configurador de Veículo ao clicar no botão principal de chamada para ação (CTA).

#### Pré-Condições
- O sistema deve estar acessível pelo navegador na URL raiz (`/`).
- O usuário não necessita de autenticação prévia.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a URL raiz do sistema (`http://localhost:5173/`). | A página inicial é carregada com sucesso, exibindo o elemento com `data-testid="landing-page"`. |
| 2  | Localizar o botão principal de configuração (ex.: *"Configurar Agora"* no cabeçalho ou na seção Hero). | O botão deve estar visível, clicável e com rótulo acessível claro. |
| 3  | Clicar no botão *"Configurar Agora"*. | O sistema redireciona para a rota `/configure` e carrega o painel de configuração do veículo. |

#### Resultados Esperados
- O sistema deve redirecionar o navegador para a URL de configuração (`/configure`).
- A tela do configurador é apresentada exibindo o estágio do veículo (`CarStage`) e o painel de configuração (`ConfigPanel`).

#### Critérios de Aceitação
- A URL final deve ser exatamente `/configure`.
- O cabeçalho do configurador com o título *"Velô Sprint"* deve estar visível.
- As opções padrão de cor (*Glacier Blue*) e rodas (*Aero Wheels*) devem iniciar selecionadas.

---

### CT02 - Navegação da Landing Page para Consulta de Pedidos (Fluxo Feliz)

#### Objetivo
Validar que o usuário consegue navegar da página inicial para a página de Consulta de Pedidos.

#### Pré-Condições
- O sistema deve estar acessível pelo navegador na URL raiz (`/`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a URL raiz do sistema (`http://localhost:5173/`). | A Landing Page é carregada corretamente. |
| 2  | No cabeçalho da página, clicar no link/botão acessível *"Consultar Pedido"*. | O sistema redireciona para a rota `/lookup`. |

#### Resultados Esperados
- O navegador exibe a rota `/lookup`.
- O formulário de consulta com o campo *"Número do Pedido"* (`#order-id`) e o botão *"Buscar Pedido"* é apresentado.

#### Critérios de Aceitação
- A URL final deve corresponder a `/lookup`.
- O cabeçalho *"Consultar Pedido"* (`heading`) deve estar visível.
- O campo de texto para número de pedido deve estar habilitado para digitação.

---

### CT03 - Interação com Seções Informativas da Landing Page (Especificações e FAQ)

#### Objetivo
Validar que as seções informativas de especificações técnicas do veículo e o perguntas frequentes (FAQ) são interativas e exibem seus respectivos conteúdos corretamente.

#### Pré-Condições
- O usuário está na Landing Page (`/`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Rolar a página até a seção de Especificações Técnicas (`SpecsSection`). | Os cards de especificações (autonomia, velocidade máxima, aceleração) estão visíveis. |
| 2  | Rolar até a seção de Perguntas Frequentes (`FAQSection`). | A lista de perguntas frequentes é exibida no formato acordeão. |
| 3  | Clicar em uma pergunta do FAQ para expandir a resposta. | O painel do acordeão se abre, exibindo o texto explicativo correspondente. |

#### Resultados Esperados
- Todas as especificações técnicas básicas do Velô Sprint são renderizadas sem quebra visual.
- Os itens do FAQ respondem aos cliques, expandindo e recolhendo corretamente as respostas.

#### Critérios de Aceitação
- Nenhuma exceção de console deve ocorrer ao interagir com o acordeão de FAQ.
- Os textos informativos das especificações e respostas de FAQ devem ser legíveis e acessíveis via leitores de tela.

---

### CT04 - Configuração Padrão do Veículo e Cálculo Inicial (Fluxo Feliz)

#### Objetivo
Validar que o Configurador do Veículo carrega com as configurações padrão iniciais e calcula corretamente o preço base de R$ 40.000,00.

#### Pré-Condições
- O usuário deve estar na página do Configurador (`/configure`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a página `/configure`. | O painel de configuração (`ConfigPanel`) é carregado. |
| 2  | Verificar a cor externa padrão selecionada. | A opção *Glacier Blue* (`data-testid="color-option-glacier-blue"`) está ativa. |
| 3  | Verificar o tipo de roda padrão selecionado. | A opção *Aero Wheels* (`data-testid="wheel-option-aero"`) está ativa. |
| 4  | Verificar as caixas de seleção dos opcionais (*Precision Park* e *Flux Capacitor*). | Ambas as caixas de seleção de opcionais iniciam desmarcadas. |
| 5  | Verificar o preço total exibido na tela. | O valor total exibido deve ser de **R$ 40.000,00** (`formatPrice(BASE_PRICE)`). |

#### Resultados Esperados
- A configuração inicial em estado limpo (`glacier-blue`, `carbon-black`, `aero`, `[]`) é mantida na store e refletida na interface do usuário.

#### Critérios de Aceitação
- O valor apresentado deve ser formatado no padrão monetário brasileiro: `R$ 40.000,00`.
- Nenhuma taxa adicional deve estar somada sem seleção explícita.

---

### CT05 - Alteração de Rodas para "Sport Wheels" e Atualização de Precificação (Fluxo Feliz)

#### Objetivo
Validar que a seleção de *Sport Wheels* adiciona R$ 2.000,00 ao valor base do veículo e altera o modelo visual exibido.

#### Pré-Condições
- O usuário está na tela do Configurador (`/configure`) com a configuração inicial de R$ 40.000,00.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na seção "Rodas" (`data-testid="section-rodas"`), clicar na opção *Sport Wheels* (`data-testid="wheel-option-sport"`). | A opção *Sport Wheels* torna-se selecionada. |
| 2  | Verificar o recálculo imediato do valor total do veículo. | O preço total exibe **R$ 42.000,00** (R$ 40.000 base + R$ 2.000 rodas). |
| 3  | Verificar a exibição da imagem/estágio do carro (`CarStage`). | A imagem visualizada é atualizada para o veículo com rodas esportivas. |

#### Resultados Esperados
- O estado de `wheelType` é atualizado para `sport`.
- O valor total apresentado aumenta exatamente R$ 2.000,00.

#### Critérios de Aceitação
- O valor formatado de saída deve ser `R$ 42.000,00`.
- O botão para prosseguir com o pedido (`Avançar` ou `Finalizar Pedido`) deve manter-se habilitado.

---

### CT06 - Adição de Opcionais "Precision Park" e "Flux Capacitor" (Fluxo Feliz — Precificação Máxima)

#### Objetivo
Validar a soma cumulativa de preços ao adicionar múltiplos pacotes opcionais (*Precision Park* +R$ 5.500,00 e *Flux Capacitor* +R$ 5.000,00) com *Sport Wheels* (+R$ 2.000,00), atingindo o valor total máximo de R$ 52.500,00.

#### Pré-Condições
- O usuário está em `/configure` com *Sport Wheels* selecionado (total de R$ 42.000,00).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na seção "Opcionais" (`data-testid="section-opcionais"`), marcar a caixa de seleção de *Precision Park* (`data-testid="opt-precision-park"`). | O opcional é marcado e o preço atualiza para **R$ 47.500,00** (R$ 42.000 + R$ 5.500). |
| 2  | Marcar a caixa de seleção de *Flux Capacitor* (`data-testid="opt-flux-capacitor"`). | O opcional é marcado e o preço atualiza para **R$ 52.500,00** (R$ 47.500 + R$ 5.000). |
| 3  | Clicar no botão para prosseguir para a tela de Pedido/Checkout. | O sistema navega para `/order` preservando a configuração completa. |

#### Resultados Esperados
- Todos os opcionais são marcados simultaneamente na store do usuário.
- A tela de Checkout recebe o valor final correto de R$ 52.500,00.

#### Critérios de Aceitação
- O preço total exibido no Configurador e no resumo do Checkout deve ser `R$ 52.500,00`.
- Os opcionais *Precision Park* e *Flux Capacitor* devem constar na lista de itens selecionados.

---

### CT07 - Remoção (Desmarcação) de Opcional Selecionado e Recálculo Dinâmico (Fluxo Alternativo)

#### Objetivo
Validar que a remoção de um opcional previamente selecionado subtrai corretamente o seu valor do preço total.

#### Pré-Condições
- O usuário está em `/configure` com o opcional *Precision Park* (+R$ 5.500,00) selecionado (preço total de R$ 45.500,00).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na seção "Opcionais", clicar na caixa de seleção marcada de *Precision Park* (`data-testid="opt-precision-park"`). | O checkbox é desmarcado com sucesso. |
| 2  | Verificar a atualização automática do valor total na tela. | O preço total é reduzido para **R$ 40.000,00** (preço base). |

#### Resultados Esperados
- O item *Precision Park* é removido do array `optionals` do estado.
- O sistema recalcula o valor para o novo estado sem erros de arredondamento ou inconsistências.

#### Critérios de Aceitação
- A interface deve exibir `R$ 40.000,00`.
- O checkbox de *Precision Park* deve constar visualmente como desmarcado.

---

### CT08 - Navegação para o Checkout e Preservação de Estado da Configuração (Fluxo Feliz)

#### Objetivo
Validar que a transição da tela de Configurador (`/configure`) para o formulário de Checkout (`/order`) transfere integralmente a configuração e o preço calculados na store.

#### Pré-Condições
- O usuário configurou o veículo com cor *Midnight Black*, *Sport Wheels* e opcional *Flux Capacitor* (Valor total: R$ 47.000,00).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | No Configurador, clicar no botão de finalizar/avançar para o pedido. | O usuário é direcionado para a rota `/order`. |
| 2  | Verificar o título do cabeçalho da página de Checkout. | O título *"Finalizar Pedido"* é exibido corretamente. |
| 3  | Verificar as informações do resumo de configuração apresentadas em `/order`. | O modelo *Midnight Black*, *Sport Wheels*, opcional *Flux Capacitor* e o total **R$ 47.000,00** estão exibidos. |

#### Resultados Esperados
- Os dados configurados na store persistida do Zustand permanecem inalterados ao carregar a página `/order`.

#### Critérios de Aceitação
- O valor base para cálculo de pagamento em `/order` deve ser idêntico ao configurado em `/configure`.
- O usuário pode retornar ao configurador pelo botão de voltar (`ArrowLeft`) sem perder suas seleções.

---

### CT09 - Finalização de Pedido com Pagamento "À Vista" (Fluxo Feliz — Aprovado)

#### Objetivo
Validar a criação bem-sucedida de um pedido utilizando o método de pagamento **À Vista**, garantindo que o pedido é aprovado automaticamente sem consulta de crédito.

#### Pré-Condições
- O usuário está na página `/order` com a configuração de um veículo no valor total de R$ 40.000,00.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher o campo *Nome* (`#name` ou `getByLabel('Nome')`) com `"Juciellen"`. | Campo preenchido sem erros. |
| 2  | Preencher o campo *Sobrenome* (`#surname` ou `getByLabel('Sobrenome')`) com `"Moraes"`. | Campo preenchido sem erros. |
| 3  | Preencher o campo *Email* (`#email`) com `"juciellen@velo.dev"`. | Campo preenchido com e-mail válido. |
| 4  | Preencher o campo *Telefone* (`#phone`) com `"(11) 99999-9999"`. | A máscara de telefone é aplicada corretamente. |
| 5  | Preencher o campo *CPF* (`#cpf`) com `"123.456.789-00"`. | A máscara de CPF é aplicada corretamente. |
| 6  | Selecionar a loja de retirada no campo *Loja* (`#store` / `Select`) escolhendo `"Velô Paulista - Av. Paulista, 1000"`. | A loja é selecionada. |
| 7  | No método de pagamento, manter selecionada a opção padrão **À Vista** (`avista`). | Nenhuma opção de entrada ou parcelamento é exibida. |
| 8  | Marcar o checkbox de aceite dos termos de uso (`terms`). | O checkbox é marcado. |
| 9  | Clicar no botão de submissão do formulário (`"Confirmar Pedido"` / `"Finalizar Pedido"`). | O pedido é processado no backend e o sistema redireciona para a tela `/success`. |

#### Resultados Esperados
- O pedido é gravado com sucesso com status **`APROVADO`**.
- O navegador redireciona para a rota `/success` enviando o objeto `order` através do estado de roteamento.

#### Critérios de Aceitação
- O título na tela de sucesso deve ser *"Pedido Aprovado!"* (`data-testid="success-status"`).
- O número identificador do pedido (`data-testid="order-id"`, formato `VLO-XXXXXX`) deve ser gerado e exibido.
- A store deve ser redefinida (`resetConfiguration`) após a conclusão do pedido.

---

### CT10 - Validação de Campos Obrigatórios Vazios no Formulário de Checkout (Dados Inválidos/Incompletos)

#### Objetivo
Validar que a tentativa de submissão do formulário de Checkout em branco bloqueia o envio e apresenta mensagens informativas de erro para cada campo obrigatório.

#### Pré-Condições
- O usuário está na tela `/order` e não preencheu nenhum dado do formulário.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Com todos os campos vazios e o checkbox de termos desmarcado, clicar direto no botão de submissão do pedido. | O sistema intercepta o envio via validação do schema Zod e não navega para `/success`. |
| 2  | Verificar a presença das mensagens de validação sob cada campo obrigatório. | São exibidas mensagens de texto alertando sobre a obrigatoriedade dos campos. |

#### Resultados Esperados
- O formulário não é enviado para o servidor.
- Mensagens de erro de validação correspondentes às regras do Zod aparecem na tela:
  - *"Nome deve ter pelo menos 2 caracteres"*
  - *"Sobrenome deve ter pelo menos 2 caracteres"*
  - *"Email inválido"*
  - *"Telefone inválido"*
  - *"CPF inválido"*
  - *"Selecione uma loja"*
  - *"Aceite os termos"*

#### Critérios de Aceitação
- O usuário deve permanecer na rota `/order`.
- Nenhuma requisição de criação de pedido deve ser enviada ao backend.

---

### CT11 - Validação de Formatos Inválidos de Email, Telefone e CPF no Checkout (Dados Inválidos)

#### Objetivo
Validar que campos preenchidos com formatos inválidos (e-mail sem domínio, CPF incompleto e telefone com dígitos insuficientes) são recusados pela validação.

#### Pré-Condições
- O usuário está em `/order`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher *Nome* e *Sobrenome* com `"Ana"` e `"Silva"`. | Dados aceitos nos campos de nome. |
| 2  | Preencher *Email* com o texto incompleto `"email-invalido-sem-arroba"`. | O campo de e-mail recebe o texto. |
| 3  | Preencher *Telefone* apenas com `"119999"`. | O campo de telefone não atinge o tamanho de 14 caracteres com máscara. |
| 4  | Preencher *CPF* apenas com `"123.456"`. | O campo não atinge os 14 caracteres com máscara. |
| 5  | Selecionar uma loja e marcar os termos. | Loja e termos configurados. |
| 6  | Clicar no botão de envio do pedido. | A submissão é bloqueada pelo sistema. |

#### Resultados Esperados
- A validação aponta erros para os campos `email`, `phone` e `cpf`.
- As mensagens *"Email inválido"*, *"Telefone inválido"* e *"CPF inválido"* são exibidas na interface.

#### Critérios de Aceitação
- O envio não é realizado e os dados preenchidos permanecem nos inputs para correção pelo cliente.

---

### CT12 - Submissão do Pedido sem Aceite dos Termos de Uso (Campos Obrigatórios)

#### Objetivo
Validar que o não preenchimento (desmarcação) da caixa de seleção de Termos de Uso impede a finalização da compra, mesmo com todos os outros campos corretos.

#### Pré-Condições
- O usuário preencheu corretamente *Nome*, *Sobrenome*, *Email*, *Telefone*, *CPF*, *Loja* e escolheu o método de pagamento.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Manter a caixa de seleção de Termos de Uso (`terms`) desmarcada. | A caixa permanece sem marcação de verificação. |
| 2  | Clicar em *"Confirmar Pedido"*. | O sistema impede a navegação e avisa sobre o termo obrigatório. |

#### Resultados Esperados
- É apresentada a mensagem de erro: *"Aceite os termos"*.
- O pedido não é criado na store nem no backend.

#### Critérios de Aceitação
- O botão de confirmação não deve iniciar o estado de carregamento (`isSubmitting`) quando os termos não estiverem aceitos.

---

### CT13 - Financiamento com Score Alto (> 700) e Entrada Inferior a 50% (Fluxo Feliz — Aprovado)

#### Objetivo
Validar o cálculo de parcelamento em 12x com juros compostos de 2% a.m. e a aprovação de crédito automática para um cliente com score superior a 700 (ex.: Score 850).

#### Pré-Condições
- Veículo configurado no valor de **R$ 40.000,00**.
- A API de análise de crédito retorna `score: 850` (Score > 700) para o CPF informado.
- O cliente preenche entrada de **R$ 10.000,00** (25% do valor total, ou seja, Entrada < 50%).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Em `/order`, selecionar o método de pagamento **Financiamento** (`financiamento`). | O campo para informar o valor da entrada (`entryValue`) e a previsão de parcelas em 12x é exibido. |
| 2  | Preencher o campo de entrada com o valor `"10000"`. | O sistema calcula o valor financiado (R$ 30.000) e exibe o valor em 12 parcelas. |
| 3  | Preencher os demais dados cadastrais corretamente e aceitar os termos. | Todos os dados validados com sucesso. |
| 4  | Clicar em *"Confirmar Pedido"*. | A requisição à função `credit-analysis` é disparada e o score 850 é retornado. |

#### Resultados Esperados
- Pela Regra 2 (`score > 700`), o status do pedido é classificado como **`APROVADO`**.
- O sistema redireciona para a tela de Sucesso (`/success`) exibindo o título *"Pedido Aprovado!"* e o resumo das parcelas em 12x.

#### Critérios de Aceitação
- O cálculo da parcela deve refletir a regra do store: `(30.000 / 12) * 1.02 = R$ 2.550,00` por mês.
- O total do pedido salvo deve corresponder a Entrada (10.000) + Total Financiado (12 * 2.550 = 30.600) = **R$ 40.600,00**.

---

### CT14 - Financiamento com Score Médio (501 a 700) e Entrada Inferior a 50% (Fluxo Alternativo — Em Análise)

#### Objetivo
Validar que uma análise de crédito que retorne score entre 501 e 700 (inclusive) resulta no estado de pedido **`EM_ANALISE`**, desde que a entrada seja menor que 50% do total.

#### Pré-Condições
- Veículo configurado com valor total de R$ 40.000,00.
- CPF de teste configurado para retornar `score: 650` (Score Médio: 501 a 700).
- Entrada informada de R$ 5.000,00 (12,5% do total, Entrada < 50%).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Em `/order`, selecionar **Financiamento** e preencher entrada de R$ 5.000,00. | Resumo de parcelamento é atualizado na tela. |
| 2  | Preencher formulário cadastral de forma correta e aceitar os termos. | Formulário válido. |
| 3  | Submeter o pedido. | O serviço de crédito retorna score 650 e o sistema avalia as regras. |

#### Resultados Esperados
- Como Entrada (12,5%) &lt; 50% e 501 &le; Score &le; 700, a Regra 3 é disparada e o status atribuído é **`EM_ANALISE`**.
- O pedido é gravado na store com status `EM_ANALISE`.
- O usuário é redirecionado para a tela `/success` apresentando o status da avaliação.

#### Critérios de Aceitação
- A tela final deve indicar que o pedido foi registrado e está pendente/em análise de crédito.
- O número do pedido gerado deve estar disponível para consultas futuras na página `/lookup`.

---

### CT15 - Financiamento com Score Baixo (<= 500) e Entrada Inferior a 50% (Cenário Negativo — Reprovado)

#### Objetivo
Validar que clientes com score de crédito abaixo ou igual a 500 sem entrada de garantia (&lt; 50%) têm seu crédito reprovado automaticamente.

#### Pré-Condições
- Veículo configurado em R$ 40.000,00.
- A API de crédito retorna `score: 420` (Score &le; 500) para o CPF informado.
- Entrada informada de R$ 10.000,00 (25% do total).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Em `/order`, selecionar **Financiamento** e informar entrada de R$ 10.000,00. | Valor remanescente calculado para 12x. |
| 2  | Preencher corretamente os campos de dados do cliente e marcar os termos. | Dados prontos para submissão. |
| 3  | Clicar em *"Confirmar Pedido"*. | O sistema processa o pedido e consulta o score 420. |

#### Resultados Esperados
- A Regra 4 (`score <= 500`) entra em vigor: o status atribuído ao pedido é **`REPROVADO`**.
- O sistema direciona para `/success` exibindo a interface de reprovação.

#### Critérios de Aceitação
- O título apresentado em `/success` deve ser **"Crédito Reprovado"** com ícone em vermelho (`XCircle`).
- A mensagem explicativa deve orientar: *"Infelizmente seu crédito não foi aprovado. Tente novamente com pagamento à vista."*

---

### CT16 - Exceção na Aprovação de Crédito — Entrada >= 50% com Score Baixo (< 700) (Regra de Negócio Especial — Aprovado)

#### Objetivo
Validar a regra de exceção de crédito que aprova **automaticamente** o pedido independentemente de score baixo (&lt; 700), desde que o cliente ofereça uma entrada igual ou superior a 50% do valor total do veículo.

#### Pré-Condições
- Veículo configurado em **R$ 40.000,00**.
- A API de crédito retorna `score: 450` (Score baixo, que normalmente causaria reprovação).
- O cliente preenche entrada de **R$ 20.000,00** (exatamente 50% do valor total do veículo).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Em `/order`, escolher método de pagamento **Financiamento**. | O formulário exibe o campo de entrada. |
| 2  | Informar no campo de entrada o valor `"20000"` (50% do preço de R$ 40.000,00). | O cálculo mostra que R$ 20.000,00 serão financiados. |
| 3  | Preencher os dados pessoais, endereço de loja e aceitar os termos de uso. | Formulário válido. |
| 4  | Submeter o pedido para avaliação de crédito. | O backend é consultado e retorna o score 450. |

#### Resultados Esperados
- Pela Regra 1 (`entryPercentage >= 0.5 && score < 700`), o sistema concede exceção e atribui o status **`APROVADO`**.
- O pedido é gravado no sistema como aprovado com sucesso.

#### Critérios de Aceitação
- A tela `/success` deve exibir o título em verde **"Pedido Aprovado!"** (`data-testid="success-status"`).
- O cliente pode seguir para a tela de Consulta (`/lookup`) onde o pedido constará com a badge verde de aprovado.

---

### CT17 - Falha na Integração/Consulta com API de Análise de Crédito (Cenário de Erro / Indisponibilidade)

#### Objetivo
Validar que falhas na API do serviço de análise de crédito (erro de rede ou indisponibilidade da Supabase Edge Function `credit-analysis`) são tratadas de forma elegante na interface sem quebrar o sistema.

#### Pré-Condições
- A API `credit-analysis` está indisponível ou configurada para retornar erro/timeout.
- O cliente selecionou o modo **Financiamento** em `/order`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher todos os campos obrigatórios do formulário em `/order` no modo Financiamento. | Formulário válido. |
| 2  | Clicar no botão para submeter o pedido. | O sistema exibe o estado de carregamento (`Loader2`) e tenta chamar o serviço de crédito. |
| 3  | Simular ou aguardar a resposta de falha/erro do serviço de crédito. | O erro é capturado pelo bloco `try/catch` da aplicação. |

#### Resultados Esperados
- O pedido **não** é gravado no sistema nem avança para `/success`.
- Uma notificação (Toast) do tipo destrutivo (`variant: 'destructive'`, `data-testid="toast-error"`) é exibida na tela com a mensagem:
  - Título: *"Erro"*
  - Descrição: *"Falha ao consultar análise de crédito. Verifique seus dados ou tente mais tarde."*

#### Critérios de Aceitação
- O estado de carregamento do botão (`isSubmitting`) deve ser finalizado, retornando ao estado normal habilitado.
- Nenhuma exceção não tratada deve aparecer no console do navegador.

---

### CT18 - Visualização da Tela de Confirmação para Pedido Aprovado (Fluxo Feliz)

#### Objetivo
Validar que a tela de Confirmação (`/success`) renderiza perfeitamente todos os dados cadastrais, resumo de valores e o código gerado do pedido para transações aprovadas.

#### Pré-Condições
- O cliente concluiu um pedido (à vista ou financiado) que obteve status `APROVADO`.
- O navegador foi direcionado para a rota `/success` com os dados em `location.state.order`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Verificar o ícone e título principal de aprovação. | Ícone `CheckCircle` verde e título *"Pedido Aprovado!"* (`data-testid="success-status"`) são exibidos. |
| 2  | Verificar a renderização do card de resumo do veículo. | A imagem da configuração correta, cor externa, cor interna e tipo de rodas estão detalhados no resumo. |
| 3  | Verificar o valor total apresentado e, em caso de financiamento, o detalhe das parcelas. | O preço total está formatado corretamente em Real (`R$ XX.XXX,XX`) com as parcelas de 12x informadas. |
| 4  | Verificar a exibição dos dados de pedido (`data-testid="order-id"`) e dados do cliente. | Código do pedido, Nome completo do cliente, E-mail e Loja de retirada são exibidos corretamente. |
| 5  | Verificar a presença e funcionamento dos botões de ação na tela. | Os botões *"Consultar Pedido"* (`data-testid="goto-consultar"`) e *"Configurar Outro"* (`data-testid="configure-another"`) estão visíveis e funcionais. |

#### Resultados Esperados
- Todas as informações visuais e textuais correspondem exatamente ao pedido criado no passo anterior.

#### Critérios de Aceitação
- O clique em *"Consultar Pedido"* deve levar à rota `/lookup`.
- O clique em *"Configurar Outro"* deve levar à rota `/configure` e redefinir a store (`resetConfiguration`).

---

### CT19 - Visualização da Tela de Confirmação para Pedido Reprovado / Em Análise (Fluxo Alternativo/Negativo)

#### Objetivo
Validar a interface da tela de confirmação (`/success`) quando um pedido financiado não obtém aprovação automática (`REPROVADO` ou `EM_ANALISE`).

#### Pré-Condições
- O cliente submeteu um pedido financiado que foi classificado como `REPROVADO` no cálculo de score.
- O navegador foi roteado para `/success`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Verificar a cor do texto e o ícone na tela de confirmação. | O ícone `XCircle` em vermelho e o título *"Crédito Reprovado"* (`data-testid="success-status"`) aparecem com destaque. |
| 2  | Ler a mensagem secundária explicativa exibida sob o título. | O texto *"Infelizmente seu crédito não foi aprovado. Tente novamente com pagamento à vista."* é apresentado de forma legível. |
| 3  | Verificar se os botões para consultar pedido ou configurar outro estão disponíveis. | Os botões de ação continuam acessíveis. |

#### Resultados Esperados
- A experiência de usuário apresenta clareza sobre o insucesso do crédito e sugere a alternativa de pagamento à vista.

#### Critérios de Aceitação
- O sistema não deve exibir mensagem verde de *"Pedido Aprovado!"* quando `order.status !== 'APROVADO'`.
- O resumo de pedido (ID, nome do cliente e loja) deve continuar visível para que o cliente guarde o registro do atendimento.

---

### CT20 - Acesso Direto à Tela de Confirmação sem Pedido no Estado (Controle de Acesso / Sem Permissão)

#### Objetivo
Validar que a tentativa de acesso direto à URL de sucesso (`/success`) sem um pedido válido em contexto redireciona o usuário para a página inicial, prevenindo telas em branco ou quebras de renderização.

#### Pré-Condições
- O navegador está em uma sessão limpa onde nenhum pedido foi recém-criado (ou seja, `location.state.order` é `undefined` ou nulo).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Digitar manualmente na barra de endereço do navegador a URL `http://localhost:5173/success` e pressionar Enter. | O sistema avalia a ausência do objeto `order` e executa um redirecionamento imediato (`<Navigate to="/" replace />`). |

#### Resultados Esperados
- O usuário não tem permissão de visualizar a tela `/success` sem dados de transação associados.
- O navegador é redirecionado de volta para a rota raiz (`/`).

#### Critérios de Aceitação
- A URL final na barra do navegador deve ser `/`.
- Nenhuma falha de renderização de componentes com valores indefinidos deve acontecer.

---

### CT21 - Consulta de Pedido Existente com Status APROVADO (Fluxo Feliz)

#### Objetivo
Validar que o usuário consegue consultar um pedido existente utilizando um número de pedido válido e que o sistema exibe corretamente a badge de status **`APROVADO`** e os detalhes cadastrados.

#### Pré-Condições
- Existe um pedido cadastrado no sistema com número `VLO-EHWTGA` e status `APROVADO`.
- O usuário está na tela de Consulta de Pedidos (`/lookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | No campo *"Número do Pedido"* (`#order-id`), digitar o código `"VLO-EHWTGA"`. | O texto é preenchido e o botão *"Buscar Pedido"* torna-se habilitado. |
| 2  | Clicar no botão *"Buscar Pedido"*. | O sistema aciona o estado de carregamento (`Loader2 - Buscando...`) e pesquisa o pedido via `getOrderByNumber`. |
| 3  | Aguardar a renderização do card de resultado do pedido. | O card com `data-testid="order-result-VLO-EHWTGA"` é exibido na tela. |
| 4  | Verificar a badge de status e os dados do veículo e cliente apresentados. | A badge exibe o ícone de confirmação com texto `"APROVADO"` em fundo verde (`bg-green-100 text-green-700`). |

#### Resultados Esperados
- Todas as especificações do carro (Cor, Interior, Rodas) e do cliente (Nome, Email, Loja) correspondentes ao pedido `VLO-EHWTGA` são apresentadas com fidelidade no card de resultado.

#### Critérios de Aceitação
- A validação de acessibilidade via snapshot ARIA deve confirmar a presença dos títulos de seção, número do pedido e badge verde de aprovação.
- A mensagem de *"Pedido não encontrado"* **não** deve ser exibida.

---

### CT22 - Consulta de Pedido Existente com Status EM_ANALISE e REPROVADO (Fluxo Alternativo)

#### Objetivo
Validar que a Consulta de Pedidos renderiza adequadamente as badges visuais e textuais para pedidos que estejam nos status **`EM_ANALISE`** (amarelo) e **`REPROVADO`** (vermelho).

#### Pré-Condições
- Existem no sistema:
  - Pedido `VLO-0YFPJY` com status `EM_ANALISE`.
  - Pedido `VLO-GOUQJH` com status `REPROVADO`.
- O usuário acessou a tela `/lookup`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Buscar o pedido de código `"VLO-0YFPJY"`. | O resultado é retornado e a badge indica **`EM_ANALISE`** na cor amarelo/âmbar (`bg-amber-100 text-amber-700`) com ícone `Clock`. |
| 2  | Limpar o campo de busca, digitar o código `"VLO-GOUQJH"` e acionar a busca. | O card atualiza para o pedido `VLO-GOUQJH` exibindo a badge **`REPROVADO`** na cor vermelha (`bg-red-100 text-red-700`) com ícone `XCircle`. |

#### Resultados Esperados
- O sistema distingue claramente via ícone acessível e esquema de cores o estado financeiro de cada compra consultada.

#### Critérios de Aceitação
- Os testes automatizados ou inspeção visual devem certificar o contraste adequado e a exibição dos textos `"EM_ANALISE"` e `"REPROVADO"`.

---

### CT23 - Consulta com Número de Pedido Inexistente ou Código Fora do Padrão (Cenário Negativo)

#### Objetivo
Validar que pesquisas por códigos inexistentes ou com formatação fora do padrão (ex.: `XYZ-999-INVALIDO` ou `VLO-000000`) apresentam a mensagem informativa de erro de pedido não encontrado.

#### Pré-Condições
- O usuário está na tela `/lookup`.
- O código de pedido `XYZ-999-INVALIDO` não está presente no banco de dados / store.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Digitar `"XYZ-999-INVALIDO"` no campo de busca de pedido (`#order-id`). | Campo preenchido com código inexistente. |
| 2  | Clicar em *"Buscar Pedido"*. | O sistema realiza a busca e retorna resultado vazio ou erro de pesquisa. |
| 3  | Verificar o card de retorno exibido na interface. | É renderizado um card de alerta com ícone de erro em vermelho e o título **"Pedido não encontrado"**. |

#### Resultados Esperados
- O sistema informa clara e objetivamente que não há pedido correspondente:  
  *"Verifique o número do pedido e tente novamente"*.
- Nenhum card com informações parciais ou vazias de pedido deve ser mostrado.

#### Critérios de Aceitação
- O heading *"Pedido não encontrado"* deve estar visível e ser acessível por leitores de tela.
- O sistema deve permanecer estável para que o cliente realize uma nova tentativa com outro código.

---

### CT24 - Validação de Botão de Busca Desabilitado para Campo Vazio ou Espaços em Branco (Validação de Interface)

#### Objetivo
Validar que o botão *"Buscar Pedido"* permanece desabilitado (`disabled`) quando o campo de entrada está vazio ou preenchido exclusivamente por caracteres de espaço.

#### Pré-Condições
- O usuário está acessando a página `/lookup`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Verificar o estado inicial do botão *"Buscar Pedido"* ao carregar a página `/lookup` (campo `#order-id` vazio). | O botão deve estar no estado desabilitado (`toBeDisabled()`). |
| 2  | Preencher o campo com vários espaços em branco (ex.: `"     "`). | O input recebe os espaços, porém o botão *"Buscar Pedido"* permanece desabilitado. |
| 3  | Digitar qualquer caractere visível no input (ex.: `"V"`). | O botão altera o estado para habilitado e torna-se clicável. |
| 4  | Apagar todo o conteúdo do input, voltando ao estado vazio. | O botão retorna imediatamente ao estado desabilitado. |

#### Resultados Esperados
- A regra de interface `disabled={!orderId.trim() || isLoading}` funciona corretamente, impedindo o disparo de requisições de busca vazias.

#### Critérios de Aceitação
- É impossível acionar o envio do formulário por clique de mouse ou tecla Enter enquanto o input não possuir caracteres alfanuméricos válidos.

---

### CT25 - Proteção de Acesso e Segurança na Consulta de Pedidos (Segurança de Dados / Controle de Acesso)

#### Objetivo
Validar que a aplicação não expõe listagem geral de pedidos a usuários não autenticados e que um cliente somente consegue acessar os dados detalhados de uma compra ao possuir e informar o seu número único identificador exacto (`order_number`).

#### Pré-Condições
- Existem múltiplos pedidos de diferentes clientes registrados no banco de dados do sistema Velô Sprint.
- O usuário é um visitante sem sessão iniciada acessando `/lookup`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Verificar a ausência de listagens gerais, links ou tabelas contendo pedidos abertos na página `/lookup`. | Nenhuma lista prévia de pedidos ou clientes é exposta na tela. |
| 2  | Tentar buscar por termos genéricos, curingas (`*`, `%`), nomes de clientes ou números truncados (ex.: `"VLO-"` ou `"Juciellen"`). | A busca só aceita o formato completo de ID do pedido; qualquer correspondência imprecisa resulta na mensagem *"Pedido não encontrado"*. |
| 3  | Confirmar que os dados pessoais (CPF, e-mail, telefone) e de precificação só são exibidos na tela após correspondência exata do `order_number`. | O card `order-result-{id}` somente é gerado quando `getOrderByNumber(orderId)` encontra correspondência exata do ID. |

#### Resultados Esperados
- A confidencialidade das compras é preservada pela exigência obrigatória do identificador do pedido como token/chave de acesso na caixa-preta.

#### Critérios de Aceitação
- Nenhum endpoint de listagem pública de pedidos deve ser acionável via interface por usuários comuns.
- A mensagem de erro em falha de busca não deve indicar se um código parcial ou CPF existe no sistema, limitando-se a *"Pedido não encontrado"*.

---

## 3. Matriz de Rastreabilidade (Módulos vs. Casos de Teste)

| Módulo do Sistema | Casos de Teste Relacionados | Cobertura de Fluxos |
|-------------------|-----------------------------|---------------------|
| **Landing Page** | CT01, CT02, CT03 | Fluxo Feliz (CTA, Links de Navegação), Conteúdo (FAQ/Specs) |
| **Configurador de Veículo** | CT04, CT05, CT06, CT07, CT08 | Fluxo Feliz (Preço base e opcionais), Fluxo Alternativo (Remoção), Preservação de Estado |
| **Checkout/Pedido** | CT09, CT10, CT11, CT12 | Fluxo Feliz (À Vista), Dados Inválidos/Incompletos, Validação de Campos Obrigatórios (Zod) |
| **Análise de Crédito Automática** | CT13, CT14, CT15, CT16, CT17 | Fluxos Feliz/Alternativo/Negativo por Score, Regra de Exceção por Entrada (&ge; 50%), Indisponibilidade de API |
| **Confirmação de Pedido** | CT18, CT19, CT20 | Fluxo Feliz (Aprovado), Fluxo Alternativo (Reprovado), Segurança/Permissão (Redirecionamento `/`) |
| **Consulta de Pedidos** | CT21, CT22, CT23, CT24, CT25 | Fluxo Feliz, Fluxos Alternativos (Status badges), Cenário Negativo (Não encontrado), Acessibilidade e Segurança |
