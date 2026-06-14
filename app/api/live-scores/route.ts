import { NextResponse } from "next/server"
import fixture from "@/data/fixture.json"
import type { LiveMatch, MatchStatus } from "@/lib/types"

export const revalidate = 30

const ART = "America/Argentina/Buenos_Aires"

function toARTDate(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: ART })
}

function getStatus(dateStr: string): MatchStatus {
  const start = new Date(dateStr)
  const now = new Date()
  const end = new Date(start.getTime() + 105 * 60 * 1000)
  if (now < start) return "scheduled"
  if (now < end) return "live"
  return "finished"
}

function mockScores(id: string) {
  const n = parseInt(id.replace("m", ""), 10)
  return { homeScore: n % 3, awayScore: (n + 1) % 3 }
}

export async function GET() {
  const today = toARTDate(new Date())

  const todayMatches = fixture.matches.filter(
    (m) => toARTDate(new Date(m.date)) === today
  )

  const matches: LiveMatch[] = todayMatches.map((m) => {
    const status = getStatus(m.date)
    if (status === "scheduled") return { ...m, status }

    const scores = mockScores(m.id)
    const minute =
      status === "live"
        ? Math.min(Math.floor((Date.now() - new Date(m.date).getTime()) / 60000), 90)
        : undefined

    return { ...m, status, ...scores, ...(minute !== undefined ? { minute } : {}) }
  })

  return NextResponse.json({ matches })
}
