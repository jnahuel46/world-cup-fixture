import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { userPreferences } from "@/lib/db/schema"
import { DEFAULT_COMPETITIONS, sanitizeCompetitionIds, type CompetitionId } from "@/lib/sports/catalog"

export async function getUserCompetitions(userId: string): Promise<CompetitionId[]> {
  if (!db) return DEFAULT_COMPETITIONS
  const [row] = await db
    .select({ competitions: userPreferences.competitions })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
  // No row yet → first visit, start from the public defaults
  return row ? sanitizeCompetitionIds(row.competitions) : DEFAULT_COMPETITIONS
}

export async function setUserCompetitions(userId: string, competitions: CompetitionId[]) {
  if (!db) throw new Error("DATABASE_URL is not configured")
  await db
    .insert(userPreferences)
    .values({ userId, competitions })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { competitions, updatedAt: new Date() },
    })
}
