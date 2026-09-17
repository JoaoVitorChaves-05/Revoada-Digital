# Endpoints da API

todas as rotas estão no prefixo `/api/v1/`

## 1. módulo: Autenticação e Perfis (Users & Auth)
* `POST /api/v1/auth/register`: Registra um novo usuário (Aluno, Empresa, etc.)
* `POST /api/v1/auth/login`: Autentica o usuário e retorna o token de acesso.
* `POST /api/v1/auth/refresh-token`: Renova o token de sessão ativo
* `POST /api/v1/auth/recover-password`: Inicia a recuperação de senha.

## 2. módulo: Banco de Questões (Questions)
* `GET /api/v1/questions`: Lista todas as questões. Suporta `?page=1&limit=10` pra paginação e `?difficulty=facil` para filtros. Retorna `200 OK`.
* `GET /api/v1/questions/:id`: Retorna os detalhes de uma questão específica pelo ID (incluindo as alternativas). Retorna `200 OK` ou `404 Not Found`.
* `POST /api/v1/questions`: Cria uma nova questão e suas alternativas, exigindo o token de ADMIN ou PROFESSOR. Retorna `201 Created`.
* `PUT /api/v1/questions/:id`: Edita o enunciado ou alternativas de uma questão. Exige token de ADMIN ou PROFESSOR.
* `DELETE /api/v1/questions/:id`: Remove uma questão do banco. Exige token de ADMIN ou PROFESSOR.

## 3. Módulo: Simulados (Exams/Simulations)
* `POST /api/v1/simulations`: Gera um novo simulado (consumindo questões do banco local ou da API Docs ENEM)
* `GET /api/v1/simulations`: Consulta os simulados gerados pelo usuário.
* `POST /api/v1/simulations/:id/submit`: Submete as respostas preenchidas pelo aluno para correção e cálculo de pontos.