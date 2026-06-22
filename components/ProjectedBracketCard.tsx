import { getTranslations } from "next-intl/server"
import { EN_TO_ES } from "@/lib/team-names"
import fixture from "@/data/fixture.json"
import { FlagIcon } from "@/components/FlagIcon"
import type { GroupStanding, StandingRow } from "@/lib/types"

// ─── FIFA 2026 official Round-of-32 bracket (Wikipedia / FIFA Annex C) ──────
// 16 matches. 8 are fixed 1st-vs-2nd or 2nd-vs-2nd. 8 involve "best third".
// For third-place slots we resolve dynamically using current standings.

type SlotSpec =
  | { type: "winner"; group: string }   // 1st of group
  | { type: "runnerup"; group: string }  // 2nd of group
  | { type: "third"; groups: string[] }  // best 3rd from possible groups

type BracketMatch = {
  id: string        // M73..M88
  label: string     // human-readable label
  home: SlotSpec
  away: SlotSpec
  side: "left" | "right"
}

const R32_BRACKET: BracketMatch[] = [
  // LEFT SIDE (feeds into R16 left → QF left → SF left)
  { id: "M73", label: "73", home: { type: "runnerup", group: "A" }, away: { type: "runnerup", group: "B" }, side: "left" },
  { id: "M75", label: "75", home: { type: "winner",   group: "F" }, away: { type: "runnerup", group: "C" }, side: "left" },
  { id: "M74", label: "74", home: { type: "winner",   group: "E" }, away: { type: "third", groups: ["A","B","C","D","F"] }, side: "left" },
  { id: "M77", label: "77", home: { type: "winner",   group: "I" }, away: { type: "third", groups: ["C","D","F","G","H"] }, side: "left" },
  { id: "M76", label: "76", home: { type: "winner",   group: "C" }, away: { type: "runnerup", group: "F" }, side: "left" },
  { id: "M78", label: "78", home: { type: "runnerup", group: "E" }, away: { type: "runnerup", group: "I" }, side: "left" },
  { id: "M79", label: "79", home: { type: "winner",   group: "A" }, away: { type: "third", groups: ["C","E","F","H","I"] }, side: "left" },
  { id: "M80", label: "80", home: { type: "winner",   group: "L" }, away: { type: "third", groups: ["E","H","I","J","K"] }, side: "left" },

  // RIGHT SIDE
  { id: "M81", label: "81", home: { type: "winner",   group: "D" }, away: { type: "third", groups: ["B","E","F","I","J"] }, side: "right" },
  { id: "M82", label: "82", home: { type: "winner",   group: "G" }, away: { type: "third", groups: ["A","E","H","I","J"] }, side: "right" },
  { id: "M83", label: "83", home: { type: "winner",   group: "H" }, away: { type: "runnerup", group: "J" }, side: "right" },
  { id: "M84", label: "84", home: { type: "runnerup", group: "K" }, away: { type: "runnerup", group: "L" }, side: "right" },
  { id: "M85", label: "85", home: { type: "winner",   group: "B" }, away: { type: "third", groups: ["E","F","G","I","J"] }, side: "right" },
  { id: "M86", label: "86", home: { type: "runnerup", group: "D" }, away: { type: "runnerup", group: "G" }, side: "right" },
  { id: "M88", label: "88", home: { type: "winner",   group: "J" }, away: { type: "runnerup", group: "H" }, side: "right" },
  { id: "M87", label: "87", home: { type: "winner",   group: "K" }, away: { type: "third", groups: ["D","E","I","J","L"] }, side: "right" },
]

// ─── Standings fetcher (same logic as StandingsCard) ─────────────────────────
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
          group: s.group.replace(/^Group[_ ]?/i, ""),
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
      console.error("[bracket] API error:", err)
    }
  }

  // Fallback: fixture groups with zero stats
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

// ─── Resolve best 8 third-placed teams ───────────────────────────────────────
function getBestThirds(standings: GroupStanding[]): Map<string, StandingRow> {
  // Get the 3rd place team from each group, tagged with group letter
  const thirds = standings
    .map((g) => ({
      group: g.group,
      row: g.table.find((r) => r.position === 3) ?? g.table[2],
    }))
    .filter((t) => t.row)

  // Sort by: points desc, goal diff desc, goals for desc, group alpha
  thirds.sort((a, b) => {
    if (b.row.points !== a.row.points) return b.row.points - a.row.points
    if (b.row.goalDiff !== a.row.goalDiff) return b.row.goalDiff - a.row.goalDiff
    if (b.row.goalsFor !== a.row.goalsFor) return b.row.goalsFor - a.row.goalsFor
    return a.group.localeCompare(b.group)
  })

  // Best 8 thirds
  const best8 = thirds.slice(0, 8)
  const map = new Map<string, StandingRow>()
  for (const t of best8) {
    map.set(t.group, t.row)
  }
  return map
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ResolvedSlot = {
  team: StandingRow | null
  label: string        // e.g. "1° Grupo J" or "3° Grupo E/F/G/I/J"
  played: number
}

type ResolvedMatch = {
  id: string
  label: string
  home: ResolvedSlot
  away: ResolvedSlot
  side: "left" | "right"
}

// ─── Resolve a slot to an actual team ─────────────────────────────────────────
function resolveSlot(
  spec: SlotSpec,
  groupMap: Map<string, StandingRow[]>,
  bestThirds: Map<string, StandingRow>,
  posLabels: { first: string; second: string; third: string },
): ResolvedSlot {
  if (spec.type === "winner") {
    const table = groupMap.get(spec.group) ?? []
    const team = table.find((r) => r.position === 1) ?? table[0] ?? null
    const groupPlayed = table.reduce((s, r) => s + r.played, 0)
    return {
      team,
      label: `${posLabels.first} G${spec.group}`,
      played: groupPlayed,
    }
  }

  if (spec.type === "runnerup") {
    const table = groupMap.get(spec.group) ?? []
    const team = table.find((r) => r.position === 2) ?? table[1] ?? null
    const groupPlayed = table.reduce((s, r) => s + r.played, 0)
    return {
      team,
      label: `${posLabels.second} G${spec.group}`,
      played: groupPlayed,
    }
  }

  // Third: find which of the possible groups has a best-third team
  const possibleGroup = spec.groups.find((g) => bestThirds.has(g))
  if (possibleGroup) {
    const team = bestThirds.get(possibleGroup)!
    const table = groupMap.get(possibleGroup) ?? []
    const groupPlayed = table.reduce((s, r) => s + r.played, 0)
    // Remove from pool so each third is assigned once
    bestThirds.delete(possibleGroup)
    return {
      team,
      label: `${posLabels.third} G${spec.groups.join("/")}`,
      played: groupPlayed,
    }
  }

  // Fallback — no third resolved yet
  return {
    team: null,
    label: `${posLabels.third} G${spec.groups.join("/")}`,
    played: 0,
  }
}

// ─── Team slot sub-component ─────────────────────────────────────────────────
function TeamSlot({
  slot,
  projectedLabel,
}: {
  slot: ResolvedSlot
  projectedLabel: string
}) {
  const team = slot.team
  const isLive = slot.played > 0

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 min-w-0">
      <div className="shrink-0 w-7 h-5 flex items-center justify-center">
        {team ? (
          <FlagIcon team={team.team} className="w-7 h-5 rounded-[3px] object-cover shadow-sm" />
        ) : (
          <div className="w-7 h-5 rounded-[3px] bg-muted-foreground/20" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight text-foreground">
            {team?.team ?? "—"}
          </p>
          {!isLive && (
            <span className="shrink-0 text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              {projectedLabel}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate">
          {slot.label}
        </p>
      </div>

      <div className={`shrink-0 flex flex-col items-center ${!isLive ? "opacity-40" : ""}`}>
        <span className="text-base font-black text-foreground leading-none tabular-nums">
          {team?.points ?? 0}
        </span>
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">pts</span>
      </div>
    </div>
  )
}

// ─── Single matchup card ──────────────────────────────────────────────────────
function MatchupCard({
  matchup,
  projectedLabel,
  index,
}: {
  matchup: ResolvedMatch
  projectedLabel: string
  index: number
}) {
  const delay = `${index * 50}ms`
  const bothLive = matchup.home.played > 0 && matchup.away.played > 0

  return (
    <div
      className={`rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 ${
        bothLive
          ? "border-emerald-200/80 dark:border-emerald-800/60"
          : "border-border/60"
      }`}
      style={{ animationDelay: delay, animationFillMode: "both", animationDuration: "400ms" }}
    >
      {/* Match header */}
      <div className="px-3.5 pt-2 pb-0 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
          Partido {matchup.label}
        </span>
      </div>

      <TeamSlot slot={matchup.home} projectedLabel={projectedLabel} />

      <div className="mx-3.5 border-t border-border/50 relative flex items-center justify-center">
        <span className="absolute bg-card px-1.5 text-[9px] font-black text-muted-foreground/50 uppercase tracking-wider">
          vs
        </span>
      </div>

      <TeamSlot slot={matchup.away} projectedLabel={projectedLabel} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export async function ProjectedBracketCard() {
  const t = await getTranslations("bracket")
  const standings = await fetchStandings()

  const groupMap = new Map(standings.map((g) => [g.group, g.table]))
  const bestThirds = getBestThirds(standings)

  const totalPlayed = standings.reduce(
    (sum, g) => sum + g.table.reduce((s, r) => s + r.played, 0),
    0
  )

  const posLabels = {
    first: t("first"),
    second: t("second"),
    third: t("third"),
  }

  const projectedLabel = t("projected")

  // Resolve all 16 matches
  const resolved: ResolvedMatch[] = R32_BRACKET.map((entry) => ({
    id: entry.id,
    label: entry.label,
    home: resolveSlot(entry.home, groupMap, bestThirds, posLabels),
    away: resolveSlot(entry.away, groupMap, bestThirds, posLabels),
    side: entry.side,
  }))

  const leftMatches = resolved.filter((m) => m.side === "left")
  const rightMatches = resolved.filter((m) => m.side === "right")

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div className="rounded-2xl overflow-hidden bg-card shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 ring-1 ring-black/5 dark:ring-white/5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 px-5 py-4">
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            ⚽ FIFA World Cup 2026
          </p>
          <h1 className="text-foreground font-bold text-xl leading-tight mt-1">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-xs mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50/40 dark:bg-emerald-950/10">
          <div
            className={`size-2.5 rounded-full shrink-0 ${
              totalPlayed > 0
                ? "bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.6)] animate-pulse"
                : "bg-muted-foreground/30"
            }`}
          />
          <span className="text-[11px] text-muted-foreground">
            {totalPlayed > 0 ? t("liveNote") : t("notStartedNote")}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-800" />
          <span className="text-[10px] text-muted-foreground">{t("legendWinner")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-blue-200 dark:bg-blue-800" />
          <span className="text-[10px] text-muted-foreground">{t("legendRunnerup")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-amber-200 dark:bg-amber-800" />
          <span className="text-[10px] text-muted-foreground">{t("legendThird")}</span>
        </div>
      </div>

      {/* Bracket grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent dark:from-emerald-800" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              {t("sideA")}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-200 to-transparent dark:from-emerald-800" />
          </div>
          {leftMatches.map((m, i) => (
            <MatchupCard
              key={m.id}
              matchup={m}
              projectedLabel={projectedLabel}
              index={i}
            />
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-teal-200 to-transparent dark:from-teal-800" />
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
              {t("sideB")}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-teal-200 to-transparent dark:from-teal-800" />
          </div>
          {rightMatches.map((m, i) => (
            <MatchupCard
              key={m.id}
              matchup={m}
              projectedLabel={projectedLabel}
              index={i + 8}
            />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-muted-foreground/70 pb-2">
        {t("note")}
      </p>
    </div>
  )
}
