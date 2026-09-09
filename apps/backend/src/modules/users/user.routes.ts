import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { UserController } from "./user.controller.js";
import { PrismaUserRepository } from "./prisma-user.repository.js";
import { UserService } from "./user.service.js";

const repository = new PrismaUserRepository(prisma);
const service = new UserService(repository);
const controller = new UserController(service);

export const userRouter = Router();

userRouter.post("/admin/users", controller.create);
userRouter.get("/admin/users", controller.list);
userRouter.put("/admin/users/:id", controller.update);
