import { NextResponse } from "next/server"
import { EN_TO_ES } from "@/lib/team-names"

export const revalidate = 300

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) return NextResponse.json({ scorers: [] })

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/scorers?limit=10",
      { headers: { "X-Auth-Token": apiKey }, next: { revalidate: 300 } }
    )
    if (!res.ok) throw new Error(`API ${res.status}`)

    const data = await res.json()

    const scorers = (data.scorers ?? []).map((s: {
      player: { name: string }
      team: { name: string; shortName: string }
      goals: number
      assists: number | null
      penalties: number | null
    }) => ({
      name: s.player.name,
      team: EN_TO_ES[s.team.name] ?? s.team.shortName,
      goals: s.goals,
      assists: s.assists ?? 0,
      penalties: s.penalties ?? 0,
    }))

    return NextResponse.json({ scorers })
  } catch {
    return NextResponse.json({ scorers: [] })
  }
}
