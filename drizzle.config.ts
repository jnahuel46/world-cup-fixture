import { defineConfig } from "drizzle-kit"

// drizzle-kit doesn't read Next's env files on its own
try {
  process.loadEnvFile(".env.local")
} catch {}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
})
