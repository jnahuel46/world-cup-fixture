"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          {t("title")}
          {hasLive && (
            <span className="inline-flex items-center gap-1 text-sm font-normal text-green-600">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              {t("live")}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <MatchListSkeleton />
        ) : !matches?.length ? (
          <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
        ) : (
          <ul className="divide-y">
            {matches.map((m) => (
              <MatchRow key={m.id} match={m} t={t} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
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

  const scoreOrTime =
    match.status === "scheduled" ? (
      <span className="text-sm text-muted-foreground tabular-nums">{time}</span>
    ) : (
      <span className="font-semibold tabular-nums text-base">
        {match.homeScore ?? 0} - {match.awayScore ?? 0}
      </span>
    )

  return (
    <li className="py-3">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-right font-medium text-sm">{match.home}</span>
        <div className="flex flex-col items-center gap-1 w-20 shrink-0">
          {scoreOrTime}
        </div>
        <span className="flex-1 font-medium text-sm">{match.away}</span>
      </div>
      <div className="flex items-center justify-center gap-2 mt-1">
        <StatusBadge status={match.status} minute={match.minute} t={t} />
        <span className="text-xs text-muted-foreground">{match.stage}</span>
      </div>
    </li>
  )
}

function StatusBadge({
  status,
  minute,
  t,
}: {
  status: MatchStatus
  minute?: number
  t: ReturnType<typeof useTranslations<"todayCard">>
}) {
  if (status === "live") {
    return (
      <Badge className="gap-1 bg-green-500 hover:bg-green-500 text-white text-xs py-0">
        <span className="size-1.5 rounded-full bg-white animate-pulse" />
        {minute != null ? `${minute}'` : t("liveLabel")}
      </Badge>
    )
  }
  if (status === "finished") {
    return (
      <Badge variant="secondary" className="text-xs py-0">
        {t("finished")}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs py-0">
      {t("scheduled")}
    </Badge>
  )
}

function MatchListSkeleton() {
  return (
    <ul className="divide-y">
      {[1, 2, 3].map((i) => (
        <li key={i} className="py-3">
          <Skeleton className="h-8 w-full rounded-md" />
        </li>
      ))}
    </ul>
  )
}
