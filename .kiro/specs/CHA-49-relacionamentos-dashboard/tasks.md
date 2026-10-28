# Implementation Plan: CHA-49 - Relacionamentos dos dados do dashboard do diretor

> **NOTA IMPORTANTE — Migration apenas `--create-only` (NÃO aplicada)**
>
> Esta entrega é a **parte segura** de implementação de dados. A migration Prisma é gerada **somente** com `npx prisma migrate dev --create-only`, que escreve o SQL em `apps/backend/prisma/migrations` **sem aplicar no banco**. **Nunca** executar `prisma migrate deploy` nem `prisma migrate dev` (sem `--create-only`) nesta entrega: aplicar agora criaria conflito com a PR #76 (CHA-170, que também altera `StudentProfile`) e com o trabalho de **joao.mancio (CHA-49)**. A aplicação/deploy da migration fica para **revisão e coordenação** posteriores.
>
> **Fora do escopo desta spec de dados:** o controller/rota/endpoint `GET /dashboard/director` pertence à **CHA-48** e a autorização diretor/admin à **CHA-168**. Esta spec cobre schema, migration (create-only), repositório, service e testes de agregação.
>
> **Fronteira de camadas:** o Prisma é usado **somente** na camada `repositories/`.

## Overview

A implementação é incremental e segue a ordem de dependência: schema → validate → migration (create-only) → generate → repository → service → testes → verificação. Cada passo constrói sobre o anterior e termina na integração service + testes, sem código órfão.

## Tasks

- [x] 1. Alterar o schema Prisma com a entidade de turma e o vínculo do aluno
  - Editar `apps/backend/prisma/schema.prisma`
  - Adicionar `model SchoolClass` com `@@map("school_classes")`: `id String @id @default(uuid())`, `name String`, `schoolId String`, relação `school School @relation(fields: [schoolId], references: [id], onDelete: Restrict)`, `students StudentProfile[]`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `@@index([schoolId])`
  - Adicionar em `School` a relação inversa `classes SchoolClass[]`
  - Adicionar em `StudentProfile` o campo `classId String?` e a relação `class SchoolClass? @relation(fields: [classId], references: [id], onDelete: SetNull)`, mais `@@index([schoolId])` e `@@index([classId])`
  - Mudança não destrutiva: `classId` nullable, `SchoolClass` nova, `onDelete: SetNull` no aluno
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 12.1_

- [x] 2. Validar o schema Prisma
  - Rodar `npx prisma validate` em `apps/backend`
  - Garantir que o schema editado é válido antes de gerar qualquer migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_

- [ ] 3. Gerar a migration somente com `--create-only` (sem aplicar)
  - Rodar `npx prisma migrate dev --create-only --name add_school_class_and_student_class` em `apps/backend`
  - **NÃO aplicar** a migration no banco
  - Revisar o SQL gerado em `apps/backend/prisma/migrations`: confirmar criação de `school_classes`, `class_id` nullable em `student_profiles`, `ON DELETE SET NULL` no vínculo aluno→turma, `ON DELETE RESTRICT` no vínculo turma→escola e os índices `schoolId`/`classId`
  - Confirmar migration atômica (uma única mudança coesa)
  - _Requirements: 12.2, 12.4, 12.5_

- [x] 4. Regenerar o Prisma Client
  - Rodar `npx prisma generate` em `apps/backend` para atualizar os tipos do client com `SchoolClass` e `StudentProfile.classId`
  - Garantir que os novos tipos estejam disponíveis para o repositório
  - _Requirements: 11.3_

- [ ] 5. Implementar o repositório de agregação do dashboard
  - [x] 5.1 Definir os tipos do contrato agregado
    - Em `apps/backend/src/repositories/dashboard.repository.ts` (ou arquivo de tipos compartilhado do repositório), definir `SubjectGap`, `ClassDashboard` e `DirectorDashboard` conforme o contrato do design
    - `gapRate` em `[0, 1]`; `classId: string | null`; `hasData: boolean`
    - _Requirements: 11.1, 11.2_

  - [x] 5.2 Implementar `getDirectorDashboard(schoolId)` com a query de agregação
    - Em `apps/backend/src/repositories/dashboard.repository.ts`, implementar a função seguindo o caminho `StudentProfile → MockExam → Attempt → AttemptAnswer → Question`
    - Filtrar `Attempt.status = SUBMITTED` e `AttemptAnswer.isCorrect != null`
    - Agrupar por `classId`, `subject` e `concept`; incluir o grupo `classId = null` (sem turma)
    - Calcular `gapRate = wrong / answered`, retornando `0` quando `answered = 0` (sem divisão por zero)
    - Prisma usado **apenas** neste arquivo (fronteira de camada)
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 7.3, 9.1, 10.1, 10.2, 11.3_

  - [x]* 5.3 Escrever teste de propriedade para a taxa de defasagem limitada
    - **Property 1: Taxa de defasagem limitada ao intervalo [0, 1]**
    - **Validates: Requirements 7.1, 7.2**

  - [x]* 5.4 Escrever teste de propriedade para o denominador que ignora respostas sem correção
    - **Property 3: Denominador ignora respostas sem correção**
    - **Validates: Requirements 6.1, 6.2**

  - [x]* 5.5 Escrever teste de propriedade para considerar apenas tentativas SUBMITTED
    - **Property 4: Apenas tentativas SUBMITTED entram no cálculo**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 6. Implementar o service do dashboard
  - [x] 6.1 Implementar `getDirectorDashboard(schoolId)` no service
    - Em `apps/backend/src/services/dashboard.service.ts`, chamar o repositório e garantir que **todas** as turmas da escola apareçam, inclusive as sem dados (`hasData = false`, `breakdown: []`)
    - Não acessar Prisma diretamente (delega ao repositório)
    - _Requirements: 8.1, 8.2, 11.1_

  - [x]* 6.2 Escrever teste de propriedade para turma sem dados
    - **Property 2: Turma sem tentativas submetidas não quebra a agregação**
    - **Validates: Requirements 8.1, 8.2, 7.3**

  - [x]* 6.3 Escrever teste unitário para o grupo de alunos sem turma
    - Verificar que alunos com `classId = null` aparecem agrupados como `classId = null` no contrato
    - _Requirements: 9.1_

- [x] 7. Checkpoint - garantir que os testes passam
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Verificação final e registro de restrições
  - Rodar `npm test -w apps/backend` e `npx prisma validate`
  - Registrar explicitamente que a migration foi gerada **apenas com `--create-only` (não aplicada)** e que a aplicação/deploy fica para a coordenação com joao.mancio / CHA-48 / PR #76 (CHA-170)
  - _Requirements: 12.3, 12.6_

## Notes

- Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido.
- Cada tarefa referencia requisitos específicos para rastreabilidade.
- Os checkpoints asseguram validação incremental.
- Testes de propriedade validam as Correctness Properties do design; mínimo de 100 iterações por propriedade. Tag sugerida: **Feature: CHA-49-relacionamentos-dashboard, Property {número}: {texto}**.
- **A migration é apenas `--create-only` (não aplicada).** Controller/rota/endpoint pertencem à CHA-48; autorização à CHA-168 — fora do escopo desta spec.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["5.3", "5.4", "5.5"] },
    { "id": 7, "tasks": ["6.1"] },
    { "id": 8, "tasks": ["6.2", "6.3"] },
    { "id": 9, "tasks": ["8"] }
  ]
}
```

## Status da implementação (Opção 1)

- **Concluído:** schema.prisma editado (SchoolClass + classId em StudentProfile + relação em School) e validado com `prisma validate`; Prisma Client regenerado; repositório `dashboard.repository.ts` (com função pura `agregarDefasagem`) e service `dashboard.service.ts` implementados (Prisma só no repositório); testes em `dashboard.repository.test.ts` passando (5/5), cobrindo as Correctness Properties.
- **PENDENTE — Tarefa 3 (migration):** a migration NÃO foi gerada. O `.env` da raiz aponta o `DATABASE_URL`/`DIRECT_URL` para o banco de PRODUÇÃO no Supabase (`aws-0-...pooler.supabase.com`), e `prisma migrate dev --create-only` detectou drift e tentou operar contra produção (chegou a sugerir reset, que apagaria dados). Por segurança (regra do AGENTS.md: nunca operar migration contra produção), a geração foi interrompida. Há ainda a migration `20261028205258_year_id_student_profile` (PR #76 / CHA-170) aplicada em produção e ausente localmente — fonte de conflito.
- **Como concluir com segurança:** apontar `DATABASE_URL`/`DIRECT_URL` para um banco LOCAL (Docker), sincronizar o histórico de migrations (incluindo a `year_id_student_profile` da CHA-170), e então rodar `npx prisma migrate dev --create-only --name add_school_class_and_student_class`, revisar o SQL e coordenar com joao.mancio (CHA-49) e a PR #76 antes de aplicar/mergear.
- **Tarefa 8:** `prisma validate` OK; testes do dashboard OK. `npm test -w apps/backend` completo e o `tsc` geral acusam erros PRÉ-EXISTENTES (dependências não instaladas: jsonwebtoken, @supabase/supabase-js, socket.io/-client; e erros em outras features), não relacionados à CHA-49.