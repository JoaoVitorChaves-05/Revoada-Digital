import type { UserRepository } from "./user.repository.js";
import type { User, UserListFilters, UpdateUserInput, UserRole } from "./user.types.js";
import { UserBusinessError } from "./user.types.js";

const VALID_ROLES: UserRole[] = ["aluno", "professor", "admin"];

// REGRAS DE NEGÓCIO: recebe dados "limpos" e retorna
// dados ou lança um erro (UserBusinessError).

export class UserService {
  // injeção de dependência: o service não cria o repository, ele recebe de fora.
  constructor(private readonly repository: UserRepository) { }

  async listUsers(filters: UserListFilters): Promise<User[]> {
    return this.repository.list(filters);
  }

  async updateUser(

    //valida role, busca user, atualiza user, retorna user atualizado
    id: string,
    requesterId: string,
    input: UpdateUserInput,
  ): Promise<User> {
    if (input.role && !VALID_ROLES.includes(input.role)) {
      throw new UserBusinessError(
        `Role inválida: "${input.role}". Use uma de: ${VALID_ROLES.join(", ")}`,
        400, // 400 = Bad Request (o cliente mandou algo errado)
      );
    }

    const target = await this.repository.findById(id);
    if (!target) {
      throw new UserBusinessError("Usuário não encontrado", 404);
    }

    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw new UserBusinessError("Usuário não encontrado", 404);
    }

    return updated;
  }

  async deleteUser(id: string, requesterId: string): Promise<void> {
    //busca e verifica regras de delete 
    const target = await this.repository.findById(id);
    if (!target) {
      throw new UserBusinessError("Usuário não encontrado", 404);
    }

    //ninguém pode se auto-excluir.
    if (target.id === requesterId) {
      throw new UserBusinessError(
        "Você não pode excluir a própria conta por aqui",
        403, // Forbidden (identificado, mas não pode fazer isso)
      );
    }

    // não pode ficar uma escola sem nenhum admin
    if (target.role === "admin" && target.schoolId) {
      const adminCount = await this.repository.countAdminsInSchool(target.schoolId);
      if (adminCount <= 1) {
        throw new UserBusinessError(
          "Não é possível excluir o único admin da escola",
          403,
        );
      }
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new UserBusinessError("Usuário não encontrado", 404);
    }
  }
}
