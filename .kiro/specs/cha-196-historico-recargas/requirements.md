# Requirements Document

## Introduction

Esta feature (CHA-196) entrega a tela de frontend onde o aluno visualiza o histórico das recargas de celular que resgatou com seus pontos. É uma subtarefa da US-09 ("Aluno resgata recarga de celular via API de pagamento").

O backend já possui o modelo `Payment` (recargas) e as rotas `GET /payments/catalog` e `POST /payments/recharge`. **Hoje não existe um endpoint de listagem/histórico das recargas do aluno.** Por decisão de escopo, esta spec cobre **somente o frontend**: a tela consome um endpoint de listagem paginado — aqui chamado de API_Historico_Recargas — tratado como **contrato/dependência externa a ser criado por outra tarefa**. Nenhum trabalho de backend está incluído neste escopo.

A tela deve tratar os estados de carregamento, erro e lista vazia, suportar paginação incremental ("carregar mais"), exibir os campos definidos por recarga, e preservar acessibilidade. O cliente HTTP a ser usado é o `api` (axios) compartilhado em `apps/frontend/src/services/api.ts`, e o contrato de histórico assume o prefixo real `/payments`.

### Dependência explícita (ponta solta)

- A tela depende de um endpoint `GET /payments/history` (nome de rota a ser confirmado na fase de design com a tarefa de backend) que ainda **não existe**. Enquanto o contrato não for implementado, a tela não exibirá dados reais. Esta dependência está registrada no Requisito 7.

## Glossary

- **Tela_Historico**: Componente de frontend (React + TypeScript) responsável por exibir ao aluno autenticado a lista de recargas por ele resgatadas.
- **API_Historico_Recargas**: Endpoint HTTP de listagem paginada das recargas do aluno autenticado, resolvido pelo `userId` do token JWT. É um contrato externo, ainda não implementado, consumido pela Tela_Historico. Prefixo assumido: `/payments`.
- **Cliente_API**: Instância axios compartilhada em `apps/frontend/src/services/api.ts`, que injeta o token `authToken` no cabeçalho `Authorization` e redireciona ao login em resposta `401`.
- **Recarga**: Registro de uma recarga resgatada pelo aluno, correspondente ao modelo `Payment` do backend.
- **Status_Recarga**: Situação de uma Recarga, com os valores `PENDING`, `COMPLETED` e `REFUNDED`.
- **Pagina_Recargas**: Conjunto de Recargas retornado pela API_Historico_Recargas em uma única requisição, acompanhado de indicação de existência de mais itens.
- **Aluno**: Usuário autenticado com `StudentProfile`, dono das recargas exibidas.

## Requirements

### Requirement 1: Carregamento inicial do histórico

**User Story:** Como aluno, quero que minhas recargas sejam carregadas ao abrir a tela de histórico, para que eu veja o que já resgatei sem ações adicionais.

#### Acceptance Criteria

1. WHEN a Tela_Historico é montada, THE Tela_Historico SHALL solicitar à API_Historico_Recargas a primeira Pagina_Recargas do Aluno autenticado através do Cliente_API, com no máximo 20 Recargas por página e ordenação por data de criação decrescente (mais recentes primeiro).
2. WHILE a Tela_Historico aguarda a resposta da API_Historico_Recargas, THE Tela_Historico SHALL exibir um indicador de carregamento até receber a resposta ou atingir o tempo limite de 10 segundos.
3. WHEN a API_Historico_Recargas retorna a primeira Pagina_Recargas com uma ou mais Recargas, THE Tela_Historico SHALL exibir cada Recarga retornada em formato de lista, preservando a ordem decrescente por data de criação recebida da API_Historico_Recargas.
4. WHEN a API_Historico_Recargas retorna a primeira Pagina_Recargas sem nenhuma Recarga, THE Tela_Historico SHALL exibir uma mensagem indicando ausência de recargas no histórico.
5. IF a requisição à API_Historico_Recargas falha ou excede o tempo limite de 10 segundos, THEN THE Tela_Historico SHALL exibir uma mensagem de erro indicando a falha no carregamento e disponibilizar um controle para repetir a requisição.

### Requirement 2: Campos exibidos por recarga

**User Story:** Como aluno, quero ver os detalhes de cada recarga, para que eu identifique o que foi resgatado, quando e qual o status atual.

#### Acceptance Criteria

1. WHEN a Tela_Historico exibe uma Recarga, THE Tela_Historico SHALL exibir a data de criação da Recarga formatada no padrão pt-BR (dia, mês e ano no formato DD/MM/AAAA) acompanhada do horário no formato HH:MM de 24 horas.
2. WHEN a Tela_Historico exibe uma Recarga, THE Tela_Historico SHALL exibir o nome do item de catálogo e o valor em reais (BRL) da Recarga, com o valor formatado com o símbolo "R$", duas casas decimais e separadores pt-BR (milhar com ".", decimal com ",").
3. WHEN a Tela_Historico exibe uma Recarga, THE Tela_Historico SHALL exibir a quantidade de pontos gastos (coinsSpent) da Recarga como um número inteiro maior ou igual a 0.
4. WHEN a Tela_Historico exibe uma Recarga, THE Tela_Historico SHALL exibir o Status_Recarga da Recarga com rótulo em português correspondente a cada valor possível de Status_Recarga.
5. WHEN a Tela_Historico exibe uma Recarga, THE Tela_Historico SHALL exibir o número de telefone recarregado da Recarga formatado no padrão pt-BR ((DD) NNNNN-NNNN).
6. IF um campo exibível da Recarga (data de criação, nome do item de catálogo, valor em reais, pontos gastos, Status_Recarga ou número de telefone) estiver ausente ou nulo, THEN THE Tela_Historico SHALL exibir um indicador textual de dado indisponível no lugar do campo correspondente, mantendo os demais campos da Recarga visíveis.
7. IF o valor de Status_Recarga da Recarga não corresponder a nenhum valor conhecido de Status_Recarga, THEN THE Tela_Historico SHALL exibir um rótulo textual indicando status desconhecido sem impedir a exibição dos demais campos da Recarga.

### Requirement 3: Estado de carregamento

**User Story:** Como aluno, quero um indicador de carregamento, para que eu saiba que os dados estão sendo buscados.

#### Acceptance Criteria

1. WHILE uma requisição à API_Historico_Recargas está pendente e nenhuma Recarga foi exibida ainda, THE Tela_Historico SHALL exibir um indicador de carregamento visível.
2. WHEN a requisição à API_Historico_Recargas é concluída com sucesso, THE Tela_Historico SHALL remover o indicador de carregamento em até 500 milissegundos após o recebimento da resposta.
3. IF a requisição à API_Historico_Recargas termina em erro, THEN THE Tela_Historico SHALL remover o indicador de carregamento e exibir uma mensagem indicando falha na busca das Recargas.
4. WHILE uma requisição à API_Historico_Recargas está pendente, THE Tela_Historico SHALL exibir no máximo um indicador de carregamento por vez.

### Requirement 4: Estado de lista vazia

**User Story:** Como aluno que nunca resgatou uma recarga, quero uma mensagem clara, para que eu entenda que ainda não há histórico.

#### Acceptance Criteria

1. WHEN a API_Historico_Recargas retorna com sucesso zero Recargas na primeira Pagina_Recargas, THE Tela_Historico SHALL exibir, em no máximo 3 segundos após o recebimento da resposta, uma mensagem textual informando que o Aluno ainda não possui recargas resgatadas.
2. WHILE a mensagem de lista vazia está visível, THE Tela_Historico SHALL ocultar o controle de carregar mais itens.
3. WHILE a mensagem de lista vazia está visível, THE Tela_Historico SHALL não exibir nenhum item de Recarga.
4. IF a API_Historico_Recargas falha ou não responde em até 10 segundos ao solicitar a primeira Pagina_Recargas, THEN THE Tela_Historico SHALL exibir uma mensagem de erro indicando que o histórico não pôde ser carregado, distinta da mensagem de lista vazia, e disponibilizar um controle para nova tentativa.

### Requirement 5: Estado de erro

**User Story:** Como aluno, quero ser avisado quando o histórico não puder ser carregado, para que eu possa tentar novamente.

#### Acceptance Criteria

1. IF a requisição à API_Historico_Recargas falha com resposta de status diferente de 401, ou não obtém resposta dentro de 10 segundos, THEN THE Tela_Historico SHALL substituir o conteúdo de carregamento por uma mensagem de erro informando que o histórico não pôde ser carregado, preservando o estado atual sem exibir dados parciais.
2. WHILE uma mensagem de erro está visível, THE Tela_Historico SHALL exibir um controle de repetição operável por teclado e associado a rótulo acessível que permita ao Aluno repetir a requisição à API_Historico_Recargas.
3. WHEN o Aluno aciona o controle de repetição, THE Tela_Historico SHALL solicitar novamente a Pagina_Recargas correspondente à última requisição falha, remover a mensagem de erro e exibir o indicador de carregamento até obter resposta.
4. IF a requisição repetida à API_Historico_Recargas falha novamente com resposta de status diferente de 401, ou não obtém resposta dentro de 10 segundos, THEN THE Tela_Historico SHALL exibir novamente a mensagem de erro mantendo o controle de repetição disponível.
5. IF a requisição à API_Historico_Recargas falha com resposta de status 401, THEN THE Tela_Historico SHALL delegar o tratamento ao Cliente_API, que redireciona o Aluno para a tela de login sem exibir a mensagem de erro de carregamento.

### Requirement 6: Paginação incremental

**User Story:** Como aluno com muitas recargas, quero carregar mais itens sob demanda, para que a tela não precise trazer todo o histórico de uma vez.

#### Acceptance Criteria

1. WHEN a API_Historico_Recargas indica que existem mais Recargas além da Pagina_Recargas exibida, THE Tela_Historico SHALL exibir um controle de carregar mais itens habilitado e operável por teclado.
2. WHEN o Aluno aciona o controle de carregar mais itens, THE Tela_Historico SHALL solicitar à API_Historico_Recargas a próxima Pagina_Recargas de até 20 Recargas, contíguas à última Recarga já exibida.
3. WHEN a próxima Pagina_Recargas é retornada, THE Tela_Historico SHALL acrescentar as novas Recargas após as Recargas já exibidas, preservando a ordem decrescente por data e sem duplicar Recargas já presentes na Tela_Historico.
4. WHILE uma requisição de próxima Pagina_Recargas está pendente, THE Tela_Historico SHALL desabilitar o controle de carregar mais itens e exibir um indicador de carregamento.
5. WHEN a API_Historico_Recargas indica que não existem mais Recargas além da Pagina_Recargas exibida, THE Tela_Historico SHALL ocultar o controle de carregar mais itens.
6. IF a requisição de próxima Pagina_Recargas não é concluída em até 10 segundos ou retorna resposta de falha diferente de 401, THEN THE Tela_Historico SHALL manter inalteradas as Recargas já exibidas e apresentar uma mensagem de erro indicando a falha no carregamento, com um controle para repetir a requisição da mesma próxima Pagina_Recargas.
7. WHEN a próxima Pagina_Recargas retornada não contém nenhuma Recarga, THE Tela_Historico SHALL manter as Recargas já exibidas e ocultar o controle de carregar mais itens.

### Requirement 7: Contrato da API de histórico (dependência externa)

**User Story:** Como desenvolvedor de frontend, quero um contrato explícito do endpoint de histórico, para que eu construa a tela mesmo antes de o backend existir e a integração seja direta quando o endpoint for criado.

#### Acceptance Criteria

1. THE Tela_Historico SHALL consumir a API_Historico_Recargas através do Cliente_API compartilhado em `apps/frontend/src/services/api.ts`.
2. WHEN a Tela_Historico requisita uma Pagina_Recargas, THE Tela_Historico SHALL enviar os parâmetros de paginação definidos no contrato da API_Historico_Recargas com número da página inteiro maior ou igual a 1 e tamanho da página inteiro entre 1 e 50.
3. IF a Tela_Historico requisita uma Pagina_Recargas sem informar parâmetros de paginação, THEN THE Tela_Historico SHALL enviar número da página igual a 1 e tamanho da página igual a 20.
4. THE Tela_Historico SHALL interpretar cada Recarga da API_Historico_Recargas com os campos id, nome do item de catálogo, valor em BRL, pontos gastos, Status_Recarga, número de telefone e data de criação.
5. THE Tela_Historico SHALL interpretar o campo valor em BRL como número decimal entre 0,01 e 999999999,99, o campo pontos gastos como inteiro maior ou igual a 0, o campo Status_Recarga como um dos valores definidos no glossário para Status_Recarga, e o campo data de criação como data e hora em formato ISO 8601.
6. THE Tela_Historico SHALL tipar os dados da API_Historico_Recargas em um arquivo sob `apps/frontend/src/types`.
7. WHERE a API_Historico_Recargas ainda não está implementada, WHEN a Tela_Historico requisita uma Pagina_Recargas, THE Tela_Historico SHALL apresentar o estado de erro definido no Requirement 5 em vez de dados reais, preservando a ausência de dados exibidos sem encerrar a aplicação.

### Requirement 8: Acessibilidade

**User Story:** Como aluno que usa leitor de tela ou teclado, quero navegar e entender a tela de histórico, para que a informação seja acessível.

#### Acceptance Criteria

1. THE Tela_Historico SHALL estruturar a página com um único elemento de cabeçalho (banner), um único elemento de conteúdo principal (main) e uma lista semântica para os itens do histórico, de modo que cada região seja alcançável por navegação por marcos (landmarks) do leitor de tela.
2. WHEN a Tela_Historico passa a exibir o indicador de carregamento ou a mensagem de erro, THE Tela_Historico SHALL anunciar a mudança de estado em até 1 segundo por meio de uma região com atualização assistiva (aria-live="polite" ou role equivalente) sem exigir ação do usuário.
3. THE Tela_Historico SHALL tornar o controle de carregar mais itens e o controle de repetição focáveis e acionáveis somente por teclado (Tab/Shift+Tab para foco; Enter ou Barra de espaço para acionar), com indicador de foco visível em cada controle.
4. WHEN a Tela_Historico exibe o Status_Recarga, THE Tela_Historico SHALL apresentar o significado do status por meio de texto legível adjacente ao indicador, sem depender exclusivamente de cor, forma ou posição para transmitir o estado.
5. IF o controle de carregar mais itens ou o controle de repetição estiver desabilitado, THEN THE Tela_Historico SHALL expor o estado desabilitado de forma programática ao leitor de tela (por exemplo, atributo de estado desabilitado) e remover o controle da ordem de foco por teclado.
