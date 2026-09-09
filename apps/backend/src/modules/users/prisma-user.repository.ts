import { ProfileType, type PrismaClient } from "../../generated/prisma/client.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListFilters,
  UserRole,
} from "./user.types.js";
import type { UserRepository } from "./user.repository.js";

type PrismaUser = Awaited<ReturnType<PrismaClient["user"]["findFirst"]>>;

function toUser(user: NonNullable<PrismaUser>): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    rg: user.rg,
    cpf: user.cpf,
    profileType: toApiProfileType(user.profileType),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function toPrismaProfileType(profileType: UserRole): ProfileType {
  switch (profileType) {
    case "aluno":
      return ProfileType.STUDENT;
    case "professor":
      return ProfileType.TEACHER;
    case "admin":
      return ProfileType.ADMIN;
  }
}

function toApiProfileType(profileType: ProfileType | null): UserRole {
  switch (profileType) {
    case ProfileType.STUDENT:
      return "aluno";
    case ProfileType.TEACHER:
      return "professor";
    case ProfileType.ADMIN:
      return "admin";
    default:
      throw new Error("Usuário retornado sem profileType válido");
  }
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  async list(filters: UserListFilters): Promise<User[]> {
    const users = await this.client.user.findMany({
      where: {
        profileType: filters.profileType
          ? toPrismaProfileType(filters.profileType)
          : undefined,
        ...(filters.search
          ? {
              OR: [
                { fullName: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map(toUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    return user ? toUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.client.user.findUnique({ where: { email } });
    return user ? toUser(user) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.client.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          rg: data.rg,
          cpf: data.cpf,
          profileType: toPrismaProfileType(data.profileType),
        },
      });

      if (data.profileType === "aluno") {
        await transaction.student_profiles.create({
          data: {
            id: user.id,
            userId: user.id,
            school: data.school!,
          },
        });
      } else if (data.profileType === "professor") {
        await transaction.teacher_profiles.create({
          data: {
            id: user.id,
            userId: user.id,
            school: data.school!,
          },
        });
      } else if (data.profileType === "admin") {
        await transaction.admin_profiles.create({
          data: {
            id: user.id,
            userId: user.id,
          },
        });
      }

      return toUser(user);
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const updateData = {
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.rg !== undefined ? { rg: data.rg } : {}),
      ...(data.cpf !== undefined ? { cpf: data.cpf } : {}),
      ...(data.profileType !== undefined
        ? { profileType: toPrismaProfileType(data.profileType) }
        : {}),
    };

    const user = await this.client.user
      .update({ where: { id }, data: updateData })
      .catch((error: unknown) => {
        if (isRecordNotFoundError(error)) return null;
        throw error;
      });

    return user ? toUser(user) : null;
  }
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
