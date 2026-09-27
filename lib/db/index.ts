import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// null when DATABASE_URL is missing, so the public dashboard still builds and runs without a DB
export const db = process.env.DATABASE_URL
  ? drizzle(neon(process.env.DATABASE_URL), { schema })
  : null
