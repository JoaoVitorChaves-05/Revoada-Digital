# Implementation Plan: Dashboard do Aluno ("Início")

## Overview

Implementação exclusivamente de frontend (`apps/frontend`, React + TypeScript + Vite), sem endpoints de backend. A ordem é incremental e testável: primeiro a camada de dados isolada (tipos, Serviço_Sessão, Cliente_Attempts, Derivador_Metricas de funções puras), depois as cores centralizadas, em seguida os componentes de bloco de apresentação, a página orquestradora com os estados loading/erro/vazio/sucesso e, por fim, a integração na navegação por `useState` de `src/App.tsx`.

A linguagem é TypeScript (definida pelo design, sem pseudocódigo).

Validações obrigatórias de cada tarefa de código:
- `npm run lint --workspace apps/frontend`
- `npm run build --workspace apps/frontend`

Sobre testes: o `apps/frontend` não possui runner de testes nem script `test` hoje. A configuração de Vitest + fast-check e todas as tarefas de teste (propriedades e exemplos) são **opcionais** (marcadas com `*`) e condicionadas a essa configuração, deixada a cargo do time.

## Tasks

- [x] 1. Criar tipos de dados da camada de dados
  - Criar `src/types/attempts.types.ts` com `AttemptStatus`, `AttemptAnswer`, `AttemptMockExamResumo` e `Attempt`, espelhando a resposta real de `GET /attempts?userId=` (`findByUserId`): `answers` presente, sem relação `question`/`subject`; datas como `string` ISO; campos nulos (`score`, `correctAnswers`, `totalQuestions`, `isCorrect`, `answeredAt`) conforme o schema Prisma
  - Criar `src/types/dashboard.types.ts` com `DiaFrequencia` (`data`, `rotulo`, `estudou`, `ehHoje`) e `MetricasDashboard` (`questoesResolvidas`, `taxaAcerto: number | null`, `streakDias`, `frequencia7Dias`, `diasComEstudo`)
  - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
  - _Requirements: 3.6_

- [x] 2. Implementar o Serviço_Sessão
  - [x] 2.1 Criar `src/utils/sessao.ts` com a interface de sessão desacoplada
    - Definir `SessaoAluno` (`getUserId(): string`, `getAuthToken(): string | null`, `getNomeAluno(): string | null`) e `ConfigSessao` (`userIdFallback: string`)
    - Implementar `criarSessao(config)` onde `getUserId()` resolve a origem do id (fonte real futura → `config.userIdFallback`) e nunca lança; `getAuthToken()` retorna `null` nesta fase (ponto de extensão da Fase 2); `getNomeAluno()` retorna `null` nesta fase
    - Exportar a instância padrão `sessao` com o fallback configurável em um único lugar
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 2.2 Escrever testes de exemplo do Serviço_Sessão (requer runner — ver tarefa 13)
    - Sem sessão disponível ⇒ `getUserId()` retorna o fallback configurado
    - `getAuthToken()` retorna `null` nesta fase; `getNomeAluno()` retorna `null`
    - _Requirements: 2.2, 2.4_

- [x] 3. Implementar o Cliente_Attempts (único ponto de fetch)
  - [x] 3.1 Criar `src/utils/attemptsClient.ts` com `buscarAttempts(userId, token?)`
    - Usar `const URL_BASE_API = 'http://localhost:3000'` e requisitar `GET /attempts?userId=<id>` no padrão de `src/pages/PainelDesempenho.page.tsx`
    - Encaminhar `token` opcional como header `Authorization` (ponto de extensão Fase 2) quando presente
    - Em resposta não-`ok` ou falha de rede ⇒ `throw new Error('Não foi possível carregar seu painel.')`; se o corpo não for um array, tratar como erro com a mesma mensagem
    - Retornar `Promise<Attempt[]>` tipado pelos tipos da tarefa 1
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 3.1, 3.3, 3.6, 18.1_

  - [x] 3.2 Escrever testes de exemplo do Cliente_Attempts com `fetch` mockado (requer runner — ver tarefa 13)
    - Resposta `ok` com array ⇒ retorna tipado
    - Resposta não-`ok` ⇒ lança a mensagem legível; corpo não-array ⇒ lança
    - _Requirements: 3.3, 3.6_

- [x] 4. Implementar o Derivador_Metricas (funções puras)
  - [x] 4.1 Implementar o utilitário interno de data e as métricas de contagem/taxa
    - Criar `src/utils/derivadorMetricas.ts` com a função interna pura `timestampEfetivo(answer, attempt)` (ordem de fallback `answer.answeredAt` → `attempt.submittedAt` → `attempt.startedAt`; `null` se nada datável) e uma função de "chave do dia local" para os buckets de dia
    - Implementar `contarQuestoesResolvidas(attempts)` = soma de `attempt.answers.length` em todas as tentativas
    - Implementar `calcularTaxaAcerto(attempts)` em `0..100`, retornando `null` quando não há nenhuma `answer` (Estado_Vazio, sem divisão por zero); `isCorrect === null` conta como não-acerto no denominador
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 5.1, 6.1, 6.3, 18.1_

  - [x] 4.2 Escrever teste de propriedade para `contarQuestoesResolvidas` (requer runner — ver tarefa 13)
    - **Property 1: Questões resolvidas é a soma consistente dos answers**
    - **Validates: Requirements 5.1, 5.2, 5.4**
    - Mínimo de 100 iterações com `fast-check`; tag `// Feature: dashboard-aluno, Property 1: ...`

  - [x] 4.3 Escrever teste de propriedade para `calcularTaxaAcerto` (requer runner — ver tarefa 13)
    - **Property 2: Taxa de acerto é null ou está no domínio 0..100**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Mínimo de 100 iterações com `fast-check`; tag `// Feature: dashboard-aluno, Property 2: ...`

  - [x] 4.4 Implementar `calcularStreak` e `calcularFrequencia7Dias`
    - `calcularStreak(attempts, agora)`: dias consecutivos terminando em `agora` com ao menos uma `answer` (via `timestampEfetivo`), sempre `>= 0`
    - `calcularFrequencia7Dias(attempts, agora)`: exatamente 7 entradas do dia `(agora-6)` até `agora` em ordem cronológica; cada entrada com `estudou` e `ehHoje` (apenas o último), e `rotulo`/`data` do bucket local
    - Implementar o agregador `derivarMetricas(attempts, agora)` compondo as quatro funções em `MetricasDashboard`, incluindo `diasComEstudo` (contagem de dias com estudo na janela de 7 dias)
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 5.2, 5.4, 6.2, 8.1, 8.3, 8.5, 11.1, 11.2, 11.3, 11.4, 11.5, 3.5, 18.1_

  - [x] 4.5 Escrever teste de propriedade para `calcularStreak` (requer runner — ver tarefa 13)
    - **Property 3: Streak está dentro da faixa [0, dias distintos com estudo]**
    - **Validates: Requirements 8.1, 8.3, 8.5**
    - Mínimo de 100 iterações com `fast-check`; tag `// Feature: dashboard-aluno, Property 3: ...`

  - [x] 4.6 Escrever teste de propriedade para `calcularFrequencia7Dias` (requer runner — ver tarefa 13)
    - **Property 4: Frequência tem exatamente 7 dias com contagem consistente**
    - **Validates: Requirements 11.1, 11.2, 11.4, 11.5**
    - Mínimo de 100 iterações com `fast-check`; tag `// Feature: dashboard-aluno, Property 4: ...`

- [x] 5. Checkpoint da camada de dados
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Centralizar novas cores em `src/utils/colors.ts`
  - Adicionar ao `theme` existente as novas cores necessárias ao dashboard (ex.: azul primário e laranja do SVG), mantendo o padrão de nomenclatura atual
  - Garantir que nenhuma cor nova seja hardcoded nos componentes/CSS; todo consumo vem de `colors.ts`
  - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
  - _Requirements: 16.2_

- [x] 7. Implementar o componente Placeholder reutilizável
  - [x] 7.1 Criar `src/components/dashboard/Placeholder.tsx`
    - `PlaceholderProps` (`rotulo?` default "em breve", `descricaoAcessivel?`, `children?`)
    - Marcação visual atenuada + selo textual "em breve"; marcação programática `data-placeholder="true"` no elemento raiz e `aria-disabled` nos controles inativos
    - Usar cores de `src/utils/colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 18.2_

  - [x] 7.2 Escrever teste de exemplo do Placeholder (requer runner — ver tarefa 13)
    - Presença de `data-placeholder="true"` no elemento raiz e `aria-disabled` em controle inativo
    - _Requirements: 18.2_

- [x] 8. Implementar componentes de bloco de dados reais
  - [x] 8.1 Implementar `Saudacao.tsx`
    - Exibir "Bom te ver por aqui, {nome}!" e a data atual do dispositivo; quando o nome for `null`, renderizar `Placeholder` "em breve" no lugar do nome
    - Elemento semântico com rótulo; cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 4.1, 4.2, 4.3, 16.2, 17.1, 17.2_

  - [x] 8.2 Implementar `CardMetrica.tsx`
    - Card genérico (título, valor, variação opcional) reutilizado por "Questões resolvidas", "Taxa de acerto", "Tempo de estudo" e "Sequência atual"
    - Suportar variação como `Placeholder` "em breve" e rótulo de medida aproximada (para "Sequência atual"); valor em Estado_Vazio quando aplicável
    - Rótulos textuais e cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 5.2, 5.3, 5.4, 6.2, 6.4, 7.1, 7.2, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2, 16.2, 17.1_

  - [x] 8.3 Implementar `GraficoFrequencia.tsx`
    - Gráfico de barras dos últimos 7 dias a partir de `DiaFrequencia[]`; destacar a barra do dia atual (`ehHoje`); exibir o resumo "{X} de 7 dias com estudo"
    - `role="img"` + texto alternativo descrevendo "X de 7 dias com estudo"; cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 16.2, 17.4_

- [x] 9. Implementar componentes de bloco placeholder e rodapé
  - [x] 9.1 Implementar `ContinueDeOndeParou.tsx`
    - Bloco em `Placeholder` "em breve" com botão "Continuar" desabilitado (`disabled`/`aria-disabled`)
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 9.1, 9.2, 18.2_

  - [x] 9.2 Implementar `BlocoDesempenhoAreas.tsx`
    - Listar Linguagens, Ciências Humanas, Matemática e Ciências da Natureza como barras de progresso em `Placeholder` "em breve"; link "Ver estatísticas" que aciona o handler recebido por prop
    - Controle com rótulo textual, operável por teclado; cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 12.1, 12.2, 12.3, 16.2, 17.1, 17.3, 18.2_

  - [x] 9.3 Implementar `BlocoDisciplinas.tsx`
    - Lista de cards por disciplina; números (questões resolvidas e taxa por disciplina) em `Placeholder` "em breve"; controle "Estudar" por card e link "Ver disciplinas"
    - Rótulos textuais e operação por teclado; cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 16.2, 17.1, 17.3, 18.2_

  - [x] 9.4 Implementar `BlocoRadar.tsx`
    - Itens "Revisão recomendada de questões erradas" e "Seu próximo simulado ENEM" em `Placeholder` "em breve"; controle "Montar meu simulado" no item de próximo simulado
    - Rótulos textuais e operação por teclado; cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 14.1, 14.2, 14.3, 16.2, 17.1, 17.3, 18.2_

  - [x] 9.5 Implementar `RodapeInstitucional.tsx`
    - Links "Central de ajuda", "Termos de uso" e "Privacidade" como elementos operáveis por teclado
    - Cores de `colors.ts`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 15.1, 15.2, 17.3_

- [x] 10. Checkpoint dos componentes de bloco
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implementar a página Dashboard e seus estados
  - [x] 11.1 Criar `src/pages/Dashboard.page.tsx` com orquestração de dados e estados
    - Receber props `onBack` e `onVerEstatisticas`; obter `userId` via `sessao.getUserId()` no mount e chamar `buscarAttempts(userId)`; derivar métricas com `derivarMetricas(attempts, new Date())`
    - Implementar `carregar()` reexecutável e a ramificação dos quatro estados: Estado_Carregamento (pendente), Estado_Erro (mensagem legível + botão "Tentar novamente" que reexecuta `carregar()`), Estado_Vazio (zero tentativas, orienta primeiro simulado; métricas reais exibem zeros), Estado_Sucesso (distribui `MetricasDashboard` aos blocos)
    - Nenhum `fetch` direto na página nem nos blocos (delegar ao Cliente_Attempts); nome da saudação vem de `sessao.getNomeAluno()` (placeholder quando `null`)
    - Compor todos os blocos das tarefas 7–9 em regiões `<section>` com `aria-label` e hierarquia de títulos; passar `onVerEstatisticas` ao `BlocoDesempenhoAreas`
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 5.2, 6.2, 8.3, 11.4, 12.4, 16.1, 16.3, 17.2, 18.1_

  - [x] 11.2 Criar `src/pages/Dashboard.css`
    - Estilos específicos da página seguindo a estrutura de blocos do SVG, no par `Dashboard.page.tsx` + `Dashboard.css`
    - Consumir exclusivamente cores de `src/utils/colors.ts` (sem hardcode)
    - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
    - _Requirements: 16.1, 16.2, 16.3_

  - [x] 11.3 Escrever testes de exemplo da página (requer runner — ver tarefa 13)
    - Ramificação dos quatro estados (carregamento, erro com retry, vazio, sucesso) com 1–3 exemplos
    - Presença de `data-placeholder="true"` nos blocos R7/R9/R10/R12/R13/R14 e `disabled`/`aria-disabled` no botão "Continuar"
    - "Ver estatísticas" aciona `onVerEstatisticas`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 9.2, 12.4, 18.2_

- [x] 12. Integrar o Dashboard na navegação de `src/App.tsx`
  - Estender a união `type Screen` com o valor `'dashboard'`
  - Adicionar renderização condicional: quando `screen === 'dashboard'`, renderizar `<DashboardPage onBack={() => setScreen('home')} onVerEstatisticas={() => setScreen('desempenho')} />`
  - Não adicionar biblioteca de roteamento; reaproveitar a tela `'desempenho'` existente
  - Validar com `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 12.4, 18.3_

- [x] 13. Checkpoint final
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. (Opcional) Configurar runner de testes do frontend — pré-requisito das tarefas de teste
  - Adicionar `vitest` e `fast-check` a `devDependencies` de `apps/frontend` e o script `"test": "vitest --run"` em `apps/frontend/package.json`
  - Deixar a decisão de instalar a cargo do time; esta tarefa habilita as sub-tarefas de teste marcadas com `*` (2.2, 3.2, 4.2, 4.3, 4.5, 4.6, 7.2, 11.3)
  - _Requirements: 5.1, 6.1, 8.1, 11.1_

## Notes

- Tarefas marcadas com `*` são opcionais. Todas as tarefas de teste dependem da tarefa 14 (configuração de Vitest + fast-check), que também é opcional e fica a cargo do time — o frontend não tem runner hoje.
- A validação obrigatória de cada tarefa de código é `npm run lint --workspace apps/frontend` e `npm run build --workspace apps/frontend`.
- Cada tarefa referencia os requisitos (sub-cláusulas) que atende para rastreabilidade.
- Os checkpoints garantem validação incremental.
- A camada de dados (tipos, sessão, cliente, derivador) é implementada e validada antes dos componentes de UI que a consomem.
- As 4 propriedades de correção cobrem exclusivamente as funções puras do `Derivador_Metricas`; os demais comportamentos (navegação, estados de I/O, placeholders, acessibilidade) são cobertos por testes de exemplo opcionais.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "14"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "6", "7.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "4.3", "4.4", "7.2", "8.1", "8.2", "8.3", "9.1", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 3, "tasks": ["4.5", "4.6", "11.1"] },
    { "id": 4, "tasks": ["11.2", "11.3"] },
    { "id": 5, "tasks": ["12"] }
  ]
}
```
