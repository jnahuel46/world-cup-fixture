import { getTranslations } from "next-intl/server"
import { FlagIcon } from "@/components/FlagIcon"

interface Scorer {
  name: string
  team: string
  goals: number
  assists: number
  penalties: number
}

async function fetchScorers(): Promise<Scorer[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/scorers?limit=10",
      { headers: { "X-Auth-Token": apiKey }, next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()

    const { EN_TO_ES } = await import("@/lib/team-names")
    return (data.scorers ?? []).map((s: {
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
  } catch {
    return []
  }
}

const RANK_COLORS = ["text-amber-500", "text-slate-400", "text-orange-400"]

export async function ScorersCard() {
  const t = await getTranslations("scorers")
  const scorers = await fetchScorers()

  if (scorers.length === 0) return null

  return (
    <div className="w-full max-w-md rounded-2xl overflow-hidden bg-card shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 ring-1 ring-black/5 dark:ring-white/5">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20 border-b border-amber-100 dark:border-amber-900/40 px-5 py-4">
        <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-[0.15em]">
          🏆 FIFA World Cup 2026
        </p>
        <h2 className="text-foreground font-bold text-lg leading-tight mt-1">
          {t("title")}
        </h2>
      </div>

      {/* List */}
      <div className="divide-y divide-border/50">
        {scorers.map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
            {/* Rank */}
            <span className={`w-5 text-center text-sm font-black tabular-nums shrink-0 ${RANK_COLORS[i] ?? "text-muted-foreground/60"}`}>
              {i + 1}
            </span>

            {/* Flag */}
            <FlagIcon team={s.team} className="w-6 h-4 rounded-[2px] object-cover shrink-0" />

            {/* Name + team */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.team}</p>
            </div>

            {/* Goals */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-base font-black tabular-nums text-foreground">{s.goals}</span>
              <span className="text-sm">⚽</span>
            </div>

            {/* Assists (si hay) */}
            {s.assists > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="text-xs tabular-nums text-muted-foreground">{s.assists}</span>
                <span className="text-[10px] text-muted-foreground">🅰️</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
