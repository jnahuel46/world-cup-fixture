import type { MatchStatus } from "@/lib/types"

// football-data.org v4 — https://www.football-data.org/documentation/api

const BASE = "https://api.football-data.org/v4"

export type FootballTeam = { name: string; crest?: string }

export type FootballMatch = {
  id: number
  date: string
  status: MatchStatus
  home: FootballTeam
  away: FootballTeam
  homeScore: number | null
  awayScore: number | null
  minute?: number
  round?: string
}

export type FootballStanding = {
  position: number
  team: FootballTeam
  played: number
  goalDiff: number
  points: number
}

export type FootballOverview = {
  live: FootballMatch[]
  upcoming: FootballMatch[]
  recent: FootballMatch[]
  standings: FootballStanding[]
  // Something is live or kicks off within 30 min → the UI should keep refreshing
  active: boolean
}

type ApiTeam = { name: string; shortName?: string; crest?: string }
type ApiMatch = {
  id: number
  utcDate: string
  status: string
  minute?: number
  matchday?: number | null
  stage?: string
  homeTeam: ApiTeam
  awayTeam: ApiTeam
  score: { fullTime: { home: number | null; away: number | null } }
}

function mapStatus(s: string): MatchStatus {
  if (s === "IN_PLAY" || s === "PAUSED") return "live"
  if (s === "FINISHED" || s === "AWARDED") return "finished"
  return "scheduled"
}

function team(t: ApiTeam): FootballTeam {
  return { name: t.shortName || t.name || "TBD", crest: t.crest }
}

function round(m: ApiMatch) {
  if (m.stage && m.stage !== "REGULAR_SEASON" && m.stage !== "LEAGUE_STAGE") {
    return m.stage.replaceAll("_", " ").toLowerCase()
  }
  return m.matchday ? `J${m.matchday}` : undefined
}

async function get<T>(path: string, revalidate: number): Promise<T | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate },
    })
    if (!res.ok) throw new Error(`football-data ${res.status} ${path}`)
    return (await res.json()) as T
  } catch (err) {
    console.error("[football]", err)
    return null
  }
}

/** Returns null when there is no API key or the API failed. */
export async function getFootballOverview(code: string): Promise<FootballOverview | null> {
  // One request for the whole season keeps us well under the 10 req/min free-tier limit
  const [matchesRes, standingsRes] = await Promise.all([
    get<{ matches: ApiMatch[] }>(`/competitions/${code}/matches`, 60),
    get<{ standings: { type: string; table: ApiStanding[] }[] }>(`/competitions/${code}/standings`, 600),
  ])
  if (!matchesRes) return null

  const matches: FootballMatch[] = matchesRes.matches.map((m) => ({
    id: m.id,
    date: m.utcDate,
    status: mapStatus(m.status),
    home: team(m.homeTeam),
    away: team(m.awayTeam),
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    minute: m.minute,
    round: round(m),
  }))

  const byDate = (a: FootballMatch, b: FootballMatch) => a.date.localeCompare(b.date)
  const total = standingsRes?.standings.find((s) => s.type === "TOTAL")

  const live = matches.filter((m) => m.status === "live").sort(byDate)
  const upcoming = matches.filter((m) => m.status === "scheduled").sort(byDate).slice(0, 8)
  const startsSoon = upcoming.length > 0 && new Date(upcoming[0].date).getTime() - Date.now() < 30 * 60 * 1000

  return {
    live,
    upcoming,
    active: live.length > 0 || startsSoon,
    recent: matches.filter((m) => m.status === "finished").sort(byDate).slice(-8).reverse(),
    standings: (total?.table ?? []).map((r) => ({
      position: r.position,
      team: team(r.team),
      played: r.playedGames,
      goalDiff: r.goalDifference,
      points: r.points,
    })),
  }
}

type ApiStanding = {
  position: number
  team: ApiTeam
  playedGames: number
  goalDifference: number
  points: number
}
