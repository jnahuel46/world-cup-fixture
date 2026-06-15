"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { value: "Europe/Madrid",                  label: "Madrid"       },
  { value: "Europe/London",                  label: "Londres"      },
  { value: "America/New_York",               label: "Nueva York"   },
  { value: "America/Mexico_City",            label: "México"       },
  { value: "America/Los_Angeles",            label: "Los Ángeles"  },
] as const

export const DEFAULT_TZ = "America/Argentina/Buenos_Aires"
const LS_KEY = "wc26_timezone"

type TimezoneCtx = { timezone: string; setTimezone: (tz: string) => void }

const Ctx = createContext<TimezoneCtx>({ timezone: DEFAULT_TZ, setTimezone: () => {} })

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTz] = useState(DEFAULT_TZ)

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored && TIMEZONES.some((t) => t.value === stored)) setTz(stored)
  }, [])

  function setTimezone(tz: string) {
    setTz(tz)
    localStorage.setItem(LS_KEY, tz)
  }

  return <Ctx.Provider value={{ timezone, setTimezone }}>{children}</Ctx.Provider>
}

export function useTimezone() {
  return useContext(Ctx)
}
