// Registry of every competition the dashboard can show.
// To add one: add an entry here + a provider in lib/sports/ + a card in components/sports/
// + its display name under "competitions" in messages/*.json.

export type Sport = "football" | "motorsport"

export type Competition = {
  id: string
  sport: Sport
  emoji: string
  // football-data.org competition code (football only)
  code?: string
}

export const COMPETITIONS = [
  { id: "ucl", sport: "football", emoji: "⭐", code: "CL" },
  { id: "laliga", sport: "football", emoji: "🇪🇸", code: "PD" },
  { id: "f1", sport: "motorsport", emoji: "🏎️" },
] as const satisfies readonly Competition[]

export type CompetitionId = (typeof COMPETITIONS)[number]["id"]

// What anonymous visitors (and new users) see
export const DEFAULT_COMPETITIONS: CompetitionId[] = ["ucl", "f1"]

export function getCompetition(id: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.id === id)
}

// Drops unknown / duplicated ids — preferences come from the DB and may be stale
export function sanitizeCompetitionIds(ids: unknown): CompetitionId[] {
  if (!Array.isArray(ids)) return []
  const valid = new Set<string>(COMPETITIONS.map((c) => c.id))
  return [...new Set(ids)].filter((id): id is CompetitionId => typeof id === "string" && valid.has(id))
}
