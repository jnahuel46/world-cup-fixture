"use client"

import { useLocale } from "next-intl"
import { useTimezone } from "@/components/TimezoneProvider"

const FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  time: { hour: "2-digit", minute: "2-digit" },
  day: { weekday: "short", day: "numeric", month: "short" },
  dayTime: { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
  long: { weekday: "long", day: "numeric", month: "long" },
}

/** Renders an ISO date in the user's selected timezone (see TimezoneSelector). */
export function LocalTime({ iso, format = "dayTime" }: { iso: string; format?: keyof typeof FORMATS }) {
  const locale = useLocale()
  const { timezone } = useTimezone()
  const text = new Date(iso).toLocaleString(locale === "es" ? "es-AR" : "en-GB", {
    ...FORMATS[format],
    hourCycle: "h23",
    timeZone: timezone,
  })
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  )
}
