"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar } from "@/components/ui/calendar"
import { FlagIcon } from "@/components/FlagIcon"
import { useTimezone } from "@/components/TimezoneProvider"
import { googleCalendarUrl, downloadICS } from "@/lib/ics"
import type { Match } from "@/lib/types"

type Props = { matches: Match[] }

function toLocalDate(dateStr: string, tz: string) {
  const d = new Date(dateStr)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)
  const year = Number(parts.find((p) => p.type === "year")?.value)
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1
  const day = Number(parts.find((p) => p.type === "day")?.value)
  return new Date(year, month, day)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function MatchCalendar({ matches }: Props) {
  const t = useTranslations("calendar")
  const tExport = useTranslations("export")
  const { timezone } = useTimezone()
  const [selected, setSelected] = useState<Date | undefined>(() => new Date())

  const matchDays = matches.map((m) => toLocalDate(m.date, timezone))

  const dayMatches = selected
    ? matches.filter((m) => isSameDay(toLocalDate(m.date, timezone), selected))
    : []

  return (
    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
      <div className="isolate overflow-hidden rounded-lg">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        modifiers={{ hasMatch: matchDays }}
        modifiersClassNames={{
          hasMatch:
            "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-green-500 relative",
        }}
        startMonth={new Date(2026, 5)}
        endMonth={new Date(2026, 6)}
      />
      </div>

      <div className="w-full overflow-hidden min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold capitalize">
            {selected
              ? selected.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : t("selectDate")}
          </h2>
          {dayMatches.length > 0 && (
            <button
              onClick={() => downloadICS(dayMatches, "mundial-2026-dia.ics")}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full px-3 py-1 transition-colors"
            >
              {tExport("exportDay")}
            </button>
          )}
        </div>

        {dayMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
        ) : (
          <ul className="space-y-2">
            {dayMatches.map((m) => {
              const time = new Date(m.date).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: timezone,
              })
              return (
                <li key={m.id} className="rounded-lg border p-3 w-full min-w-0">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <FlagIcon team={m.home} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                    <span className="font-medium text-sm truncate min-w-0 flex-1">{m.home}</span>
                    <span className="text-sm text-muted-foreground tabular-nums shrink-0 px-1">
                      {time}
                    </span>
                    <span className="font-medium text-sm truncate text-right min-w-0 flex-1">{m.away}</span>
                    <FlagIcon team={m.away} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {m.stage}{m.venue ? ` · ${m.venue}` : ""}
                    </p>
                    <a
                      href={googleCalendarUrl(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 ml-2 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      {tExport("addToGcal")}
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Export info tip */}
        <div className="mt-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 px-3.5 py-3 space-y-2">
          <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
            {tExport("infoTitle")}
          </p>
          <div className="flex gap-2">
            <span className="text-base leading-none">📥</span>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80 leading-relaxed">
              <span className="font-semibold">{tExport("exportDay")}</span> — {tExport("infoIcal")}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-base leading-none">🗓</span>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80 leading-relaxed">
              <span className="font-semibold">{tExport("addToGcal")}</span> — {tExport("infoGcal")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
