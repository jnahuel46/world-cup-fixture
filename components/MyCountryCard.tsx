"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { FlagIcon } from "@/components/FlagIcon"
import { cn } from "@/lib/utils"
import type { Match } from "@/lib/types"

const ART = "America/Argentina/Buenos_Aires"
const LS_KEY = "wc26_my_country"

const ALL_TEAMS = [
  "Argentina", "Alemania", "Arabia Saudita", "Argelia", "Australia", "Austria",
  "Bélgica", "Bosnia-Herzegovina", "Brasil", "Canadá", "Catar", "Corea del Sur",
  "Costa de Marfil", "Croacia", "Curazao", "Ecuador", "Egipto", "Escocia",
  "España", "EE.UU.", "Francia", "Ghana", "Haití", "Inglaterra", "Irak",
  "Irán", "Japón", "Jordania", "Marruecos", "México", "Noruega", "Nueva Zelanda",
  "Países Bajos", "Panamá", "Paraguay", "Portugal", "R.D. Congo", "República Checa",
  "Senegal", "Suecia", "Suiza", "Sudáfrica", "Túnez", "Turquía", "Uruguay",
  "Uzbekistán", "Cabo Verde",
].sort((a, b) => a.localeCompare(b, "es"))

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    weekday: "short", day: "numeric", month: "short", timeZone: ART,
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit", timeZone: ART,
  })
}

function matchStatus(dateStr: string): "past" | "today" | "upcoming" {
  const matchDate = new Date(dateStr).toLocaleDateString("en-CA", { timeZone: ART })
  const today = new Date().toLocaleDateString("en-CA", { timeZone: ART })
  if (matchDate < today) return "past"
  if (matchDate === today) return "today"
  return "upcoming"
}

export function MyCountryCard({ matches }: { matches: Match[] }) {
  const t = useTranslations("myCountry")
  const [country, setCountry] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCountry(localStorage.getItem(LS_KEY))
  }, [])

  function selectCountry(c: string) {
    setCountry(c)
    localStorage.setItem(LS_KEY, c)
  }

  function clearCountry() {
    setCountry(null)
    localStorage.removeItem(LS_KEY)
  }

  const countryMatches = country
    ? matches.filter((m) => m.home === country || m.away === country)
    : []

  if (!mounted) return null

  return (
    <div className="w-full max-w-md rounded-2xl overflow-hidden bg-card shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 ring-1 ring-black/5 dark:ring-white/5">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/20 border-b border-sky-100 dark:border-sky-900/40 px-5 py-4">
        <p className="text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-[0.15em]">
          🌍 FIFA World Cup 2026
        </p>
        <div className="flex items-center justify-between mt-1">
          <h2 className="text-foreground font-bold text-lg leading-tight">{t("title")}</h2>
          {country && (
            <button
              onClick={clearCountry}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("change")}
            </button>
          )}
        </div>
      </div>

      {/* Country selector */}
      {!country ? (
        <div className="px-5 py-6">
          <p className="text-sm text-muted-foreground mb-3">{t("prompt")}</p>
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => e.target.value && selectCountry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="" disabled>{t("selectPlaceholder")}</option>
              {ALL_TEAMS.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▼</span>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {/* Country pill */}
          <div className="flex items-center gap-3 px-5 py-3 bg-sky-50/50 dark:bg-sky-950/20">
            <FlagIcon team={country} className="w-7 h-5 rounded-[3px] object-cover shrink-0" />
            <span className="font-bold text-base text-foreground">{country}</span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {countryMatches.length} {t("matches")}
            </span>
          </div>

          {/* Match list */}
          {countryMatches.map((m) => {
            const status = matchStatus(m.date)
            const isHome = m.home === country
            const opponent = isHome ? m.away : m.home

            return (
              <div
                key={m.id}
                className={cn(
                  "px-5 py-3 transition-colors",
                  status === "today" ? "bg-green-50/60 dark:bg-green-950/20" : "hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Opponent flag + name */}
                  <FlagIcon team={opponent} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {isHome ? t("vsOpponent", { opponent }) : t("vsOpponent", { opponent })}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {m.stage} · {m.venue.split(",")[0]}
                    </p>
                  </div>
                  {/* Date + time */}
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-medium text-foreground capitalize">{formatDate(m.date)}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{formatTime(m.date)}</p>
                  </div>
                  {/* Status dot */}
                  {status === "today" && (
                    <span className="size-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  )}
                  {status === "past" && (
                    <span className="size-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
