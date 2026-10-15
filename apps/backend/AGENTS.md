# Instrucoes especificas do backend

As instrucoes gerais e de seguranca em [`../../AGENTS.md`](../../AGENTS.md) tambem se aplicam aqui. Este arquivo contem apenas contexto tecnico do backend.

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
