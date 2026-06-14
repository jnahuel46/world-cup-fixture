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
      className="text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 transition-colors"
    >
      {other.toUpperCase()}
    </Link>
  )
}
