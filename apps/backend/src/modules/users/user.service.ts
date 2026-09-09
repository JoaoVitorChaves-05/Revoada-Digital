import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListFilters,
  UserRole,
} from "./user.types.js";
import { UserBusinessError } from "./user.types.js";
import type { UserRepository } from "./user.repository.js";

const VALID_ROLES: UserRole[] = ["aluno", "professor", "admin"];

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  listUsers(filters: UserListFilters): Promise<User[]> {
    return this.repository.list(filters);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    if (!VALID_ROLES.includes(input.profileType)) {
      throw new UserBusinessError(
        `profileType inválido: "${input.profileType}". Use um de: ${VALID_ROLES.join(", ")}`,
        400,
      );
    }

    const existingUser = await this.repository.findByEmail(input.email);
    if (existingUser) {
      throw new UserBusinessError("E-mail já cadastrado", 409);
    }

    return this.repository.create(input);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    if (input.profileType && !VALID_ROLES.includes(input.profileType)) {
      throw new UserBusinessError(
        `profileType inválido: "${input.profileType}". Use um de: ${VALID_ROLES.join(", ")}`,
        400,
      );
    }

    const user = await this.repository.update(id, input);
    if (!user) {
      throw new UserBusinessError("Usuário não encontrado", 404);
    }

    return user;
  }
}
