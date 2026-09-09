import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { UserBusinessError, type User } from "./user.types.js";

const createUsers = (): User[] => [
  {
    id: "admin-1",
    name: "Admin Um",
    email: "admin1@escola.com",
    role: "admin",
    schoolId: "school-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "admin-2",
    name: "Admin Dois",
    email: "admin2@escola.com",
    role: "admin",
    schoolId: "school-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "student-1",
    name: "Ana Silva",
    email: "ana@escola.com",
    role: "aluno",
    schoolId: "school-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "teacher-1",
    name: "Bruno Souza",
    email: "bruno@escola.com",
    role: "professor",
    schoolId: "school-2",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("UserService", () => {
  let repository: InMemoryUserRepository;
  let service: UserService;

  beforeEach(() => {
    repository = new InMemoryUserRepository(createUsers());
    service = new UserService(repository);
  });

  describe("listUsers", () => {
    it("lista todos os usuários", async () => {
      const users = await service.listUsers({});

      expect(users).toHaveLength(4);
    });

    it("filtra por escola", async () => {
      const users = await service.listUsers({ schoolId: "school-1" });

      expect(users).toHaveLength(3);
      expect(users.every((user) => user.schoolId === "school-1")).toBe(true);
    });

    it("filtra por role", async () => {
      const users = await service.listUsers({ role: "admin" });

      expect(users).toHaveLength(2);
      expect(users.every((user) => user.role === "admin")).toBe(true);
    });

    it("filtra por texto no nome ou e-mail", async () => {
      const users = await service.listUsers({ search: "ana" });

      expect(users).toHaveLength(1);
      expect(users[0].id).toBe("student-1");
    });

    it("retorna lista vazia quando não encontra resultados", async () => {
      const users = await service.listUsers({ search: "inexistente" });

      expect(users).toEqual([]);
    });

    it("combina múltiplos filtros", async () => {
      const users = await service.listUsers({
        schoolId: "school-1",
        role: "admin",
        search: "dois",
      });

      expect(users).toHaveLength(1);
      expect(users[0].id).toBe("admin-2");
    });
  });

  describe("updateUser", () => {
    it("atualiza o nome do usuário", async () => {
      const updated = await service.updateUser(
        "student-1",
        "admin-1",
        { name: "Ana Atualizada" },
      );

      expect(updated.name).toBe("Ana Atualizada");
      expect(updated.id).toBe("student-1");
    });

    it("atualiza a role para um valor válido", async () => {
      const updated = await service.updateUser(
        "student-1",
        "admin-1",
        { role: "professor" },
      );

      expect(updated.role).toBe("professor");
    });

    it("atualiza o schoolId", async () => {
      const updated = await service.updateUser(
        "student-1",
        "admin-1",
        { schoolId: "school-2" },
      );

      expect(updated.schoolId).toBe("school-2");
    });

    it("permite remover o schoolId usando null", async () => {
      const updated = await service.updateUser(
        "student-1",
        "admin-1",
        { schoolId: null },
      );

      expect(updated.schoolId).toBeNull();
    });

    it("rejeita uma role inválida", async () => {
      await expect(
        service.updateUser(
          "student-1",
          "admin-1",
          { role: "diretor" as never },
        ),
      ).rejects.toMatchObject({
        message: 'Role inválida: "diretor". Use uma de: aluno, professor, admin',
        statusCode: 400,
      });
    });

    it("rejeita usuário inexistente", async () => {
      await expect(
        service.updateUser("unknown", "admin-1", { name: "Teste" }),
      ).rejects.toMatchObject({
        message: "Usuário não encontrado",
        statusCode: 404,
      });
    });

    it("persiste a alteração no repository", async () => {
      await service.updateUser(
        "student-1",
        "admin-1",
        { name: "Nome Persistido" },
      );

      const users = await service.listUsers({ search: "persistido" });

      expect(users).toHaveLength(1);
      expect(users[0].id).toBe("student-1");
    });
  });

  describe("deleteUser", () => {
    it("exclui um usuário existente", async () => {
      await service.deleteUser("student-1", "admin-1");

      const users = await service.listUsers({});
      expect(users.some((user) => user.id === "student-1")).toBe(false);
    });

    it("não permite excluir a própria conta", async () => {
      await expect(
        service.deleteUser("admin-1", "admin-1"),
      ).rejects.toMatchObject({
        message: "Você não pode excluir a própria conta por aqui",
        statusCode: 403,
      });
    });

    it("não permite excluir o único admin da escola", async () => {
      const users = createUsers().filter((user) => user.id !== "admin-2");
      repository = new InMemoryUserRepository(users);
      service = new UserService(repository);

      await expect(
        service.deleteUser("admin-1", "student-1"),
      ).rejects.toMatchObject({
        message: "Não é possível excluir o único admin da escola",
        statusCode: 403,
      });
    });

    it("permite excluir um admin quando há outro admin na escola", async () => {
      await service.deleteUser("admin-1", "student-1");

      const users = await service.listUsers({});
      expect(users.some((user) => user.id === "admin-1")).toBe(false);
      expect(users.some((user) => user.id === "admin-2")).toBe(true);
    });

    it("permite excluir um usuário que não é admin", async () => {
      await service.deleteUser("student-1", "admin-1");

      const users = await service.listUsers({});
      expect(users).toHaveLength(3);
    });

    it("rejeita exclusão de usuário inexistente", async () => {
      await expect(
        service.deleteUser("unknown", "admin-1"),
      ).rejects.toMatchObject({
        message: "Usuário não encontrado",
        statusCode: 404,
      });
    });
  });
});
