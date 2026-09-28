import { Suspense } from "react"
import { BracketTreeCard } from "@/components/BracketTreeCard"

function Loading() {
  return (
    <div className="flex gap-12 mt-6 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card h-28 w-[220px] shrink-0 animate-pulse" />
      ))}
    </div>
  )
}

export default async function LlavesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <BracketTreeCard />
      </Suspense>
    </main>
  )
}
