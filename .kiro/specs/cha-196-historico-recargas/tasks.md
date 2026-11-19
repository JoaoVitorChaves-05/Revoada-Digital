# Implementation Plan: CHA-196 — Histórico de Recargas (frontend)

## Overview

Plano de implementação **somente frontend** (React + TypeScript + Vite, em `apps/frontend`) para a Tela_Historico de recargas resgatadas pelo aluno. As tarefas seguem fielmente o `design.md` aprovado e avançam de forma incremental e orientada a testes: tipos de domínio → formatadores puros + property tests → reducers puros de paginação e de estado + property tests → cliente HTTP + mock de desenvolvimento → hook de dados → página e componente de item + testes de componente/acessibilidade → integração em `App.tsx` e ponto de entrada de navegação → validação (lint/build/test).

Nenhuma tarefa de backend está incluída. A **API_Historico_Recargas** (`GET /payments/history`) é tratada como contrato/dependência externa ainda não implementada; enquanto não existir, a tela cai no estado de erro de R5 (R7.7), salvo quando o mock de desenvolvimento estiver ligado pela flag.

## Tasks

- [x] 1. Definir os tipos de domínio e contrato da API
  - Criar `apps/frontend/src/types/recargas.types.ts` seguindo a convenção `*.types.ts` do pacote (interfaces exportadas com comentários referenciando requisitos, como em `dashboard.types.ts`).
  - Declarar `StatusRecarga` (`'PENDING' | 'COMPLETED' | 'REFUNDED'`), a interface `Recarga` (campos `id`, `catalogItemName`, `amountBRL`, `coinsSpent`, `status`, `phoneNumber`, `createdAt`), `ParametrosPaginacao` (`page`, `pageSize`) e `RespostaHistoricoRecargas` (`items`, `page`, `pageSize`, `hasMore`).
  - Exportar as constantes `PAGINA_INICIAL = 1` e `TAMANHO_PAGINA_PADRAO = 20`.
  - _Requirements: 7.4, 7.5, 7.6, 7.3, 1.1_

- [x] 2. Implementar formatadores pt-BR puros
  - [x] 2.1 Criar `apps/frontend/src/utils/formatoRecarga.ts` com funções puras
    - `formatarDataHora(iso)` → `DD/MM/AAAA HH:MM` (24h, pt-BR); `DADO_INDISPONIVEL` se ausente/inválida.
    - `formatarBRL(valor)` → `R$ 1.234,56` via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
    - `formatarTelefone(numero)` → `(DD) NNNNN-NNNN`; mantém valor cru quando não casar o padrão.
    - `rotuloStatus(status)` → mapa `PENDING→"Pendente"`, `COMPLETED→"Concluída"`, `REFUNDED→"Estornada"`, qualquer outro → `"Status desconhecido"`.
    - Exportar a constante `DADO_INDISPONIVEL = 'Indisponível'`.
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.2 Escrever property test para rótulo de status
    - **Property 5: Totalidade do rótulo de status**
    - **Validates: Requirements 2.4, 2.7**
    - Tag: `// Feature: cha-196-historico-recargas, Property 5: ...`; `fast-check` com `{ numRuns: 100 }` (ou superior); alvo `rotuloStatus`.

  - [ ]* 2.3 Escrever property test para data/hora pt-BR
    - **Property 6: Formatação de data e hora pt-BR**
    - **Validates: Requirements 2.1**
    - Gerador de datas ISO 8601 válidas; verifica o padrão `DD/MM/AAAA HH:MM` (24h); `{ numRuns: 100 }`.

  - [ ]* 2.4 Escrever property test para moeda BRL
    - **Property 7: Formatação de valor em BRL**
    - **Validates: Requirements 2.2**
    - Gerador de decimais em `0,01..999999999,99`; verifica prefixo `R$`, duas casas decimais, vírgula decimal e ponto de milhar; `{ numRuns: 100 }`.

  - [ ]* 2.5 Escrever property test para telefone pt-BR
    - **Property 8: Formatação de telefone pt-BR**
    - **Validates: Requirements 2.5**
    - Gerador de sequências de 11 dígitos; verifica o padrão `(DD) NNNNN-NNNN`; `{ numRuns: 100 }`.

- [x] 3. Implementar o reducer puro de paginação (merge + dedupe)
  - [x] 3.1 Criar helper puro de redução de páginas
    - Função pura (em `formatoRecarga.ts` ou helper vizinho em `src/utils`) que concatena a próxima `Pagina_Recargas` após os itens já acumulados, removendo `id` já presentes e preservando a ordem de recebimento (ordem decrescente por `createdAt`).
    - _Requirements: 1.3, 6.3_

  - [ ]* 3.2 Escrever property test para acumulação de páginas
    - **Property 1: Acumulação de páginas preserva ordem e não duplica**
    - **Validates: Requirements 1.3, 6.3**
    - `fast-check` com sequências arbitrárias de páginas (incluindo `id` repetidos); `{ numRuns: 100 }`.

- [x] 4. Implementar o cliente HTTP e o mock de desenvolvimento
  - [x] 4.1 Criar `apps/frontend/src/utils/recargasClient.ts`
    - `buscarHistoricoRecargas(params)` chama `api.get<RespostaHistoricoRecargas>('/payments/history', { params, timeout: TIMEOUT_HISTORICO_MS })` com `TIMEOUT_HISTORICO_MS = 10_000`.
    - Não intercepta `401` (delegado ao interceptor global de `api`); rejeita em timeout/erros `!== 401`.
    - Espelha o padrão de `coinsClient.ts`/`attemptsClient.ts`.
    - _Requirements: 7.1, 7.2, 7.3, 5.5, 1.2_

  - [x] 4.2 Criar o mock temporário de desenvolvimento
    - Criar `apps/frontend/src/utils/recargasHistoricoMock.ts` com cabeçalho marcando-o como **CÓDIGO TEMPORÁRIO DE DESENVOLVIMENTO — remover/desligar na integração** com a API real.
    - `buscarHistoricoRecargasMock(params)` devolve o shape exato `RespostaHistoricoRecargas`, com dados fake ordenados decrescente por `createdAt`, fatiando por `page`/`pageSize`, derivando `hasMore` de um total fixo (permitindo múltiplas páginas, próxima página vazia e total `0` para lista vazia) e latência simulada `LATENCIA_MOCK_MS`.
    - Não simula `401`.
    - No `recargasClient`, adicionar o único branch condicional: se `import.meta.env.VITE_RECARGAS_HISTORICO_MOCK === 'true'`, delegar ao mock; variante opcional `VITE_RECARGAS_HISTORICO_MOCK_ERRO === 'true'` faz o mock rejeitar (sem `401`) para exercitar o estado de erro. Flags **desligadas por padrão**; o mock é importado **apenas** pelo cliente.
    - _Requirements: 7.7, 5.1, 3.1, 1.2_

- [x] 5. Implementar o hook de dados `useHistoricoRecargas`
  - [x] 5.1 Criar `apps/frontend/src/hooks/useHistoricoRecargas.ts` com a máquina de estados
    - Estados: `carregando-inicial`, `lista`, `vazio`, `erro-inicial`, `carregando-mais`, `erro-carregar-mais`.
    - Na montagem dispara página 1 com `pageSize = 20`; acumula e deduplica via helper puro da tarefa 3.1; expõe `estado`, `recargas`, `temMais`, `carregandoMais`, `recarregarInicial`, `carregarMais`.
    - Dois modos de erro: primeira página → `erro-inicial` (sem dados parciais); carregar mais → `erro-carregar-mais` mantendo os itens e memorizando a página falha para retry da mesma página.
    - Não trata `401` (delegado ao interceptor global); usa flag `ativo` para evitar atualização pós-desmontagem (padrão de `useSaldoCoins.ts`).
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 4.1, 5.1, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.3, 7.7_

  - [ ]* 5.2 Escrever property test para visibilidade de "carregar mais"
    - **Property 2: Visibilidade do controle "carregar mais"**
    - **Validates: Requirements 4.2, 6.1, 6.5**
    - Alvo: derivação `temMais` a partir de `hasMore`/estado; `{ numRuns: 100 }`.

  - [ ]* 5.3 Escrever property test para exclusividade dos estados de UI
    - **Property 3: Exclusividade dos estados de UI**
    - **Validates: Requirements 4.3, 4.4, 5.1**
    - Alvo: reducer de estado do hook (no máximo um entre `vazio`/`erro-inicial`/`lista`; `vazio`/`erro-inicial` ⇒ lista vazia); `{ numRuns: 100 }`.

  - [ ]* 5.4 Escrever property test para erro ao carregar mais
    - **Property 4: Erro ao carregar mais preserva os itens exibidos**
    - **Validates: Requirements 6.6**
    - Alvo: reducer de estado do hook (lista idêntica antes/depois da falha); `{ numRuns: 100 }`.

- [x] 6. Checkpoint — garantir que lógica pura e hook passam nos testes
  - Garanta que todos os testes passam; pergunte ao usuário caso surjam dúvidas.

- [x] 7. Implementar o componente de item `RecargaItem`
  - [x] 7.1 Criar o componente `RecargaItem` (em `pages/Recompensas/`)
    - Exibe os campos de R2 de uma `Recarga` usando os formatadores: data/hora, nome do item e valor BRL, pontos gastos (inteiro ≥ 0), rótulo de status e telefone.
    - Aplica `DADO_INDISPONIVEL` para campos ausentes/nulos sem derrubar os demais campos; usa `rotuloStatus` para status desconhecido; apresenta o significado do status por texto legível adjacente (não só por cor/forma/posição).
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.4_

  - [ ]* 7.2 Escrever teste para indicador de dado indisponível por campo
    - **Property 9: Indicador de dado indisponível por campo ausente**
    - **Validates: Requirements 2.6**
    - Alvo: helper de exibição de campo / `RecargaItem`; `{ numRuns: 100 }`.

- [x] 8. Implementar a página `HistoricoRecargas`
  - [x] 8.1 Criar `apps/frontend/src/pages/Recompensas/HistoricoRecargas.tsx`
    - Página de apresentação (sem I/O direto) que consome `useHistoricoRecargas` e deriva o que exibir a partir de `estado`.
    - Usa Tailwind + `HeaderApp` com `ativo="Recompensas"` (landmark `banner`), `<main>` único (landmark `main`) e lista semântica `<ul>` de `RecargaItem`.
    - Região `aria-live="polite"` (`role="status"`/`role="alert"`) anunciando entrada em loading/erro; indicador de carregamento (máx. um por vez), mensagem de lista vazia e mensagens de erro distintas.
    - Controle "Carregar mais" (`<button type="button">`) visível só quando `temMais`, desabilitado enquanto `carregandoMais`; controle "Tentar novamente" nos estados de erro. Ambos focáveis/acionáveis por teclado, com foco visível e estado desabilitado exposto programaticamente e fora da ordem de foco quando desabilitado.
    - Props de navegação iguais a `MeusResgates` (`userName`, `onVoltar`, `onInicio`, `onDisciplinas`, `onSimulados`, `onComunidade`, `onChat`, `onPerfil`, `onConfiguracoes`, `onLogout`).
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3, 8.5_

  - [ ]* 8.2 Escrever testes de componente para estados de carregamento, lista e vazio
    - Mockar `recargasClient`/`api` via `vi.mock` (sem ligar a flag de dev); aguardar estados assíncronos com `findBy*`.
    - Cobre: carregamento inicial com `page=1`, `pageSize=20`; indicador de loading enquanto pendente e remoção após resposta; lista com itens; lista vazia com mensagem e controle "carregar mais" oculto.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 4.1, 4.2, 4.3, 7.2, 7.3_

  - [ ]* 8.3 Escrever testes de componente para erro inicial, retry e 401
    - Erro inicial substitui loading por mensagem distinta, sem dados parciais; "Tentar novamente" reexecuta a mesma requisição e reexibe loading; falha repetida mantém o controle.
    - `401` é delegado ao interceptor global e **não** exibe a mensagem de erro de carregamento (teste leve de integração com o interceptor de `api`).
    - _Requirements: 1.5, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 7.7_

  - [ ]* 8.4 Escrever testes de componente para paginação incremental
    - Acionar "carregar mais" requisita `page=2` contígua; controle desabilitado e loading durante a pendência; nova página anexada sem duplicar e preservando a ordem; próxima página vazia mantém itens e oculta o controle; erro ao carregar mais mantém itens e oferece retry da mesma página.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 8.5 Escrever testes de acessibilidade da página
    - Verifica um `banner`, um `main` e lista semântica; região `aria-live="polite"` ao entrar em loading/erro; botões focáveis/acionáveis por teclado com foco visível; estado desabilitado exposto e fora da ordem de foco.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Integrar a tela ao App e fiar o ponto de entrada
  - [x] 9.1 Integrar `HistoricoRecargas` em `apps/frontend/src/App.tsx`
    - Adicionar `'historico-recargas'` ao union `type Screen`.
    - Adicionar bloco de render condicional exigindo usuário logado (`if (!usuario) { setScreen('login'); return null }`), renderizando `HistoricoRecargas` com os callbacks de navegação (`onVoltar` → `setScreen('recompensas')`, demais conforme o padrão das telas logadas).
    - _Requirements: 7.1, 8.1_

  - [x] 9.2 Fiar o ponto de entrada na área de recompensas
    - Adicionar um controle "Histórico de recargas" na área de recompensas (`LojaRecompensas`/`CatalogoRecargas`) que chama `setScreen('historico-recargas')` via prop, sem assumir rota de URL.
    - _Requirements: 7.1_

- [x] 10. Checkpoint final — validação lint/build/test
  - Executar `npm run lint --workspace apps/frontend`, `npm run build --workspace apps/frontend` e `npm run test --workspace apps/frontend`; garantir que todos passam. Pergunte ao usuário caso surjam dúvidas.

## Notes

- As tarefas marcadas com `*` são opcionais (testes de propriedade, unidade, componente e acessibilidade) e podem ser puladas para um MVP mais rápido; as tarefas principais não são opcionais.
- Cada tarefa referencia requisitos específicos (R1–R8) para rastreabilidade; as subtarefas de property test referenciam explicitamente a Property correspondente do design.
- Os property tests usam `fast-check` com no mínimo 100 iterações e tag `// Feature: cha-196-historico-recargas, Property N: ...`, incidindo sobre lógica pura (formatadores, reducer de paginação, reducer de estado do hook).
- Os testes de componente mockam `recargasClient`/`api` via `vi.mock` e **não** dependem do mock de desenvolvimento (flag `VITE_RECARGAS_HISTORICO_MOCK`).
- O mock de desenvolvimento (tarefa 4.2) é **temporário**, desligado por padrão e passível de remoção na integração com a API_Historico_Recargas real, sem impacto na página, no hook ou nos tipos.
- Os checkpoints garantem validação incremental da lógica pura/hook e, ao final, da suíte completa.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "8.4", "8.5", "9.1"] },
    { "id": 8, "tasks": ["9.2"] }
  ]
}
```
