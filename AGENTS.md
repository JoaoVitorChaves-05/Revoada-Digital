# Contexto e instrucoes do projeto

Estas instrucoes sao a referencia compartilhada para agentes que trabalham neste repositorio. Os arquivos `apps/backend/AGENTS.md` e `apps/frontend/AGENTS.md` complementam este contexto com orientacoes especificas de cada aplicacao.

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
