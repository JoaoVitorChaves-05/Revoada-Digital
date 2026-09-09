import request from "supertest";
import { createApp } from "../../app.js";
import { describe, it, expect } from "vitest";

const app = createApp();

describe("UserController (HTTP)", () => {
    it("lista usuários", async () => {
        const response = await request(app).get("/admin/users");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
    });

    it("filtra usuários por role", async () => {
        const response = await request(app)
            .get("/admin/users")
            .query({ role: "admin" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].role).toBe("admin");
    });

    it("retorna 400 para role inválida", async () => {
        const response = await request(app)
            .get("/admin/users")
            .query({ role: "diretor" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'role inválida: "diretor"',
        });
    });

    it("atualiza um usuário", async () => {
        const response = await request(app)
            .put("/admin/users/u2")
            .send({ name: "Paulo Atualizado" });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Paulo Atualizado");
    });

    it("retorna 400 para body inválido", async () => {
        const response = await request(app)
            .put("/admin/users/u2")
            .send({ name: 123 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("name deve ser uma string");
    });

    it("retorna 404 para usuário inexistente", async () => {
        const response = await request(app)
            .put("/admin/users/inexistente")
            .send({ name: "Teste" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Usuário não encontrado");
    });

    it("não permite excluir a própria conta", async () => {
        const response = await request(app)
            .delete("/admin/users/u1")
            .set("x-user-id", "u1");

        expect(response.status).toBe(403);
    });

    it("exclui um usuário", async () => {
        const response = await request(app)
            .delete("/admin/users/u2")
            .set("x-user-id", "u1");

        expect(response.status).toBe(204);
        expect(response.text).toBe("");
    });
});
