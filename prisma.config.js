import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

// MySQL has no pooler/direct split to work around, so migrations and queries
// both run against DATABASE_URL. (Supabase needed a separate DIRECT_URL
// because migrations cannot run through its pgbouncer pooler.)
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
