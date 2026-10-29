# Contexto e instrucoes do projeto

Estas instrucoes sao a referencia compartilhada para agentes que trabalham neste repositorio. O contexto especifico de cada aplicacao (backend e frontend) esta consolidado neste mesmo arquivo, nas secoes "Backend" e "Frontend" ao final.

## Projeto

Revoada Digital e uma plataforma de estudos para o ENEM com simulados direcionados por materia, conteudo e dificuldade. A proposta inclui feedback de desempenho e pontos por estudo, com recompensas previstas no roadmap.

Trate funcionalidades descritas como roadmap como planejadas, nao implementadas. Para saber o que existe hoje, confira o codigo, os manifests e os testes; o README e documentos de contexto podem estar desatualizados.

## Estrutura e stack

- Monorepo Node.js com npm workspaces em `apps/*`.
- `apps/frontend`: React, TypeScript e Vite.
- `apps/backend`: TypeScript, Express, Prisma e PostgreSQL; tambem contem integracao com Socket.IO.
- `compose.yml` define o ambiente local com PostgreSQL e backend.
- O `package.json` da raiz lista os comandos de workspace disponiveis. Confira os scripts dos pacotes antes de executar comandos, pois nem todo script existe em todos os pacotes.

## Como trabalhar

- Responda no idioma usado pela pessoa; neste repositorio, a documentacao e predominantemente em portugues.
- Antes de editar, leia o codigo e os testes proximos da mudanca. Siga os padroes ja usados no pacote afetado e mantenha a alteracao focada.
- Ao mudar comportamento, atualize ou acrescente testes relevantes e execute a validacao mais especifica disponivel. Informe claramente o que foi executado e o que nao foi.
- Nao assuma que uma tecnologia, endpoint ou decisao descrita em documentacao antiga continua vigente: confirme no codigo antes de depender dela.
- Mudancas no schema Prisma devem incluir a migration correspondente e ser validadas contra um banco local.
- Seja um cursor, não um faz-tudo.
- Apontar riscos e pontas soltas mesmo quando o time decidiu deixá-los para depois.

## Versionamento e fluxo Git

- Ramos permanentes: `main` representa producao, `staging` e homologacao/pre-producao, e `develop` e a linha de integracao do desenvolvimento.
- Nunca faca commits diretamente em `main`, `staging` ou `develop`. Crie uma branch de trabalho e integre mudancas por Pull Request com revisao e CI aprovados.
- Para funcionalidades, correcoes e tarefas comuns, atualize `develop` e crie a branch a partir dela. Use o formato `tipo/nome-da-tarefa-ou-id`, por exemplo `feat/CHA-123-chat` ou `fix/CHA-456-validacao`. Prefixos usuais: `feat/`, `fix/`, `chore/`, `docs/` e `refactor/`.
- Antes de abrir o PR, execute os testes e validacoes relevantes, envie a branch ao remoto e abra o PR com destino a `develop`. Mantenha commits pequenos e siga Conventional Commits, por exemplo `feat(chat): adiciona envio de mensagens`.
- Promocoes de `develop` para `staging` sao para homologacao; de `staging` para `main`, para releases aprovadas. Nao promova codigo sem revisao e validacao. Cada release integrada em `main` deve receber uma tag SemVer, como `v1.2.0`.
- Para hotfix critico de producao, crie `hotfix/...` a partir de `main` atualizada e abra PR para `main`. Depois do merge, integre obrigatoriamente a correcao de volta em `develop` e tambem em `staging` quando aplicavel.
- Exclua branches temporarias apos a integracao, desde que nao haja trabalho pendente nelas.

## Seguranca e dados

- Nunca exponha, copie para saidas ou comite valores de `.env`, `.env.docker`, tokens, senhas ou URLs de conexao com credenciais. Ao validar o ambiente, mostre apenas um resultado sanitizado, nunca os valores.
- Nunca execute migrations, testes ou comandos de escrita contra banco de producao. Confirme que o destino e local antes de operar no banco.
- Antes de uma operacao destrutiva ou que possa causar perda de dados, explique o impacto e obtenha autorizacao explicita.
- Nao altere configuracoes compartilhadas ou dados fora do escopo solicitado.

---

# Backend (`apps/backend`)

As instrucoes gerais e de seguranca acima tambem se aplicam aqui. Esta secao contem apenas contexto tecnico do backend.

## Arquitetura atual

- API em TypeScript com Express; `src/server.ts` monta middlewares e rotas.
- `src/index.ts` cria o servidor HTTP e inicializa o Socket.IO.
- A logica e organizada em `src/routes`, `src/controllers`, `src/services`, `src/repositories` e `src/schemas`. Confira os exemplos do mesmo dominio antes de introduzir outro padrao.
- Validacoes de entrada ficam em `src/schemas`; confirme o comportamento das rotas e dos testes antes de alterar contratos da API.
- O banco atual e PostgreSQL, acessado por Prisma. Schema e migrations ficam em `prisma/`.
- O Socket.IO e inicializado em `src/socket/`; seus middlewares e handlers ficam nesse diretorio. Nao presuma nomes de eventos, autenticacao ou comportamento de salas sem conferir o codigo atual.

## Banco local e validacao

- O `compose.yml` da raiz define o PostgreSQL local e o servico do backend.
- `prisma.config.ts` carrega o `.env` da raiz e usa `DIRECT_URL` quando definido, ou `DATABASE_URL` como alternativa. O container do backend recebe o `.env.docker`.
- Antes de executar qualquer comando Prisma que consulte ou altere dados, confirme que a conexao efetiva aponta para o banco local. Nunca mostre os valores das variaveis de conexao.
- O script `prisma:migrate` deste pacote executa `prisma migrate dev --create-only`. Revise a migration gerada antes de aplica-la.
- Testes do backend: `npm test --workspace apps/backend`. O script `pretest` gera o Prisma Client, portanto a configuracao local de ambiente precisa estar disponivel.
- Confira os scripts no `apps/backend/package.json` antes de sugerir ou executar outras tarefas; nao presuma que exista um script de build.

---

# Frontend (`apps/frontend`)

As instrucoes gerais acima tambem se aplicam aqui. Esta secao registra apenas o contexto tecnico do frontend.

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