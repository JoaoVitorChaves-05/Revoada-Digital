# Design — CHA-49: Dados de desempenho para a aba Disciplinas e o Dashboard do Início

## Overview

A CHA-49 define a estratégia de obtenção dos dados de desempenho exibidos em duas telas que já existem no frontend e hoje usam dados mockados ou placeholders:

1. **Aba Disciplinas** (`DisciplinasScreen`): desempenho por área do ENEM — questões resolvidas, taxa de acerto e acerto por nível de dificuldade. Hoje com números fixos no código.
2. **Dashboard do Início**, bloco "Seu desempenho por área" (`BlocoDesempenhoAreas`): hoje é placeholder "em breve" porque `GET /attempts?userId=` não retorna o `subject` da questão.

O Dashboard já deriva no frontend (via `derivarMetricas`) as métricas que dependem só das answers (questões resolvidas geral, taxa de acerto geral, streak, frequência de 7 dias). **O que falta é a agregação por disciplina e por dificuldade**, que exige cruzar as answers com `Question.subject`/`Question.difficulty` — feito no backend.

Este design cria endpoints de agregação read-only. Não há alteração de schema: as tabelas e relacionamentos necessários já existem (criados em tarefas anteriores).

## Architecture

Fluxo da requisição, seguindo o padrão em camadas do backend (Express + Prisma):

```
Front (DisciplinasScreen / BlocoDesempenhoAreas)
  -> GET /dashboard/me/desempenho-areas
    -> dashboard.routes  -> dashboard.controller -> dashboard.service -> dashboard.repository -> Prisma
```

Caminho dos dados no banco (de um aluno até o desempenho por área):

```
student_profiles (id)
  -> mock_exams (studentId)
    -> attempts (mockExamId, status)
      -> attempt_answers (attemptId, questionId, isCorrect)
        -> questions (subject[], difficulty)
```

- A **query** (repository) busca as answers submetidas do aluno, trazendo de cada question apenas `subject` e `difficulty`.
- A **agregação** (service) é função pura: mapeia subject -> área do ENEM, difficulty -> faixa, e calcula contagens e taxas. Espelha o `getClassPerformance` já existente no `dashboard.service`, que agrupa por subject.
- O **controller** trata entrada/erros; a **rota** registra o endpoint.

## Components and Interfaces

**Backend (apps/backend/src):**
- `routes/dashboard.routes.ts` — adiciona `GET /dashboard/me/desempenho-areas`.
- `controllers/dashboard.controller.ts` — `getDesempenhoAreas(req, res)`: resolve o aluno (userId/studentId como o dashboard já faz), chama o service, retorna 200 com o payload ou trata erro.
- `services/dashboard.service.ts` — `getDesempenhoAreas(studentId)`: orquestra o fetch (repository) e a agregação (função pura `agregarPorArea`).
- `repositories/dashboard.repository.ts` — `findAnswersComQuestaoByStudent(studentId)`: Prisma query retornando `{ isCorrect, question: { subject, difficulty } }[]`.

**Função pura de agregação (testável):**
- `agregarPorArea(answers): AreaDesempenho[]` — recebe as answers com subject/difficulty e devolve o payload por área.

**Frontend (consumo, numa tarefa de ligação posterior):**
- `DisciplinasScreen` e `BlocoDesempenhoAreas` passam a consumir o endpoint em vez do mock/placeholder.

## Data Models

Nenhuma mudança no schema Prisma. Modelos já existentes e usados:
- `Question.subject: String[]`, `Question.difficulty: Int`.
- `AttemptAnswer.isCorrect: Boolean?`, relações `attempt` e `question`.
- `Attempt.status`, `Attempt.mockExam.studentId`.

**Mapa Disciplina (ENEM) -> subjects:**
- Linguagens: Língua Portuguesa, Literatura, Inglês, Espanhol, Artes, Educação Física
- Ciências Humanas: História, Geografia, Filosofia, Sociologia
- Ciências da Natureza: Biologia, Química, Física
- Matemática: Matemática

**Faixas de dificuldade:** `difficulty` 1 = Fáceis, 2 = Médias, 3 = Difíceis (confirmar com o seed).

**Contrato do endpoint `GET /dashboard/me/desempenho-areas`:**
```json
{
  "areas": [
    {
      "area": "Matemática",
      "questoesResolvidas": 340,
      "taxaAcerto": 74,
      "porDificuldade": [
        { "nivel": "Fáceis", "taxaAcerto": 92 },
        { "nivel": "Médias", "taxaAcerto": 78 },
        { "nivel": "Difíceis", "taxaAcerto": 64 }
      ]
    }
  ]
}
```
- `questoesResolvidas`: COUNT de answers cuja question pertence à área (questão interdisciplinar conta para cada área do seu subject[]).
- `taxaAcerto`: % de `isCorrect = true` sobre o total de answers da área (0..100, inteiro). null conta como não-acerto.
- `porDificuldade`: mesma taxa agrupada por faixa.

## Decisões tomadas

1. **Área sem answers aparece zerada** (não é omitida): o endpoint sempre retorna as 4 áreas do ENEM; as sem dados vêm com zeros. Mantém o layout das telas estável (sempre 4 cards) e evita "sumir" disciplina.
2. **Faixas de dificuldade**: `difficulty` é 0..3 no banco. Agrupado em 3 faixas (Fáceis = 0 e 1, Médias = 2, Difíceis = 3) para casar com os 3 níveis que as telas exibem.
3. **Retorno agrupado por área (não por subject)**: o backend já devolve consolidado nas 4 áreas do ENEM. Razão: as duas telas raciocinam por área; agrupar no servidor evita duplicar o mapa subject->área no front e mantém uma fonte única da regra.
4. **Sem `GET /dashboard/me/resumo` por ora**: o Dashboard do Início já deriva questões resolvidas/taxa/streak/frequência no front a partir de `/attempts`, e funciona. Criar um endpoint que duplica isso seria retrabalho sem ganho agora. Escopo: só o endpoint de desempenho por área, que é o dado que falta. Pode ser revisto depois se quisermos tirar a lógica do cliente.

## Correctness Properties

### Property 1: Taxa em faixa válida
Para toda área, `0 <= taxaAcerto <= 100`; idem para cada `porDificuldade.taxaAcerto`.

### Property 2: Consistência de contagem
`questoesResolvidas` de uma área = soma das answers daquela área; nunca negativo.

### Property 3: Aluno sem answers
Retorna `areas` vazio (ou áreas zeradas, conforme requisitos), sem erro e sem divisão por zero.

### Property 4: Interdisciplinar
Uma answer cuja question tem N subjects contribui para as N áreas correspondentes.

### Property 5: Isolamento por aluno
O resultado considera apenas answers de mock_exams do `studentId` informado.

## Error Handling

- Aluno (studentId) inexistente: 404 com mensagem clara.
- Falha de query/banco: 500 com mensagem genérica (sem vazar detalhe interno).
- Aluno válido sem tentativas: 200 com `areas` vazio (não é erro).
- Entrada ausente (sem userId/studentId): 400.

## Testing Strategy

- **Unitário (função pura `agregarPorArea`):** cobre P1–P4 com conjuntos de answers montados à mão (vazio, uma área, interdisciplinar, difficulty variado, isCorrect null). Espelha o estilo dos testes de `dashboard.service` já existentes.
- **Integração (rota):** mocka o repository e valida o payload e os códigos de status (200 vazio, 404, 400).
- Rodar `npm test --workspace apps/backend`.

## Fora de escopo
- Alterações de schema (não há).
- Dashboard do diretor (outra tarefa).
- Ligar o botão "Estudar" da aba Disciplinas ao simulado (ajuste de front, separado).