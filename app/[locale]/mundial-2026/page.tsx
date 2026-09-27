import { TodayMatchesCard } from "@/components/TodayMatchesCard"
import { ScorersCard } from "@/components/ScorersCard"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 pt-8 pb-16 bg-muted/30">
      <TodayMatchesCard />
      <ScorersCard />
    </main>
  )
}
