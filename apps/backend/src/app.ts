import express from "express";
import { userRouter } from "./modules/users/user.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(userRouter);

  return app;
}
