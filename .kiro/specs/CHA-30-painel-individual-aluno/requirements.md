# Requirements Document

## Introduction

Esta spec cobre a subtarefa **CHA-30** ("FE - Criar painel individual do aluno (gráfico por matéria + mapa de defasagem)"), subtarefa de frontend da User Story pai **CHA-28** (US-03 - "Aluno vê histórico e relatório pós-prova") da plataforma Revoada Digital.

O escopo é **exclusivamente o frontend** (apps/frontend, React 19 + TypeScript + Vite): um painel individual que apresenta ao aluno autenticado (a) um **gráfico por matéria** com a visão macro de desempenho em cada disciplina e (b) um **mapa de defasagem por conteúdo/conceito** dentro de cada matéria, destacando onde o aluno precisa reforçar.

O painel consome um endpoint de backend definido por **contrato de dados** (shape do JSON). A implementação do endpoint **não** faz parte desta spec (fica para uma task de backend separada, sem sobrepor CHA-29); esta spec apenas define o formato tipado dos dados esperados e o comportamento do frontend ao consumi-los.

A visualização é construída em **CSS/SVG puro**, sem introduzir nova dependência, reutilizando `theme` e `getDificuldadeColors` de `src/utils/colors.ts`. O painel segue o padrão de busca de dados e tratamento de estados já usado em `src/pages/result_simulado.page.tsx` (useEffect + fetch, estados de carregando/erro/vazio/sucesso) e é alcançável pela navegação por estado existente em `src/App.tsx`, já que o projeto não possui biblioteca de roteamento.

## Glossary

- **Painel_Individual**: Componente/página de frontend que exibe o desempenho do aluno autenticado por matéria e o mapa de defasagem por conteúdo. É o sistema principal desta spec.
- **Aluno**: Usuário autenticado da plataforma que visualiza o próprio desempenho no Painel_Individual.
- **Matéria**: Disciplina do ENEM agregadora de desempenho (ex.: Matemática, Linguagens, Ciências da Natureza, Ciências Humanas).
- **Conteúdo**: Tópico ou conceito específico dentro de uma Matéria (ex.: "Funções do 2º grau", "Figuras de linguagem").
- **Desempenho_Por_Materia**: Conjunto de métricas agregadas de uma Matéria: nome, total de questões respondidas, acertos e percentual de acerto.
- **Mapa_De_Defasagem**: Lista de Conteúdos de uma Matéria, cada um com percentual de acerto e um nível de defasagem (baixa, média ou alta), destacando onde o Aluno precisa reforçar.
- **Nivel_De_Defasagem**: Classificação de um Conteúdo em "baixa", "média" ou "alta", usada para determinar o destaque visual e o rótulo textual.
- **Contrato_De_Dados**: Formato tipado (TypeScript) do JSON esperado do endpoint de defasagem, definido em `src/types`. Independe da implementação do backend.
- **Endpoint_De_Defasagem**: Recurso HTTP (contrato `GET /dashboard/me/defasagem` ou nome equivalente) que retorna Desempenho_Por_Materia e Mapa_De_Defasagem do Aluno autenticado.
- **URL_Base_API**: Endereço base do backend usado nas chamadas HTTP; hoje hardcoded como `http://localhost:3000` no padrão existente (`result_simulado.page.tsx`).
- **Servico_De_Cores**: Módulo `src/utils/colors.ts`, contendo `theme` e `getDificuldadeColors`, reutilizado para estilos e cores por nível.
- **Navegacao_Por_Estado**: Mecanismo de navegação atual baseado em `type Screen` e `setScreen` em `src/App.tsx`, na ausência de biblioteca de roteamento.

## Requirements

### Requirement 1: Contrato de dados tipado do endpoint de defasagem

**User Story:** Como desenvolvedor de frontend, quero um contrato de dados tipado em TypeScript para a resposta do Endpoint_De_Defasagem, para que o Painel_Individual consuma dados consistentes e verificáveis sem acoplar-se à implementação do backend.

#### Acceptance Criteria

1. THE Painel_Individual SHALL definir em `src/types` um tipo TypeScript que descreva a resposta do Endpoint_De_Defasagem contendo uma lista de Desempenho_Por_Materia e, para cada Matéria, o respectivo Mapa_De_Defasagem.
2. THE Contrato_De_Dados SHALL incluir, para cada Desempenho_Por_Materia, os campos nome da Matéria, total de questões respondidas, total de acertos e percentual de acerto.
3. THE Contrato_De_Dados SHALL incluir, para cada Conteúdo do Mapa_De_Defasagem, os campos nome do Conteúdo, percentual de acerto e Nivel_De_Defasagem.
4. THE Contrato_De_Dados SHALL restringir o campo Nivel_De_Defasagem aos valores "baixa", "média" e "alta".

### Requirement 2: Carregamento dos dados do painel

**User Story:** Como Aluno autenticado, quero que o Painel_Individual busque meus dados de desempenho ao ser aberto, para que eu veja informações atualizadas sobre minhas matérias e conteúdos.

#### Acceptance Criteria

1. WHEN o Painel_Individual é aberto, THE Painel_Individual SHALL requisitar os dados do Aluno autenticado ao Endpoint_De_Defasagem via HTTP GET.
2. WHILE a requisição ao Endpoint_De_Defasagem está em andamento, THE Painel_Individual SHALL exibir um indicador textual de carregamento.
3. WHEN a requisição ao Endpoint_De_Defasagem retorna sucesso com dados de desempenho, THE Painel_Individual SHALL exibir o gráfico por Matéria e o Mapa_De_Defasagem.
4. THE Painel_Individual SHALL compor a URL da requisição a partir da URL_Base_API `http://localhost:3000`.

### Requirement 3: Gráfico de desempenho por matéria

**User Story:** Como Aluno, quero ver uma visão macro do meu desempenho em cada matéria, para que eu identifique rapidamente minhas disciplinas mais fortes e mais fracas.

#### Acceptance Criteria

1. WHEN os dados de Desempenho_Por_Materia são exibidos, THE Painel_Individual SHALL renderizar uma barra de desempenho para cada Matéria usando CSS ou SVG, sem adicionar biblioteca de gráficos.
2. WHEN uma barra de Matéria é renderizada, THE Painel_Individual SHALL exibir o nome da Matéria, o percentual de acerto e a razão entre acertos e total de questões respondidas como texto legível.
3. WHEN uma barra de Matéria é renderizada, THE Painel_Individual SHALL dimensionar o comprimento da barra proporcionalmente ao percentual de acerto da Matéria.
4. THE Painel_Individual SHALL aplicar cores obtidas do Servico_De_Cores às barras de Matéria.

### Requirement 4: Mapa de defasagem por conteúdo

**User Story:** Como Aluno, quero ver, dentro de cada matéria, quais conteúdos preciso reforçar, para que eu direcione meus estudos aos conceitos com maior defasagem.

#### Acceptance Criteria

1. WHEN o Mapa_De_Defasagem de uma Matéria é exibido, THE Painel_Individual SHALL renderizar uma célula ou item para cada Conteúdo usando CSS ou SVG, sem adicionar biblioteca de gráficos.
2. WHEN um Conteúdo é renderizado, THE Painel_Individual SHALL exibir o nome do Conteúdo, o percentual de acerto e o Nivel_De_Defasagem como texto legível.
3. WHEN um Conteúdo é renderizado, THE Painel_Individual SHALL aplicar as cores correspondentes ao Nivel_De_Defasagem obtidas de `getDificuldadeColors` do Servico_De_Cores.
4. WHEN o Mapa_De_Defasagem de uma Matéria é exibido, THE Painel_Individual SHALL associar visualmente cada conjunto de Conteúdos à sua Matéria de origem.

### Requirement 5: Estado de erro com nova tentativa

**User Story:** Como Aluno, quero ser avisado quando o carregamento falhar e poder tentar novamente, para que uma falha temporária não me impeça de ver meu painel.

#### Acceptance Criteria

1. IF a requisição ao Endpoint_De_Defasagem falha, THEN THE Painel_Individual SHALL exibir uma mensagem de erro textual.
2. IF a requisição ao Endpoint_De_Defasagem falha, THEN THE Painel_Individual SHALL exibir um controle acionável para repetir a requisição.
3. WHEN o Aluno aciona o controle de nova tentativa, THE Painel_Individual SHALL requisitar novamente os dados ao Endpoint_De_Defasagem.

### Requirement 6: Estado vazio para aluno sem histórico

**User Story:** Como Aluno sem histórico de simulados, quero uma orientação clara em vez de um painel vazio, para que eu saiba que preciso fazer meu primeiro simulado.

#### Acceptance Criteria

1. WHEN a requisição ao Endpoint_De_Defasagem retorna sucesso sem dados de desempenho, THE Painel_Individual SHALL exibir uma mensagem orientando o Aluno a realizar o primeiro simulado.
2. WHEN o estado vazio é exibido, THE Painel_Individual SHALL omitir o gráfico por Matéria e o Mapa_De_Defasagem.

### Requirement 7: Acessibilidade do painel

**User Story:** Como Aluno que usa leitor de tela ou navega por teclado, quero compreender e operar o painel sem depender da cor, para que eu tenha acesso equivalente às informações de desempenho.

#### Acceptance Criteria

1. WHEN uma barra de Matéria ou uma célula de Conteúdo é renderizada, THE Painel_Individual SHALL apresentar rótulo textual e valor numérico legíveis, de modo que a informação não dependa apenas da cor.
2. THE Painel_Individual SHALL usar marcação HTML semântica para títulos, listas e controles.
3. THE Painel_Individual SHALL permitir operar os controles interativos por teclado.
4. WHEN controles interativos são renderizados, THE Painel_Individual SHALL associar a cada controle um rótulo acessível descritivo.

### Requirement 8: Acesso pela navegação existente

**User Story:** Como Aluno, quero alcançar o Painel_Individual a partir da navegação atual da aplicação, para que eu consiga abrir e sair do painel sem uma biblioteca de roteamento.

#### Acceptance Criteria

1. THE Painel_Individual SHALL ser alcançável por meio da Navegacao_Por_Estado definida em `src/App.tsx`, adicionando o valor correspondente a `type Screen`.
2. WHEN o Painel_Individual está em exibição, THE Painel_Individual SHALL oferecer um controle para retornar à tela anterior da Navegacao_Por_Estado.

## Pontos de atenção

- **URL_Base_API hardcoded**: A URL `http://localhost:3000` está fixa no padrão atual (`result_simulado.page.tsx`). Recomenda-se extraí-la para uma configuração/variável de ambiente (ex.: `import.meta.env`) em iteração futura; esta spec mantém o padrão existente, mas registra o acoplamento como risco.
- **Contrato sujeito ao backend**: O Contrato_De_Dados é uma suposição desta subtarefa de frontend. O nome final do Endpoint_De_Defasagem e os nomes/formatos de campos devem ser confirmados com a task de backend (sem sobrepor CHA-29) antes da integração real.
- **Ausência de roteador**: A navegação por estado em `App.tsx` não oferece deep-linking nem histórico de navegador; o acesso ao painel fica limitado ao fluxo interno de telas até a eventual adoção de um roteador.
- **Autenticação**: A spec assume um Aluno autenticado e um endpoint "me". O mecanismo de identificação/sessão (token, cookie) depende do backend e não está detalhado aqui.
