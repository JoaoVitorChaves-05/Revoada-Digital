import type { Request, Response } from "express";
import type { UserService } from "./user.service.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListFilters,
  UserRole,
} from "./user.types.js";
import { UserBusinessError } from "./user.types.js";

const VALID_ROLES: UserRole[] = ["aluno", "professor", "admin"];

export class UserController {
  constructor(private readonly service: UserService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationError = validateCreateBody(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const user = await this.service.createUser(req.body as CreateUserInput);
      res.status(201).json(user);
    } catch (error) {
      handleError(error, res);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { profileType, search } = req.query;
    const filters: UserListFilters = {};

    if (typeof search === "string") filters.search = search;

    if (typeof profileType === "string") {
      if (!VALID_ROLES.includes(profileType as UserRole)) {
        res.status(400).json({ error: `profileType inválido: "${profileType}"` });
        return;
      }
      filters.profileType = profileType as UserRole;
    }

    const users = await this.service.listUsers(filters);
    res.status(200).json(users);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (typeof id !== "string" || id.length === 0) {
      res.status(400).json({ error: "id inválido" });
      return;
    }

    const validationError = validateUpdateBody(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const user = await this.service.updateUser(id, req.body as UpdateUserInput);
      res.status(200).json(user);
    } catch (error) {
      handleError(error, res);
    }
  };
}

function validateUpdateBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return "Corpo da requisição inválido";
  }

  const { email, fullName, rg, cpf, profileType } = body as Record<string, unknown>;

  if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
    return "email deve ser válido";
  }
  if (fullName !== undefined && typeof fullName !== "string") {
    return "fullName deve ser uma string";
  }
  for (const [field, value] of Object.entries({ rg, cpf })) {
    if (value !== undefined && typeof value !== "string") {
      return `${field} deve ser uma string`;
    }
  }
  if (profileType !== undefined && !VALID_ROLES.includes(profileType as UserRole)) {
    return `profileType inválido: "${String(profileType)}"`;
  }

  return null;
}

function validateCreateBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return "Corpo da requisição inválido";
  }

  const { email, fullName, rg, cpf, profileType, school } = body as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim() === "") {
    return "fullName é obrigatório e deve ser uma string";
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return "email é obrigatório e deve ser válido";
  }
  if (typeof rg !== "string" || rg.trim() === "") {
    return "rg é obrigatório e deve ser uma string";
  }
  if (typeof cpf !== "string" || cpf.trim() === "") {
    return "cpf é obrigatório e deve ser uma string";
  }
  if (typeof profileType !== "string" || !VALID_ROLES.includes(profileType as UserRole)) {
    return `profileType inválido: "${String(profileType)}"`;
  }
  if (profileType !== "admin" && (typeof school !== "string" || school.trim() === "")) {
    return "school é obrigatório para aluno e professor";
  }
  if (school !== undefined && typeof school !== "string") {
    return "school deve ser uma string";
  }

  return null;
}

function handleError(error: unknown, res: Response): void {
  if (error instanceof UserBusinessError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Erro interno" });
}
