export type MatchStatus = "scheduled" | "live" | "finished"

export type StandingRow = {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export type GroupStanding = {
  group: string
  table: StandingRow[]
}

export type Match = {
  id: string
  date: string
  stage: string
  home: string
  away: string
  venue: string
}

export type LiveMatch = Match & {
  status: MatchStatus
  homeScore?: number
  awayScore?: number
  minute?: number
}
