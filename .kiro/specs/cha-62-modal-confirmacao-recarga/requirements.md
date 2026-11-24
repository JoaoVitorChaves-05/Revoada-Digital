# Requirements Document

## Introduction

Esta feature (CHA-62) adiciona um **modal de confirmação de recarga** no frontend (`apps/frontend`), aberto a partir da ação de resgatar um item do catálogo de recargas. O modal exibe os dados da recarga a confirmar (nome do item, valor em BRL e custo em pontos/coins), **coleta e valida o número de telefone** do usuário (obrigatório para o backend), exige confirmação explícita antes de disparar a recarga, permite cancelar sem efeito e trata os estados de submit (enviando, sucesso, erro) com possibilidade de nova tentativa.

O escopo é exclusivamente frontend. O backend já expõe o contrato de criação de recarga (`POST /payments/recharge`) e de catálogo (`GET /payments/catalog`); esta feature não altera o backend.

**Decisão de escopo (fechada com a usuária):** esta feature INCLUI o disparo da recarga. O Recharge_Modal é responsável por enviar a recarga via `POST /payments/recharge` através do Recharge_Service sobre o Shared_Api_Client (`apps/frontend/src/services/api.ts`). A correção da busca de catálogo (`GET /recharges/catalog` + mock → `GET /payments/catalog`) NÃO faz parte desta feature e fica para outra issue; por isso o Recharge_Modal NÃO busca o catálogo, mas recebe o Catalog_Item a confirmar por props tipadas no formato real (`id`, `name`, `amountBRL`, `coinsCost`). Fornecer um Catalog_Item nesse formato é responsabilidade de quem monta/abre o modal, fora do escopo desta issue (ver "Premissas, limitações e riscos").

**Contexto verificado no código (NÃO é contrato desta feature):** a tela atual `apps/frontend/src/pages/Recompensas/CatalogoRecargas.tsx` está desalinhada do backend. Hoje ela: (a) chama rotas inexistentes `GET /recharges/catalog` e `POST /recharges/redeem`; (b) envia payload incompatível (`userId`, `rechargeId`, `valor`, `pontosGastos`) sem coletar telefone; (c) usa `fetch` manual com headers próprios e chaves de token (`token`/`accessToken`) divergentes do cliente axios compartilhado (`authToken`); (d) usa um mock hardcoded com formato de item (`operadora`, `valor`, `custoPontos`, `descricao`) incompatível com o formato real do catálogo (`id`, `name`, `amountBRL`, `coinsCost`); e (e) no `catch` finge sucesso ("simulado com sucesso") mesmo quando há erro. O catálogo não é mostrado em nenhuma outra tela montada.

## Glossary

- **Recharge_Modal**: Modal de confirmação de recarga introduzido por esta feature. Exibe os dados da recarga, coleta o telefone, confirma ou cancela a ação e reflete os estados de submit.
- **Catalog_Item**: Item de recarga no formato real de `GET /payments/catalog`, com os campos `id` (uuid), `name` (string), `amountBRL` (número em reais) e `coinsCost` (número inteiro de pontos/coins). Nesta feature o Catalog_Item é fornecido ao Recharge_Modal por props por quem abre o modal; o modal não busca o catálogo.
- **Catalog_Screen**: Tela do catálogo de recargas (`CatalogoRecargas`) a partir da qual o usuário aciona o resgate de um Catalog_Item.
- **Redeem_Trigger**: Controle, por Catalog_Item, que o usuário ativa na Catalog_Screen para abrir o Recharge_Modal referente àquele item.
- **Phone_Field**: Campo de entrada do número de telefone dentro do Recharge_Modal, com label associado.
- **Phone_Value**: Texto digitado no Phone_Field.
- **Normalized_Phone**: Phone_Value após remoção de todos os caracteres não dígitos.
- **Phone_Rule**: Regra de validação do telefone equivalente à do backend: o Normalized_Phone deve casar com a expressão `^\d{2}9\d{8}$` (dois dígitos de DDD, seguidos do dígito 9, seguidos de oito dígitos; total de 11 dígitos; ex.: "11912345678").
- **Confirm_Control**: Controle de confirmação do Recharge_Modal que dispara a recarga.
- **Cancel_Control**: Controle de cancelamento do Recharge_Modal que fecha o modal sem disparar a recarga.
- **Recharge_Service**: Camada frontend que envia a recarga ao backend via `POST /payments/recharge`, usando o cliente axios compartilhado `apps/frontend/src/services/api.ts`.
- **Recharge_Request**: Corpo enviado ao `POST /payments/recharge`, estritamente `{ catalogItemId: string, phoneNumber: string }`.
- **Recharge_API**: Endpoint de backend `POST /payments/recharge` que cria a recarga; responde HTTP 201 em sucesso e códigos de erro (401, 404, 409, 502, 500) em falha.
- **Shared_Api_Client**: Cliente axios compartilhado (`apps/frontend/src/services/api.ts`) que injeta o token `authToken` e trata globalmente a resposta HTTP 401 redirecionando para `/login`.
- **Submit_State**: Estado do envio da recarga no Recharge_Modal, com valores `idle`, `submitting`, `success` e `error`.
- **Provider_Failure**: Falha do provedor de recarga reportada pelo backend como código `PROVIDER_FAILURE` com HTTP 502, independentemente de o backend ter classificado a certeza interna como DEFINITIVE ou UNCERTAIN.

## Requirements

### Requirement 1: Abertura do modal a partir do catálogo

**User Story:** As a estudante, I want abrir um modal de confirmação ao resgatar um item do catálogo, so that eu revise os dados antes de gastar meus pontos.

#### Acceptance Criteria

1. WHEN the usuário ativa o Redeem_Trigger de um Catalog_Item, THE Recharge_Modal SHALL abrir exibindo os dados daquele Catalog_Item.
2. WHILE nenhum Redeem_Trigger tiver sido ativado, THE Recharge_Modal SHALL permanecer não renderizado, não produzindo elementos visíveis nem interativos.
3. WHEN the Recharge_Modal abre para um Catalog_Item, THE Recharge_Modal SHALL associar o Catalog_Item exibido ao `id` daquele Catalog_Item.
4. WHEN the usuário ativa o Redeem_Trigger de um Catalog_Item enquanto outro Recharge_Modal ainda não foi aberto, THE Catalog_Screen SHALL abrir exatamente um Recharge_Modal por ativação.

### Requirement 2: Exibição dos dados da recarga

**User Story:** As a estudante, I want ver o item, o valor em reais e o custo em pontos no modal, so that eu confirme que estou resgatando a recarga correta.

#### Acceptance Criteria

1. WHILE the Recharge_Modal está aberto para um Catalog_Item, THE Recharge_Modal SHALL exibir o campo `name` daquele Catalog_Item.
2. WHILE the Recharge_Modal está aberto para um Catalog_Item, THE Recharge_Modal SHALL exibir o valor `amountBRL` daquele Catalog_Item formatado como moeda em reais no padrão pt-BR.
3. WHILE the Recharge_Modal está aberto para um Catalog_Item, THE Recharge_Modal SHALL exibir o custo `coinsCost` daquele Catalog_Item como quantidade de pontos.
4. THE Recharge_Modal SHALL exibir os dados do Catalog_Item a partir dos campos retornados por `GET /payments/catalog` (`id`, `name`, `amountBRL`, `coinsCost`), SHALL NOT depender dos campos `operadora`, `valor`, `custoPontos` ou `descricao` do mock atual.

### Requirement 3: Coleta e validação do número de telefone

**User Story:** As a estudante, I want informar e validar o número de telefone no modal, so that a recarga seja enviada para a linha correta e aceita pelo backend.

#### Acceptance Criteria

1. WHILE the Recharge_Modal está aberto, THE Recharge_Modal SHALL exibir um Phone_Field com um label textual associado programaticamente ao campo.
2. WHEN the usuário edita o Phone_Field, THE Recharge_Modal SHALL atualizar o Phone_Value com o texto digitado.
3. WHEN the Confirm_Control é ativado e o Normalized_Phone do Phone_Value não satisfaz a Phone_Rule, THEN THE Recharge_Modal SHALL exibir uma mensagem de validação indicando telefone inválido e SHALL NOT invocar o Recharge_Service.
4. WHEN the Confirm_Control é ativado e o Phone_Value está vazio ou contém apenas espaços, THEN THE Recharge_Modal SHALL exibir uma mensagem de validação indicando telefone obrigatório e SHALL NOT invocar o Recharge_Service.
5. WHEN the Confirm_Control é ativado e o Normalized_Phone satisfaz a Phone_Rule, THE Recharge_Modal SHALL usar o Normalized_Phone como `phoneNumber` do Recharge_Request.
6. WHILE uma mensagem de validação de telefone está exibida, WHEN the usuário edita o Phone_Field para um valor cujo Normalized_Phone satisfaz a Phone_Rule, THE Recharge_Modal SHALL remover a mensagem de validação de telefone.
7. WHEN the Recharge_Modal abre para um Catalog_Item, THE Recharge_Modal SHALL iniciar o Phone_Field vazio, SHALL NOT pré-preencher o Phone_Value com qualquer telefone.

### Requirement 4: Confirmação explícita e cancelamento sem efeito

**User Story:** As a estudante, I want confirmar explicitamente ou cancelar a recarga, so that eu não dispare uma recarga por engano.

#### Acceptance Criteria

1. WHILE the Recharge_Modal não teve o Confirm_Control ativado com telefone válido, THE Recharge_Modal SHALL NOT invocar o Recharge_Service.
2. WHEN the usuário ativa o Confirm_Control com Normalized_Phone satisfazendo a Phone_Rule, THE Recharge_Modal SHALL invocar o Recharge_Service exatamente uma vez com um Recharge_Request contendo o `id` do Catalog_Item como `catalogItemId` e o Normalized_Phone como `phoneNumber`.
3. WHEN the usuário ativa o Cancel_Control, THE Recharge_Modal SHALL fechar sem invocar o Recharge_Service e SHALL deixar o saldo de pontos do usuário inalterado.
4. WHEN the usuário aciona o fechamento do Recharge_Modal pela tecla Esc, THE Recharge_Modal SHALL fechar sem invocar o Recharge_Service, com o mesmo efeito do Cancel_Control.
5. THE Recharge_Request enviado pelo Recharge_Modal SHALL conter exatamente os campos `catalogItemId` e `phoneNumber`, SHALL NOT incluir os campos `userId`, `rechargeId`, `valor` ou `pontosGastos`.

### Requirement 5: Estado de envio (submitting)

**User Story:** As a estudante, I want ver feedback de carregamento enquanto a recarga é enviada, so that eu entenda que o pedido está em processamento e não dispare duas vezes.

#### Acceptance Criteria

1. WHEN the Recharge_Service é invocado, THE Recharge_Modal SHALL definir o Submit_State como `submitting`.
2. WHILE the Submit_State é `submitting`, THE Recharge_Modal SHALL definir o Confirm_Control em estado desabilitado e não interativo, ignorando ativação por clique e por teclado.
3. WHILE the Submit_State é `submitting`, THE Recharge_Modal SHALL exibir no Confirm_Control um rótulo de progresso em vez do rótulo de confirmação padrão.
4. WHILE the Submit_State é `submitting`, IF o Confirm_Control é ativado novamente por clique ou teclado, THEN THE Recharge_Modal SHALL ignorar a ativação e SHALL NOT iniciar uma requisição adicional ao Recharge_Service.
5. WHILE the Submit_State é `submitting`, THE Recharge_Modal SHALL definir o Cancel_Control em estado desabilitado e não interativo, ignorando ativação por clique e por teclado.

### Requirement 6: Resultado de sucesso

**User Story:** As a estudante, I want um retorno claro quando a recarga é aceita, so that eu saiba que o pedido foi concluído.

#### Acceptance Criteria

1. WHEN the Recharge_API responde HTTP 201 para a requisição do Recharge_Modal, THE Recharge_Modal SHALL definir o Submit_State como `success`.
2. WHEN the Submit_State passa a `success`, THE Recharge_Modal SHALL exibir uma confirmação de sucesso que identifica a recarga concluída.
3. IF the Recharge_API responde sucesso mais de uma vez para a mesma ativação do Confirm_Control, THEN THE Recharge_Modal SHALL considerar apenas o primeiro resultado e SHALL ignorar os demais.

### Requirement 7: Tratamento de erro e nova tentativa

**User Story:** As a estudante, I want ser avisado quando a recarga falha e poder tentar de novo, so that eu não assuma sucesso indevidamente nem perca a ação.

#### Acceptance Criteria

1. IF the Recharge_API responde com um código de erro (401, 404, 409, 502 ou 500) para a requisição do Recharge_Modal, THEN THE Recharge_Modal SHALL definir o Submit_State como `error`.
2. WHEN the Submit_State passa a `error`, THE Recharge_Modal SHALL permanecer aberto com o Confirm_Control e o Cancel_Control habilitados.
3. WHEN the Submit_State passa a `error`, THE Recharge_Modal SHALL exibir uma mensagem de erro não vazia e SHALL NOT exibir uma confirmação de sucesso.
4. WHEN the Recharge_API responde HTTP 409 com código `INSUFFICIENT_POINTS`, THE Recharge_Modal SHALL exibir uma mensagem de erro que indique saldo de pontos insuficiente.
5. WHEN the Recharge_API responde HTTP 502 com código `PROVIDER_FAILURE` (Provider_Failure), THE Recharge_Modal SHALL exibir uma mensagem de erro genérica indicando falha ao solicitar a recarga ao provedor e SHALL permitir nova tentativa, SHALL NOT exibir um aviso específico de falha incerta (UNCERTAIN), pois o backend não expõe essa distinção ao cliente.
6. WHILE uma mensagem de erro de submit anterior está exibida, WHEN the usuário ativa o Confirm_Control novamente, THE Recharge_Modal SHALL limpar a mensagem de erro anterior antes de invocar o Recharge_Service.
7. IF the Recharge_API responde com erro, THEN THE Recharge_Modal SHALL NOT exibir texto que afirme que a recarga foi concluída ou simulada com sucesso.

### Requirement 8: Integração pelo cliente axios compartilhado

**User Story:** As a desenvolvedor, I want que o modal use o cliente HTTP compartilhado, so that a autenticação e o tratamento global de 401 sejam consistentes com o restante do app.

#### Acceptance Criteria

1. WHEN the Recharge_Modal envia a recarga, THE Recharge_Service SHALL usar o Shared_Api_Client (`apps/frontend/src/services/api.ts`) para a requisição `POST /payments/recharge`.
2. THE Recharge_Service SHALL NOT montar headers de autenticação manualmente nem ler as chaves de token `token` ou `accessToken` do armazenamento local.
3. WHEN the Recharge_API responde HTTP 401 durante o envio, THE Recharge_Modal SHALL delegar o tratamento ao interceptor global do Shared_Api_Client e SHALL NOT exibir uma confirmação de sucesso.

### Requirement 9: Acessibilidade do modal

**User Story:** As a usuário que navega por teclado e leitor de tela, I want um modal acessível, so that eu consiga operar a confirmação de recarga sem mouse.

#### Acceptance Criteria

1. WHILE the Recharge_Modal está aberto, THE Recharge_Modal SHALL expor o papel de diálogo (`role="dialog"`) com nome acessível correspondente ao título do modal.
2. WHILE the Recharge_Modal está aberto, THE Recharge_Modal SHALL manter o foco do teclado contido entre os controles do modal (focus trap), de modo que a navegação por Tab e Shift+Tab permaneça dentro do modal.
3. WHEN the Recharge_Modal abre, THE Recharge_Modal SHALL mover o foco do teclado para um elemento interativo interno do modal.
4. WHEN the usuário pressiona a tecla Esc com o Recharge_Modal aberto e o Submit_State diferente de `submitting`, THE Recharge_Modal SHALL fechar o modal.
5. THE Phone_Field SHALL ter um label associado programaticamente, e o Confirm_Control e o Cancel_Control SHALL ser operáveis por teclado.

## Premissas, limitações e riscos

As seis questões em aberto foram decididas pela usuária. Esta seção registra as premissas adotadas, as dependências externas e as dívidas técnicas a reconciliar.

### Decisões tomadas

- **Q1 — Submit incluído.** O Recharge_Modal dispara a recarga via `POST /payments/recharge` através do Recharge_Service sobre o Shared_Api_Client. Requisitos 3.5, 4.2 e 4.5 consolidados como firmes.
- **Q2 — Catálogo (GET) fora de escopo.** A troca de `GET /recharges/catalog` + mock por `GET /payments/catalog` fica para outra issue. O Recharge_Modal NÃO busca o catálogo: recebe o Catalog_Item a confirmar por props no formato real (`id`, `name`, `amountBRL`, `coinsCost`).
- **Q3 — Phone_Field inicia vazio.** Sem pré-preenchimento (R3.7). Não há fonte confirmada de telefone do usuário no frontend.
- **Q4 — Falha de provedor = erro genérico + retry.** `PROVIDER_FAILURE`/HTTP 502 é tratado como erro com nova tentativa, sem aviso específico de falha incerta (R7.5).
- **Q5 — Componente de modal novo e acessível.** O Recharge_Modal é um componente novo desta feature, não uma extensão do `ConfirmDialog`.
- **Q6 — Util de formatação próprio nesta branch.** A formatação de BRL e a normalização/máscara de telefone são criadas como novo util em `apps/frontend/src/utils` nesta feature.

### Premissas

- **P1 — Origem do Catalog_Item.** Quem monta/abre o Recharge_Modal fornece um Catalog_Item já no formato real (`id`, `name`, `amountBRL`, `coinsCost`). O modal não é responsável por buscar, mapear ou validar a origem do catálogo.
- **P2 — Contrato do backend estável.** `POST /payments/recharge` aceita `{ catalogItemId, phoneNumber }`, responde HTTP 201 em sucesso e os códigos 401/404/409/502/500 em falha, conforme verificado no backend.

### Dependências externas (fora desta feature)

- **D1 — Reconciliação da Catalog_Screen.** A tela atual `CatalogoRecargas.tsx` ainda entrega itens em formato de mock (`operadora`, `valor`, `custoPontos`, `descricao`) incompatível com o Catalog_Item real. Conectar a Catalog_Screen ao `GET /payments/catalog` e fornecer itens no formato real ao modal é dependência externa (Q2). Enquanto não resolvida, o modal só opera corretamente com itens no formato real vindos por props.

### Riscos e dívidas técnicas

- **R1 — Falha incerta do provedor (UNCERTAIN) invisível ao cliente.** No caso UNCERTAIN, os pontos podem ter sido debitados sem recarga garantida, mas o backend responde o mesmo `PROVIDER_FAILURE`/HTTP 502 do caso DEFINITIVE. A UI tratará ambos como erro genérico com retry (R7.5). Risco: o usuário pode repetir uma recarga possivelmente já debitada. Mitigar quando o backend expuser a distinção ao cliente.
- **R2 — Duplicação de lógica de formatação (CHA-196 × CHA-62).** O util `formatoRecarga.ts` da CHA-196 NÃO está nesta branch nem na `develop` (PR ainda não mergeado), por isso esta feature cria o próprio util (Q6). Para **evitar colisão de arquivo/merge** com a CHA-196, esta feature nomeia o util como `apps/frontend/src/utils/formatoMoedaTelefone.ts` (arquivo distinto do `formatoRecarga.ts` da CHA-196). Permanece a dívida de **lógica** (não de arquivo): quando CHA-196 e CHA-62 convergirem na `develop`, as duas implementações de formatação de BRL/telefone devem ser reconciliadas numa única fonte.
