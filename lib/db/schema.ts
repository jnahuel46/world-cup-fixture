import { integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

// ── Auth.js tables (shape required by @auth/drizzle-adapter) ──────────────────

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
)

// ── App tables ────────────────────────────────────────────────────────────────

export const userPreferences = pgTable("user_preferences", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  // Ordered list of competition ids (see lib/sports/catalog.ts)
  competitions: jsonb("competitions").$type<string[]>().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})
