"use client"

import { usePathname, Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function WorldCupNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Mundial 2026" className="border-b border-border/60 bg-background/50">
      <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors",
              pathname === href
                ? "bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-900/60 dark:text-emerald-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
