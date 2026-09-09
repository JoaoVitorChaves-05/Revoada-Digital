import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListFilters,
} from "./user.types.js";

export interface UserRepository {
  list(filters: UserListFilters): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User | null>;
}

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}

  async list(filters: UserListFilters): Promise<User[]> {
    return this.users.filter((user) => {
      if (filters.profileType && user.profileType !== filters.profileType) return false;

      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = user.fullName.toLowerCase().includes(search);
        const matchesEmail = user.email.toLowerCase().includes(search);
        if (!matchesName && !matchesEmail) return false;
      }

      return true;
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const user: User = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: data.email,
      fullName: data.fullName,
      rg: data.rg,
      cpf: data.cpf,
      profileType: data.profileType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    Object.assign(user, data);
    return user;
  }
}
