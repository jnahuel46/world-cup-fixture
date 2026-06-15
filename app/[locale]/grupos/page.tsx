import { Suspense } from "react"
import { StandingsCard } from "@/components/StandingsCard"

function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card h-40 animate-pulse" />
      ))}
    </div>
  )
}

export default async function GruposPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <StandingsCard />
      </Suspense>
    </main>
  )
}
