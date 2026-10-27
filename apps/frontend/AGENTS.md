# Instrucoes especificas do frontend

As instrucoes gerais em [`../../AGENTS.md`](../../AGENTS.md) tambem se aplicam aqui. Este arquivo registra apenas o contexto tecnico do frontend.

## Stack e organizacao

- Aplicacao React com TypeScript, Vite e `react-dom`; scripts e dependencias estao em `package.json`.
- O ponto de entrada e `src/main.tsx`; `src/App.tsx` coordena a tela principal atualmente. Confira o fluxo real antes de introduzir ou pressupor uma biblioteca de roteamento.
- A interface existente organiza partes em `src/components`, `src/screens` e `src/pages`. Reutilize a organizacao mais proxima da funcionalidade que estiver alterando.
- Estilos globais ficam em `src/index.css` e `src/App.css`; estilos especificos de telas podem ficar em arquivos CSS junto delas. Antes de criar uma nova solucao de estilos, confira os componentes e estilos vizinhos.
- Tipos compartilhados da interface ficam em `src/types`; utilitarios compartilhados ficam em `src/utils`.

## Integracao e comportamento

- Antes de integrar com a API, confira as rotas, schemas e tipos atuais do backend. Nao trate endpoints comentados, dados mockados ou URLs locais como contratos definitivos.
- Mantenha os dados de API tipados e trate estados de carregamento, erro e ausencia de dados quando aplicavel.
- Nao inclua segredos, tokens ou credenciais no codigo do cliente. Configuracoes expostas ao browser nao sao secretas.
- Preserve acessibilidade: associe labels aos campos, use elementos semanticos e mantenha controles operaveis por teclado.
- Siga os componentes e padroes existentes; evite adicionar bibliotecas ou abstrair componentes sem necessidade concreta.

## Validacao

- `npm run lint --workspace apps/frontend`
- `npm run build --workspace apps/frontend`
- O pacote nao declara atualmente um script de testes. Confira novamente `package.json` antes de assumir disponibilidade de testes automatizados.
