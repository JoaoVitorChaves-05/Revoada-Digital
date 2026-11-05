# Design Document

## Overview

Esta feature entrega a tela inicial do aluno logado (`Dashboard_Aluno`, a "Início") no frontend React + TypeScript + Vite em `apps/frontend`. O design é fiel ao que já existe no projeto: segue o padrão de página rica com `fetch` direto de `src/pages/PainelDesempenho.page.tsx`, reutiliza o `theme` de `src/utils/colors.ts`, e se integra ao esquema de navegação por `useState` de `src/App.tsx` sem introduzir biblioteca de rotas.

O escopo é exclusivamente de frontend. Nenhum endpoint de backend é criado (R18.3). A fonte de dados real nesta fase é o endpoint já existente `GET /attempts?userId=<id>`, cuja resposta (verificada em `apps/backend/src/repositories/attempt.repository.ts`, método `findByUserId`) inclui `answers: true` e `mockExam` selecionado, **sem** a relação `question` aninhada. Por consequência, não há `Question.subject` disponível, e os blocos de desempenho por área e números por disciplina ficam como placeholder "em breve" (R12, R13). Essa é uma ponta solta deliberada, documentada e isolada para a Fase 2.

Decisões centrais do design:

- **Isolamento de dados (R18.1):** nenhum componente de bloco chama `fetch`. Toda I/O vive no `Cliente_Attempts`; toda a aritmética vive no `Derivador_Metricas` (funções puras).
- **Sessão desacoplada (R2):** `Serviço_Sessão` expõe `getUserId()` com fallback configurável e um ponto de extensão `getAuthToken()` para a Fase 2, sem acoplar os componentes a `fetch` nem a storage.
- **Placeholder como cidadão de primeira classe (R18.2):** um componente `Placeholder` reutilizável marca blocos "em breve" de forma distinguível, visual e programaticamente.
- **Lógica pura testável (R5, R6, R8, R11):** o `Derivador_Metricas` é o alvo principal de teste; o design declara que o frontend hoje não tem runner de testes e propõe a abordagem.

### Resumo de pesquisa (contexto do código existente)

Pontos confirmados por leitura do código, que fundamentam o design:

- `src/App.tsx` controla a tela ativa com `useState<Screen>` onde `type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'result' | 'desempenho'`. Cada tela recebe handlers (`onBack`, `onLogin`, etc.). Não há `react-router`.
- `src/pages/PainelDesempenho.page.tsx` é o padrão de página rica: `const URL_BASE_API = 'http://localhost:3000'`, estados `dados`/`loading`/`error`, função `carregar...` reexecutável (usada no botão "Tentar novamente"), e renderização ramificada de loading/erro/vazio/sucesso. O design replica esse padrão.
- `src/utils/colors.ts` exporta `theme` (`background.grid/card`, `text.title/subtitle/body`, `button.*`, `border.card`, `shadow.card`), `getDificuldadeColors(nivel)` e `coresDoNivelDefasagem(nivel)`. Novas cores (azul primário, laranja do SVG) serão centralizadas aqui.
- `apps/frontend/package.json` scripts: `dev`, `build` (`tsc -b && vite build`), `lint` (`eslint .`), `preview`. **Não há script `test`** — confirmado. Dependências: apenas `react`/`react-dom`; nenhum runner de teste instalado.
- Backend `findByUserId` faz `include: { answers: true, mockExam: { select: {...} } }`. Confirma a ausência de `question`/`subject` na resposta. Campos nulos relevantes no schema: `Attempt.score/correctAnswers/totalQuestions` e `AttemptAnswer.isCorrect/answeredAt` são opcionais.

## Architecture

### Visão geral

```mermaid
flowchart TD
    App["src/App.tsx<br/>useState&lt;Screen&gt;"] -->|screen === 'dashboard'| Page["Dashboard.page.tsx<br/>(orquestra estados de UI)"]
    App -->|onVerEstatisticas =&gt; setScreen('desempenho')| Desempenho["PainelDesempenho.page.tsx<br/>(tela existente)"]

    Page -->|getUserId| Sessao["Servico_Sessao<br/>src/utils/sessao.ts"]
    Page -->|buscarAttempts userId| Cliente["Cliente_Attempts<br/>src/utils/attemptsClient.ts"]
    Cliente -->|GET /attempts?userId=| API[("Backend existente<br/>http://localhost:3000")]
    Page -->|derivarMetricas attempts| Derivador["Derivador_Metricas<br/>src/utils/derivadorMetricas.ts<br/>(funcoes puras)"]

    Page --> Blocos["Componentes de bloco<br/>src/components/dashboard/*"]
    Derivador -->|MetricasDashboard| Blocos
    Blocos --> Placeholder["Placeholder<br/>(bloco 'em breve')"]

    Tipos["src/types/attempts.types.ts<br/>src/types/dashboard.types.ts"] -.tipa.-> Cliente
    Tipos -.tipa.-> Derivador
    Tipos -.tipa.-> Blocos
```

### Fluxo de dados

1. `App` define `screen === 'dashboard'` e renderiza `Dashboard.page.tsx`, passando `onBack` e `onVerEstatisticas` (que faz `setScreen('desempenho')`, reusando a tela existente — R12.4).
2. No mount, a página obtém `userId` via `ServicoSessao.getUserId()` (R2, R3.1) e chama `ClienteAttempts.buscarAttempts(userId)`.
3. A resposta tipada (`Attempt[]`) é passada a `derivarMetricas(attempts, agora)` que devolve `MetricasDashboard` (R3.5).
4. A página escolhe o estado de UI (carregamento / erro / vazio / sucesso) e distribui as métricas aos componentes de bloco.
5. Blocos não deriváveis renderizam `Placeholder` (R18.2); o link "Ver estatísticas" aciona `onVerEstatisticas`.

### Camadas e responsabilidades

| Camada | Arquivo | Responsabilidade | Chama `fetch`? |
| --- | --- | --- | --- |
| Navegação | `src/App.tsx` | Registrar `'dashboard'` no `Screen`, renderização condicional, handlers | Não |
| Página/orquestração | `src/pages/Dashboard.page.tsx` | Estados de UI, montagem, composição dos blocos | Não (delega) |
| Sessão | `src/utils/sessao.ts` | `getUserId()` com fallback; ponto de extensão `getAuthToken()` | Não |
| Cliente de dados | `src/utils/attemptsClient.ts` | `GET /attempts?userId=` e parse tipado | **Sim (único ponto)** |
| Derivação | `src/utils/derivadorMetricas.ts` | Funções puras de cálculo de métricas | Não |
| Blocos | `src/components/dashboard/*` | Apresentação (recebem props já calculadas) | Não |
| Tipos | `src/types/attempts.types.ts`, `src/types/dashboard.types.ts` | Contratos de dados | Não |
| Cores | `src/utils/colors.ts` | `theme` + novas cores centralizadas | Não |

### Decisão: página em `src/pages`

A tela é uma **página rica com fetch** (estados de loading/erro/vazio, dados remotos), exatamente o perfil de `src/pages/PainelDesempenho.page.tsx`. Em contraste, `src/screens/*` (HomeScreen, LoginScreen, etc.) são telas sem I/O. Portanto o componente de tela fica em `src/pages/Dashboard.page.tsx` (coerente com R16.3). O CSS específico fica em `src/pages/Dashboard.css`, seguindo o par `PainelDesempenho.page.tsx` + `PainelDesempenho.css`.

## Components and Interfaces

### 1. Navegação em `src/App.tsx` (R1)

Alterações mínimas, sem roteador:

- Estender a união: `type Screen = ... | 'desempenho' | 'dashboard'`.
- Renderização condicional:

```tsx
if (screen === 'dashboard') {
  return (
    <DashboardPage
      onBack={() => setScreen('home')}
      onVerEstatisticas={() => setScreen('desempenho')}
    />
  )
}
```

`onBack` segue o padrão existente (R1.3). `onVerEstatisticas` reaproveita a tela `'desempenho'` já registrada (R12.4). Nenhuma dependência nova é adicionada (R1.4, R18.3).

### 2. `Serviço_Sessão` — `src/utils/sessao.ts` (R2)

Interface única que desacopla "quem é o aluno" do resto. Nesta fase lê de uma fonte configurável com fallback; a assinatura já prevê o token da Fase 2 sem alterar os componentes de bloco.

```ts
export interface SessaoAluno {
  /** Retorna o userId atual do aluno. Nunca lança; usa fallback se preciso. */
  getUserId(): string;
  /**
   * Ponto de extensao Fase 2: token de autenticacao.
   * Nesta fase retorna null (auth ainda nao emite JWT).
   */
  getAuthToken(): string | null;
  /** Nome do aluno quando disponivel; null nesta fase (vira placeholder na saudacao). */
  getNomeAluno(): string | null;
}

export interface ConfigSessao {
  /** userId usado quando nenhuma sessao esta disponivel (R2.2). */
  userIdFallback: string;
}

export function criarSessao(config: ConfigSessao): SessaoAluno;

/** Instancia padrao usada pela pagina; fallback vindo de config central. */
export const sessao: SessaoAluno;
```

Observações:

- `getUserId()` resolve a origem do id na seguinte ordem (ponto de extensão): fonte de sessão real (ainda inexistente na Fase 1) → `config.userIdFallback`. O fallback é configurável em um único lugar (R2.2), espelhando o `currentAttemptId` de teste já usado em `App.tsx`.
- Os componentes de bloco **nunca** importam `sessao` diretamente para buscar dados; quem consome é a página (R2.3). Isso mantém os blocos puros de apresentação e permite a troca pela Fase 2 sem reescrita (R2.4).
- `getNomeAluno()` retorna `null` nesta fase, dirigindo a saudação ao placeholder (R4.2).

### 3. `Cliente_Attempts` — `src/utils/attemptsClient.ts` (R3, R18.1)

Único ponto de `fetch`. Mesma base URL e tratamento de erro de `PainelDesempenho.page.tsx`.

```ts
import type { Attempt } from '../types/attempts.types';

// Alinhado a PainelDesempenho.page.tsx. TODO Fase 2: mover para import.meta.env.
const URL_BASE_API = 'http://localhost:3000';

/**
 * GET /attempts?userId=<id>. Lanca Error com mensagem legivel em falha de rede/HTTP.
 * Opcionalmente recebe um token (ponto de extensao Fase 2) para o header Authorization.
 */
export async function buscarAttempts(
  userId: string,
  token?: string | null,
): Promise<Attempt[]>;
```

Contrato de erro: resposta não-`ok` ou falha de rede ⇒ `throw new Error('Não foi possível carregar seu painel.')`, capturado pela página para o `Estado_Erro` (R3.3). O parse valida que o corpo é um array; qualquer coisa diferente é tratada como erro.

### 4. `Derivador_Metricas` — `src/utils/derivadorMetricas.ts` (R5, R6, R8, R11, R18.1)

Funções **puras** (sem `fetch`, sem `Date.now()` interno — o "agora" é injetado como parâmetro para testabilidade e controle de timezone). Alvo principal dos testes e das propriedades de correção.

Assinaturas:

```ts
import type { Attempt } from '../types/attempts.types';
import type {
  MetricasDashboard,
  DiaFrequencia,
} from '../types/dashboard.types';

/** Total de questoes resolvidas = soma de answers em todas as tentativas (R5.1). */
export function contarQuestoesResolvidas(attempts: Attempt[]): number;

/**
 * Taxa de acerto geral em 0..100 (R6.1). Retorna null quando nao ha nenhuma
 * answer, sinalizando Estado_Vazio em vez de divisao por zero (R6.3).
 */
export function calcularTaxaAcerto(attempts: Attempt[]): number | null;

/**
 * Sequencia (streak) aproximada: dias consecutivos, terminando em `agora`,
 * com ao menos uma answer. Usa answeredAt; cai para submittedAt/startedAt da
 * tentativa quando answeredAt e nulo (R8.1). Sempre >= 0.
 */
export function calcularStreak(attempts: Attempt[], agora: Date): number;

/**
 * Exatamente 7 entradas, do dia (agora-6) ate `agora`, em ordem cronologica.
 * Cada entrada indica se houve estudo naquele dia e se e o dia atual (R11.1-R11.3).
 */
export function calcularFrequencia7Dias(
  attempts: Attempt[],
  agora: Date,
): DiaFrequencia[]; // length === 7

/** Agregador de conveniencia que monta MetricasDashboard a partir das funcoes acima. */
export function derivarMetricas(
  attempts: Attempt[],
  agora: Date,
): MetricasDashboard;
```

Regra compartilhada de "timestamp efetivo" de uma answer (usada por streak e frequência), encapsulada numa função interna pura:

```ts
// Ordem de fallback: answer.answeredAt -> attempt.submittedAt -> attempt.startedAt.
// Retorna null se nenhum existir (answer e descartada da contagem de dias).
function timestampEfetivo(answer, attempt): Date | null;
```

### 5. Componentes de bloco — `src/components/dashboard/`

Todos recebem props já calculadas (sem `fetch`, R18.1). Novo subdiretório `dashboard/` sob `src/components` para agrupar sem poluir o diretório raiz existente.

- `Saudacao.tsx` — "Bom te ver por aqui, {nome}!" + data atual; nome vira `Placeholder` quando `null` (R4).
- `CardMetrica.tsx` — card genérico (título, valor, variação opcional). Reutilizado por "Questões resolvidas", "Taxa de acerto", "Tempo de estudo", "Sequência atual".
- `GraficoFrequencia.tsx` — gráfico de barras dos 7 dias; destaca o dia atual; texto alternativo (R11, R17.4).
- `BlocoDesempenhoAreas.tsx` — lista Linguagens/Ciências Humanas/Matemática/Ciências da Natureza em placeholder + link "Ver estatísticas" (R12).
- `BlocoDisciplinas.tsx` — cards por disciplina com números em placeholder, controle "Estudar" e link "Ver disciplinas" (R13).
- `BlocoRadar.tsx` — "Revisão recomendada" e "Próximo simulado" em placeholder + "Montar meu simulado" (R14).
- `ContinueDeOndeParou.tsx` — placeholder com botão "Continuar" desabilitado (R9).
- `RodapeInstitucional.tsx` — links "Central de ajuda", "Termos de uso", "Privacidade" operáveis por teclado (R15).
- `Placeholder.tsx` — componente reutilizável de marcação "em breve" (ver abaixo, R18.2).

### 6. `Placeholder` reutilizável (R18.2)

Marca um bloco/valor como não-derivável nesta fase, de forma distinguível visual e programaticamente.

```ts
export interface PlaceholderProps {
  /** Texto curto; default "em breve". */
  rotulo?: string;
  /** Rotulo acessivel do que estara disponivel depois. */
  descricaoAcessivel?: string;
  children?: React.ReactNode; // estrutura "fantasma" (ex: barras cinza)
}
```

Marcação dupla:
- **Visual:** estilo atenuado (opacidade/zebra cinza) + selo textual "em breve".
- **Programática:** atributo `data-placeholder="true"` no elemento raiz e `aria-disabled` em controles inativos (ex.: "Continuar" em R9.2). Isso torna cada placeholder localizável no DOM/testes e claramente distinto de um bloco de dados reais.

### Mapa bloco do SVG → dado real vs. placeholder

| Bloco do SVG | Natureza | Origem / Requisito |
| --- | --- | --- |
| Saudação + data | Real (data) / Placeholder (nome) | `ServicoSessao` / R4 |
| Card "Questões resolvidas" | **Real** (valor) / Placeholder (variação semanal) | `contarQuestoesResolvidas` / R5 |
| Card "Taxa de acerto" | **Real** (valor) / Placeholder (variação mensal) | `calcularTaxaAcerto` / R6 |
| Card "Tempo de estudo" | Placeholder | R7 |
| Card "Sequência atual" | **Real aproximado** / Placeholder (recorde) | `calcularStreak` / R8 |
| "Continue de onde parou" | Placeholder (botão desabilitado) | R9 |
| Card "Meta diária" | Placeholder | R10 |
| "Frequência de estudos" (barras) | **Real** | `calcularFrequencia7Dias` / R11 |
| "Seu desempenho" por área | Placeholder + link navega p/ 'desempenho' | R12 |
| "O que vamos estudar hoje?" | Lista real / números por disciplina placeholder | R13 |
| "No seu radar" | Placeholder | R14 |
| Rodapé institucional | Estático (links) | R15 |

## Data Models

### `src/types/attempts.types.ts` (R3.6)

Tipos espelhando a resposta real de `GET /attempts?userId=` (`findByUserId`). Campos nulos refletem o schema Prisma (`score`, `correctAnswers`, `totalQuestions`, `isCorrect`, `answeredAt` são opcionais).

```ts
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAlternativeId: string | null;
  isCorrect: boolean | null;
  answeredAt: string | null; // ISO; Date nao sobrevive ao JSON
  // NAO ha `question`/`subject` aninhado nesta fase (ver Overview).
}

export interface AttemptMockExamResumo {
  id: string;
  name: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  mockExamId: string;
  status: AttemptStatus;
  startedAt: string;       // ISO
  submittedAt: string | null;
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  earnedPoints: number | null;
  answers: AttemptAnswer[];
  mockExam: AttemptMockExamResumo;
  createdAt: string;
  updatedAt: string;
}
```

Nota de modelagem: datas chegam como `string` ISO (JSON). O `Derivador_Metricas` converte para `Date` internamente via o `timestampEfetivo`, o que concentra o parsing e o tratamento de timezone em um só lugar.

### `src/types/dashboard.types.ts`

```ts
export interface DiaFrequencia {
  /** Data do dia (meia-noite local), identificando o bucket. */
  data: string;        // ISO date (YYYY-MM-DD)
  /** Rotulo curto p/ eixo (ex: "seg"). */
  rotulo: string;
  /** Houve ao menos uma answer nesse dia. */
  estudou: boolean;
  /** Marca a barra do dia atual (R11.3). */
  ehHoje: boolean;
}

export interface MetricasDashboard {
  questoesResolvidas: number;         // R5.2
  taxaAcerto: number | null;          // 0..100, null => Estado_Vazio (R6.3)
  streakDias: number;                 // R8.3
  frequencia7Dias: DiaFrequencia[];   // length 7 (R11.2)
  diasComEstudo: number;              // 0..7, resumo "X de 7" (R11.4)
}
```

## Correctness Properties

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas do sistema — essencialmente, uma afirmação formal sobre o que o sistema deve fazer. Propriedades fazem a ponte entre especificações legíveis por humanos e garantias de correção verificáveis por máquina.*

As propriedades abaixo cobrem exclusivamente as **funções puras do `Derivador_Metricas`**, que são o núcleo de lógica testável desta feature. Navegação, estados de I/O, placeholders, estilo e acessibilidade não são propriedades universais sobre input gerado e são cobertos por testes de exemplo/integração/snapshot (ver Testing Strategy). As propriedades foram consolidadas após reflexão para eliminar redundância (ex.: "vazio ⇒ zero" é caso-limite das propriedades gerais; limites inferior e superior do streak foram unidos em uma faixa).

### Property 1: Questões resolvidas é a soma consistente dos answers

*Para toda* lista de tentativas `attempts`, `contarQuestoesResolvidas(attempts)` é igual à soma de `attempt.answers.length` sobre todas as tentativas. Em particular, para a lista vazia o resultado é `0`.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 2: Taxa de acerto é null ou está no domínio 0..100

*Para toda* lista de tentativas `attempts`: se não houver nenhum registro `answer`, `calcularTaxaAcerto(attempts)` retorna `null` (Estado_Vazio, sem divisão por zero); caso contrário, o retorno é um número em `0 <= taxa <= 100` igual ao percentual de `answers` com `isCorrect === true` sobre o total de `answers`.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 3: Streak está dentro da faixa [0, dias distintos com estudo]

*Para toda* lista de tentativas `attempts` e todo instante `agora`, `calcularStreak(attempts, agora)` satisfaz `0 <= streak <= N`, onde `N` é a quantidade de dias de calendário distintos que possuem ao menos uma `answer` com timestamp efetivo. Logo, para a lista vazia (ou sem answers datáveis) o streak é `0`.

**Validates: Requirements 8.1, 8.3, 8.5**

### Property 4: Frequência tem exatamente 7 dias com contagem consistente

*Para toda* lista de tentativas `attempts` e todo instante `agora`, `calcularFrequencia7Dias(attempts, agora)` retorna um array com **exatamente 7** elementos em ordem cronológica, no qual **exatamente um** elemento tem `ehHoje === true` (o último, correspondente a `agora`), e a contagem de elementos com `estudou === true` é igual a `diasComEstudo`, com `0 <= diasComEstudo <= 7`. Para a lista vazia, todos os 7 dias têm `estudou === false` e `diasComEstudo === 0` (resumo "0 de 7 dias com estudo").

**Validates: Requirements 11.1, 11.2, 11.4, 11.5**

## Error Handling

| Situação | Camada | Tratamento | Requisito |
| --- | --- | --- | --- |
| Falha de rede ou HTTP não-`ok` em `GET /attempts` | `Cliente_Attempts` | `throw new Error('Não foi possível carregar seu painel.')` | R3.3 |
| Erro propagado até a página | `Dashboard.page.tsx` | Captura em `try/catch`, popula `error`, renderiza `Estado_Erro` com mensagem legível + botão "Tentar novamente" que reexecuta `carregar()` | R3.3 |
| Corpo da resposta não é array | `Cliente_Attempts` | Tratado como erro (mesma mensagem) em vez de quebrar o parse | R3.6 |
| Zero tentativas | `Dashboard.page.tsx` | `Estado_Vazio` orientando o primeiro simulado; métricas reais exibem zeros (R5.4, R8.5, R11.5) | R3.4 |
| `answers` vazio em todas as tentativas | `Derivador_Metricas` | `calcularTaxaAcerto` retorna `null` ⇒ card em Estado_Vazio (sem NaN) | R6.3 |
| `isCorrect`/`answeredAt` nulos | `Derivador_Metricas` | `isCorrect === null` conta como não-acerto no denominador; `answeredAt` nulo cai para `submittedAt`/`startedAt` da tentativa; se nada datável, a answer é ignorada na contagem de dias | R6.1, R8.1, R11.1 |
| `userId` de sessão indisponível | `Serviço_Sessão` | Retorna `userIdFallback` configurável (nunca lança) | R2.2 |
| Nome do aluno indisponível | `Dashboard.page.tsx` | Saudação exibe `Placeholder` "em breve" no lugar do nome | R4.2 |
| Falha de um bloco placeholder | Componentes de bloco | Placeholders são estáticos e não dependem de dados; não interrompem a renderização dos demais blocos | R7.2, R10.2 |

### Tratamento de data e timezone (frequência e streak)

Decisão: o cálculo é **client-side**, usando o fuso do dispositivo do aluno. O `Derivador_Metricas` recebe `agora: Date` como parâmetro (injetado pela página via `new Date()`), e os "buckets" de dia são definidos pela data local (ano-mês-dia no fuso do dispositivo) derivada do `timestampEfetivo` de cada answer. A saudação também usa a data local do dispositivo (R4.3).

Risco documentado (ponta solta deliberada): o dashboard do backend calcula agregações usando o fuso de Brasília; como aqui o cálculo é no cliente, um aluno em outro fuso, ou com relógio incorreto, pode ver fronteiras de dia ligeiramente diferentes das do backend. Por isso o streak é explicitamente rotulado como medida **aproximada** (R8.2) e a frequência é uma visão recente, não um relatório canônico. Mitigação de baixo custo: concentrar toda a conversão de data no `Derivador_Metricas` (uma só função `timestampEfetivo` + uma função de "chave do dia local"), de modo que a Fase 2 possa trocar para um fuso fixo (ex.: America/Sao_Paulo) alterando um único ponto, sem tocar nos componentes. Injetar `agora` também torna o comportamento determinístico e testável.

## Testing Strategy

### Situação atual do runner de testes (declaração explícita)

Confirmado em `apps/frontend/package.json`: **não existe script `test`** e nenhum runner (Vitest/Jest) está instalado nas dependências do frontend. Portanto, nesta fase **não é possível executar testes automatizados no frontend sem configuração adicional**, e o design não assume que o runner exista.

Abordagem adotada:

1. **Manter a lógica pura isolada e testável por construção.** Todas as regras de negócio ficam no `Derivador_Metricas` como funções puras com `agora` injetado — sem React, sem `fetch`, sem relógio global. Isso garante que a feature está pronta para teste assim que um runner for adicionado, sem refatoração.
2. **Proposta (opcional, fora do escopo de execução desta feature):** adicionar Vitest ao workspace do frontend — `devDependencies: vitest` e script `"test": "vitest --run"` — mais `fast-check` para as propriedades. A decisão de instalar fica a cargo do time, pois o AGENTS.md observa que o frontend pode não ter testes e esta feature não deve presumir disponibilidade. O design deixa a porta aberta, não a atravessa.
3. **Validações disponíveis hoje (devem ser executadas):**
   - `npm run lint --workspace apps/frontend`
   - `npm run build --workspace apps/frontend`

### Testes baseados em propriedades (quando o runner existir)

Se/quando Vitest + `fast-check` forem configurados, implementar as 4 propriedades da seção Correctness Properties, **uma propriedade ⇒ um teste de propriedade**, cada um com **no mínimo 100 iterações** e tag referenciando a propriedade do design:

- Formato da tag: `// Feature: dashboard-aluno, Property {n}: {texto da propriedade}`
- Geradores: `Attempt[]` com `answers[]` aleatórios, incluindo deliberadamente os casos-limite exercidos nas propriedades — lista vazia, tentativas sem answers, `isCorrect`/`answeredAt` nulos, datas espalhadas em torno de `agora` (incluindo fronteiras de dia). O `agora` também é gerado/fixado para controlar o timezone.
- Não implementar PBT do zero: usar `fast-check` como biblioteca.

Mapa propriedade → função sob teste:

| Propriedade | Função | Requisitos |
| --- | --- | --- |
| 1 | `contarQuestoesResolvidas` | 5.1, 5.2, 5.4 |
| 2 | `calcularTaxaAcerto` | 6.1, 6.2, 6.3 |
| 3 | `calcularStreak` | 8.1, 8.3, 8.5 |
| 4 | `calcularFrequencia7Dias` | 11.1, 11.2, 11.4, 11.5 |

### Testes de exemplo / unidade (complementares)

Focados em casos concretos e pontos de integração, não cobertos por propriedades:

- `Serviço_Sessão`: sem sessão disponível ⇒ `getUserId()` retorna o fallback configurado (R2.2); `getAuthToken()` retorna `null` nesta fase.
- `Cliente_Attempts` (com `fetch` mockado): resposta `ok` com array ⇒ retorna tipado; resposta não-`ok` ⇒ lança a mensagem legível; corpo não-array ⇒ lança (R3.3, R3.6).
- Página `Dashboard`: ramificação dos quatro estados (carregamento, erro com retry, vazio, sucesso) com 1–3 exemplos (R3.2–R3.5).
- Placeholders: presença de `data-placeholder="true"` nos blocos de R7/R9/R10/R12/R13/R14 e `aria-disabled`/`disabled` no botão "Continuar" (R9.2, R18.2).
- Navegação: "Ver estatísticas" aciona `onVerEstatisticas` (R12.4).

### Acessibilidade (R17)

Verificação por exemplo (e manual/axe quando possível): regiões `<section>` com `aria-label` e hierarquia de títulos (R17.2), rótulos textuais nos controles (R17.1), operação por teclado dos links do rodapé e demais controles (R15.2, R17.3), e `role="img"` + `aria-label`/texto alternativo descrevendo "X de 7 dias com estudo" no `GraficoFrequencia` (R17.4). Validação completa de WCAG exige teste manual com tecnologias assistivas e revisão especializada.

### Estilo e organização (R16)

Verificados por `lint`/`build` e revisão: uso exclusivo de cores de `src/utils/colors.ts` (com novas cores centralizadas lá, nunca hardcode espalhado), organização nos diretórios existentes (`src/pages`, `src/components/dashboard`, `src/types`, `src/utils`) e fidelidade à estrutura de blocos do SVG. Snapshot tests de layout são opcionais e dependem do runner.
