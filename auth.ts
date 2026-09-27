import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema"

// Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  providers: [Google],
  // JWT sessions: no DB round-trip per request; the adapter still persists users/accounts
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})

/** Like auth(), but returns null instead of throwing while login isn't configured (no AUTH_SECRET). */
export async function getSession() {
  if (!process.env.AUTH_SECRET) return null
  return auth()
}
