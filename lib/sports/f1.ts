// Jolpica F1 API (Ergast-compatible, free, no key) — https://github.com/jolpica/jolpica-f1

const BASE = "https://api.jolpi.ca/ergast/f1"

export type F1SessionKey = "fp1" | "fp2" | "fp3" | "sprintQualy" | "sprint" | "qualy" | "race"
export type F1Session = { key: F1SessionKey; date: string; done: boolean }

export type F1Race = {
  round: number
  name: string
  circuit: string
  country: string
  date: string
  sessions: F1Session[]
}

export type F1Result = {
  position: number
  driver: string
  code: string
  team: string
  time?: string
}

export type F1Standing = {
  position: number
  driver: string
  team: string
  points: number
  wins: number
}

export type F1Overview = {
  season: string
  totalRounds: number
  nextRace: F1Race | null
  lastRace: (F1Race & { results: F1Result[] }) | null
  standings: F1Standing[]
}

type ApiDateTime = { date: string; time?: string }
type ApiRace = ApiDateTime & {
  season: string
  round: string
  raceName: string
  Circuit: { circuitName: string; Location: { locality: string; country: string } }
  FirstPractice?: ApiDateTime
  SecondPractice?: ApiDateTime
  ThirdPractice?: ApiDateTime
  SprintQualifying?: ApiDateTime
  Sprint?: ApiDateTime
  Qualifying?: ApiDateTime
  Results?: {
    position: string
    Driver: { givenName: string; familyName: string; code?: string }
    Constructor: { name: string }
    Time?: { time: string }
    status: string
  }[]
}

const SESSION_KEYS = [
  ["FirstPractice", "fp1"],
  ["SecondPractice", "fp2"],
  ["ThirdPractice", "fp3"],
  ["SprintQualifying", "sprintQualy"],
  ["Sprint", "sprint"],
  ["Qualifying", "qualy"],
] as const

function iso({ date, time }: ApiDateTime) {
  return time ? `${date}T${time}` : `${date}T00:00:00Z`
}

function mapRace(r: ApiRace): F1Race {
  const sessions: F1Session[] = SESSION_KEYS.flatMap(([apiKey, key]) =>
    r[apiKey] ? [{ key, date: iso(r[apiKey]), done: false }] : []
  )
  sessions.push({ key: "race", date: iso(r), done: false })
  const now = Date.now()
  for (const s of sessions) s.done = new Date(s.date).getTime() < now
  sessions.sort((a, b) => a.date.localeCompare(b.date))
  return {
    round: Number(r.round),
    name: r.raceName,
    circuit: r.Circuit.circuitName,
    country: r.Circuit.Location.country,
    date: iso(r),
    sessions,
  }
}

async function get<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate } })
    if (!res.ok) throw new Error(`jolpica ${res.status} ${path}`)
    return ((await res.json()) as { MRData: T }).MRData
  } catch (err) {
    console.error("[f1]", err)
    return null
  }
}

/** Returns null when the API failed. */
export async function getF1Overview(): Promise<F1Overview | null> {
  const [schedule, last, standings] = await Promise.all([
    get<{ RaceTable: { season: string; Races: ApiRace[] } }>("/current.json", 3600),
    get<{ RaceTable: { Races: ApiRace[] } }>("/current/last/results.json", 600),
    get<{
      StandingsTable: {
        StandingsLists: {
          DriverStandings: {
            position: string
            points: string
            wins: string
            Driver: { givenName: string; familyName: string }
            Constructors: { name: string }[]
          }[]
        }[]
      }
    }>("/current/driverstandings.json", 600),
  ])
  if (!schedule) return null

  const races = schedule.RaceTable.Races.map(mapRace)
  // A race stays "next" until ~3h after the start so it's visible while it's running
  const cutoff = Date.now() - 3 * 60 * 60 * 1000
  const nextRace = races.find((r) => new Date(r.date).getTime() > cutoff) ?? null

  const lastApi = last?.RaceTable.Races[0]
  const lastRace = lastApi
    ? {
        ...mapRace(lastApi),
        results: (lastApi.Results ?? []).slice(0, 10).map((res) => ({
          position: Number(res.position),
          driver: `${res.Driver.givenName} ${res.Driver.familyName}`,
          code: res.Driver.code ?? res.Driver.familyName.slice(0, 3).toUpperCase(),
          team: res.Constructor.name,
          time: res.Time?.time ?? res.status,
        })),
      }
    : null

  return {
    season: schedule.RaceTable.season,
    totalRounds: races.length,
    nextRace,
    lastRace,
    standings: (standings?.StandingsTable.StandingsLists[0]?.DriverStandings ?? []).map((s) => ({
      position: Number(s.position),
      driver: `${s.Driver.givenName} ${s.Driver.familyName}`,
      team: s.Constructors[0]?.name ?? "",
      points: Number(s.points),
      wins: Number(s.wins),
    })),
  }
}
