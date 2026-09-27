"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/auth"
import { setUserCompetitions } from "@/lib/preferences"
import { sanitizeCompetitionIds } from "@/lib/sports/catalog"

export async function saveCompetitions(ids: string[]): Promise<{ ok: boolean }> {
  const session = await getSession()
  if (!session?.user?.id) return { ok: false }

  try {
    await setUserCompetitions(session.user.id, sanitizeCompetitionIds(ids))
  } catch (err) {
    console.error("[saveCompetitions]", err)
    return { ok: false }
  }

  revalidatePath("/[locale]/dashboard", "page")
  return { ok: true }
}
