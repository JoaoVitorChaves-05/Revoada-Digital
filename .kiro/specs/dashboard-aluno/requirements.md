# Requirements Document

## Introduction

Esta feature entrega a tela inicial do aluno logado (dashboard / "Início") da plataforma Revoada Digital, no frontend React + TypeScript + Vite em `apps/frontend`. O layout segue o SVG do Figma fornecido pelo usuário e reaproveita a paleta de `src/utils/colors.ts`.

O escopo é exclusivamente de frontend. Nenhum endpoint de backend é criado nesta feature. Nesta fase (Fase 1), todos os números exibidos que forem derivados de dados reais vêm do endpoint já existente `GET /attempts?userId=<id>`, processados no cliente. Blocos cujos dados não são deriváveis hoje são renderizados com estado "em breve" (placeholder), sem quebrar a tela. A substituição por endpoints autenticados dedicados é tratada como Fase 2, fora do escopo desta feature.

A autenticação (emissão de JWT) está em desenvolvimento em paralelo e ainda não está pronta. Por isso, o dashboard obtém o `userId` atual por meio de uma interface de sessão desacoplada (um módulo/contexto no frontend), com um valor de fallback configurável, sem depender de token válido nesta fase.

### Restrição de fonte de dados (decisão alinhada com o usuário)

- **Deriváveis de `GET /attempts?userId=` nesta fase:** questões resolvidas, taxa de acerto geral, frequência semanal (últimos 7 dias) e sequência/streak aproximados — a partir dos campos de cada tentativa (`status`, `startedAt`, `submittedAt`, `score`, `correctAnswers`, `totalQuestions`) e dos registros `answers` (`isCorrect`, `answeredAt`).
- **Observação importante sobre desempenho por área:** o campo `Question.subject` existe no schema Prisma, porém a resposta atual de `GET /attempts?userId=` (via `findByUserId`) inclui `answers` **sem** a relação `question` aninhada e, portanto, **sem** `subject`. Logo, o desempenho por área (Linguagens, Ciências Humanas, Matemática, Ciências da Natureza) **não é derivável diretamente** da resposta atual desse endpoint. Nesta fase, o bloco "Seu desempenho" é tratado como placeholder "em breve" (ver Requisito 11), salvo decisão posterior de estender o `include` do endpoint (trabalho de backend, fora do escopo) ou de agregar chamadas adicionais por tentativa. Esta é uma ponta solta deliberadamente deixada para depois.

## Glossary

- **Dashboard_Aluno**: Tela (screen) inicial do aluno logado em `apps/frontend`, responsável por exibir os blocos de visão geral de estudos.
- **Serviço_Sessão**: Módulo/contexto do frontend que fornece o `userId` atual (e, futuramente, o token). Nesta fase retorna o `userId` por uma fonte configurável com valor de fallback.
- **Cliente_Attempts**: Função/utilitário do frontend que consome `GET /attempts?userId=<id>` a partir da URL base `http://localhost:3000`, no mesmo padrão de `src/pages/PainelDesempenho.page.tsx`.
- **Derivador_Metricas**: Utilitário do frontend (em `src/utils`) que calcula métricas deriváveis (questões resolvidas, taxa de acerto, frequência semanal, streak) a partir da lista de tentativas.
- **Tentativa**: Registro retornado por `GET /attempts?userId=` (campos `status`, `startedAt`, `submittedAt`, `score`, `correctAnswers`, `totalQuestions`) e seus `answers` (`isCorrect`, `answeredAt`).
- **Bloco_Placeholder**: Bloco visual cujo dado não é derivável na Fase 1 e que exibe um rótulo "em breve"/skeleton estável em vez de dados reais.
- **Estado_Carregamento**: Estado do Dashboard_Aluno enquanto a requisição a `GET /attempts?userId=` está pendente.
- **Estado_Erro**: Estado do Dashboard_Aluno quando a requisição a `GET /attempts?userId=` falha.
- **Estado_Vazio**: Estado do Dashboard_Aluno quando a requisição retorna zero tentativas.

## Requirements

### Requirement 1: Registro da tela no esquema de navegação existente

**User Story:** Como aluno logado, quero acessar a tela "Início" pelo mesmo mecanismo de navegação já usado no app, para que a experiência seja consistente sem introduzir novas dependências.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL ser registrado como um valor adicional do tipo `Screen` controlado por `useState` em `src/App.tsx`.
2. WHEN o valor de `Screen` corresponde ao Dashboard_Aluno, THE App SHALL renderizar o Dashboard_Aluno.
3. THE Dashboard_Aluno SHALL expor uma ação de navegação de retorno equivalente ao padrão `onBack` usado pelas telas existentes em `src/App.tsx`.
4. THE Dashboard_Aluno SHALL ser implementado sem adicionar biblioteca de roteamento ao pacote `apps/frontend`.

### Requirement 2: Interface de sessão para obtenção do userId

**User Story:** Como aluno logado, quero que o dashboard identifique quem sou eu por uma interface de sessão desacoplada, para que a tela funcione antes de a autenticação por token estar pronta e migre sem reescrita quando ela ficar.

#### Acceptance Criteria

1. THE Serviço_Sessão SHALL expor o `userId` atual do aluno por meio de uma interface única consumida pelo Dashboard_Aluno.
2. WHERE nenhum `userId` de sessão estiver disponível, THE Serviço_Sessão SHALL retornar um `userId` de fallback configurável.
3. THE Dashboard_Aluno SHALL obter o `userId` exclusivamente a partir do Serviço_Sessão.
4. THE Serviço_Sessão SHALL definir um ponto de extensão para o token de autenticação futuro sem exigir alteração nos componentes de bloco do Dashboard_Aluno.

### Requirement 3: Carregamento das tentativas do aluno

**User Story:** Como aluno logado, quero que o dashboard carregue meu histórico de tentativas ao abrir, para que meus números reais sejam exibidos.

#### Acceptance Criteria

1. WHEN o Dashboard_Aluno é montado, THE Cliente_Attempts SHALL requisitar `GET /attempts?userId=<id>` usando a URL base `http://localhost:3000` e o `userId` do Serviço_Sessão.
2. WHILE a requisição a `GET /attempts?userId=` está pendente, THE Dashboard_Aluno SHALL exibir o Estado_Carregamento.
3. IF a requisição a `GET /attempts?userId=` falha, THEN THE Dashboard_Aluno SHALL exibir o Estado_Erro com uma mensagem legível e um controle para repetir a requisição.
4. IF a requisição a `GET /attempts?userId=` retorna zero tentativas, THEN THE Dashboard_Aluno SHALL exibir o Estado_Vazio orientando o aluno a realizar o primeiro simulado.
5. WHEN a requisição a `GET /attempts?userId=` retorna com sucesso ao menos uma tentativa, THE Dashboard_Aluno SHALL renderizar os blocos de dados reais com os valores calculados pelo Derivador_Metricas.
6. THE Dashboard_Aluno SHALL tipar os dados recebidos de `GET /attempts?userId=` por meio de tipos declarados em `src/types`.

### Requirement 4: Saudação personalizada e data atual

**User Story:** Como aluno logado, quero uma saudação com meu nome e a data de hoje, para que a tela pareça pessoal e atual.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL exibir a saudação no formato "Bom te ver por aqui, {nome}!".
2. WHERE o nome do aluno não estiver disponível por meio do Serviço_Sessão nesta fase, THE Dashboard_Aluno SHALL exibir a saudação como Bloco_Placeholder com rótulo "em breve" no lugar do nome.
3. THE Dashboard_Aluno SHALL exibir a data atual do dispositivo do aluno junto à saudação.

### Requirement 5: Card "Questões resolvidas" (dado real)

**User Story:** Como aluno logado, quero ver o total de questões que resolvi, para que eu acompanhe meu volume de estudo.

#### Acceptance Criteria

1. THE Derivador_Metricas SHALL calcular o total de questões resolvidas somando os registros `answers` das tentativas retornadas por `GET /attempts?userId=`.
2. THE Dashboard_Aluno SHALL exibir no card "Questões resolvidas" o total calculado pelo Derivador_Metricas.
3. WHERE a variação semanal de questões resolvidas não for derivável com confiança nesta fase, THE Dashboard_Aluno SHALL exibir o indicador de variação semanal como Bloco_Placeholder com rótulo "em breve".
4. WHEN o Estado_Vazio está ativo, THE Dashboard_Aluno SHALL exibir o total de questões resolvidas como zero.

### Requirement 6: Card "Taxa de acerto" (dado real)

**User Story:** Como aluno logado, quero ver minha taxa de acerto, para que eu saiba o quanto estou acertando.

#### Acceptance Criteria

1. THE Derivador_Metricas SHALL calcular a taxa de acerto geral como o percentual de registros `answers` com `isCorrect` verdadeiro sobre o total de `answers` retornados por `GET /attempts?userId=`.
2. THE Dashboard_Aluno SHALL exibir no card "Taxa de acerto" o percentual calculado pelo Derivador_Metricas.
3. IF o total de registros `answers` é zero, THEN THE Dashboard_Aluno SHALL exibir a taxa de acerto como Estado_Vazio em vez de calcular uma divisão por zero.
4. WHERE a variação da taxa de acerto frente ao mês anterior não for derivável com confiança nesta fase, THE Dashboard_Aluno SHALL exibir o indicador de variação mensal como Bloco_Placeholder com rótulo "em breve".

### Requirement 7: Card "Tempo de estudo" (placeholder nesta fase)

**User Story:** Como aluno logado, quero ver meu tempo de estudo, para que eu acompanhe minha dedicação.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o card "Tempo de estudo" como Bloco_Placeholder com rótulo "em breve" nesta fase.
2. THE Dashboard_Aluno SHALL renderizar o card "Tempo de estudo" sem interromper a renderização dos demais blocos.

### Requirement 8: Card "Sequência atual" (dado real aproximado)

**User Story:** Como aluno logado, quero ver minha sequência de dias estudando, para que eu me sinta motivado a manter a constância.

#### Acceptance Criteria

1. THE Derivador_Metricas SHALL calcular a sequência atual (streak) aproximada contando dias consecutivos com ao menos uma `answer` registrada, com base em `answeredAt`, ou em `submittedAt`/`startedAt` da tentativa quando `answeredAt` não estiver disponível.
2. THE Dashboard_Aluno SHALL identificar o card "Sequência atual" como medida aproximada derivada do histórico de tentativas.
3. THE Dashboard_Aluno SHALL exibir no card "Sequência atual" o valor em dias calculado pelo Derivador_Metricas.
4. WHERE o recorde de sequência não for derivável com confiança nesta fase, THE Dashboard_Aluno SHALL exibir o indicador de recorde como Bloco_Placeholder com rótulo "em breve".
5. WHEN o Estado_Vazio está ativo, THE Dashboard_Aluno SHALL exibir a sequência atual como zero dias.

### Requirement 9: Bloco "Continue de onde parou" (placeholder nesta fase)

**User Story:** Como aluno logado, quero retomar um simulado em andamento, para que eu não perca o progresso iniciado.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o bloco "Continue de onde parou" como Bloco_Placeholder com rótulo "em breve" nesta fase.
2. THE Dashboard_Aluno SHALL renderizar o controle "Continuar" do bloco "Continue de onde parou" em estado desabilitado enquanto o bloco está como Bloco_Placeholder.

### Requirement 10: Card "Meta diária" (placeholder nesta fase)

**User Story:** Como aluno logado, quero ver minha meta diária de questões, para que eu organize meu estudo do dia.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o card "Meta diária" como Bloco_Placeholder com rótulo "em breve" nesta fase.
2. THE Dashboard_Aluno SHALL renderizar o card "Meta diária" sem interromper a renderização dos demais blocos.

### Requirement 11: Bloco "Frequência de estudos" (dado real)

**User Story:** Como aluno logado, quero ver minha frequência de estudo nos últimos 7 dias, para que eu veja minha regularidade recente.

#### Acceptance Criteria

1. THE Derivador_Metricas SHALL calcular, para cada um dos últimos 7 dias, se houve ao menos uma `answer` registrada nesse dia, com base em `answeredAt`, ou em `submittedAt`/`startedAt` da tentativa quando `answeredAt` não estiver disponível.
2. THE Dashboard_Aluno SHALL exibir o bloco "Frequência de estudos" como um gráfico de barras dos últimos 7 dias.
3. THE Dashboard_Aluno SHALL destacar visualmente a barra correspondente ao dia atual.
4. THE Dashboard_Aluno SHALL exibir o resumo "{X} de 7 dias com estudo", onde {X} é a contagem de dias com estudo calculada pelo Derivador_Metricas.
5. WHEN o Estado_Vazio está ativo, THE Dashboard_Aluno SHALL exibir o resumo "0 de 7 dias com estudo".

### Requirement 12: Bloco "Seu desempenho" por área (placeholder nesta fase)

**User Story:** Como aluno logado, quero ver minha taxa de acerto por área do conhecimento, para que eu identifique onde reforçar.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o bloco "Seu desempenho" por área como Bloco_Placeholder com rótulo "em breve" nesta fase, porque `GET /attempts?userId=` não retorna `Question.subject` em sua resposta atual.
2. THE Dashboard_Aluno SHALL listar as áreas Linguagens, Ciências Humanas, Matemática e Ciências da Natureza como barras de progresso em estado de placeholder.
3. THE Dashboard_Aluno SHALL exibir o link "Ver estatísticas" no bloco "Seu desempenho".
4. WHEN o aluno aciona o link "Ver estatísticas", THE Dashboard_Aluno SHALL navegar para a tela de desempenho existente usando o esquema de `useState` de `src/App.tsx`.

### Requirement 13: Bloco "O que vamos estudar hoje?" por disciplina

**User Story:** Como aluno logado, quero ver minhas disciplinas com números de estudo, para que eu escolha o que estudar.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o bloco "O que vamos estudar hoje?" como uma lista de cards por disciplina.
2. THE Dashboard_Aluno SHALL renderizar os indicadores de número de questões resolvidas e taxa de acerto por disciplina como Bloco_Placeholder com rótulo "em breve" nesta fase, porque a agregação por disciplina depende de `Question.subject`, não retornado por `GET /attempts?userId=`.
3. THE Dashboard_Aluno SHALL exibir um controle "Estudar" em cada card de disciplina.
4. THE Dashboard_Aluno SHALL exibir o link "Ver disciplinas" no bloco "O que vamos estudar hoje?".

### Requirement 14: Bloco "No seu radar" (placeholder nesta fase)

**User Story:** Como aluno logado, quero ver revisões recomendadas e meu próximo simulado, para que eu saiba quais são os próximos passos.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL renderizar o item "Revisão recomendada de questões erradas" do bloco "No seu radar" como Bloco_Placeholder com rótulo "em breve" nesta fase.
2. THE Dashboard_Aluno SHALL renderizar o item "Seu próximo simulado ENEM" do bloco "No seu radar" como Bloco_Placeholder com rótulo "em breve" nesta fase.
3. THE Dashboard_Aluno SHALL exibir o controle "Montar meu simulado" no item "Seu próximo simulado ENEM".

### Requirement 15: Rodapé institucional

**User Story:** Como aluno logado, quero acessar os links institucionais, para que eu encontre ajuda e informações legais.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL exibir no rodapé os links "Central de ajuda", "Termos de uso" e "Privacidade".
2. THE Dashboard_Aluno SHALL renderizar os links do rodapé como elementos operáveis por teclado.

### Requirement 16: Estilo visual e reaproveitamento de paleta

**User Story:** Como aluno logado, quero uma tela coerente com a identidade visual do produto, para que a experiência seja agradável e consistente.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL compor o layout seguindo a estrutura de blocos definida pelo SVG do Figma fornecido.
2. THE Dashboard_Aluno SHALL aplicar cores a partir de `src/utils/colors.ts`.
3. THE Dashboard_Aluno SHALL ser organizado nos diretórios existentes do frontend (`src/components`, `src/screens`, `src/pages`, `src/types`, `src/utils`), reutilizando a organização mais próxima da funcionalidade alterada.

### Requirement 17: Acessibilidade

**User Story:** Como aluno que usa tecnologias assistivas, quero uma tela acessível, para que eu consiga operar o dashboard por teclado e leitor de tela.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL associar rótulos textuais aos controles interativos de cada bloco.
2. THE Dashboard_Aluno SHALL estruturar os blocos com elementos semânticos (regiões/seções com rótulo e hierarquia de títulos).
3. THE Dashboard_Aluno SHALL manter todos os controles interativos operáveis por teclado.
4. THE Dashboard_Aluno SHALL fornecer texto alternativo para os gráficos de barras do bloco "Frequência de estudos".

### Requirement 18: Separação de fase e substituição de fonte de dados

**User Story:** Como time de desenvolvimento, quero que os blocos placeholder e a fonte de dados estejam claramente demarcados, para que a Fase 2 substitua a origem sem refazer o layout.

#### Acceptance Criteria

1. THE Dashboard_Aluno SHALL isolar o acesso a dados no Cliente_Attempts e no Derivador_Metricas, de modo que os componentes de bloco não chamem `fetch` diretamente.
2. THE Dashboard_Aluno SHALL marcar cada Bloco_Placeholder de forma distinguível de um bloco de dados reais, tanto visualmente quanto no código.
3. THE Dashboard_Aluno SHALL ser implementado sem criar endpoints de backend.
