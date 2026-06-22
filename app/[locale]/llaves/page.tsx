import { Suspense } from "react"
import { ProjectedBracketCard } from "@/components/ProjectedBracketCard"

function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card h-28 animate-pulse" />
      ))}
    </div>
  )
}

export default async function LlavesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <ProjectedBracketCard />
      </Suspense>
    </main>
  )
}
