export type MatchStatus = "scheduled" | "live" | "finished"

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
