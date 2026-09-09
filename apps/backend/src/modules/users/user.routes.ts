import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";
import { InMemoryUserRepository } from "./user.repository.js";
import type { User } from "./user.types.js";

// dados de exemplo só pra você conseguir testar os endpoints
// localmente Apagar isso quando plugar o repositório real do Postgres.
const seed: User[] = [
  {
    id: "u1",
    name: "Luara Maria",
    email: "luara@escola.com",
    role: "admin",
    schoolId: "school-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Paulo Jose",
    email: "paulo@escola.com",
    role: "aluno",
    schoolId: "school-1",
    createdAt: new Date().toISOString(),
  },
];

// rota → controller → service → repository
// troque só esta linha:
//   const repository = new PostgresUserRepository(db);
// só pra testar localmente, sem banco de dados real
const repository = new InMemoryUserRepository(seed); //guarda os dados em memória, só pra teste local
const service = new UserService(repository);
const controller = new UserController(service);

export const userRouter = Router();

userRouter.get("/admin/users", controller.list);
userRouter.put("/admin/users/:id", controller.update);
userRouter.delete("/admin/users/:id", controller.delete);
