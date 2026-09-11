// This file is used by Prisma CLI for migrations and schema validation.
/// <reference types="node" />
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "../../.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
