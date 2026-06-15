"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { RotateCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { FlagIcon } from "@/components/FlagIcon"
import { cn } from "@/lib/utils"
import { useTimezone } from "@/components/TimezoneProvider"
import type { LiveMatch, MatchStatus } from "@/lib/types"

const COOLDOWN_SECS = 30

export function TodayMatchesCard() {
  const t = useTranslations("todayCard")
  const { timezone } = useTimezone()
  const [matches, setMatches] = useState<LiveMatch[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [cooldown, setCooldown] = useState(0)

  // Countdown tick: chains 1-second timeouts while cooldown > 0
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // Ref always points to the latest fetch function — interval never goes stale
  const fetchRef = useRef(async () => {})
  fetchRef.current = async () => {
    try {
      const res = await fetch(`/api/live-scores?tz=${encodeURIComponent(timezone)}`)
      const data = await res.json()
      setMatches(data.matches)
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    if (cooldown > 0) return
    setCooldown(COOLDOWN_SECS)
    fetchRef.current()
  }

  // Fetch once on mount, then only on manual refresh
  useEffect(() => {
    fetchRef.current()
    setCooldown(COOLDOWN_SECS)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hasLive = matches?.some((m) => m.status === "live")

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
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

          <div className="flex items-center gap-2">
            {hasLive && (
              <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                {t("live").toUpperCase()}
              </span>
            )}

            {/* Refresh button */}
            <button
              onClick={refresh}
              disabled={cooldown > 0}
              title={cooldown > 0 ? t("refreshIn", { s: cooldown }) : t("refresh")}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition-colors",
                cooldown > 0
                  ? "border-border text-muted-foreground/50 cursor-not-allowed bg-muted/30"
                  : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-white/60 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 cursor-pointer"
              )}
            >
              <RotateCw
                className={cn(
                  "size-3",
                  cooldown > 0 ? "text-muted-foreground/40" : "text-emerald-600 dark:text-emerald-400"
                )}
              />
              {cooldown > 0 ? t("refreshIn", { s: cooldown }) : t("refresh")}
            </button>
          </div>
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

      {/* Telegram coming soon banner */}
      <div className="flex items-center justify-center gap-2 bg-sky-50 dark:bg-sky-950/30 border-t border-sky-100 dark:border-sky-900/40 px-5 py-2.5">
        <TelegramIcon className="size-3.5 text-sky-500 shrink-0" />
        <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
          {t("telegramSoon")}
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
  const { timezone } = useTimezone()
  const time = new Date(match.date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  })

  const isLive = match.status === "live"
  const isScheduled = match.status === "scheduled"

  return (
    <div
      className={cn(
        "px-5 py-4 transition-colors",
        isLive
          ? "bg-green-50/60 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30"
          : "hover:bg-muted/40"
      )}
    >
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
        {match.venue && (
          <>
            <span className="text-muted-foreground/50 text-xs">·</span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              {match.venue.split(",")[0]}
            </span>
          </>
        )}
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

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.965-.924c-.644-.204-.657-.644.136-.953l11.57-4.461c.537-.194 1.006.131.983.892z"/>
    </svg>
  )
}
