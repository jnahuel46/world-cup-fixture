import { NextResponse } from "next/server"
import fixture from "@/data/fixture.json"
import { EN_TO_ES } from "@/lib/team-names"
import type { LiveMatch, MatchStatus } from "@/lib/types"

export const revalidate = 30

const ART = "America/Argentina/Buenos_Aires"

function toARTDate(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: ART })
}

function mapStatus(apiStatus: string): MatchStatus {
  switch (apiStatus) {
    case "IN_PLAY":
    case "PAUSED":
      return "live"
    case "FINISHED":
    case "AWARDED":
      return "finished"
    default:
      return "scheduled"
  }
}

// ── Fallback mock (used when no API key or API error) ──────────────────────
function mockStatus(dateStr: string): MatchStatus {
  const start = new Date(dateStr)
  const now = new Date()
  if (now < start) return "scheduled"
  if (now < new Date(start.getTime() + 105 * 60 * 1000)) return "live"
  return "finished"
}

function mockScores(id: string) {
  const n = parseInt(id.replace("m", ""), 10)
  return { homeScore: n % 3, awayScore: (n + 1) % 3 }
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function GET() {
  const now = new Date()
  const today = toARTDate(now)

  const todayMatches = fixture.matches.filter(
    (m) => toARTDate(new Date(m.date)) === today
  )

  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (apiKey) {
    try {
      // Query a 2-day UTC window to cover the full ART day (ART = UTC-3)
      const utcToday = now.toISOString().slice(0, 10)
      const utcTomorrow = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10)

      const res = await fetch(
        `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${utcToday}&dateTo=${utcTomorrow}`,
        {
          headers: { "X-Auth-Token": apiKey },
          next: { revalidate: 30 },
        }
      )

      if (!res.ok) throw new Error(`API ${res.status}`)

      const data = await res.json()

      // Build a lookup keyed by "HomeES|AwayES"
      type ApiEntry = { status: MatchStatus; homeScore: number; awayScore: number; minute?: number }
      const lookup: Record<string, ApiEntry> = {}

      for (const am of data.matches ?? []) {
        const home = EN_TO_ES[am.homeTeam?.name] ?? am.homeTeam?.shortName ?? am.homeTeam?.name
        const away = EN_TO_ES[am.awayTeam?.name] ?? am.awayTeam?.shortName ?? am.awayTeam?.name
        if (!home || !away) continue

        const status = mapStatus(am.status)
        const homeScore = am.score?.fullTime?.home ?? 0
        const awayScore = am.score?.fullTime?.away ?? 0
        const minute = am.minute ?? undefined

        lookup[`${home}|${away}`] = { status, homeScore, awayScore, minute }
      }

      const matches: LiveMatch[] = todayMatches.map((m) => {
        const entry = lookup[`${m.home}|${m.away}`]

        if (!entry) {
          // No match found in API response — fall back to time-based mock
          const status = mockStatus(m.date)
          if (status === "scheduled") return { ...m, status }
          return { ...m, status, ...mockScores(m.id) }
        }

        if (entry.status === "scheduled") return { ...m, status: "scheduled" }

        return {
          ...m,
          status: entry.status,
          homeScore: entry.homeScore,
          awayScore: entry.awayScore,
          ...(entry.status === "live" && entry.minute != null ? { minute: entry.minute } : {}),
        }
      })

      return NextResponse.json({ matches })
    } catch (err) {
      console.error("[live-scores] API error, falling back to mock:", err)
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────
  const matches: LiveMatch[] = todayMatches.map((m) => {
    const status = mockStatus(m.date)
    if (status === "scheduled") return { ...m, status }
    const minute =
      status === "live"
        ? Math.min(Math.floor((Date.now() - new Date(m.date).getTime()) / 60000), 90)
        : undefined
    return { ...m, status, ...mockScores(m.id), ...(minute !== undefined ? { minute } : {}) }
  })

  return NextResponse.json({ matches })
}
