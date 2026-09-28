import { getTranslations } from "next-intl/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { getFootballOverview, type FootballMatch, type FootballTeam } from "@/lib/sports/football"
import type { CompetitionId } from "@/lib/sports/catalog"
import { AutoRefresh } from "./AutoRefresh"
import { LocalTime } from "./LocalTime"
import { EmptyState, LiveBadge, SectionTitle, SportCard } from "./SportCard"

type Props = { competition: CompetitionId; code: string }

export async function FootballCard({ competition, code }: Props) {
  const t = await getTranslations("sports")
  const tc = await getTranslations("competitions")
  const data = await getFootballOverview(code)

  const header = { competition, eyebrow: `⚽ ${t("football")}`, title: tc(competition) }

  if (!data) {
    return (
      <SportCard {...header}>
        <EmptyState>{process.env.FOOTBALL_DATA_API_KEY ? t("noData") : t("noApiKey")}</EmptyState>
      </SportCard>
    )
  }

  const { live, upcoming, recent, standings, active } = data

  return (
    <SportCard {...header} badge={live.length > 0 ? <LiveBadge label={t("live")} /> : undefined}>
      {active && <AutoRefresh seconds={60} />}
      <Tabs defaultValue="matches" className="gap-0">
        <div className="px-5 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="matches">{t("matches")}</TabsTrigger>
            <TabsTrigger value="table" disabled={standings.length === 0}>
              {t("table")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="matches" className="pb-2">
          {live.length > 0 && (
            <>
              <SectionTitle>{t("live")}</SectionTitle>
              <MatchList matches={live} liveLabel={t("live")} />
            </>
          )}
          <SectionTitle>{t("upcoming")}</SectionTitle>
          {upcoming.length ? (
            <MatchList matches={upcoming.slice(0, 5)} liveLabel={t("live")} />
          ) : (
            <EmptyState>{t("noUpcoming")}</EmptyState>
          )}
          <SectionTitle>{t("results")}</SectionTitle>
          {recent.length ? (
            <MatchList matches={recent.slice(0, 5)} liveLabel={t("live")} />
          ) : (
            <EmptyState>{t("noResults")}</EmptyState>
          )}
        </TabsContent>

        <TabsContent value="table" className="pb-2">
          <div className="max-h-[28rem] overflow-y-auto px-2 pt-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2 pl-3 text-left font-semibold w-8">#</th>
                  <th className="py-2 text-left font-semibold">{t("team")}</th>
                  <th className="py-2 text-right font-semibold w-9">{t("played")}</th>
                  <th className="py-2 text-right font-semibold w-10">{t("goalDiff")}</th>
                  <th className="py-2 pr-3 text-right font-semibold w-10">{t("points")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {standings.map((row) => (
                  <tr key={row.position} className="hover:bg-muted/40">
                    <td className="py-2 pl-3 tabular-nums text-muted-foreground">{row.position}</td>
                    <td className="py-2">
                      <TeamName team={row.team} />
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{row.played}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-bold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </SportCard>
  )
}

function MatchList({ matches, liveLabel }: { matches: FootballMatch[]; liveLabel: string }) {
  return (
    <ul className="divide-y divide-border/50">
      {matches.map((m) => (
        <MatchRow key={m.id} match={m} liveLabel={liveLabel} />
      ))}
    </ul>
  )
}

function MatchRow({ match, liveLabel }: { match: FootballMatch; liveLabel: string }) {
  const isLive = match.status === "live"
  const showScore = match.status !== "scheduled"
  const homeWon = showScore && (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWon = showScore && (match.awayScore ?? 0) > (match.homeScore ?? 0)

  return (
    <li className={cn("flex items-center gap-4 px-5 py-2.5", isLive && "bg-green-50/60 dark:bg-green-950/20")}>
      <div className="w-20 shrink-0 text-[11px] leading-tight text-muted-foreground">
        {isLive ? (
          <span className="inline-flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            {match.minute != null ? `${match.minute}'` : liveLabel}
          </span>
        ) : (
          <>
            <span className="block capitalize">
              <LocalTime iso={match.date} format="day" />
            </span>
            {match.status === "scheduled" && (
              <span className="block font-semibold text-foreground/80 tabular-nums">
                <LocalTime iso={match.date} format="time" />
              </span>
            )}
          </>
        )}
        {match.round && <span className="block text-[10px] text-muted-foreground/70 capitalize">{match.round}</span>}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <TeamLine team={match.home} score={showScore ? match.homeScore : null} bold={homeWon} />
        <TeamLine team={match.away} score={showScore ? match.awayScore : null} bold={awayWon} />
      </div>
    </li>
  )
}

function TeamLine({ team, score, bold }: { team: FootballTeam; score: number | null; bold: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <TeamName team={team} className={cn("flex-1", bold ? "font-bold" : "font-medium")} />
      {score != null && <span className={cn("tabular-nums text-sm", bold ? "font-black" : "font-semibold")}>{score}</span>}
    </div>
  )
}

function TeamName({ team, className }: { team: FootballTeam; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 min-w-0", className)}>
      {team.crest ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote crests (png/svg) from football-data.org
        <img src={team.crest} alt="" className="size-5 shrink-0 object-contain" loading="lazy" />
      ) : (
        <span className="size-5 shrink-0 rounded-full bg-muted" />
      )}
      <span className="truncate text-sm">{team.name}</span>
    </span>
  )
}
