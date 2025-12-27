import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "io-net-tool/prisma/schema.prisma",
  migrations: { path: "io-net-tool/prisma/migrations" },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
