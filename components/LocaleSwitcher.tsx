"use client"

import { useLocale } from "next-intl"
import { usePathname, Link } from "@/i18n/navigation"

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const other = locale === "es" ? "en" : "es"

  return (
    <Link
      href={pathname}
      locale={other}
      className="text-xs font-medium border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
    >
      {other.toUpperCase()}
    </Link>
  )
}
