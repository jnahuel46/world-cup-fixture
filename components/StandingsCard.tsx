import { getTranslations } from "next-intl/server"
import { EN_TO_ES } from "@/lib/team-names"
import fixture from "@/data/fixture.json"
import { FlagIcon } from "@/components/FlagIcon"
import { cn } from "@/lib/utils"
import type { GroupStanding, StandingRow } from "@/lib/types"

async function fetchStandings(): Promise<GroupStanding[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (apiKey) {
    try {
      const res = await fetch(
        "https://api.football-data.org/v4/competitions/WC/standings",
        { headers: { "X-Auth-Token": apiKey }, next: { revalidate: 300 } }
      )
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()

      type ApiRow = {
        position: number
        team: { name: string; shortName: string }
        playedGames: number
        won: number
        draw: number
        lost: number
        goalsFor: number
        goalsAgainst: number
        goalDifference: number
        points: number
      }
      type ApiStanding = { type: string; group: string; table: ApiRow[] }

      return (data.standings as ApiStanding[])
        .filter((s) => s.type === "TOTAL")
        .map((s) => ({
          group: s.group.replace("GROUP_", ""),
          table: s.table.map((row) => ({
            position: row.position,
            team: EN_TO_ES[row.team.name] ?? row.team.shortName ?? row.team.name,
            played: row.playedGames,
            won: row.won,
            drawn: row.draw,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDiff: row.goalDifference,
            points: row.points,
          })),
        }))
        .sort((a, b) => a.group.localeCompare(b.group))
    } catch (err) {
      console.error("[standings] API error:", err)
    }
  }

  // Fallback: grupos del fixture con stats en cero
  return Object.entries(fixture.groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teams]) => ({
      group,
      table: (teams as string[]).map((team, i) => ({
        position: i + 1,
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
      })),
    }))
}

type Labels = { team: string; played: string; goalDiff: string; points: string }

function GroupCard({ group, labels }: { group: GroupStanding; labels: Labels }) {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm">
      {/* Header */}
      <div className="bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900/40 px-3 py-2 flex items-center justify-between">
        <h2 className="text-[11px] font-black text-violet-700 dark:text-violet-300 uppercase tracking-widest">
          Grupo {group.group}
        </h2>
        <div className="flex gap-3 text-[10px] font-medium text-muted-foreground">
          <span className="hidden sm:block w-5 text-center">{labels.played}</span>
          <span className="hidden sm:block w-5 text-center">{labels.goalDiff}</span>
          <span className="w-5 text-center font-bold">{labels.points}</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {group.table.map((row: StandingRow, i: number) => (
          <div
            key={row.team}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40",
              i < 2 && "bg-violet-50/40 dark:bg-violet-950/20"
            )}
          >
            <span className="w-4 text-center text-[11px] font-bold text-muted-foreground shrink-0">
              {row.position}
            </span>
            <FlagIcon team={row.team} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground truncate min-w-0">
              {row.team}
            </span>
            <div className="flex items-center gap-3 shrink-0 tabular-nums">
              <span className="hidden sm:block w-5 text-center text-xs text-muted-foreground">
                {row.played}
              </span>
              <span className="hidden sm:block w-5 text-center text-xs text-muted-foreground">
                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
              </span>
              <span className="w-5 text-center text-sm font-black text-foreground">
                {row.points}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function StandingsCard() {
  const t = await getTranslations("groups")
  const groups = await fetchStandings()

  const labels: Labels = {
    team: t("team"),
    played: t("played"),
    goalDiff: t("goalDiff"),
    points: t("points"),
  }

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div className="rounded-2xl overflow-hidden bg-card shadow-sm border border-violet-100/80 dark:border-violet-900/40 ring-1 ring-black/5 dark:ring-white/5">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/20 px-5 py-4">
          <p className="text-violet-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            ⚽ FIFA World Cup 2026
          </p>
          <h1 className="text-foreground font-bold text-xl leading-tight mt-1">{t("title")}</h1>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-violet-50/40 dark:bg-violet-950/10">
          <div className="size-2.5 rounded-sm bg-violet-200 dark:bg-violet-800 shrink-0" />
          <span className="text-[11px] text-muted-foreground">{t("qualifies")}</span>
        </div>
      </div>

      {/* All 12 groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <GroupCard key={group.group} group={group} labels={labels} />
        ))}
      </div>
    </div>
  )
}
