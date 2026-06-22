"use client"

import { useEffect, useState } from "react"
import { usePathname, Link } from "@/i18n/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = { today: string; calendar: string; myCountry: string; groups: string; bracket: string }

export function NavLinks({ today, calendar, myCountry, groups, bracket }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close on navigation
  useEffect(() => setOpen(false), [pathname])

  const links = [
    { href: "/",          label: today      },
    { href: "/calendario", label: calendar  },
    { href: "/grupos",    label: groups     },
    { href: "/llaves",    label: bracket    },
    { href: "/mi-pais",   label: myCountry  },
  ]

  return (
    <>
      {/* Desktop: pill links */}
      <div className="hidden md:flex items-center gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "text-sm px-3 py-1.5 sm:px-4 rounded-full transition-all duration-150",
              pathname === href
                ? "bg-emerald-100 text-emerald-800 font-medium shadow-sm dark:bg-emerald-900/60 dark:text-emerald-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
      </button>

      {/* Mobile: backdrop + dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/20 dark:bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav"
            aria-label="Navegación principal"
            className="fixed left-0 right-0 top-14 z-50 bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg px-4 py-3 flex flex-col gap-1"
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "text-sm font-medium px-4 py-3 rounded-xl transition-colors",
                  pathname === href
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
