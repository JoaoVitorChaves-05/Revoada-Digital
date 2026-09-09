export type UserRole = "aluno" | "professor" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  rg: string;
  cpf: string;
  profileType: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserListFilters {
  profileType?: UserRole;
  search?: string;
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  rg?: string;
  cpf?: string;
  profileType?: UserRole;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  rg: string;
  cpf: string;
  profileType: UserRole;
  school?: string;
}

export class UserBusinessError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "UserBusinessError";
  }
}
