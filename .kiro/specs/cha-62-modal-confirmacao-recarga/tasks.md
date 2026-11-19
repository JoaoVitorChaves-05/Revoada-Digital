# Implementation Plan: Modal de Confirmação de Recarga (CHA-62)

## Overview

Feature **exclusivamente frontend** em `apps/frontend/src` (React + TypeScript). O plano é construído de baixo para cima e orientado por dependência: primeiro os tipos (`recarga.types.ts`), depois a lógica pura (`formatoMoedaTelefone.ts` e `submitRecarga.ts`), em seguida o Recharge_Service (`recargaClient.ts`, sobre o `services/api.ts` compartilhado) e, por fim, o componente acessível `RecargaConfirmModal.tsx`.

**Fora de escopo (Q2/D1):** este plano NÃO integra o modal à `CatalogoRecargas.tsx` (Catalog_Screen). O `RecargaConfirmModal` fica **pronto para uso** por quem reconciliar a Catalog_Screen ao `GET /payments/catalog` (dependência externa), recebendo um `CatalogItem` no formato real por props. Nos testes, o modal é exercitado com `item` fornecido via props e com o módulo `../services/api` **mockado** — sem backend real nem a tela de catálogo.

A lógica pura (reducer, validação/normalização de telefone, montagem do request, formatação de BRL, mapeamento de erro) é testada por **property tests** com `fast-check` (já em devDependencies, mín. 100 iterações); o componente e a acessibilidade são testados por **exemplos** com Vitest + React Testing Library (`jsdom`). Os testes ficam colocados ao lado da unidade sob teste e rodam pelo setup Vitest existente (`apps/frontend/src/test/setup.ts`) e pela CI (`.github/workflows/test.yml`).

## Tasks

- [x] 1. Definir os tipos de domínio da recarga
  - [x] 1.1 Criar `recarga.types.ts`
    - Criar `apps/frontend/src/types/recarga.types.ts`
    - Exportar `CatalogItem` (`id: string`, `name: string`, `amountBRL: number`, `coinsCost: number`) no formato real do `GET /payments/catalog`
    - Exportar `RechargeRequest` estrito (`catalogItemId: string`, `phoneNumber: string`)
    - Exportar `RecargaErroCodigo` (`'UNAUTHORIZED' | 'NOT_FOUND' | 'INSUFFICIENT_POINTS' | 'PROVIDER_FAILURE' | 'SERVER_ERROR' | 'UNKNOWN'`)
    - Exportar `SubmitState` (união discriminada: `idle` | `submitting` | `success` | `error` com `codigo` e `mensagem`) e `SubmitAction` (`SUBMIT` | `SUCCESS` | `ERROR` com `codigo`/`mensagem` | `RESET`)
    - _Requirements: 2.4, 4.5, 5.1_

- [x] 2. Implementar a formatação de moeda e telefone (funções puras)
  - [x] 2.1 Criar `formatoMoedaTelefone.ts`
    - Criar `apps/frontend/src/utils/formatoMoedaTelefone.ts`
    - `formatarBRL(amountBRL: number): string` usando `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` (função pura)
    - `normalizarTelefone(phoneValue: string): string` como `phoneValue.replace(/\D/g, '')`
    - `telefoneValido(phoneValue: string): boolean` como `/^\d{2}9\d{8}$/.test(normalizarTelefone(phoneValue))`
    - _Requirements: 2.2, 3.3, 3.4, 3.5_

  - [ ]* 2.2 Property test da validação de telefone
    - Adicionar `apps/frontend/src/utils/formatoMoedaTelefone.property.test.ts` com `fast-check` (mín. 100 iterações)
    - Gerador inclui strings arbitrárias, apenas-dígitos, whitespace e vazias (edge cases de R3.4)
    - `// Feature: cha-62-modal-confirmacao-recarga, Property 2: Validação de telefone casa exatamente a Phone_Rule`
    - **Property 2: Validação de telefone casa exatamente a Phone_Rule**
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ]* 2.3 Property test da formatação BRL
    - Adicionar ao `apps/frontend/src/utils/formatoMoedaTelefone.property.test.ts` com `fast-check` (mín. 100 iterações)
    - Gerar números finitos não negativos; comparar `formatarBRL(v)` com `Intl.NumberFormat('pt-BR', ...)` (model-based): símbolo `R$`, vírgula decimal, duas casas
    - `// Feature: cha-62-modal-confirmacao-recarga, Property 4: Formatação BRL em pt-BR`
    - **Property 4: Formatação BRL em pt-BR**
    - **Validates: Requirements 2.2**

  - [ ]* 2.4 Testes de exemplo de formatação/normalização
    - Adicionar `apps/frontend/src/utils/formatoMoedaTelefone.test.ts`
    - `formatarBRL`: casos 0, inteiros e centavos; `normalizarTelefone`: entradas com máscara/espaços
    - _Requirements: 2.2, 3.4_

- [x] 3. Implementar o reducer puro de Submit_State e a montagem do request
  - [x] 3.1 Criar `submitRecarga.ts`
    - Criar `apps/frontend/src/utils/submitRecarga.ts`
    - Exportar `estadoInicial: SubmitState` (`{ status: 'idle' }`)
    - `submitReducer(state, action)`: reducer **total** e **determinístico** seguindo a tabela de transições do design — `submitting` ignora `SUBMIT` (guarda contra duplo envio); `success` ignora `SUBMIT`/`SUCCESS`/`ERROR`; `error` + `SUBMIT` vai a `submitting` limpando a mensagem; `RESET` volta a `idle`
    - `montarRechargeRequest(item, phoneValue)`: retorna exatamente `{ catalogItemId: item.id, phoneNumber: normalizarTelefone(phoneValue) }`, sem campos legados (`userId`, `rechargeId`, `valor`, `pontosGastos`)
    - Importar `normalizarTelefone` de `./formatoMoedaTelefone` e os tipos de `../types/recarga.types`
    - _Requirements: 1.3, 3.5, 4.2, 4.5, 5.1, 5.4, 6.1, 6.3, 7.1, 7.6_

  - [ ]* 3.2 Property test do reducer (totalidade/idempotência)
    - Adicionar `apps/frontend/src/utils/submitRecarga.property.test.ts` com `fast-check` (mín. 100 iterações)
    - Gerar sequências de `SubmitAction` a partir de `estadoInicial`; verificar totalidade, determinismo, guarda de `submitting`, idempotência de `success` e limpeza de erro ao reenviar
    - `// Feature: cha-62-modal-confirmacao-recarga, Property 1: Reducer de Submit_State é total, determinístico e idempotente onde exigido`
    - **Property 1: Reducer de Submit_State é total, determinístico e idempotente onde exigido**
    - **Validates: Requirements 5.1, 5.4, 6.1, 6.3, 7.1, 7.6**

  - [ ]* 3.3 Property test da montagem do Recharge_Request
    - Adicionar ao `apps/frontend/src/utils/submitRecarga.property.test.ts` com `fast-check` (mín. 100 iterações)
    - Gerar `CatalogItem` e telefones válidos; verificar chaves exatas, `catalogItemId === item.id`, `phoneNumber === normalizarTelefone(p)` e ausência de campos legados
    - `// Feature: cha-62-modal-confirmacao-recarga, Property 3: Montagem do Recharge_Request é estrita e usa o telefone normalizado`
    - **Property 3: Montagem do Recharge_Request é estrita e usa o telefone normalizado**
    - **Validates: Requirements 1.3, 3.5, 4.2, 4.5**

- [ ] 4. Implementar o Recharge_Service sobre o cliente compartilhado
  - [ ] 4.1 Criar `recargaClient.ts`
    - Criar `apps/frontend/src/utils/recargaClient.ts`
    - Classe `RecargaError extends Error` com `codigo: RecargaErroCodigo`
    - `criarRecarga(request: RechargeRequest): Promise<void>` usando `api.post('/payments/recharge', request)` do `../services/api` — sem montar headers, sem ler `token`/`accessToken`; o interceptor injeta `authToken` e trata 401 globalmente
    - Derivar `RecargaErroCodigo` a partir de `error.response?.status` e do `code` do corpo (`INSUFFICIENT_POINTS`, `PROVIDER_FAILURE`, etc.); lançar `RecargaError` em falha
    - `mapearErroRecarga(codigo)`: mensagem específica para `INSUFFICIENT_POINTS` (saldo insuficiente) e `PROVIDER_FAILURE` (falha genérica do provedor, com retry), e genérica para os demais; nunca vazia; nunca afirma sucesso nem menciona UNCERTAIN
    - _Requirements: 7.3, 7.4, 7.5, 7.7, 8.1, 8.2_

  - [ ]* 4.2 Property test da mensagem de erro não vazia
    - Adicionar `apps/frontend/src/utils/recargaClient.test.ts` com `fast-check` (mín. 100 iterações) cobrindo todos os `RecargaErroCodigo`
    - Verificar que `mapearErroRecarga(c)` é não vazio após `trim` e não afirma sucesso
    - `// Feature: cha-62-modal-confirmacao-recarga, Property 5: Mensagem de erro nunca é vazia`
    - **Property 5: Mensagem de erro nunca é vazia**
    - **Validates: Requirements 7.3, 7.7**

  - [ ]* 4.3 Testes de exemplo do Recharge_Service
    - Adicionar ao `apps/frontend/src/utils/recargaClient.test.ts` com o módulo `../services/api` mockado
    - Verificar `api.post('/payments/recharge', body)` (R8.1); que não lê `token`/`accessToken` nem monta headers (R8.2); mapeamento específico de `INSUFFICIENT_POINTS` (R7.4) e `PROVIDER_FAILURE` (R7.5)
    - _Requirements: 7.4, 7.5, 8.1, 8.2_

- [ ] 5. Checkpoint - Garantir que a lógica pura e o serviço passam
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implementar o componente `RecargaConfirmModal`
  - [ ] 6.1 Criar `RecargaConfirmModal.tsx`
    - Criar `apps/frontend/src/components/RecargaConfirmModal.tsx`
    - Props: `isOpen: boolean`, `item: CatalogItem | null`, `onClose: () => void`, `onSuccess?: (item: CatalogItem) => void`
    - Renderizar `null` quando `!isOpen || !item` (R1.2)
    - Exibir `name`, `formatarBRL(amountBRL)` e `coinsCost` como pontos, a partir do formato real (R2.1–R2.4)
    - Phone_Field controlado com `<label htmlFor>` associado, iniciando vazio (R3.1, R3.2, R3.7)
    - Usar `useReducer(submitReducer, estadoInicial)`; `RESET` ao fechar
    - Confirmar: validar com `telefoneValido`; inválido/vazio exibe mensagem e não invoca serviço (R3.3, R3.4, R4.1); válido faz `dispatch(SUBMIT)` e chama `criarRecarga(montarRechargeRequest(item, phoneValue))` exatamente uma vez (R4.2, R3.5, R4.5); limpar erro anterior ao reenviar (R7.6); remover mensagem quando o input passar a válido (R3.6)
    - Refletir estados: `submitting` desabilita ambos os controles e troca o rótulo do Confirm_Control por progresso, ignorando reativação (R5.1–R5.5); `success` exibe confirmação identificando a recarga e chama `onSuccess(item)` (R6.1, R6.2); `error` mantém aberto com controles habilitados e mensagem não vazia via `mapearErroRecarga`, sem texto de sucesso/"simulado" (R7.1–R7.3, R7.7); 401 não exibe sucesso, delegado ao interceptor (R8.3)
    - Acessibilidade: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (R9.1); focus trap com Tab/Shift+Tab (R9.2); foco inicial no Phone_Field (R9.3); Esc fecha via `onClose` quando `status !== 'submitting'` (R4.3, R4.4, R9.4); controles operáveis por teclado (R9.5)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.6, 7.7, 8.3, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 6.2 Testes de componente (RTL) do modal
    - Criar `apps/frontend/src/components/RecargaConfirmModal.test.tsx` com `../utils/recargaClient` (ou `../services/api`) mockado e `item` via props
    - Render `null` quando fechado (R1.2); exibe dados reais do item (R2.1–R2.4); Phone_Field vazio com label (R3.1, R3.7); edição atualiza valor e limpa validação (R3.2, R3.6); confirmar inválido/vazio exibe mensagem e não invoca serviço (R3.3, R3.4, R4.1); confirmar válido invoca o serviço uma única vez (R4.2); cancelar e Esc fecham sem invocar (R4.3, R4.4); `submitting` desabilita controles, mostra progresso e cliques repetidos não reenviam (R5.2–R5.5); sucesso mostra confirmação (R6.2); erro mantém aberto com controles habilitados e sem texto de sucesso/"simulado" (R7.2, R7.3, R7.7); 401 não mostra sucesso (R8.3)
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 6.2, 7.2, 7.3, 7.7, 8.3_

  - [ ]* 6.3 Testes de acessibilidade (RTL + user-event)
    - Adicionar ao `apps/frontend/src/components/RecargaConfirmModal.test.tsx`
    - `role="dialog"` com nome acessível (R9.1); focus trap com Tab/Shift+Tab (R9.2); foco inicial interno (R9.3); Esc fecha fora de `submitting` e não fecha durante `submitting` (R9.4); label associado e botões operáveis por teclado (R9.5)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7. Checkpoint final - Validação do workspace frontend (opcional)
  - [ ]* 7.1 Rodar build e testes do frontend
    - `npm run build --workspace apps/frontend` e `npm run test --workspace apps/frontend` (vitest `--run`)
    - Garantir que a build e todos os testes passam; perguntar à usuária se surgirem dúvidas
    - Observação: `npm run lint --workspace apps/frontend` é **opcional** e pode falhar por **incompatibilidade de toolchain pré-existente** no ambiente (não relacionada a esta feature); não bloquear a conclusão por causa do lint
    - _Requirements: 8.1_

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido.
- Cada tarefa referencia cláusulas de requisito específicas (R1..R9) para rastreabilidade.
- Property tests validam as propriedades universais do design (fast-check, mín. 100 iterações, com tag `// Feature: cha-62-...`); testes de exemplo/componente cobrem exemplos, edge cases e acessibilidade.
- Escopo **frontend apenas** (`apps/frontend`): nenhuma tarefa de backend.
- **Fora de escopo (Q2/D1):** sem integração à `CatalogoRecargas.tsx`. O modal é exercitado nos testes com `item` por props e `api` mockado; a reconciliação da Catalog_Screen ao `GET /payments/catalog` é dependência externa.
- O cliente HTTP compartilhado (`services/api.ts`) e seu interceptor global de 401 são reutilizados sem alteração.
- O `lint` do frontend pode falhar por motivo pré-existente de toolchain; a validação obrigatória considerada é build + testes.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] }
  ]
}
```
