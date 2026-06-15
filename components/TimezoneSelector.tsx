"use client"

import { Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTimezone, TIMEZONES } from "@/components/TimezoneProvider"

export function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone()
  const t = useTranslations("timezone")

  return (
    <div className="flex items-center gap-1.5" title={t("title")}>
      <span className="hidden sm:block text-[11px] font-medium text-muted-foreground select-none">
        {t("label")}
      </span>
      <div className="relative flex items-center">
        <Globe className="pointer-events-none absolute left-2 size-3 text-muted-foreground" />
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          aria-label={t("title")}
          className="h-7 cursor-pointer appearance-none rounded-full bg-muted pl-6 pr-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground border-none outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
