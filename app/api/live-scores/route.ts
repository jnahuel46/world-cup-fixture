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

export async function GET() {
  const now = new Date()
  const today = toARTDate(now)

  const todayMatches = fixture.matches.filter(
    (m) => toARTDate(new Date(m.date)) === today
  )

  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (apiKey) {
    try {
      const utcToday = now.toISOString().slice(0, 10)
      const utcTomorrow = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10)

      const res = await fetch(
        `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${utcToday}&dateTo=${utcTomorrow}`,
        { headers: { "X-Auth-Token": apiKey }, next: { revalidate: 30 } }
      )

      if (!res.ok) throw new Error(`API ${res.status}`)

      const data = await res.json()

      type ApiEntry = { status: MatchStatus; homeScore: number; awayScore: number; minute?: number }
      const lookup: Record<string, ApiEntry> = {}

      for (const am of data.matches ?? []) {
        const home = EN_TO_ES[am.homeTeam?.name] ?? am.homeTeam?.shortName ?? am.homeTeam?.name
        const away = EN_TO_ES[am.awayTeam?.name] ?? am.awayTeam?.shortName ?? am.awayTeam?.name
        if (!home || !away) continue

        lookup[`${home}|${away}`] = {
          status: mapStatus(am.status),
          homeScore: am.score?.fullTime?.home ?? 0,
          awayScore: am.score?.fullTime?.away ?? 0,
          minute: am.minute ?? undefined,
        }
      }

      console.log("[live-scores] lookup keys:", Object.keys(lookup))
      console.log("[live-scores] fixture keys:", todayMatches.map(m => `${m.home}|${m.away}`))

      const matches: LiveMatch[] = todayMatches.map((m) => {
        const key = `${m.home}|${m.away}`
        const entry = lookup[key]

        if (!entry || entry.status === "scheduled") {
          console.log(`[live-scores] "${key}" → ${entry ? "TIMED/scheduled" : "NOT FOUND"} → scheduled`)
          return { ...m, status: "scheduled" }
        }

        console.log(`[live-scores] "${key}" → ${entry.status} ${entry.homeScore}-${entry.awayScore}`)


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
      console.error("[live-scores] API error:", err)
    }
  }

  // Sin API key: todos scheduled, sin scores inventados
  const matches: LiveMatch[] = todayMatches.map((m) => ({ ...m, status: "scheduled" }))
  return NextResponse.json({ matches })
}
