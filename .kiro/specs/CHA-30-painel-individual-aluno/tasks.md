# Implementation Plan: Painel Individual do Aluno (CHA-30)

## Overview

Implementação incremental do Painel_Individual somente em `apps/frontend` (React 19 + TypeScript + Vite), sem novas dependências. A ordem segue a dependência natural: contrato de tipos → função pura de cor → componentes de apresentação puros → página container com os quatro estados → CSS → integração na navegação por estado → render de sucesso completo → verificação final (lint + build, pois não há runner de testes no frontend). Cada tarefa constrói sobre as anteriores e termina integrada, sem código órfão.

> Nota: o design define Correctness Properties (mapeamento nível→cor e dimensionamento da barra), mas registra como débito técnico a ausência de runner de testes em `apps/frontend` (sem Vitest/Jest). Portanto NÃO há subtarefas de testes automatizados; a verificação é por tipagem exaustiva, lint, build e teste manual. Não introduzir framework de testes inexistente.

## Tasks

- [x] 1. Definir o contrato de dados tipado do endpoint de defasagem
  - Criar `apps/frontend/src/types/desempenho.types.ts`
  - Exportar o type `NivelDefasagem = 'baixa' | 'média' | 'alta'` como fonte única da união literal
  - Exportar a interface `Conteudo` (`nome: string`, `percentualAcerto: number`, `nivel: NivelDefasagem`)
  - Exportar a interface `DesempenhoPorMateria` (`materia`, `totalQuestoes`, `acertos`, `percentualAcerto`, `mapaDefasagem: Conteudo[]`)
  - Exportar a interface `RespostaDefasagem` (`materias: DesempenhoPorMateria[]`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Adicionar o mapeamento nível → cor ao Servico_De_Cores
  - Em `apps/frontend/src/utils/colors.ts`, importar e reutilizar `NivelDefasagem` de `../types/desempenho.types`
  - Definir o mapa fixo `baixa → 'fácil'`, `média → 'média'`, `alta → 'difícil'`
  - Exportar a função pura `coresDoNivelDefasagem(nivel: NivelDefasagem)` que retorna `getDificuldadeColors(...)` do nível traduzido, sem duplicar a paleta
  - _Requirements: 4.3_

- [x] 3. Criar os componentes de apresentação puros
  - [x] 3.1 Criar `BarraMateria`
    - Criar `apps/frontend/src/components/BarraMateria.tsx` com props `{ nome, percentualAcerto, acertos, totalQuestoes }`
    - Renderizar o nome da Matéria, o percentual e a razão `acertos/totalQuestoes` como texto legível ao lado da barra
    - Dimensionar a largura da barra como `clamp(percentualAcerto, 0, 100)%` (função/limite inline)
    - Aplicar cor da barra via `getDificuldadeColors` por faixa de percentual (`>=70` fácil, `>=40` média, senão difícil)
    - Acessibilidade: `role="meter"` com `aria-valuenow`/`aria-valuemin={0}`/`aria-valuemax={100}` e `aria-label` descritivo
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.4_

  - [x] 3.2 Criar `CelulaConteudo`
    - Criar `apps/frontend/src/components/CelulaConteudo.tsx` com props `{ nome, percentualAcerto, nivel }`
    - Renderizar como `<li>` exibindo nome, percentual e o `Nivel_De_Defasagem` como texto legível
    - Aplicar `bg`/`text` obtidos de `coresDoNivelDefasagem(nivel)`
    - _Requirements: 4.1, 4.2, 4.3, 7.1_

  - [x] 3.3 Criar `MapaDefasagem`
    - Criar `apps/frontend/src/components/MapaDefasagem.tsx` com props `{ materia, conteudos }`
    - Renderizar um cabeçalho que nomeia a Matéria e uma `<ul>` semântica de `CelulaConteudo`
    - Associar visualmente os Conteúdos à Matéria de origem (agrupamento por cabeçalho/lista)
    - _Requirements: 4.1, 4.4, 7.2_

- [x] 4. Criar a página container com os quatro estados
  - Criar `apps/frontend/src/pages/PainelDesempenho.page.tsx` espelhando o padrão de `result_simulado.page.tsx`
  - Definir props `{ onBack: () => void }` e estados `dados: RespostaDefasagem | null`, `loading: boolean`, `error: string | null`
  - Implementar a função nomeada `carregarDefasagem` (reutilizável no retry): resetar `error`/`loading`, `fetch('http://localhost:3000/dashboard/me/defasagem')`, tratar `!response.ok` com `throw`, `try/catch/finally` com `setLoading(false)` no `finally`
  - Disparar `carregarDefasagem` em `useEffect(..., [])`
  - Early return de **carregando**: indicador textual enquanto `loading === true`
  - Early return de **erro**: mensagem textual + `<button onClick={carregarDefasagem}>Tentar novamente</button>`
  - Early return de **vazio**: quando `dados.materias.length === 0`, mensagem orientando a realizar o primeiro simulado, omitindo gráfico e mapa
  - Incluir um controle "Voltar" acionável que chama `onBack`
  - _Requirements: 2.1, 2.2, 2.4, 5.1, 5.2, 5.3, 6.1, 6.2, 8.2_

- [x] 5. Criar o CSS dedicado do painel
  - Criar `apps/frontend/src/pages/PainelDesempenho.css` com estilos para a barra proporcional, a grade/lista do mapa e o layout de seções por Matéria
  - Importar o CSS em `PainelDesempenho.page.tsx` e aplicar as classes nos componentes de apresentação
  - Garantir foco visível nos controles `<button>` (acessibilidade por teclado)
  - _Requirements: 3.1, 4.1, 7.3_

- [x] 6. Integrar o painel na navegação por estado
  - Em `apps/frontend/src/App.tsx`, importar `PainelDesempenhoPage`
  - Adicionar o valor `'desempenho'` ao `type Screen`
  - Adicionar render condicional `if (screen === 'desempenho') return <PainelDesempenhoPage onBack={() => setScreen('home')} />`
  - _Requirements: 8.1, 8.2_

- [x] 7. Montar o render de sucesso completo
  - No render de sucesso de `PainelDesempenho.page.tsx`, iterar sobre `dados.materias` gerando uma seção por Matéria
  - Em cada seção, renderizar `BarraMateria` (visão macro) seguido de `MapaDefasagem` com os `conteudos` daquela Matéria (`mapaDefasagem`)
  - Usar títulos semânticos (`<h1>`/`<h2>`) e garantir que cada seção associe o mapa à sua Matéria
  - _Requirements: 2.3, 3.1, 3.2, 4.1, 4.4, 7.2_

- [x] 8. Verificação final (tipagem, lint, build e teste manual)
  - Executar `npm run lint -w apps/frontend` e corrigir apontamentos
  - Executar `npm run build -w apps/frontend` (`tsc -b && vite build`) e garantir tipagem e build sem erros
  - Checklist de teste manual dos quatro estados: carregando, erro + "Tentar novamente", vazio (orienta primeiro simulado), sucesso (barras proporcionais e coloridas, texto de percentual e razão acertos/total, mapa agrupado por Matéria, defasagem alta = vermelho)
  - Checklist de acessibilidade: HTML semântico (`h1/h2`, `ul/li`, `<button>`), operação por teclado (Tab/Enter) em "Tentar novamente" e "Voltar", rótulo textual + valor numérico em cada barra/célula, `aria-label`/`role="meter"` nas barras
  - _Requirements: 1.1, 2.2, 3.2, 4.2, 5.2, 6.1, 7.1, 7.2, 7.3, 7.4_

## Notes

- Não há subtarefas de testes automatizados: `apps/frontend` não possui runner de testes (débito técnico registrado no design). A verificação se dá por tipagem exaustiva, ESLint, build e teste manual.
- Cada tarefa referencia requisitos específicos para rastreabilidade.
- A tarefa 7 depende dos componentes (tarefa 3) e da página (tarefa 4); por isso o render de sucesso completo vem após a estrutura de estados estar montada.
- Escopo exclusivamente de código no frontend: nenhuma tarefa de deploy, documentação ou backend.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "4"] },
    { "id": 4, "tasks": ["5", "6"] },
    { "id": 5, "tasks": ["7"] },
    { "id": 6, "tasks": ["8"] }
  ]
}
```
