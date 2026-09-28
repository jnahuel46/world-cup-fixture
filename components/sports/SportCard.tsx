import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { CompetitionId } from "@/lib/sports/catalog"

const ACCENTS: Record<CompetitionId, { header: string; eyebrow: string }> = {
  ucl: {
    header: "from-indigo-50 to-sky-50 dark:from-indigo-950/50 dark:to-sky-950/30 border-indigo-100 dark:border-indigo-900/40",
    eyebrow: "text-indigo-600 dark:text-indigo-400",
  },
  laliga: {
    header: "from-orange-50 to-rose-50 dark:from-orange-950/40 dark:to-rose-950/20 border-orange-100 dark:border-orange-900/40",
    eyebrow: "text-orange-600 dark:text-orange-400",
  },
  f1: {
    header: "from-red-50 to-zinc-50 dark:from-red-950/40 dark:to-zinc-950/20 border-red-100 dark:border-red-900/40",
    eyebrow: "text-red-600 dark:text-red-400",
  },
}

type Props = {
  competition: CompetitionId
  eyebrow: string
  title: string
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
}

export function SportCard({ competition, eyebrow, title, subtitle, badge, children }: Props) {
  const accent = ACCENTS[competition]
  return (
    <section className="w-full min-w-0 rounded-2xl overflow-hidden bg-card shadow-sm border border-border/60 ring-1 ring-black/5 dark:ring-white/5">
      <div className={cn("bg-gradient-to-br border-b px-5 py-4", accent.header)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", accent.eyebrow)}>{eyebrow}</p>
            <h2 className="text-foreground font-bold text-lg leading-tight mt-1 truncate">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>}
          </div>
          {badge}
        </div>
      </div>
      {children}
    </section>
  )
}

export function LiveBadge({ label }: { label: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
      {label.toUpperCase()}
    </span>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </h3>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>
}

export function SportCardSkeleton() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-card border border-border/60">
      <div className="px-5 py-4 border-b space-y-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-5 w-48 rounded-full" />
      </div>
      <div className="p-5 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
