import { getTranslations } from "next-intl/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { getF1Overview } from "@/lib/sports/f1"
import { LocalTime } from "./LocalTime"
import { EmptyState, SectionTitle, SportCard } from "./SportCard"

const PODIUM = ["text-amber-500", "text-slate-400", "text-orange-400"]

export async function F1Card() {
  const t = await getTranslations("sports.f1")
  const ts = await getTranslations("sports")
  const tc = await getTranslations("competitions")
  const data = await getF1Overview()

  const header = { competition: "f1" as const, eyebrow: `🏎️ ${ts("motorsport")}`, title: tc("f1") }

  if (!data) {
    return (
      <SportCard {...header}>
        <EmptyState>{ts("noData")}</EmptyState>
      </SportCard>
    )
  }

  const { nextRace, lastRace, standings } = data

  return (
    <SportCard {...header} subtitle={t("season", { season: data.season })}>
      <Tabs defaultValue={nextRace ? "next" : "last"} className="gap-0">
        <div className="px-5 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="next" disabled={!nextRace}>{t("nextRace")}</TabsTrigger>
            <TabsTrigger value="last" disabled={!lastRace}>{t("lastRace")}</TabsTrigger>
            <TabsTrigger value="standings" disabled={!standings.length}>{t("championship")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="next" className="pb-3">
          {nextRace ? (
            <>
              <div className="px-5 pt-4">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t("round", { round: nextRace.round, total: data.totalRounds })}
                </p>
                <p className="font-bold text-base leading-tight mt-0.5">{nextRace.name}</p>
                <p className="text-xs text-muted-foreground">
                  {nextRace.circuit} · {nextRace.country}
                </p>
              </div>
              <SectionTitle>{t("schedule")}</SectionTitle>
              <ul className="divide-y divide-border/50">
                {nextRace.sessions.map((s) => {
                  const isRace = s.key === "race"
                  return (
                    <li
                      key={s.key}
                      className={cn(
                        "flex items-center justify-between px-5 py-2 text-sm",
                        isRace && "bg-red-50/60 dark:bg-red-950/20",
                        s.done && "text-muted-foreground line-through decoration-muted-foreground/40"
                      )}
                    >
                      <span className={cn(isRace ? "font-bold" : "font-medium")}>{t(`sessions.${s.key}`)}</span>
                      <span className="tabular-nums text-xs capitalize">
                        <LocalTime iso={s.date} format="dayTime" />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <EmptyState>{t("seasonOver")}</EmptyState>
          )}
        </TabsContent>

        <TabsContent value="last" className="pb-2">
          {lastRace && (
            <>
              <div className="px-5 pt-4 pb-1">
                <p className="font-bold text-base leading-tight">{lastRace.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  <LocalTime iso={lastRace.date} format="long" />
                </p>
              </div>
              <ul className="divide-y divide-border/50">
                {lastRace.results.map((r) => (
                  <li key={r.position} className="flex items-center gap-3 px-5 py-2">
                    <span className={cn("w-5 text-center text-sm font-black tabular-nums", PODIUM[r.position - 1] ?? "text-muted-foreground/60")}>
                      {r.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.driver}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.team}</p>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{r.time}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TabsContent>

        <TabsContent value="standings" className="pb-2">
          <ul className="divide-y divide-border/50 pt-2">
            {standings.slice(0, 10).map((s) => (
              <li key={s.position} className="flex items-center gap-3 px-5 py-2">
                <span className={cn("w-5 text-center text-sm font-black tabular-nums", PODIUM[s.position - 1] ?? "text-muted-foreground/60")}>
                  {s.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.driver}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {s.team}
                    {s.wins > 0 && ` · ${t("wins", { count: s.wins })}`}
                  </p>
                </div>
                <span className="text-sm font-black tabular-nums">{s.points}</span>
                <span className="text-[10px] text-muted-foreground -ml-2">pts</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </SportCard>
  )
}
