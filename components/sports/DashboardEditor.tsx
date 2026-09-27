"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { ArrowDown, ArrowUp, Check, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCompetition, type CompetitionId } from "@/lib/sports/catalog"
import { saveCompetitions } from "@/app/[locale]/dashboard/actions"

type Props = {
  all: CompetitionId[]
  selected: CompetitionId[]
  canSave: boolean
}

export function DashboardEditor({ all, selected, canSave }: Props) {
  const t = useTranslations("dashboard")
  const tc = useTranslations("competitions")
  const [open, setOpen] = useState(false)
  // Selected ones first (in the user's order), then the rest
  const [order, setOrder] = useState<CompetitionId[]>([...selected, ...all.filter((id) => !selected.includes(id))])
  const [enabled, setEnabled] = useState<Set<CompetitionId>>(new Set(selected))
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()

  function move(index: number, delta: -1 | 1) {
    const next = [...order]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    setOrder(next)
  }

  function toggle(id: CompetitionId) {
    const next = new Set(enabled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setEnabled(next)
  }

  function save() {
    setError(false)
    startTransition(async () => {
      const res = await saveCompetitions(order.filter((id) => enabled.has(id)))
      if (res.ok) setOpen(false)
      else setError(true)
    })
  }

  return (
    <div className="relative self-start sm:self-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {t("customize")}
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg p-4">
          <p className="text-xs text-muted-foreground mb-3">{t("hint")}</p>

          <ul className="space-y-1">
            {order.map((id, i) => {
              const on = enabled.has(id)
              return (
                <li key={id} className={cn("flex items-center gap-2 rounded-xl px-2 py-1.5", on ? "bg-muted/60" : "opacity-60")}>
                  <label className="flex flex-1 items-center gap-2 cursor-pointer min-w-0">
                    <input type="checkbox" checked={on} onChange={() => toggle(id)} className="size-4 accent-emerald-600" />
                    <span aria-hidden="true">{getCompetition(id)?.emoji}</span>
                    <span className="text-sm font-medium truncate">{tc(id)}</span>
                  </label>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    className="p-1 rounded-md hover:bg-background disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label={t("moveDown")}
                    className="p-1 rounded-md hover:bg-background disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>

          {!canSave && <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">{t("noDb")}</p>}
          {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{t("error")}</p>}

          <button
            onClick={save}
            disabled={!canSave || pending}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Check className="size-4" aria-hidden="true" />
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      )}
    </div>
  )
}
