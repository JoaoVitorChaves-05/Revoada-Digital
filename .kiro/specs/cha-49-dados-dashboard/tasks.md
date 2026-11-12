# Implementation Plan: CHA-49 — Endpoint de desempenho por área

## Overview

Implementa o endpoint `GET /dashboard/me/desempenho-areas`, que agrega o desempenho do aluno por área do ENEM (questões resolvidas, taxa de acerto e taxa por faixa de dificuldade). Estende os arquivos de dashboard já existentes no backend (controller, service, repository, routes). Alimenta a aba Disciplinas e o bloco "Desempenho por área" do Dashboard. Referência: design.md.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3"] },
    { "wave": 3, "tasks": ["4"] },
    { "wave": 4, "tasks": ["5"] },
    { "wave": 5, "tasks": ["6"] },
    { "wave": 6, "tasks": ["7"] }
  ]
}
```

## Tasks

- [x] 1. Função pura de agregação por área
  - Criar `agregarPorArea(answers)` em `apps/backend/src/services/dashboard.service.ts`.
  - Mapa subject -> área do ENEM (Linguagens, Ciências Humanas, Ciências da Natureza, Matemática).
  - Mapa difficulty -> faixa (0 e 1 = Fáceis, 2 = Médias, 3 = Difíceis).
  - Sempre retornar as 4 áreas; área sem answers vem zerada.
  - Questão interdisciplinar (subject[] com N itens) conta para cada área.
  - taxaAcerto = round(acertos/total*100), 0..100; isCorrect null = não-acerto; total 0 => 0.
  - _Validates: Property 1, Property 2, Property 3, Property 4_

- [x] 2. Query no repository
  - Em `apps/backend/src/repositories/dashboard.repository.ts`, adicionar `findAnswersComQuestaoByStudent(studentId)`.
  - Buscar answers de attempts (status SUBMITTED) dos mock_exams do aluno, selecionando `isCorrect` e `question: { subject, difficulty }`.
  - _Validates: Property 5_

- [x] 3. Função no service
  - Em `dashboard.service.ts`, `getDesempenhoAreas(studentId)`: chama o repository e aplica `agregarPorArea`.
  - Lançar erro claro se o aluno não existir (para o controller traduzir em 404).
  - _Depende de: 1, 2_

- [x] 4. Controller
  - Em `dashboard.controller.ts`, `getDesempenhoAreas(req, res)`: resolve o aluno (mesmo padrão dos endpoints de dashboard existentes), chama o service, retorna 200 com `{ areas }`.
  - Tratar: 400 (sem identificação do aluno), 404 (aluno inexistente), 500 (erro interno).
  - _Depende de: 3_

- [x] 5. Registrar a rota
  - Em `apps/backend/src/routes/dashboard.routes.ts`, adicionar `GET /me/desempenho-areas` apontando para o controller.
  - _Depende de: 4_

- [x] 6. Testes
  - Unitários de `agregarPorArea` cobrindo as Correctness Properties (vazio, uma área, interdisciplinar, difficulty 0..3, isCorrect null).
  - Teste de rota (mockando o repository) para 200 (com e sem dados), 400 e 404.
  - Rodar `npm test --workspace apps/backend`.
  - _Validates: Property 1, Property 2, Property 3, Property 4, Property 5_

- [x] 7. Validação manual
  - Subir o backend local e chamar `GET /dashboard/me/desempenho-areas` para um aluno com tentativas; conferir as 4 áreas e as taxas.
  - _Depende de: 5_

## Notes

- Não altera o schema Prisma — todas as tabelas/relacionamentos já existem.
- Fora de escopo (tarefas separadas): ligar o frontend (DisciplinasScreen e BlocoDesempenhoAreas) ao endpoint; e o `GET /dashboard/me/resumo` (ver Decisões no design).
- A agregação fica em função pura para ser testável, espelhando o `getClassPerformance` já existente no `dashboard.service`.