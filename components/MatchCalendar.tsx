"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar } from "@/components/ui/calendar"
import { FlagIcon } from "@/components/FlagIcon"
import type { Match } from "@/lib/types"

const ART = "America/Argentina/Buenos_Aires"

type Props = { matches: Match[] }

function toLocalDate(dateStr: string) {
  const d = new Date(dateStr)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ART,
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
  const [selected, setSelected] = useState<Date | undefined>(() => new Date())

  const matchDays = matches.map((m) => toLocalDate(m.date))

  const dayMatches = selected
    ? matches.filter((m) => isSameDay(toLocalDate(m.date), selected))
    : []

  return (
    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
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

      <div className="w-full overflow-hidden min-h-[200px]">
        <h2 className="text-base font-semibold mb-3 capitalize">
          {selected
            ? selected.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : t("selectDate")}
        </h2>

        {dayMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
        ) : (
          <ul className="space-y-2">
            {dayMatches.map((m) => {
              const time = new Date(m.date).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: ART,
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
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {m.stage} · {m.venue}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
