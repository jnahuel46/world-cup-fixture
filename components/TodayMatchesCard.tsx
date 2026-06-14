"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { FlagIcon } from "@/components/FlagIcon"
import { cn } from "@/lib/utils"
import type { LiveMatch, MatchStatus } from "@/lib/types"

const ART = "America/Argentina/Buenos_Aires"

export function TodayMatchesCard() {
  const t = useTranslations("todayCard")
  const [matches, setMatches] = useState<LiveMatch[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchMatches() {
    try {
      const res = await fetch("/api/live-scores")
      const data = await res.json()
      setMatches(data.matches)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    const id = setInterval(fetchMatches, 30_000)
    return () => clearInterval(id)
  }, [])

  const hasLive = matches?.some((m) => m.status === "live")

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ART,
  })

  return (
    <div className="w-full max-w-md rounded-2xl overflow-hidden bg-card shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 ring-1 ring-black/5 dark:ring-white/5">
      {/* Card header */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/30 border-b border-emerald-100 dark:border-emerald-900/40 px-5 py-4">
        <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em]">
          ⚽ FIFA World Cup 2026
        </p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h2 className="text-foreground font-bold text-lg leading-tight">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5 capitalize">{today}</p>
          </div>
          {hasLive && (
            <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              {t("live").toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Matches */}
      <div className="divide-y divide-border/50">
        {loading ? (
          <MatchListSkeleton />
        ) : !matches?.length ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("noMatches")}
          </div>
        ) : (
          matches.map((m) => <MatchRow key={m.id} match={m} t={t} />)
        )}
      </div>

      {/* Coming soon banner */}
      <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-100 dark:border-amber-900/40 px-5 py-2.5">
        <span className="text-amber-500 text-sm">🚧</span>
        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
          {t("comingSoon")}
        </span>
      </div>
    </div>
  )
}

function MatchRow({
  match,
  t,
}: {
  match: LiveMatch
  t: ReturnType<typeof useTranslations<"todayCard">>
}) {
  const time = new Date(match.date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ART,
  })

  const isLive = match.status === "live"
  const isScheduled = match.status === "scheduled"

  return (
    <div
      className={cn(
        "px-5 py-4 transition-colors",
        isLive ? "bg-green-50/60 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30" : "hover:bg-muted/40"
      )}
    >
      {/* Teams + center */}
      <div className="flex items-center gap-1">
        {/* Home */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="font-semibold text-sm text-foreground truncate">{match.home}</span>
          <FlagIcon team={match.home} />
        </div>

        {/* Score / time */}
        <div className="w-[88px] shrink-0 text-center">
          {isLive && (
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                {match.minute != null ? `${match.minute}'` : t("liveLabel")}
              </span>
            </div>
          )}

          {isScheduled ? (
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">{time}</span>
          ) : (
            <div className="inline-flex items-center gap-1 bg-foreground text-background rounded-lg px-3 py-1">
              <span className="text-base font-black tabular-nums">{match.homeScore ?? 0}</span>
              <span className="text-muted-foreground text-xs font-light">–</span>
              <span className="text-base font-black tabular-nums">{match.awayScore ?? 0}</span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <FlagIcon team={match.away} />
          <span className="font-semibold text-sm text-foreground truncate">{match.away}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <StatusChip status={match.status} t={t} />
        <span className="text-muted-foreground/50 text-xs">·</span>
        <span className="text-[11px] text-muted-foreground">{match.stage}</span>
        <span className="text-muted-foreground/50 text-xs">·</span>
        <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
          {match.venue.split(",")[0]}
        </span>
      </div>
    </div>
  )
}

function StatusChip({
  status,
  t,
}: {
  status: MatchStatus
  t: ReturnType<typeof useTranslations<"todayCard">>
}) {
  if (status === "live") {
    return (
      <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
        {t("liveLabel")}
      </span>
    )
  }
  if (status === "finished") {
    return (
      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        {t("finished")}
      </span>
    )
  }
  return (
    <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900">
      {t("scheduled")}
    </span>
  )
}

function MatchListSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-3">
          <Skeleton className="h-4 flex-1 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-4 flex-1 rounded-full" />
        </div>
      ))}
    </>
  )
}
