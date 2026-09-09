import express from "express"; //monta o servidor HTTP e gerencia rotas, middlewares, etc
import { userRouter } from "./modules/users/user.routes.js";

// testes automatizados conseguem importar o `app` e simular
// requisições sem precisar realmente abrir uma porta de rede. 

export function createApp() {
  const app = express();

  app.use(express.json()); // permite ler JSON do body das requisições

  app.use(userRouter); //registra as rotas do módulo de usuários
  // app.use(schoolRouter);
  // app.use(rewardRouter);

  return app;
}
