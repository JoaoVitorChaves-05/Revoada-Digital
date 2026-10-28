# Requirements Document

## Introduction

Esta spec documenta os requisitos de **planejamento de dados** para os relacionamentos que alimentarão o dashboard do diretor (US-07 / CHA-47), no qual um diretor visualiza o panorama de defasagens por turma e por matéria/conceito. O escopo é **exclusivamente de modelagem e estratégia de obtenção de dados**: não há edição de `schema.prisma`, geração de migration nem código de repositório/serviço nesta spec.

Os requisitos abaixo capturam **o que** a modelagem e a estratégia de agregação precisam garantir, de forma testável e rastreável, para que a implementação posterior (CHA-49 schema/migration, coordenada com joao.mancio, e CHA-48 endpoint) seja consistente com este planejamento. A implementação real e os testes automatizados pertencem às tasks de implementação, não a esta spec.

## Glossary

- **Modelo_De_Dados**: conjunto de entidades, campos e relacionamentos propostos para o schema Prisma do backend que suportam o dashboard do diretor.
- **Turma** (**SchoolClass**): entidade proposta que representa uma turma pertencente a uma escola, usada para agrupar a defasagem no dashboard.
- **School**: entidade existente que representa uma escola; dona das turmas e dos perfis de aluno.
- **StudentProfile**: entidade existente que representa o perfil de um aluno, vinculada a uma `School` e, opcionalmente, a uma `Turma`.
- **MockExam**: entidade existente que representa um simulado de um aluno.
- **Attempt**: entidade existente que representa uma tentativa de resolução de um simulado, com um `status`.
- **AttemptAnswer**: entidade existente que representa a resposta de uma questão dentro de uma tentativa, com o campo `isCorrect`.
- **Question**: entidade existente que representa uma questão, com os campos `subject` (matéria) e `concept` (conceito).
- **Tentativa_Submetida**: `Attempt` cujo `status` é igual a `SUBMITTED`; tentativas com `status` `IN_PROGRESS` ou `ABANDONED` não são tentativas submetidas.
- **Resposta_Corrigida**: `AttemptAnswer` cujo campo `isCorrect` é não nulo (`true` ou `false`).
- **Defasagem**: proporção de erros de uma turma em uma matéria/conceito, correspondente à razão entre respostas incorretas e respostas corrigidas.
- **Taxa_De_Defasagem** (**gapRate**): valor numérico `erros / respondidas` que quantifica a `Defasagem`, definido no intervalo fechado `[0, 1]`.
- **Estrategia_De_Agregacao**: estratégia de obtenção dos dados de defasagem por query em tempo real, sem tabela ou view materializada, descrita no design.
- **Contrato_Dashboard** (**DirectorDashboard**): shape de dados agregado exposto pela camada de repositório ao service, contendo as turmas e seus respectivos breakdowns por matéria/conceito.
- **Repositorio_Dashboard** (**DashboardRepository**): componente da camada `repositories/`, único ponto onde o Prisma é usado, responsável por executar a agregação e devolver o `Contrato_Dashboard`.
- **Grupo_Sem_Turma**: agrupamento de saída que representa os alunos cujo `classId` é nulo, identificado por `classId = null` no `Contrato_Dashboard`.
- **ProfileType**: enum existente de tipos de perfil; não recebe o valor `DIRECTOR` nesta modelagem.

## Requirements

### Requirement 1: Entidade de Turma (SchoolClass)

**User Story:** Como diretor, quero que o modelo de dados preveja uma entidade de turma pertencente a uma escola, para que a defasagem possa ser agrupada por turma no dashboard (US-07).

#### Acceptance Criteria

1. THE Modelo_De_Dados SHALL prever a entidade Turma com os campos `id`, `name`, `schoolId`, `createdAt` e `updatedAt`.
2. THE Modelo_De_Dados SHALL definir uma relação entre a entidade Turma e a entidade School na qual cada Turma pertence a exatamente uma School.
3. THE Modelo_De_Dados SHALL definir na entidade School a relação inversa que lista as turmas pertencentes à School.
4. WHERE a remoção de uma School é solicitada enquanto existirem turmas vinculadas, THE Modelo_De_Dados SHALL restringir a remoção da School (`onDelete: Restrict`).

### Requirement 2: Vínculo opcional entre aluno e turma

**User Story:** Como responsável pela modelagem, quero que o vínculo entre aluno e turma seja opcional, para que a mudança seja não destrutiva e um aluno possa existir sem turma.

#### Acceptance Criteria

1. THE Modelo_De_Dados SHALL definir no StudentProfile o campo `classId` como opcional (nullable).
2. THE Modelo_De_Dados SHALL definir no StudentProfile a relação opcional com a entidade Turma por meio do campo `classId`.
3. WHERE uma Turma vinculada a alunos é removida, THE Modelo_De_Dados SHALL atribuir `classId = null` aos StudentProfile afetados sem removê-los nem bloquear a remoção da Turma (`onDelete: SetNull`).

### Requirement 3: Filtro por escola e agrupamento por turma e matéria/conceito

**User Story:** Como diretor, quero que o panorama seja filtrado pela minha escola e organizado por turma e por matéria/conceito, para que eu enxergue onde estão as defasagens.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL filtrar os dados pelo identificador de escola `school_id` fornecido como entrada, alinhado à CHA-48.
2. THE Estrategia_De_Agregacao SHALL agrupar o resultado por Turma por meio do `classId` do StudentProfile.
3. THE Estrategia_De_Agregacao SHALL agrupar o resultado por matéria (`Question.subject`) e por conceito (`Question.concept`) dentro de cada Turma.

### Requirement 4: Fonte da métrica de defasagem

**User Story:** Como responsável pela modelagem, quero que a defasagem seja derivada das respostas das questões, para que a métrica reflita o desempenho real dos alunos.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL calcular a Defasagem a partir do campo `isCorrect` de AttemptAnswer.
2. THE Estrategia_De_Agregacao SHALL percorrer o caminho de relacionamentos StudentProfile → MockExam → Attempt → AttemptAnswer → Question para obter as respostas que compõem a Defasagem.

### Requirement 5: Considerar apenas tentativas submetidas

**User Story:** Como diretor, quero que apenas tentativas concluídas contem para a defasagem, para que resultados parciais ou abandonados não distorçam o panorama.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL considerar somente respostas vinculadas a Tentativa_Submetida (`Attempt.status = SUBMITTED`).
2. THE Estrategia_De_Agregacao SHALL excluir do cálculo as respostas vinculadas a tentativas com `status` igual a `IN_PROGRESS` ou `ABANDONED`.

### Requirement 6: Denominador da taxa de defasagem

**User Story:** Como responsável pela modelagem, quero que apenas respostas corrigidas componham o denominador, para que a taxa de defasagem seja calculada corretamente.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL contar como respondidas (`answered`) somente as AttemptAnswer cujo `isCorrect` é não nulo.
2. THE Estrategia_De_Agregacao SHALL excluir do denominador da Taxa_De_Defasagem as respostas cujo `isCorrect` é nulo.

### Requirement 7: Taxa de defasagem válida

**User Story:** Como diretor, quero que a taxa de defasagem seja sempre um valor válido, para que o dashboard não exiba números inconsistentes nem falhe por divisão por zero.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL calcular a Taxa_De_Defasagem como `erros / respondidas`.
2. THE Estrategia_De_Agregacao SHALL produzir uma Taxa_De_Defasagem contida no intervalo fechado `[0, 1]`.
3. IF o total de respondidas é igual a zero, THEN THE Estrategia_De_Agregacao SHALL retornar Taxa_De_Defasagem igual a `0` sem efetuar divisão por zero.

### Requirement 8: Turma sem dados no panorama

**User Story:** Como diretor, quero que as turmas sem tentativas submetidas ainda apareçam no panorama, para que eu saiba quais turmas não têm dados.

#### Acceptance Criteria

1. WHERE uma Turma não possui respostas corrigidas em Tentativa_Submetida, THE Contrato_Dashboard SHALL representar a Turma com `hasData = false` e `breakdown` vazio.
2. WHERE uma Turma não possui dados, THE Estrategia_De_Agregacao SHALL concluir a agregação sem erro.

### Requirement 9: Grupo de alunos sem turma

**User Story:** Como diretor, quero que alunos sem turma apareçam agrupados à parte, para que nenhum aluno fique fora do panorama.

#### Acceptance Criteria

1. WHERE existem StudentProfile com `classId` nulo, THE Contrato_Dashboard SHALL representar esses alunos como o Grupo_Sem_Turma identificado por `classId = null`.

### Requirement 10: Agregação em tempo real

**User Story:** Como responsável pela arquitetura, quero que a agregação seja feita por query em tempo real, para que os dados fiquem sempre consistentes e sem otimização prematura.

#### Acceptance Criteria

1. THE Estrategia_De_Agregacao SHALL obter os dados por query em tempo real.
2. THE Estrategia_De_Agregacao SHALL operar sem tabela ou view materializada nesta fase.

### Requirement 11: Contrato de saída agregado

**User Story:** Como desenvolvedor da CHA-48, quero um contrato agregado estável vindo do repositório, para que o endpoint do dashboard seja alimentado com dados já organizados.

#### Acceptance Criteria

1. THE Repositorio_Dashboard SHALL expor o Contrato_Dashboard (`DirectorDashboard`) contendo o `schoolId` e a lista de turmas (`classes`).
2. THE Contrato_Dashboard SHALL representar cada Turma com um `breakdown` por matéria/conceito e a respectiva Taxa_De_Defasagem (`gapRate`).
3. THE Modelo_De_Dados SHALL restringir o uso do Prisma à camada `repositories/`.

### Requirement 12: Restrições da migration quando implementada

**User Story:** Como responsável pela entrega, quero que as restrições da futura migration estejam documentadas, para que a implementação seja segura, coordenada e não destrutiva.

#### Acceptance Criteria

1. THE Modelo_De_Dados SHALL manter a mudança proposta não destrutiva, preservando os StudentProfile existentes com `classId = null`.
2. WHERE a migration for implementada, THE migration SHALL ser atômica, contendo uma única mudança coesa.
3. WHERE a migration for mergeada, THE migration SHALL permanecer imutável, com correções entregues em nova migration.
4. WHERE a migration for criada, THE migration SHALL ser gerada com `prisma migrate --create-only` e revisada antes de ser aplicada.
5. THE spec de planejamento SHALL abster-se de gerar a migration nesta fase.
6. WHERE a migration for implementada, THE implementação SHALL ser coordenada com joao.mancio (CHA-49) e com a CHA-48.

### Requirement 13: Distinção de diretor fora do modelo de dados

**User Story:** Como responsável pela modelagem, quero que a distinção de diretor fique na autorização, para que o modelo de dados permaneça simples e sem migration de enum.

#### Acceptance Criteria

1. THE Modelo_De_Dados SHALL abster-se de adicionar o valor `DIRECTOR` ao ProfileType.
2. THE Modelo_De_Dados SHALL delegar a distinção de diretor à camada de autorização (CHA-168).
