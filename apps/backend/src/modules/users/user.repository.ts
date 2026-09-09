import type { User, UserListFilters, UpdateUserInput } from "./user.types.js";

// camada de persistencia: o repository é a única parte do sistema que sabe como os dados são guardados (Postgres, MongoDB, arquivo, etc). 
// O service não sabe nem se existe banco de dados, só chama o repository.


//def metodos que o service espera do repository..
export interface UserRepository {
  list(filters: UserListFilters): Promise<User[]>; //retorna todos os usuários que batem com os filtros
  findById(id: string): Promise<User | null>; //retorna o usuário com o id dado, ou null se não existir
  update(id: string, data: UpdateUserInput): Promise<User | null>; //att e retorna o usuário, ou null se não existir
  delete(id: string): Promise<boolean>; //remove o usuário com o id dado, retorna true se removeu, false se não achou
  countAdminsInSchool(schoolId: string): Promise<number>; //conta quantos admins existem na escola com o id dado (pra não deixar a escola sem admin)
}

// "InMemory" = guardado só na memória do processo (um array).
// pra desenvolver e testar sem precisar do banco pronto.
// Os dados somem toda vez que o servidor reinicia 
export class InMemoryUserRepository implements UserRepository {
  private users: User[];

  constructor(seed: User[] = []) {
    this.users = seed;
  }

  async list(filters: UserListFilters): Promise<User[]> {
    return this.users.filter((user) => {
      if (filters.schoolId && user.schoolId !== filters.schoolId) return false;
      if (filters.role && user.role !== filters.role) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matches =
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    // Só sobrescreve os campos que vieram no "data" (spread do que já existe
    // + spread do que mudou por cima). Isso é um "update parcial" (PATCH-like).
    const updated: User = { ...this.users[index], ...data };
    this.users[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const before = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < before;
  }

  async countAdminsInSchool(schoolId: string): Promise<number> {
    return this.users.filter((u) => u.schoolId === schoolId && u.role === "admin").length;
  }
}
