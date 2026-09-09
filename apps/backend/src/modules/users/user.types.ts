// Os papéis (roles) possíveis de um usuário na plataforma.

// Usar um union type em vez de "string"
// // => evita que alguém mande um role inválido tipo "aluno "

export type UserRole = "aluno" | "professor" | "admin";

// Como um usuário existen o banco
// deve bater com as colunas da tabela `users` no Postgres.
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null; // pode ser null se o usuário ainda não tem escola vinculada
  createdAt: string; // ISO date string, ex: "2026-09-06T10:00:00.000Z"
}

// Filtros aceitos(GET /admin/users).
// Todos os campos são opcionais (?) porque o admin pode não usar nenhum filtro.
export interface UserListFilters {
  schoolId?: string;
  role?: UserRole;
  search?: string; // busca por nome/email
}

// O que o body do PUT /admin/users/:id pode alterar .
// "id" nem "createdAt" não podem ser editados pelo cliente.
export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  schoolId?: string | null;
}

// Erros previsíveis (não são bugs, são regras).
// facilita transformar isso em um status HTTP certo (403, 404, etc.) lá no controller.
export class UserBusinessError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "UserBusinessError";
  }
}
