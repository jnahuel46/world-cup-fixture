"use client"

import { usePathname, Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type Props = { today: string; calendar: string }

export function NavLinks({ today, calendar }: Props) {
  const pathname = usePathname()

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "text-sm px-3 py-1.5 sm:px-4 rounded-full transition-all duration-150",
        pathname === href
          ? "bg-emerald-100 text-emerald-800 font-medium shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
    </Link>
  )

  return (
    <div className="flex items-center gap-1">
      {navLink("/", today)}
      {navLink("/calendario", calendar)}
    </div>
  )
}
