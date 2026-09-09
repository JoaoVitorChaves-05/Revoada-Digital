import type { Request, Response } from "express";
import type { UserService } from "./user.service.js";
import type { UpdateUserInput, UserListFilters, UserRole } from "./user.types.js";
import { UserBusinessError } from "./user.types.js";

const VALID_ROLES: UserRole[] = ["aluno", "professor", "admin"];

// ---------------------------------------------------------------------------
//   1. lê e valida o que veio na requisição (query params, body, params)
//   2. chama o service
//   3. transforma o resultado (ou erro) em uma resposta HTTP
// ---------------------------------------------------------------------------
export class UserController {
  constructor(private readonly service: UserService) { }

  // GET /admin/users?schoolId=...&role=...&search=...
  list = async (req: Request, res: Response): Promise<void> => {
    const { schoolId, role, search } = req.query;

    // req.query vem sempre como string | string[] | undefined 
    const filters: UserListFilters = {};
    if (typeof schoolId === "string") filters.schoolId = schoolId;
    if (typeof search === "string") filters.search = search;
    if (typeof role === "string") {
      if (!VALID_ROLES.includes(role as UserRole)) {
        res.status(400).json({ error: `role inválida: "${role}"` });
        return;
      }
      filters.role = role as UserRole;
    }

    const users = await this.service.listUsers(filters);
    res.status(200).json(users);
  };

  // PUT /admin/users/:id
  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({ error: "id inválido" });
      return;
    }

    const requesterId = getRequesterId(req);

    const validationError = validateUpdateBody(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    try {
      const updated = await this.service.updateUser(id, requesterId, req.body as UpdateUserInput);
      res.status(200).json(updated);
    } catch (err) {
      handleError(err, res);
    }
  };

  // DELETE /admin/users/:id
  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({ error: "id inválido" });
      return;
    }

    const requesterId = getRequesterId(req);

    try {
      await this.service.deleteUser(id, requesterId);
      res.status(204).send(); // 204 = sucesso, sem corpo de resposta
    } catch (err) {
      handleError(err, res);
    }
  };
}

// TODO: quando o middleware de autenticação existir 
// // => req.user.id.
function getRequesterId(req: Request): string {
  return (req.headers["x-user-id"] as string) ?? "unknown";
}

function validateUpdateBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return "Corpo da requisição inválido";
  }
  const { name, role, schoolId } = body as Record<string, unknown>;

  if (name !== undefined && typeof name !== "string") {
    return "name deve ser uma string";
  }
  if (role !== undefined && !VALID_ROLES.includes(role as UserRole)) {
    return `role inválida: "${String(role)}"`;
  }
  if (schoolId !== undefined && schoolId !== null && typeof schoolId !== "string") {
    return "schoolId deve ser string ou null";
  }
  return null;
}

// Converte um UserBusinessError no status HTTP certo. Qualquer outro erro
// (bug de verdade) vira 500, pra nunca vazar detalhe interno pro cliente.
function handleError(err: unknown, res: Response): void {
  if (err instanceof UserBusinessError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erro interno" });
}
